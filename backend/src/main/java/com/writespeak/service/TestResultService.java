package com.writespeak.service;

import com.writespeak.model.TestResult;
import com.writespeak.repository.TestResultRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
public class TestResultService {

    @Autowired
    private TestResultRepository testResultRepository;

    @Autowired
    private ProgressService progressService;

    public TestResult evaluateAndSaveTest(String username, String testType, List<Map<String, Object>> answers) {
        int correct = 0;
        List<String> wrongChars = java.util.ArrayList.class.cast(new java.util.ArrayList<String>());

        for (Map<String, Object> answer : answers) {
            String target = (String) answer.get("target");
            Boolean isCorrect = (Boolean) answer.get("correct");
            String detected = (String) answer.getOrDefault("detected", "?");

            if (isCorrect != null && isCorrect) {
                correct++;
            } else if (target != null) {
                wrongChars.add(target + "(" + detected + ")");
            }
        }

        int total = answers.size();
        double accuracy = total > 0 ? Math.round((double) correct / total * 100) : 0.0;
        int score = correct * 15;

        TestResult result = new TestResult();
        result.setUsername(username);
        result.setTestType(testType.toUpperCase());
        result.setTotalQuestions(total);
        result.setCorrectAnswers(correct);
        result.setAccuracy(accuracy);
        result.setScore(score);
        result.setWrongChars(wrongChars);

        String grade =
            accuracy >= 90 ? "A+ 🌟 Outstanding!" :
            accuracy >= 80 ? "A  ⭐ Excellent!"    :
            accuracy >= 70 ? "B  👍 Good Job!"     :
            accuracy >= 60 ? "C  💪 Keep Going!"   :
                             "D  📚 Practice More!";
        result.setGrade(grade);

        // Update student progress tracker document
        progressService.awardBonus(username, score, correct);

        return testResultRepository.save(result);
    }

    public List<TestResult> getTestHistory(String username) {
        return testResultRepository.findByUsernameOrderByDateDesc(username);
    }
}
