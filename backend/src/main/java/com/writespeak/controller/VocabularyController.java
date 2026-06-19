package com.writespeak.controller;

import com.writespeak.dto.WordData;
import com.writespeak.service.VocabularyService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/vocabulary")
public class VocabularyController {

    @Autowired
    private VocabularyService vocabularyService;

    @GetMapping("/{word}")
    public ResponseEntity<WordData> getWordData(@PathVariable String word) {
        WordData data = vocabularyService.getWordData(word);
        if (data == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(data);
    }
}
