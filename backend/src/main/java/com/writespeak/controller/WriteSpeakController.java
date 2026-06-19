package com.writespeak.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class WriteSpeakController {

    @GetMapping("/")
    public String index() {
        return "WriteSpeak AI Spring Boot Backend with MongoDB Atlas & JWT Security is running successfully!";
    }
}
