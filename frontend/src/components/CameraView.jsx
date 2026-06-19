import React, { useEffect, useRef } from 'react';

const CameraView = ({ onFrame }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const isProcessingRef = useRef(false);

  useEffect(() => {
    const videoElement = videoRef.current;
    const canvasElement = canvasRef.current;
    
    if (!videoElement || !canvasElement || !window.Hands || !window.Camera || !window.SelfieSegmentation) {
      console.warn("MediaPipe scripts not loaded yet in index.html");
      return;
    }

    const canvasCtx = canvasElement.getContext('2d');

    // 1. Initialize Hands Model
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
      canvasCtx.save();
      canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
      
      // Draw segmentation mask
      canvasCtx.drawImage(results.segmentationMask, 0, 0, canvasElement.width, canvasElement.height);
      
      // Only keep the inside of the mask for the actual webcam image
      canvasCtx.globalCompositeOperation = 'source-in';
      canvasCtx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height);
      
      canvasCtx.restore();
    });

    // 3. Start Camera and loop feeds
    const camera = new window.Camera(videoElement, {
      onFrame: async () => {
        if (!isProcessingRef.current) {
          isProcessingRef.current = true;
          try {
            await hands.send({ image: videoElement });
            await segmentation.send({ image: videoElement });
          } catch (err) {
            console.error("MediaPipe frame processing error:", err);
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
      <video
        ref={videoRef}
        style={{ display: 'none' }}
        autoPlay
        playsInline
      ></video>
      <canvas
        ref={canvasRef}
        width={640}
        height={480}
        className="w-full h-full object-cover -scale-x-100 rounded-[24px]"
      ></canvas>
    </>
  );
};

export default CameraView;
