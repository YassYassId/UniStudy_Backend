package com.web.unistudy_backend.Services;

import com.web.unistudy_backend.DTOs.*;
import com.web.unistudy_backend.Entities.User;
import org.springframework.security.core.userdetails.UserDetailsService;

import java.util.List;
import java.util.Optional;

public interface UserService {
    UserDetailsService userDetailsService();

    JwtAuthenticationResponse register(RegisterRequest registerRequest);

    JwtAuthenticationResponse signin(SigninRequest signinRequest);

    JwtAuthenticationResponse refreshToken(RefreshTokenRequest refreshTokenRequest);

    void saveUser(User user);

    void disconnect(User user);

    User loadUserByUsername(String email);

    List<UserDTO> getUsers();

    UserDTO getUserInfo(String username);

    Optional<User> getUser(String email);
}
