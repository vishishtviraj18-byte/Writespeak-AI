package com.writespeak.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.writespeak.dto.WordData;
import me.xdrop.fuzzywuzzy.FuzzySearch;
import me.xdrop.fuzzywuzzy.model.ExtractedResult;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
public class VocabularyService {
    private Map<String, WordData> vocabulary;
    private List<String> vocabWords;

    @PostConstruct
    public void init() {
        try {
            ObjectMapper mapper = new ObjectMapper();
            InputStream is = new ClassPathResource("vocabulary.json").getInputStream();
            vocabulary = mapper.readValue(is, new TypeReference<Map<String, WordData>>() {});
            vocabWords = new ArrayList<>(vocabulary.keySet());
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    public ExtractedResult getBestMatch(String text) {
        if (text == null || text.trim().isEmpty()) return null;
        return FuzzySearch.extractOne(text.toUpperCase(), vocabWords);
    }

    public WordData getWordData(String word) {
        return vocabulary.get(word.toUpperCase());
    }
}
