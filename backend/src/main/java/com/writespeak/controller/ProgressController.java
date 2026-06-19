package com.writespeak.controller;

import com.writespeak.model.Progress;
import com.writespeak.service.ProgressService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/progress")
public class ProgressController {

    @Autowired
    private ProgressService progressService;

    @GetMapping
    public ResponseEntity<Progress> getProgress() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok(progressService.getProgress(username));
    }

    @PostMapping("/correct")
    public ResponseEntity<Progress> markCorrect(@RequestBody Map<String, String> body) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        String charType  = body.get("charType");   // "alphabet" or "number"
        String charValue = body.get("charValue");   // "A", "1", etc.
        return ResponseEntity.ok(progressService.updateAfterCorrect(username, charType, charValue));
    }

    @PostMapping("/wrong")
    public ResponseEntity<Progress> markWrong() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok(progressService.updateAfterWrong(username));
    }

    @PostMapping("/bonus")
    public ResponseEntity<Progress> awardBonus(@RequestBody Map<String, Object> body) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        int score = body.containsKey("score") ? Integer.parseInt(String.valueOf(body.get("score"))) : 0;
        int stars = body.containsKey("stars") ? Integer.parseInt(String.valueOf(body.get("stars"))) : 0;
        return ResponseEntity.ok(progressService.awardBonus(username, score, stars));
    }
}
