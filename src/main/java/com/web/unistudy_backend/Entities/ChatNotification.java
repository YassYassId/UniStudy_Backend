package com.web.unistudy_backend.Entities;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChatNotification {
    private String id;
    private String senderId;
    private String recipientId;
    private String groupId;
    private String content;

    // private messages
    public ChatNotification(String id, String senderId, String recipientId, String content) {
        this.id = id;
        this.senderId = senderId;
        this.recipientId = recipientId;
        this.content = content;
    }

    // group messages
    public ChatNotification(String id, String senderId, String groupId, String content, boolean isGroupMessage) {
        this.id = id;
        this.senderId = senderId;
        this.groupId = groupId;
        this.content = content;
    }
}
