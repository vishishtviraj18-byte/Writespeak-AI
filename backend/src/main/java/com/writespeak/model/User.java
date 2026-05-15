package com.writespeak.model;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String username;

    @Column(nullable = false)
    private String password; // stored as plain text for MVP; use BCrypt in production

    @Column(nullable = false)
    private String name;

    private String gender; // "male" | "female" | "other"

    private Integer age;
}
