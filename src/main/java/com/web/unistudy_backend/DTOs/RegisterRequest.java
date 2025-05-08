package com.web.unistudy_backend.DTOs;

import lombok.Data;

import java.util.ArrayList;
import java.util.List;

@Data
public class RegisterRequest {
    private String firstName;
    private String lastName;
    private String email;
    private String password;
    private String fieldOfStudy;
    private String university;
    private List<String> subjects;
}
