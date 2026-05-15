package com.writespeak.service;

import com.writespeak.model.User;
import com.writespeak.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    public User register(String username, String password, String name, String gender, Integer age) {
        if (userRepository.existsByUsername(username)) {
            throw new IllegalArgumentException("Username already taken");
        }
        User user = new User();
        user.setUsername(username);
        user.setPassword(password); // TODO: hash with BCrypt in production
        user.setName(name);
        user.setGender(gender);
        user.setAge(age);
        return userRepository.save(user);
    }

    public User login(String username, String password) {
        return userRepository.findByUsername(username)
            .filter(u -> u.getPassword().equals(password))
            .orElseThrow(() -> new IllegalArgumentException("Invalid username or password"));
    }

    public Map<String, Object> toPublic(User user) {
        return Map.of(
            "id",       user.getId(),
            "username", user.getUsername(),
            "name",     user.getName(),
            "gender",   user.getGender() != null ? user.getGender() : "other",
            "age",      user.getAge()    != null ? user.getAge()    : 0,
            "sessionId", user.getUsername()
        );
    }
}
