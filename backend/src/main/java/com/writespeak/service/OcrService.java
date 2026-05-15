package com.writespeak.service;

import com.writespeak.model.OcrResult;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.imageio.ImageIO;
import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.util.Base64;

@Service
public class OcrService {

    @Value("${tesseract.data.path:tessdata}")
    private String tessDataPath;

    @Value("${tesseract.language:eng}")
    private String language;

    // Set useMock=false and install Tesseract + tessdata to enable real OCR
    private static final boolean USE_MOCK = true;

    public OcrResult processImage(String base64Image, String targetChar) {
        OcrResult result = new OcrResult();
        result.setTargetChar(targetChar);

        if (USE_MOCK) {
            // Mock always returns correct for demo/testing
            System.out.println("[Mock OCR] Simulating recognition for: " + targetChar);
            result.setDetectedChar(targetChar);
            result.setCorrect(true);
            result.setConfidence(0.99);
            result.setMessage("Excellent! Perfect match! 🌟");
            return result;
        }

        try {
            String imageData = base64Image.replaceFirst("data:image/\\w+;base64,", "");
            byte[] imageBytes = Base64.getDecoder().decode(imageData);
            BufferedImage image = ImageIO.read(new ByteArrayInputStream(imageBytes));
            BufferedImage processed = preprocessImage(image);

            // Tesseract via Tess4J (requires local installation)
            net.sourceforge.tess4j.Tesseract tesseract = new net.sourceforge.tess4j.Tesseract();
            tesseract.setDatapath(tessDataPath);
            tesseract.setLanguage(language);
            tesseract.setPageSegMode(10);  // Single character
            tesseract.setOcrEngineMode(1); // LSTM
            tesseract.setVariable("tessedit_char_whitelist", "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789");

            String detected = tesseract.doOCR(processed).trim().toUpperCase().replaceAll("[^A-Z0-9]", "");

            if (detected.isEmpty()) {
                result.setDetectedChar("?");
                result.setCorrect(false);
                result.setConfidence(0.0);
                result.setMessage("Could not detect character. Try writing larger!");
            } else {
                String firstChar = detected.substring(0, 1);
                boolean correct  = firstChar.equals(targetChar.toUpperCase());
                result.setDetectedChar(firstChar);
                result.setCorrect(correct);
                result.setConfidence(correct ? 0.95 : 0.30);
                result.setMessage(correct
                    ? "Excellent! Perfect match! 🌟"
                    : "Almost! Detected '" + firstChar + "' but expected '" + targetChar + "'");
            }
        } catch (Exception e) {
            e.printStackTrace();
            result.setDetectedChar("?");
            result.setCorrect(false);
            result.setMessage("OCR error: " + e.getMessage());
        }

        return result;
    }

    private BufferedImage preprocessImage(BufferedImage original) {
        int w = original.getWidth();
        int h = original.getHeight();
        BufferedImage out = new BufferedImage(w, h, BufferedImage.TYPE_INT_RGB);
        for (int x = 0; x < w; x++) {
            for (int y = 0; y < h; y++) {
                int rgb = original.getRGB(x, y);
                int r = (rgb >> 16) & 0xFF;
                int g = (rgb >> 8) & 0xFF;
                int b = rgb & 0xFF;
                int brightness = (r + g + b) / 3;
                int newRgb = (brightness < 128) ? 0x000000 : 0xFFFFFF;
                out.setRGB(x, y, newRgb);
            }
        }
        return out;
    }
}
