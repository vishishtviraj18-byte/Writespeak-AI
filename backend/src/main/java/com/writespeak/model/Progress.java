package com.writespeak.model;

import jakarta.persistence.*;
import lombok.Data;
import java.util.ArrayList;
import java.util.List;

@Data
@Entity
@Table(name = "progress")
public class Progress {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String sessionId;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "alphabets_done", joinColumns = @JoinColumn(name = "progress_id"))
    @Column(name = "char_value")
    private List<String> alphabetsDone = new ArrayList<>();

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "numbers_done", joinColumns = @JoinColumn(name = "progress_id"))
    @Column(name = "char_value")
    private List<String> numbersDone = new ArrayList<>();

    private int stars;
    private int score;
    private int streak;
    private double accuracy = 100.0;
    private int correctCount;
    private int totalAttempts;
}
