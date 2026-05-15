package com.writespeak.controller;

import com.writespeak.model.TestResult;
import com.writespeak.service.TestService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/test")
@CrossOrigin(origins = "${cors.allowed.origins}")
public class TestController {

    @Autowired
    private TestService testService;

    @PostMapping("/evaluate")
    public ResponseEntity<TestResult> evaluate(@RequestBody List<Map<String, String>> answers) {
        return ResponseEntity.ok(testService.evaluateTest(answers));
    }

    @PostMapping("/generate-queue")
    public ResponseEntity<List<String>> generateQueue(@RequestBody Map<String, Object> body) {
        List<String> alpha = (List<String>) body.get("alphabetsDone");
        List<String> nums  = (List<String>) body.get("numbersDone");
        int count = body.containsKey("count") ? (int) body.get("count") : 10;
        return ResponseEntity.ok(testService.generateTestQueue(alpha, nums, count));
    }
}
