package com.web.unistudy_backend.Controllers;

import com.web.unistudy_backend.DTOs.*;
import com.web.unistudy_backend.Entities.User;
import com.web.unistudy_backend.Services.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("api/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class AuthenticationController {
    private final UserService userService;
//    private final SimpMessagingTemplate messagingTemplate;


    @PostMapping(value = "/register")
    public ResponseEntity<JwtAuthenticationResponse> register(@RequestBody RegisterRequest registerRequest){
        System.out.println(registerRequest);
        JwtAuthenticationResponse response = userService.register(registerRequest);
        Optional<User> newUser = userService.getUser(registerRequest.getEmail());
//        messagingTemplate.convertAndSend("/topic/public", newUser.get()); // Send notification after successful registration
        return ResponseEntity.ok(response);
    }


    @PostMapping(value = "/signin")
    public ResponseEntity<JwtAuthenticationResponse> signin(@RequestBody SigninRequest signinRequest){
        return ResponseEntity.ok(userService.signin(signinRequest));
    }

    @GetMapping(value = "/usersList")
    public ResponseEntity<List<UserDTO>> getUsers(){
        return ResponseEntity.ok(userService.getUsers());
    }


    @MessageMapping("/user/addUser")
    @SendTo("/topic/public")
    public User addUser(
            @Payload User user
    ) {
        return user;
    }

    @MessageMapping("/user/disconnectUser")
    @SendTo("/topic/public")
    public User disconnectUser(
            @Payload User user
    ) {
        userService.disconnect(user);
        return user;
    }

    @PostMapping(value = "/refresh" , consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<JwtAuthenticationResponse> refresh(@RequestBody RefreshTokenRequest refreshTokenRequest){
        return ResponseEntity.ok(userService.refreshToken(refreshTokenRequest));
    }
}
