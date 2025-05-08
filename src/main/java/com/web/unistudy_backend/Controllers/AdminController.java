package com.web.unistudy_backend.Controllers;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("api/admin")
@RequiredArgsConstructor
public class AdminController {
    @GetMapping("/sayHello")
    public ResponseEntity<String> sayHello(){
        return ResponseEntity.ok("Hello Admin!");
    }
}
