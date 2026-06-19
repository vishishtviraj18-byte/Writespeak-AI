package com.writespeak.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.ArrayList;
import java.util.List;

@Data
@Document(collection = "progress")
public class Progress {
    @Id
    private String id;

    @Indexed(unique = true)
    private String username;

    private List<String> alphabetsDone = new ArrayList<>();
    private List<String> numbersDone = new ArrayList<>();

    private int stars;
    private int score;
    private int streak;
    private double accuracy = 100.0;
    private int correctCount;
    private int totalAttempts;
}
