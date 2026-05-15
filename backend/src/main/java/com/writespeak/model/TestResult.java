package com.writespeak.model;

import lombok.Data;
import java.util.List;

@Data
public class TestResult {
    private int totalQuestions;
    private int correctAnswers;
    private double accuracy;
    private int score;
    private String grade;
    private List<String> wrongChars;
}
