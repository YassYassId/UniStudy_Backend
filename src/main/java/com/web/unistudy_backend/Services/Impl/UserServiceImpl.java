package com.web.unistudy_backend.Services.Impl;

import com.web.unistudy_backend.DTOs.*;
import com.web.unistudy_backend.Entities.User;
import com.web.unistudy_backend.Enums.Role;
import com.web.unistudy_backend.Repositories.UserRepository;
import com.web.unistudy_backend.Services.JWTService;
import com.web.unistudy_backend.Services.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Lazy;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class UserServiceImpl implements UserService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JWTService jwtService;

    public UserServiceImpl(UserRepository userRepository,
                           PasswordEncoder passwordEncoder,
                           @Lazy AuthenticationManager authenticationManager,
                           JWTService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
    }

    public JwtAuthenticationResponse register(RegisterRequest registerRequest){
        User user = new User();

        user.setFirstName(registerRequest.getFirstName());
        user.setLastName(registerRequest.getLastName());
        user.setEmail(registerRequest.getEmail());
        user.setPassword(passwordEncoder.encode(registerRequest.getPassword()));
        user.setFieldOfStudy(registerRequest.getFieldOfStudy());
        user.setSubjects(registerRequest.getSubjects());
        user.setRole(Role.STUDENT);
        if (userRepository.findByEmail(registerRequest.getEmail()).isPresent()){
            throw new RuntimeException("Email already exists");
        } else {
            userRepository.save(user);
        }


        var jwt = jwtService.generateToken(user);
        var refreshToken = jwtService.generateRefreshToken(new HashMap<>() , user);


        JwtAuthenticationResponse jwtAuthenticationResponse =
                new JwtAuthenticationResponse();

        jwtAuthenticationResponse.setToken(jwt);
        jwtAuthenticationResponse.setRefreshToken(refreshToken);
        return jwtAuthenticationResponse;
    }

    public JwtAuthenticationResponse signin(SigninRequest signinRequest){
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(signinRequest.getEmail(),
                signinRequest.getPassword()));

        var user = userRepository.findByEmail(signinRequest.getEmail()).orElseThrow(
                () -> new IllegalArgumentException("Invalid Username or Password"));
        userRepository.save(user);
        var jwt = jwtService.generateToken(user);
        var refreshToken = jwtService.generateRefreshToken(new HashMap<>() , user);


        JwtAuthenticationResponse jwtAuthenticationResponse =
                new JwtAuthenticationResponse();

        jwtAuthenticationResponse.setToken(jwt);
        jwtAuthenticationResponse.setRefreshToken(refreshToken);

        return jwtAuthenticationResponse;
    }

    public void saveUser(User user) {
        var existUser = userRepository.findByEmail(user.getEmail()).orElse(null);
        if (existUser != null){
            userRepository.save(user);
        }

    }

    public void disconnect(User user) {
        var storedUser = userRepository.findByEmail(user.getEmail()).orElse(null);
        if (storedUser != null) {
            userRepository.save(storedUser);
        }
    }

    public JwtAuthenticationResponse refreshToken(RefreshTokenRequest refreshTokenRequest){
        String email = jwtService.extractUsername(refreshTokenRequest.getRefreshToken());
        User user = userRepository.findByEmail(email).orElseThrow();
        if(jwtService.isTokenValid(refreshTokenRequest.getRefreshToken(), (UserDetails) user)){
            var jwt = jwtService.generateToken((UserDetails) user);

            JwtAuthenticationResponse jwtAuthenticationResponse = new JwtAuthenticationResponse();

            jwtAuthenticationResponse.setToken(jwt);
            jwtAuthenticationResponse.setRefreshToken(refreshTokenRequest.getRefreshToken());

            return jwtAuthenticationResponse;
        }
        return null;
    }

    @Override
    public User loadUserByUsername(String email) {
        return userRepository.findByEmail(email).orElseThrow();
    }

    @Override
    public Optional<User> getUser(String email){
        return userRepository.findByEmail(email);
    }

    public UserDTO getUserInfo(String email){
        Optional<User> user = userRepository.findByEmail(email);
        if (user.isPresent()) {
            UserDTO userDTO = UserDTO.builder()
                    .firstName(user.get().getFirstName())
                    .lastName(user.get().getLastName())
                    .email(user.get().getEmail())
                    .fieldOfStudy(user.get().getFieldOfStudy())
                    .university(user.get().getUniversity())
                    .fieldOfStudy(user.get().getFieldOfStudy())
                    .build();
            return userDTO;
        } else {
            return null;
        }
    }

    @Override
    public UserDetailsService userDetailsService(){
        return email -> userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
    }

    @Override
    public List<UserDTO> getUsers() {
        List<User> users = userRepository.findAll();
        List<UserDTO> userDTOList =new ArrayList<>();
        for (User user : users) {
            UserDTO userDTO = UserDTO.builder()
                    .email(user.getEmail())
                    .firstName(user.getFirstName())
                    .lastName(user.getLastName())
                    .university(user.getUniversity())
                    .fieldOfStudy(user.getFieldOfStudy()).build();

            userDTOList.add(userDTO);
        }

        return userDTOList;
    }
}
