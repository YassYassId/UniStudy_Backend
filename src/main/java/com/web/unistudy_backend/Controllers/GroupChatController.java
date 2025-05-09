package com.web.unistudy_backend.Controllers;

import com.web.unistudy_backend.Entities.ChatMessage;
import com.web.unistudy_backend.Entities.ChatNotification;
import com.web.unistudy_backend.Entities.GroupChat;
import com.web.unistudy_backend.Services.GroupChatService;
import com.web.unistudy_backend.Services.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.CrossOrigin;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/groups")
@CrossOrigin(origins = "http://localhost:5173")
public class GroupChatController {
    private final GroupChatService groupChatService;
    private final UserService userService;
    private final SimpMessagingTemplate messagingTemplate;

    public GroupChatController(GroupChatService groupChatService,
                               UserService userService,
                               SimpMessagingTemplate messagingTemplate) {
        this.groupChatService = groupChatService;
        this.userService = userService;
        this.messagingTemplate = messagingTemplate;
    }

    @PostMapping("/create")
    public ResponseEntity<GroupChat> createGroup(@RequestBody GroupChat groupChat) {
        return ResponseEntity.ok(groupChatService.createGroup(groupChat));
    }

    @GetMapping("/my-groups")
    public ResponseEntity<List<GroupChat>> getMyGroups(@RequestParam String userId) {
        return ResponseEntity.ok(groupChatService.findUserGroups(userId));
    }

    @GetMapping("/by-subject")
    public ResponseEntity<List<GroupChat>> getGroupsBySubject(@RequestParam String subject) {
        return ResponseEntity.ok(groupChatService.findGroupsBySubject(subject));
    }

    @GetMapping("/{groupId}")
    public ResponseEntity<GroupChat> getGroupDetails(@PathVariable String groupId) {
        return groupChatService.findById(groupId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{groupId}/capacity-check")
    public ResponseEntity<Map<String, Boolean>> checkGroupCapacity(@PathVariable String groupId) {
        boolean isAtCapacity = groupChatService.isGroupAtCapacity(groupId);
        Map<String, Boolean> response = new HashMap<>();
        response.put("isAtCapacity", isAtCapacity);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{groupId}/members")
    public ResponseEntity<?> addMember(@PathVariable String groupId, @RequestParam String userId) {
        try {
            GroupChat updatedGroup = groupChatService.addMemberToGroup(groupId, userId);

            // Notify all group members about the new member
            ChatNotification notification = new ChatNotification(
                    null,
                    userId,
                    groupId,
                    "User " + userId + " has joined the group",
                    true // Flag to indicate this is a group system message
            );

            messagingTemplate.convertAndSend(
                    "/topic/group/" + groupId,
                    notification
            );

            return ResponseEntity.ok(updatedGroup);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{groupId}/members/{userId}")
    public ResponseEntity<GroupChat> removeMember(@PathVariable String groupId, @PathVariable String userId) {
        GroupChat updatedGroup = groupChatService.removeMemberFromGroup(groupId, userId);

        // Notify remaining group members about the member leaving
        ChatNotification notification = new ChatNotification(
                null,
                userId,
                groupId,
                "User " + userId + " has left the group",
                true // Flag to indicate this is a group system message
        );

        messagingTemplate.convertAndSend(
                "/topic/group/" + groupId,
                notification
        );

        return ResponseEntity.ok(updatedGroup);
    }

    @DeleteMapping("/{groupId}")
    public ResponseEntity<Void> deleteGroup(@PathVariable String groupId) {
        GroupChat group = groupChatService.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Group not found"));

        // Notify all members about group deletion
        ChatNotification notification = new ChatNotification(
                null,
                group.getCreatedBy(),
                groupId,
                "This group has been deleted",
                true // Flag to indicate this is a group system message
        );

        messagingTemplate.convertAndSend(
                "/topic/group/" + groupId,
                notification
        );

        groupChatService.deleteGroup(groupId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{groupId}/messages")
    public ResponseEntity<List<ChatMessage>> getGroupMessages(@PathVariable String groupId) {
        return ResponseEntity.ok(groupChatService.findGroupMessages(groupId));
    }

    // WebSocket method to handle group messages
    @MessageMapping("/group-chat")
    public void processGroupMessage(@Payload ChatMessage chatMessage) {
        ChatMessage savedMsg = groupChatService.saveGroupMessage(chatMessage);

        // Find the group to get all members
        GroupChat group = groupChatService.findById(savedMsg.getGroupId())
                .orElseThrow(() -> new RuntimeException("Group not found"));

        // Create notification
        ChatNotification notification = new ChatNotification(
                savedMsg.getId(),
                savedMsg.getSenderId(),
                savedMsg.getGroupId(),
                savedMsg.getContent(),
                true // Flag to indicate this is a group message
        );

        // Send to group topic instead of individual users
        messagingTemplate.convertAndSend(
                "/topic/group/" + savedMsg.getGroupId(),
                notification
        );
    }
}
