import React, { useEffect, useRef, useState } from 'react';
import { useSettings } from '../context/SettingsContext';

const DrawingCanvas = ({ onSubmit, disabled, onPronounce }) => {
  const { settings } = useSettings();
  const sensitivityRef = useRef(15);
  const strokeColorRef = useRef('#FF5E7E');

  useEffect(() => { sensitivityRef.current = settings.gestureSensitivity; }, [settings.gestureSensitivity]);
  useEffect(() => { strokeColorRef.current = settings.strokeColor; }, [settings.strokeColor]);

  const canvasRef = useRef(null);
  const [ctx, setCtx] = useState(null);
  const isDrawingRef = useRef(false);
  const lastPosRef = useRef(null);

  const submittedRef = useRef(false);
  const gestureFrames = useRef({ fist: 0, palm: 0, thumbsUp: 0 });

  const [mouseMode, setMouseMode] = useState(false);
  const isMouseDownRef = useRef(false);
  const mouseModeRef = useRef(false);

  useEffect(() => { mouseModeRef.current = mouseMode; }, [mouseMode]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.lineCap = 'round';
    context.lineJoin = 'round';
    context.lineWidth = 16;

    const BOX_W = 200, BOX_H = 320;
    const BOX_X = (canvas.width - BOX_W) / 2;
    const BOX_Y = (canvas.height - BOX_H) / 2;

    setCtx(context);

    // Glowing particle draw stroke
    const drawStroke = (ax, ay, bx, by) => {
      context.save();
      context.beginPath();
      context.rect(BOX_X, BOX_Y, BOX_W, BOX_H);
      context.clip();
      
      context.shadowBlur = 12;
      context.shadowColor = strokeColorRef.current;
      context.strokeStyle = strokeColorRef.current;
      context.lineWidth = 16;
      context.lineCap = 'round';
      
      context.beginPath();
      context.moveTo(ax, ay);
      context.lineTo(bx, by);
      context.stroke();

      if (Math.random() > 0.5) {
        context.shadowBlur = 6;
        context.shadowColor = '#FFF';
        context.beginPath();
        context.arc(bx + (Math.random() - 0.5) * 16, by + (Math.random() - 0.5) * 16, Math.random() * 3 + 1, 0, Math.PI * 2);
        context.fillStyle = ['#FFD166','#38E4B7','#FFFFFF','#FF5E7E'][Math.floor(Math.random() * 4)];
        context.fill();
      }
      context.restore();
    };

    const getCanvasPos = (e) => {
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY,
      };
    };

    const isInBox = (x, y) =>
      x > BOX_X && x < BOX_X + BOX_W && y > BOX_Y && y < BOX_Y + BOX_H;

    const onMouseDown = (e) => {
      if (!mouseModeRef.current || disabled) return;
      const { x, y } = getCanvasPos(e);
      if (!isInBox(x, y)) return;
      isMouseDownRef.current = true;
      lastPosRef.current = { x, y };
    };

    const onMouseMove = (e) => {
      if (!mouseModeRef.current || !isMouseDownRef.current || disabled) return;
      const { x, y } = getCanvasPos(e);
      if (!isInBox(x, y)) { lastPosRef.current = null; return; }
      if (lastPosRef.current) {
        drawStroke(lastPosRef.current.x, lastPosRef.current.y, x, y);
      }
      lastPosRef.current = { x, y };
    };

    const onMouseUp = () => { isMouseDownRef.current = false; lastPosRef.current = null; };

    canvas.addEventListener('mousedown', onMouseDown);
    canvas.addEventListener('mousemove', onMouseMove);
    canvas.addEventListener('mouseup', onMouseUp);
    canvas.addEventListener('mouseleave', onMouseUp);

    // Touch support
    const onTouchStart = (e) => {
      e.preventDefault();
      if (!mouseModeRef.current || disabled) return;
      const t = e.touches[0];
      const { x, y } = getCanvasPos(t);
      if (!isInBox(x, y)) return;
      isMouseDownRef.current = true;
      lastPosRef.current = { x, y };
    };

    const onTouchMove = (e) => {
      e.preventDefault();
      if (!mouseModeRef.current || !isMouseDownRef.current || disabled) return;
      const t = e.touches[0];
      const { x, y } = getCanvasPos(t);
      if (!isInBox(x, y)) { lastPosRef.current = null; return; }
      if (lastPosRef.current) drawStroke(lastPosRef.current.x, lastPosRef.current.y, x, y);
      lastPosRef.current = { x, y };
    };

    canvas.addEventListener('touchstart', onTouchStart, { passive: false });
    canvas.addEventListener('touchmove', onTouchMove, { passive: false });
    canvas.addEventListener('touchend', onMouseUp);

    window.handleLandmarks = (landmarks) => {
      if (disabled) return;
      
      // If no hands detected, slowly decay gesture frame counts rather than immediate drop to 0
      if (!landmarks || landmarks.length === 0) {
        isDrawingRef.current = false;
        lastPosRef.current = null;
        gestureFrames.current.fist = Math.max(0, gestureFrames.current.fist - 1);
        gestureFrames.current.palm = Math.max(0, gestureFrames.current.palm - 1);
        gestureFrames.current.thumbsUp = Math.max(0, gestureFrames.current.thumbsUp - 1);
        return;
      }

      const hand = landmarks[0];
      const thumbTip = hand[4];
      const indexFingerTip = hand[8];
      const indexFingerMcp = hand[5];
      const middleFingerTip = hand[12];
      const ringFingerTip = hand[16];
      const pinkyTip = hand[20];

      // Screen coordinates (Mirrored X!)
      const x = (1 - indexFingerTip.x) * canvas.width;
      const y = indexFingerTip.y * canvas.height;

      // Finger states compared to PIP joints (more robust for kids)
      const isIndexUp = indexFingerTip.y < hand[6].y;
      const isMiddleUp = middleFingerTip.y < hand[10].y;
      const isRingUp = ringFingerTip.y < hand[14].y;
      const isPinkyUp = pinkyTip.y < hand[18].y;
      const isThumbUp = thumbTip.y < hand[3].y && thumbTip.y < indexFingerMcp.y;

      const isFist = !isIndexUp && !isMiddleUp && !isRingUp && !isPinkyUp && !isThumbUp;
      const isOpenPalm = isIndexUp && isMiddleUp && isRingUp && isPinkyUp;
      const isThumbsUp = isThumbUp && !isIndexUp && !isMiddleUp && !isRingUp && !isPinkyUp;
      const isDrawing = isIndexUp && !isMiddleUp && !isRingUp && !isPinkyUp && !isThumbUp;

      if (isFist) {
        gestureFrames.current.fist++;
        gestureFrames.current.palm = Math.max(0, gestureFrames.current.palm - 1);
        gestureFrames.current.thumbsUp = Math.max(0, gestureFrames.current.thumbsUp - 1);
        
        if (gestureFrames.current.fist > sensitivityRef.current && !submittedRef.current) {
          submittedRef.current = true;
          triggerSubmit();
          gestureFrames.current.fist = 0;
        }
        isDrawingRef.current = false;
        lastPosRef.current = null;
      } else if (isThumbsUp) {
        gestureFrames.current.thumbsUp++;
        gestureFrames.current.fist = Math.max(0, gestureFrames.current.fist - 1);
        gestureFrames.current.palm = Math.max(0, gestureFrames.current.palm - 1);
        
        if (gestureFrames.current.thumbsUp > sensitivityRef.current && !submittedRef.current && onPronounce) {
          submittedRef.current = true;
          onPronounce();
          gestureFrames.current.thumbsUp = 0;
          setTimeout(() => { submittedRef.current = false; }, 2000);
        }
        isDrawingRef.current = false;
        lastPosRef.current = null;
      } else if (isOpenPalm) {
        gestureFrames.current.palm++;
        gestureFrames.current.fist = Math.max(0, gestureFrames.current.fist - 1);
        gestureFrames.current.thumbsUp = Math.max(0, gestureFrames.current.thumbsUp - 1);
        
        if (gestureFrames.current.palm > sensitivityRef.current && !submittedRef.current) {
          handleClear();
          submittedRef.current = true;
          gestureFrames.current.palm = 0;
          setTimeout(() => { submittedRef.current = false; }, 1000);
        }
        isDrawingRef.current = false;
        lastPosRef.current = null;
      } else {
        // Slow decay for mismatched frames
        gestureFrames.current.fist = Math.max(0, gestureFrames.current.fist - 1);
        gestureFrames.current.palm = Math.max(0, gestureFrames.current.palm - 1);
        gestureFrames.current.thumbsUp = Math.max(0, gestureFrames.current.thumbsUp - 1);
      }

      if (isDrawing) {
        const boxX1 = (canvas.width - BOX_W) / 2;
        const boxX2 = (canvas.width + BOX_W) / 2;
        const boxY1 = (canvas.height - BOX_H) / 2;
        const boxY2 = (canvas.height + BOX_H) / 2;

        const inBoundary = x > boxX1 && x < boxX2 && y > boxY1 && y < boxY2;
        if (!inBoundary) {
          isDrawingRef.current = false;
          lastPosRef.current = null;
          return;
        }

        if (!isDrawingRef.current) {
          isDrawingRef.current = true;
          lastPosRef.current = { x, y };
        } else if (context) {
          drawStroke(lastPosRef.current.x, lastPosRef.current.y, x, y);
          lastPosRef.current = { x, y };
        }
      } else {
        isDrawingRef.current = false;
        lastPosRef.current = null;
      }
    };

    return () => {
      window.handleLandmarks = null;
      canvas.removeEventListener('mousedown', onMouseDown);
      canvas.removeEventListener('mousemove', onMouseMove);
      canvas.removeEventListener('mouseup', onMouseUp);
      canvas.removeEventListener('mouseleave', onMouseUp);
      canvas.removeEventListener('touchstart', onTouchStart);
      canvas.removeEventListener('touchmove', onTouchMove);
      canvas.removeEventListener('touchend', onMouseUp);
    };
  }, [disabled, onPronounce]);

  const triggerSubmit = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Convert colored stroke on transparent canvas into black stroke on white canvas (for standard OCR engines)
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    const tempCtx = tempCanvas.getContext('2d');
    
    tempCtx.fillStyle = "white";
    tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
    tempCtx.shadowBlur = 0;
    tempCtx.drawImage(canvas, 0, 0);

    const imgData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
    const data = imgData.data;
    for (let i = 0; i < data.length; i += 4) {
      if (data[i] < 255 || data[i+1] < 255 || data[i+2] < 255) {
        data[i] = 0;
        data[i+1] = 0;
        data[i+2] = 0;
      }
    }
    tempCtx.putImageData(imgData, 0, 0);

    const dataUrl = tempCanvas.toDataURL('image/png');
    onSubmit(dataUrl);

    // Clear original drawing board
    const context = canvas.getContext('2d');
    context.clearRect(0, 0, canvas.width, canvas.height);
    
    setTimeout(() => {
      submittedRef.current = false;
    }, 1500);
  };

  const handleClear = () => {
    if (ctx) {
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
  };

  return (
    <>
      <canvas
        ref={canvasRef}
        width={640}
        height={480}
        className="absolute top-0 left-0 w-full h-full z-20 rounded-[24px]"
        style={{ cursor: mouseMode ? 'crosshair' : 'default' }}
      />

      {/* Mode toggle */}
      <button
        onClick={() => setMouseMode(m => !m)}
        className={`absolute bottom-3 left-3 z-30 font-black text-sm text-white px-5 py-2 rounded-full border-2 border-white shadow-md cursor-pointer transition-colors ${
          mouseMode ? 'bg-primary' : 'bg-secondary'
        }`}
      >
        {mouseMode ? '🖱️ Mouse Mode ON' : '✋ Hand Mode'}
      </button>

      {/* Always-visible fallback control panel for both Hand and Mouse Mode */}
      <div className="absolute bottom-3 right-3 z-30 flex gap-2">
        <button
          onClick={onPronounce}
          className="bg-accent text-slate-800 text-xs font-black border-2 border-white rounded-full py-2 px-4 hover:brightness-105 active:scale-95 shadow"
        >
          🔊 Hear Again
        </button>
        <button
          onClick={handleClear}
          className="bg-slate-400 text-white text-xs font-black border-2 border-white rounded-full py-2 px-4 hover:brightness-105 active:scale-95 shadow"
        >
          🧹 Clear
        </button>
        <button
          onClick={() => !disabled && triggerSubmit()}
          disabled={disabled}
          className={`text-white text-xs font-black border-2 border-white rounded-full py-2 px-5 shadow transition-all ${
            disabled ? 'bg-slate-300 cursor-not-allowed' : 'bg-primary active:scale-95'
          }`}
        >
          ✅ Submit
        </button>
      </div>
    </>
  );
};

export default DrawingCanvas;
