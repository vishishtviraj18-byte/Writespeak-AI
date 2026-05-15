package com.writespeak.controller;

import com.writespeak.model.OcrResult;
import com.writespeak.service.OcrService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/ocr")
@CrossOrigin(origins = "${cors.allowed.origins}")
public class OcrController {

    @Autowired
    private OcrService ocrService;

    @PostMapping("/process")
    public ResponseEntity<OcrResult> processOcr(@RequestBody Map<String, String> body) {
        String base64Image = body.get("image");
        String targetChar = body.get("targetChar");

        if (base64Image == null || targetChar == null) {
            return ResponseEntity.badRequest().build();
        }

        OcrResult result = ocrService.processImage(base64Image, targetChar);
        return ResponseEntity.ok(result);
    }
}
