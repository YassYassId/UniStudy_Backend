package com.web.unistudy_backend.Repositories;

import com.web.unistudy_backend.Entities.User;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface UserRepository extends MongoRepository<User, String> {
    Optional<User> findByEmail(String email);

    String email(String email);
}