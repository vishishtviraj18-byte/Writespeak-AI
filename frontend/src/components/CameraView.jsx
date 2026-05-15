import React, { useEffect, useRef } from 'react';

const CameraView = ({ onFrame }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const isProcessingRef = useRef(false);

  useEffect(() => {
    const videoElement = videoRef.current;
    const canvasElement = canvasRef.current;
    
    if (!videoElement || !canvasElement || !window.Hands || !window.Camera || !window.SelfieSegmentation) {
      console.warn("MediaPipe scripts not loaded yet");
      return;
    }

    const canvasCtx = canvasElement.getContext('2d');

    // 1. Initialize Hands
    const hands = new window.Hands({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
    });
    hands.setOptions({
      maxNumHands: 1,
      modelComplexity: 1,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5
    });
    hands.onResults((results) => {
      if (onFrame && results.multiHandLandmarks) {
        onFrame(results.multiHandLandmarks);
      }
    });

    // 2. Initialize Selfie Segmentation (Background Removal)
    const segmentation = new window.SelfieSegmentation({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation/${file}`
    });
    segmentation.setOptions({
      modelSelection: 0 // 0 = general (faster), 1 = landscape (more accurate but slower)
    });
    
    segmentation.onResults((results) => {
      // Draw segmented output to canvas (Layer 2)
      canvasCtx.save();
      canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
      
      // Draw the mask
      canvasCtx.drawImage(results.segmentationMask, 0, 0, canvasElement.width, canvasElement.height);
      
      // Only overwrite inside the mask with the actual camera feed
      canvasCtx.globalCompositeOperation = 'source-in';
      canvasCtx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height);
      
      canvasCtx.restore();
    });

    // 3. Start Camera and feed to both models
    const camera = new window.Camera(videoElement, {
      onFrame: async () => {
        if (!isProcessingRef.current) {
          isProcessingRef.current = true;
          try {
            // Run sequentially to avoid WebGL context conflicts between the two models
            await hands.send({ image: videoElement });
            await segmentation.send({ image: videoElement });
          } catch (err) {
            console.error("Model processing error:", err);
          } finally {
            isProcessingRef.current = false;
          }
        }
      },
      width: 640,
      height: 480
    });

    camera.start();

    return () => {
      camera.stop();
      hands.close();
      segmentation.close();
    };
  }, [onFrame]);

  return (
    <>
      {/* Hidden raw video feed */}
      <video
        ref={videoRef}
        style={{ display: 'none' }}
        autoPlay
        playsInline
      ></video>
      
      {/* Segmented output canvas (Layer 2) */}
      <canvas
        ref={canvasRef}
        width={640}
        height={480}
        className="video-element"
      ></canvas>
    </>
  );
};

export default CameraView;
