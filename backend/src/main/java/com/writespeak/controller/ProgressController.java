package com.writespeak.controller;

import com.writespeak.model.Progress;
import com.writespeak.service.ProgressService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/progress")
@CrossOrigin(origins = "${cors.allowed.origins}")
public class ProgressController {

    @Autowired
    private ProgressService progressService;

    @GetMapping("/{sessionId}")
    public ResponseEntity<Progress> getProgress(@PathVariable String sessionId) {
        return ResponseEntity.ok(progressService.getProgress(sessionId));
    }

    @PostMapping("/correct")
    public ResponseEntity<Progress> markCorrect(@RequestBody Map<String, String> body) {
        String sessionId = body.get("sessionId");
        String charType  = body.get("charType");   // "alphabet" or "number"
        String charValue = body.get("charValue");   // "A", "1", etc.
        return ResponseEntity.ok(progressService.updateAfterCorrect(sessionId, charType, charValue));
    }

    @PostMapping("/wrong")
    public ResponseEntity<Progress> markWrong(@RequestBody Map<String, String> body) {
        String sessionId = body.get("sessionId");
        return ResponseEntity.ok(progressService.updateAfterWrong(sessionId));
    }
}
