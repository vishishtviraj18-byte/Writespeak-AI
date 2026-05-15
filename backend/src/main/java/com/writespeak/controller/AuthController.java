package com.writespeak.controller;

import com.writespeak.model.User;
import com.writespeak.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "${cors.allowed.origins}")
public class AuthController {

    @Autowired
    private UserService userService;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Map<String, Object> body) {
        try {
            String username = (String) body.get("username");
            String password = (String) body.get("password");
            String name     = (String) body.get("name");
            String gender   = (String) body.getOrDefault("gender", "other");
            Integer age     = body.get("age") instanceof Integer
                ? (Integer) body.get("age")
                : Integer.parseInt(String.valueOf(body.get("age")));

            User user = userService.register(username, password, name, gender, age);
            return ResponseEntity.ok(userService.toPublic(user));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> body) {
        try {
            User user = userService.login(body.get("username"), body.get("password"));
            return ResponseEntity.ok(userService.toPublic(user));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(401).body(e.getMessage());
        }
    }
}
