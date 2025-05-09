package com.web.unistudy_backend.Services.Impl;

import com.web.unistudy_backend.Entities.ChatMessage;
import com.web.unistudy_backend.Entities.GroupChat;
import com.web.unistudy_backend.Enums.MessageType;
import com.web.unistudy_backend.Repositories.GroupChatRepository;
import com.web.unistudy_backend.Repositories.GroupMessageRepository;
import com.web.unistudy_backend.Services.GroupChatService;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;
import java.util.Optional;

@Service
public class GroupChatServiceImpl implements GroupChatService {
    private final GroupChatRepository groupChatRepository;
    private final GroupMessageRepository groupMessageRepository;

    public GroupChatServiceImpl(GroupChatRepository groupChatRepository,
                                GroupMessageRepository groupMessageRepository) {
        this.groupChatRepository = groupChatRepository;
        this.groupMessageRepository = groupMessageRepository;
    }

    @Override
    public GroupChat createGroup(GroupChat groupChat) {
        groupChat.setCreatedDate(new Date());
        // Set default max capacity if not specified
        if (groupChat.getMaxCapacity() <= 0) {
            groupChat.setMaxCapacity(50); // Default max capacity
        }
        return groupChatRepository.save(groupChat);
    }

    @Override
    public List<GroupChat> findUserGroups(String userId) {
        return groupChatRepository.findByMembersContaining(userId);
    }

    @Override
    public List<GroupChat> findGroupsBySubject(String subject) {
        // Will be implemented in the repository
        return groupChatRepository.findBySubject(subject);
    }

    @Override
    public Optional<GroupChat> findById(String groupId) {
        return groupChatRepository.findById(groupId);
    }

    @Override
    public GroupChat addMemberToGroup(String groupId, String userId) {
        GroupChat groupChat = groupChatRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Group not found"));

        // Check if group is at capacity
        if (groupChat.getMembers().size() >= groupChat.getMaxCapacity()) {
            throw new RuntimeException("Group has reached maximum capacity");
        }

        if (!groupChat.getMembers().contains(userId)) {
            groupChat.getMembers().add(userId);
            return groupChatRepository.save(groupChat);
        }
        return groupChat;
    }

    @Override
    public GroupChat removeMemberFromGroup(String groupId, String userId) {
        GroupChat groupChat = groupChatRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Group not found"));

        groupChat.getMembers().remove(userId);
        return groupChatRepository.save(groupChat);
    }

    @Override
    public void deleteGroup(String groupId) {
        groupChatRepository.deleteById(groupId);
    }

    @Override
    public ChatMessage saveGroupMessage(ChatMessage chatMessage) {
        // Set message type to GROUP
        chatMessage.setType(MessageType.GROUP);
        chatMessage.setTimestamp(new Date());
        return groupMessageRepository.save(chatMessage);
    }

    @Override
    public List<ChatMessage> findGroupMessages(String groupId) {
        return groupMessageRepository.findByGroupIdOrderByTimestampAsc(groupId);
    }

    @Override
    public boolean isGroupAtCapacity(String groupId) {
        GroupChat groupChat = groupChatRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Group not found"));
        return groupChat.getMembers().size() >= groupChat.getMaxCapacity();
    }
}
