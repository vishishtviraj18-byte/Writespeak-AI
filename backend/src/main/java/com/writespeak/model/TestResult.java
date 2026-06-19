package com.writespeak.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Data
@Document(collection = "test_results")
public class TestResult {
    @Id
    private String id;

    @Indexed
    private String username;

    private String testType; // "ALPHABET" | "NUMBER"
    private int totalQuestions;
    private int correctAnswers;
    private double accuracy;
    private int score;
    private String grade;
    private List<String> wrongChars = new ArrayList<>();
    private Instant date = Instant.now();
}
