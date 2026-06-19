package com.writespeak.controller;

import com.writespeak.model.TestResult;
import com.writespeak.service.TestResultService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/test")
public class TestController {

    @Autowired
    private TestResultService testResultService;

    @PostMapping("/evaluate")
    public ResponseEntity<TestResult> evaluate(@RequestBody Map<String, Object> body) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        String testType = (String) body.getOrDefault("testType", "ALPHABET");
        List<Map<String, Object>> answers = (List<Map<String, Object>>) body.get("answers");

        TestResult result = testResultService.evaluateAndSaveTest(username, testType, answers);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/history")
    public ResponseEntity<List<TestResult>> getHistory() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok(testResultService.getTestHistory(username));
    }

    @PostMapping("/generate-queue")
    public ResponseEntity<List<String>> generateQueue(@RequestBody Map<String, Object> body) {
        List<String> alpha = (List<String>) body.get("alphabetsDone");
        List<String> nums  = (List<String>) body.get("numbersDone");
        int count = body.containsKey("count") ? Integer.parseInt(String.valueOf(body.get("count"))) : 10;

        List<String> all = new java.util.ArrayList<>();
        if (alpha != null) all.addAll(alpha);
        if (nums != null) all.addAll(nums);
        Collections.shuffle(all);

        List<String> result = all.subList(0, Math.min(count, all.size()));
        return ResponseEntity.ok(result);
    }
}
