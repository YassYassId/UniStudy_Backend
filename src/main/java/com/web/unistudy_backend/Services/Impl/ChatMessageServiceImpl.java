package com.web.unistudy_backend.Services.Impl;

import com.web.unistudy_backend.Entities.ChatMessage;
import com.web.unistudy_backend.Enums.MessageType;
import com.web.unistudy_backend.Repositories.ChatMessageRepository;
import com.web.unistudy_backend.Services.ChatMessageService;
import com.web.unistudy_backend.Services.ChatRoomService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ChatMessageServiceImpl implements ChatMessageService {
    private final ChatMessageRepository repository;
    private final ChatRoomService chatRoomService;

    public ChatMessage save(ChatMessage chatMessage) {
        if (chatMessage.getType() == MessageType.PRIVATE) {
            var chatId = chatRoomService.getChatRoomId(chatMessage.getSenderId(), chatMessage.getRecipientId(), true)
                    .orElseThrow(() -> new RuntimeException("Chat room not found"));
            chatMessage.setChatId(chatId);
            chatMessage.setTimestamp(new Date());
        }
        return repository.save(chatMessage);
    }

    public List<ChatMessage> findChatMessages(String senderId, String recipientId) {
        var chatId = chatRoomService.getChatRoomId(senderId, recipientId, false);
        return chatId.map(repository::findByChatId).orElse(new ArrayList<>());
    }
}
