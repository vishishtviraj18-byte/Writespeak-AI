package com.writespeak.service;

import com.writespeak.model.TestResult;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class TestService {

    public TestResult evaluateTest(List<Map<String, String>> answers) {
        TestResult result = new TestResult();
        int correct = 0;
        List<String> wrongChars = new ArrayList<>();

        for (Map<String, String> answer : answers) {
            String target   = answer.get("target");
            String detected = answer.get("detected");
            if (target != null && target.equalsIgnoreCase(detected)) {
                correct++;
            } else if (target != null) {
                wrongChars.add(target);
            }
        }

        int total = answers.size();
        result.setTotalQuestions(total);
        result.setCorrectAnswers(correct);
        result.setWrongChars(wrongChars);
        result.setAccuracy(total > 0 ? (double) correct / total * 100 : 0);
        result.setScore(correct * 15);

        double acc = result.getAccuracy();
        result.setGrade(
            acc >= 90 ? "A+ 🌟 Outstanding!" :
            acc >= 80 ? "A  ⭐ Excellent!"    :
            acc >= 70 ? "B  👍 Good Job!"     :
            acc >= 60 ? "C  💪 Keep Going!"   :
                        "D  📚 Practice More!"
        );

        return result;
    }

    public List<String> generateTestQueue(List<String> alphabetsDone, List<String> numbersDone, int count) {
        List<String> all = new ArrayList<>();
        if (alphabetsDone != null) all.addAll(alphabetsDone);
        if (numbersDone   != null) all.addAll(numbersDone);
        Collections.shuffle(all);
        return all.subList(0, Math.min(count, all.size()));
    }
}
