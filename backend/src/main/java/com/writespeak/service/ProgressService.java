package com.writespeak.service;

import com.writespeak.model.Progress;
import com.writespeak.repository.ProgressRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class ProgressService {

    @Autowired
    private ProgressRepository repo;

    public Progress getProgress(String sessionId) {
        return repo.findBySessionId(sessionId).orElseGet(() -> {
            Progress p = new Progress();
            p.setSessionId(sessionId);
            return repo.save(p);
        });
    }

    public Progress updateAfterCorrect(String sessionId, String charType, String charValue) {
        Progress p = getProgress(sessionId);

        if ("alphabet".equals(charType) && charValue != null && !p.getAlphabetsDone().contains(charValue)) {
            p.getAlphabetsDone().add(charValue);
        } else if ("number".equals(charType) && charValue != null && !p.getNumbersDone().contains(charValue)) {
            p.getNumbersDone().add(charValue);
        }

        p.setStars(p.getStars() + 1);
        p.setScore(p.getScore() + 10);
        p.setCorrectCount(p.getCorrectCount() + 1);
        p.setTotalAttempts(p.getTotalAttempts() + 1);
        p.setStreak(p.getStreak() + 1);

        // Streak bonuses
        if (p.getStreak() == 3) p.setScore(p.getScore() + 20);

        // Completion bonuses
        if (p.getAlphabetsDone().size() == 26) p.setScore(p.getScore() + 100);
        if (p.getNumbersDone().size() == 10)   p.setScore(p.getScore() + 50);

        p.setAccuracy(calcAccuracy(p));
        return repo.save(p);
    }

    public Progress updateAfterWrong(String sessionId) {
        Progress p = getProgress(sessionId);
        p.setTotalAttempts(p.getTotalAttempts() + 1);
        p.setStreak(0);
        p.setAccuracy(calcAccuracy(p));
        return repo.save(p);
    }

    private double calcAccuracy(Progress p) {
        if (p.getTotalAttempts() == 0) return 100.0;
        return Math.round((double) p.getCorrectCount() / p.getTotalAttempts() * 100);
    }
}
