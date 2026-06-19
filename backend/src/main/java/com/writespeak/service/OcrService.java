package com.writespeak.service;

import com.writespeak.model.OcrResult;
import org.springframework.stereotype.Service;

@Service
public class OcrService {

    public OcrResult processImage(String base64Image, String targetChar) {
        OcrResult result = new OcrResult();
        result.setTargetChar(targetChar);

        // Simple mock character matcher for demo/offline fallback.
        // Tesseract.js client-side does the actual evaluation on the frontend,
        // but this endpoint provides a clean backend fallback.
        System.out.println("[Mock OCR] Simulating recognition for: " + targetChar);
        result.setDetectedChar(targetChar);
        result.setCorrect(true);
        result.setConfidence(0.99);
        result.setMessage("Excellent! Perfect match! 🌟");

        return result;
    }
}
