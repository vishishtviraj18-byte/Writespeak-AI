package com.writespeak.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DetectResponse {
    private String recognizedChar;
    private boolean isMatch;
    private String message;
}
