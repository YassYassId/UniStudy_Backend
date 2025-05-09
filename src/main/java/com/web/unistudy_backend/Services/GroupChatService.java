package com.web.unistudy_backend.Services;

import com.web.unistudy_backend.Entities.ChatMessage;
import com.web.unistudy_backend.Entities.GroupChat;

import java.util.List;
import java.util.Optional;

public interface GroupChatService {
    GroupChat createGroup(GroupChat groupChat);
    List<GroupChat> findUserGroups(String userId);
    List<GroupChat> findGroupsBySubject(String subject);
    Optional<GroupChat> findById(String groupId);
    GroupChat addMemberToGroup(String groupId, String userId);
    GroupChat removeMemberFromGroup(String groupId, String userId);
    void deleteGroup(String groupId);
    ChatMessage saveGroupMessage(ChatMessage chatMessage);
    List<ChatMessage> findGroupMessages(String groupId);
    boolean isGroupAtCapacity(String groupId);
}
