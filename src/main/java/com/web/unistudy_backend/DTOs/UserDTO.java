package com.web.unistudy_backend.DTOs;

import lombok.Builder;
import lombok.Data;

import java.util.ArrayList;
import java.util.List;

@Data
@Builder
public class UserDTO {
    private String firstName;
    private String lastName;
    private String email;
    private String password;
    private String fieldOfStudy;
    private String university;
    private List<String> subjects;
}
