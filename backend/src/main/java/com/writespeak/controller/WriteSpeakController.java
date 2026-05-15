package com.writespeak.controller;

import com.writespeak.dto.DetectResponse;
import com.writespeak.dto.WordData;
import com.writespeak.service.OcrService;
import com.writespeak.service.VocabularyService;
import me.xdrop.fuzzywuzzy.model.ExtractedResult;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Base64;

@RestController
public class WriteSpeakController {

    @Autowired
    private OcrService ocrService;

    @Autowired
    private VocabularyService vocabularyService;

    @GetMapping("/")
    public String index() {
        return "WriteSpeak AI Backend is running! The API is at /api/detect. Please open the React frontend (usually http://localhost:5173) in your browser to view the application.";
    }

    @PostMapping("/api/detect")
    public DetectResponse detectWord(@RequestParam("image") MultipartFile image) {
        DetectResponse response = new DetectResponse();
        try {
            if (image.isEmpty()) {
                response.setSuccess(false);
                response.setError("Image is empty");
                return response;
            }

            // Convert to Base64
            String base64String = Base64.getEncoder().encodeToString(image.getBytes());
            String dataUri = "data:" + image.getContentType() + ";base64," + base64String;

            // OCR
            String detectedText = ocrService.extractTextFromBase64(dataUri);

            if (detectedText == null || detectedText.isEmpty()) {
                response.setSuccess(false);
                response.setError("No text detected");
                return response;
            }

            // Remove special characters, but keep letters and numbers
            String cleanText = detectedText.replaceAll("[^a-zA-Z0-9]", "");
            response.setDetectedText(cleanText.isEmpty() ? detectedText : cleanText);

            String textToMatch = cleanText.isEmpty() ? detectedText : cleanText;
            
            if (textToMatch.length() == 1) {
                // Alphabet or Number fallback
                boolean isNumber = Character.isDigit(textToMatch.charAt(0));
                response.setSuccess(true);
                response.setMatchedWord(textToMatch.toUpperCase());
                response.setScore(100);
                response.setCategory(isNumber ? "Number" : "Alphabet");
                response.setMeaning(isNumber ? "The number " + textToMatch : "The letter " + textToMatch.toUpperCase());
                response.setExample(isNumber ? "Can you count to " + textToMatch + "?" : "Can you draw the next letter?");
            } else {
                // Fuzzy Match
                ExtractedResult match = vocabularyService.getBestMatch(textToMatch);
                
                // Threshold for match
                if (match != null && match.getScore() > 40) {
                    WordData wordData = vocabularyService.getWordData(match.getString());
                    response.setSuccess(true);
                    response.setMatchedWord(match.getString());
                    response.setScore(match.getScore());
                    response.setCategory(wordData.getCategory());
                    response.setMeaning(wordData.getMeaning());
                    response.setExample(wordData.getExample());
                } else {
                    // Fallback: Treat unknown words as a Name!
                    response.setSuccess(true);
                    response.setMatchedWord(textToMatch);
                    response.setScore(0);
                    response.setCategory("Name / New Word");
                    response.setMeaning("A special name or a word I am still learning!");
                    response.setExample("Hello, " + textToMatch + "!");
                }
            }

        } catch (Exception e) {
            response.setSuccess(false);
            response.setError("Error processing image: " + e.getMessage());
            e.printStackTrace();
        }
        return response;
    }
}
