package com.web.unistudy_backend.Services;

import java.util.Optional;

public interface ChatRoomService {
    Optional<String> getChatRoomId(
            String senderId,
            String recipientId,
            boolean createNewRoomIfNotExists
    );
}
