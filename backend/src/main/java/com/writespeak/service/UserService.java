package com.writespeak.service;

import com.writespeak.config.JwtTokenProvider;
import com.writespeak.model.Progress;
import com.writespeak.model.User;
import com.writespeak.repository.ProgressRepository;
import com.writespeak.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProgressRepository progressRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtTokenProvider tokenProvider;

    public Map<String, Object> register(String username, String password, String name, String gender, Integer age) {
        if (userRepository.existsByUsername(username)) {
            throw new IllegalArgumentException("Username already taken");
        }

        User user = new User();
        user.setUsername(username);
        user.setPassword(passwordEncoder.encode(password));
        user.setName(name);
        user.setGender(gender);
        user.setAge(age);
        user.setRoles(Collections.singletonList("ROLE_USER"));
        userRepository.save(user);

        // Auto-create initial progress tracker document in MongoDB for this user
        Progress p = new Progress();
        p.setUsername(username);
        progressRepository.save(p);

        return toPublicResponse(user, tokenProvider.generateToken(username));
    }

    public Map<String, Object> login(String username, String password) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("Invalid username or password"));

        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new IllegalArgumentException("Invalid username or password");
        }

        return toPublicResponse(user, tokenProvider.generateToken(username));
    }

    private Map<String, Object> toPublicResponse(User user, String token) {
        Map<String, Object> response = new HashMap<>();
        response.put("token", token);
        response.put("username", user.getUsername());
        response.put("name", user.getName());
        response.put("gender", user.getGender());
        response.put("age", user.getAge());
        return response;
    }
}
