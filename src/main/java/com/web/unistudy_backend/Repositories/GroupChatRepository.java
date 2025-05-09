package com.web.unistudy_backend.Repositories;

import com.web.unistudy_backend.Entities.GroupChat;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface GroupChatRepository extends MongoRepository<GroupChat, String> {
    List<GroupChat> findByMembersContaining(String userId);
    List<GroupChat> findBySubject(String subject);
    List<GroupChat> findBySubjectAndMembersLessThanOrderByCreatedDateDesc(String subject, int maxCapacity);
}
