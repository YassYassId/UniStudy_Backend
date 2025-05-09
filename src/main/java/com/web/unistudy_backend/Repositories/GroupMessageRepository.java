package com.web.unistudy_backend.Repositories;

import com.web.unistudy_backend.Entities.ChatMessage;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface GroupMessageRepository extends MongoRepository<ChatMessage, String> {
    List<ChatMessage> findByGroupIdOrderByTimestampAsc(String groupId);
}
