package com.writespeak.model;

import lombok.Data;

@Data
public class OcrResult {
    private String detectedChar;
    private String targetChar;
    private boolean correct;
    private double confidence;
    private String message;
}
