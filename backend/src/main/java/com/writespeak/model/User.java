package com.writespeak.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.ArrayList;
import java.util.List;

@Data
@Document(collection = "users")
public class User {
    @Id
    private String id;

    @Indexed(unique = true)
    private String username;

    private String password; // Will be stored as BCrypt hash

    private String name;

    private Integer age;

    private String gender; // "male" | "female" | "other"

    private List<String> roles = new ArrayList<>();
}
