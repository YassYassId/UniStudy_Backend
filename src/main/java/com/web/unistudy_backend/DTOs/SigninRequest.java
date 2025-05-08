package com.web.unistudy_backend.DTOs;

import lombok.Data;

@Data
public class SigninRequest {
    private String email;
    private String password;
}
