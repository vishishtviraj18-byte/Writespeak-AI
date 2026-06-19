package com.writespeak.service;

import com.writespeak.model.Progress;
import com.writespeak.repository.ProgressRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class ProgressService {

    @Autowired
    private ProgressRepository progressRepository;

    public Progress getProgress(String username) {
        return progressRepository.findByUsername(username).orElseGet(() -> {
            Progress p = new Progress();
            p.setUsername(username);
            return progressRepository.save(p);
        });
    }

    public Progress updateAfterCorrect(String username, String charType, String charValue) {
        Progress p = getProgress(username);

        if ("alphabet".equalsIgnoreCase(charType) && charValue != null && !p.getAlphabetsDone().contains(charValue)) {
            p.getAlphabetsDone().add(charValue.toUpperCase());
        } else if ("number".equalsIgnoreCase(charType) && charValue != null && !p.getNumbersDone().contains(charValue)) {
            p.getNumbersDone().add(charValue);
        }

        p.setStars(p.getStars() + 1);
        p.setScore(p.getScore() + 10);
        p.setCorrectCount(p.getCorrectCount() + 1);
        p.setTotalAttempts(p.getTotalAttempts() + 1);
        p.setStreak(p.getStreak() + 1);

        // Streak bonuses
        if (p.getStreak() == 3) {
            p.setScore(p.getScore() + 20);
            p.setStars(p.getStars() + 2);
        }

        // Completion bonuses
        if (p.getAlphabetsDone().size() == 26) p.setScore(p.getScore() + 100);
        if (p.getNumbersDone().size() == 10)   p.setScore(p.getScore() + 50);

        p.setAccuracy(calcAccuracy(p));
        return progressRepository.save(p);
    }

    public Progress updateAfterWrong(String username) {
        Progress p = getProgress(username);
        p.setTotalAttempts(p.getTotalAttempts() + 1);
        p.setStreak(0);
        p.setAccuracy(calcAccuracy(p));
        return progressRepository.save(p);
    }

    public Progress awardBonus(String username, int scoreBonus, int starsBonus) {
        Progress p = getProgress(username);
        p.setScore(p.getScore() + scoreBonus);
        p.setStars(p.getStars() + starsBonus);
        return progressRepository.save(p);
    }

    private double calcAccuracy(Progress p) {
        if (p.getTotalAttempts() == 0) return 100.0;
        return Math.round((double) p.getCorrectCount() / p.getTotalAttempts() * 100);
    }
}
