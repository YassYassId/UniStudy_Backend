package com.web.unistudy_backend.Services;

import com.web.unistudy_backend.Entities.ChatMessage;

import java.util.List;

public interface ChatMessageService {
    ChatMessage save(ChatMessage chatMessage);

    List<ChatMessage> findChatMessages(String senderId, String recipientId);
}
