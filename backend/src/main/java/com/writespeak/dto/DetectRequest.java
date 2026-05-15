package com.writespeak.dto;

import lombok.Data;

@Data
public class DetectRequest {
    private String expectedChar;
    private String base64Image;
}
