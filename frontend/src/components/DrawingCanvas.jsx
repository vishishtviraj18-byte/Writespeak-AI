import React, { useEffect, useRef, useState } from 'react';
import { useSettings } from '../context/SettingsContext';

const DrawingCanvas = ({ onSubmit, disabled, onPronounce }) => {
  const { settings } = useSettings();
  const sensitivityRef = useRef(25);
  const strokeColorRef = useRef('#FF5E7E');

  // Keep refs in sync (event listeners read refs, not state)
  useEffect(() => { sensitivityRef.current = settings.gestureSensitivity; }, [settings.gestureSensitivity]);
  useEffect(() => { strokeColorRef.current = settings.strokeColor; }, [settings.strokeColor]);

  const canvasRef    = useRef(null);
  const [ctx, setCtx] = useState(null);
  const isDrawingRef = useRef(false);
  const lastPosRef   = useRef(null);

  const submittedRef  = useRef(false);
  const gestureFrames = useRef({ fist: 0, palm: 0, thumbsUp: 0 });

  // ── Mouse mode toggle ──
  const [mouseMode, setMouseMode] = useState(false);
  const isMouseDownRef = useRef(false);
  const mouseModeRef   = useRef(false); // ref so event listeners see fresh value

  // Keep ref in sync with state
  useEffect(() => { mouseModeRef.current = mouseMode; }, [mouseMode]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.lineCap  = 'round';
    context.lineJoin = 'round';
    context.lineWidth = 16;

    const BOX_W = 200, BOX_H = 320;
    const BOX_X = (canvas.width  - BOX_W) / 2;
    const BOX_Y = (canvas.height - BOX_H) / 2;

    setCtx(context);

    // ── Helper: draw a clipped glowing stroke between two points ──
    const drawStroke = (ax, ay, bx, by) => {
      context.save();
      context.beginPath();
      context.rect(BOX_X, BOX_Y, BOX_W, BOX_H);
      context.clip();
      context.shadowBlur   = 12;
      context.shadowColor  = '#FFD166';
      context.strokeStyle  = '#FF5E7E';
      context.lineWidth    = 16;
      context.lineCap      = 'round';
      context.beginPath();
      context.moveTo(ax, ay);
      context.lineTo(bx, by);
      context.stroke();
      if (Math.random() > 0.5) {
        context.shadowBlur  = 6;
        context.shadowColor = '#FFF';
        context.beginPath();
        context.arc(bx + (Math.random()-0.5)*16, by + (Math.random()-0.5)*16, Math.random()*3+1, 0, Math.PI*2);
        context.fillStyle = ['#FFD166','#38E4B7','#FFFFFF','#FF5E7E'][Math.floor(Math.random()*4)];
        context.fill();
      }
      context.restore();
    };

    // ── Mouse event handlers ──
    const getCanvasPos = (e) => {
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width  / rect.width;
      const scaleY = canvas.height / rect.height;
      return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top)  * scaleY,
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

    const onMouseUp   = () => { isMouseDownRef.current = false; lastPosRef.current = null; };
    const onMouseLeave = () => { isMouseDownRef.current = false; lastPosRef.current = null; };

    canvas.addEventListener('mousedown',  onMouseDown);
    canvas.addEventListener('mousemove',  onMouseMove);
    canvas.addEventListener('mouseup',    onMouseUp);
    canvas.addEventListener('mouseleave', onMouseLeave);

    // ── Touch support (for tablets) ──
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
    const onTouchEnd = () => { isMouseDownRef.current = false; lastPosRef.current = null; };

    canvas.addEventListener('touchstart', onTouchStart, { passive: false });
    canvas.addEventListener('touchmove',  onTouchMove,  { passive: false });
    canvas.addEventListener('touchend',   onTouchEnd);

    window.handleLandmarks = (landmarks) => {
      if (disabled) return;
      if (!landmarks || landmarks.length === 0) {
        isDrawingRef.current = false;
        lastPosRef.current = null;
        gestureFrames.current = { fist: 0, palm: 0, thumbsUp: 0 };
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

      // Finger states (Comparing Tip to PIP joint is much more reliable for kids than MCP)
      const isIndexUp = indexFingerTip.y < hand[6].y;
      const isMiddleUp = middleFingerTip.y < hand[10].y;
      const isRingUp = ringFingerTip.y < hand[14].y;
      const isPinkyUp = pinkyTip.y < hand[18].y;
      
      const isThumbUp = thumbTip.y < hand[3].y && thumbTip.y < indexFingerMcp.y;

      const isFist = !isIndexUp && !isMiddleUp && !isRingUp && !isPinkyUp && !isThumbUp;
      const isOpenPalm = isIndexUp && isMiddleUp && isRingUp && isPinkyUp;
      const isThumbsUp = isThumbUp && !isIndexUp && !isMiddleUp && !isRingUp && !isPinkyUp;
      const isDrawing = isIndexUp && !isMiddleUp && !isRingUp && !isPinkyUp && !isThumbUp;

      // Requires holding the gesture for ~25 frames (~1 second) to trigger
      if (isFist) {
        gestureFrames.current.fist++;
        gestureFrames.current.palm = 0;
        gestureFrames.current.thumbsUp = 0;
        
        if (gestureFrames.current.fist > sensitivityRef.current && !submittedRef.current) {
          submittedRef.current = true;
          handleSubmit(canvas);
          gestureFrames.current.fist = 0;
        }
        isDrawingRef.current = false;
        lastPosRef.current = null;
        return;
      } else if (isThumbsUp) {
        gestureFrames.current.thumbsUp++;
        gestureFrames.current.fist = 0;
        gestureFrames.current.palm = 0;
        
        if (gestureFrames.current.thumbsUp > sensitivityRef.current && !submittedRef.current && onPronounce) {
          submittedRef.current = true;
          onPronounce();
          gestureFrames.current.thumbsUp = 0;
          setTimeout(() => { submittedRef.current = false; }, 2000);
        }
        isDrawingRef.current = false;
        lastPosRef.current = null;
        return;
      } else if (isOpenPalm) {
        gestureFrames.current.palm++;
        gestureFrames.current.fist = 0;
        gestureFrames.current.thumbsUp = 0;
        
        if (gestureFrames.current.palm > sensitivityRef.current && !submittedRef.current) {
           handleClear();
           submittedRef.current = true;
           gestureFrames.current.palm = 0;
           setTimeout(() => { submittedRef.current = false; }, 1000);
        }
        isDrawingRef.current = false;
        lastPosRef.current = null;
        return;
      } else {
        // Reset all frames if no gesture is held
        gestureFrames.current = { fist: 0, palm: 0, thumbsUp: 0 };
      }

      if (isDrawing) {
        // Strict boundary matching the letter guide box
        const BOX_W = 200, BOX_H = 320;
        const boxX1 = (canvas.width  - BOX_W) / 2;
        const boxX2 = (canvas.width  + BOX_W) / 2;
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
          // CLIP to letter box so glow/particles never escape
          context.save();
          context.beginPath();
          context.rect(boxX1, boxY1, BOX_W, BOX_H);
          context.clip();

          // Glowing stroke — use user's chosen color
          context.shadowBlur   = 12;
          context.shadowColor  = strokeColorRef.current;
          context.strokeStyle  = strokeColorRef.current;
          context.lineWidth    = 16;
          context.beginPath();
          context.moveTo(lastPosRef.current.x, lastPosRef.current.y);
          context.lineTo(x, y);
          context.stroke();

          // Glitter particles — tiny, close to finger, clipped inside box
          if (Math.random() > 0.5) {
            context.shadowBlur = 6;
            context.shadowColor = '#FFF';
            context.beginPath();
            const px = x + (Math.random() - 0.5) * 16;
            const py = y + (Math.random() - 0.5) * 16;
            context.arc(px, py, Math.random() * 3 + 1, 0, Math.PI * 2);
            context.fillStyle = ['#FFD166','#38E4B7','#FFFFFF','#FF5E7E'][Math.floor(Math.random()*4)];
            context.fill();
          }

          context.restore(); // removes clip
          lastPosRef.current = { x, y };
        }
      } else {
        isDrawingRef.current = false;
        lastPosRef.current = null;
      }
    };

    return () => {
      window.handleLandmarks = null;
      canvas.removeEventListener('mousedown',  onMouseDown);
      canvas.removeEventListener('mousemove',  onMouseMove);
      canvas.removeEventListener('mouseup',    onMouseUp);
      canvas.removeEventListener('mouseleave', onMouseLeave);
      canvas.removeEventListener('touchstart', onTouchStart);
      canvas.removeEventListener('touchmove',  onTouchMove);
      canvas.removeEventListener('touchend',   onTouchEnd);
    };
  }, [disabled, onPronounce]);

  const handleSubmit = (canvas) => {
    // We must export a plain black stroke on white background for OCR!
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    const tempCtx = tempCanvas.getContext('2d');
    
    tempCtx.fillStyle = "white";
    tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
    
    // Disable shadow for clear export
    tempCtx.shadowBlur = 0;
    // Draw the actual canvas content
    tempCtx.drawImage(canvas, 0, 0);

    // Binarize the image (turn all colored/glitter pixels to pure black for OCR)
    const imgData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
    const data = imgData.data;
    for (let i = 0; i < data.length; i += 4) {
      // If pixel is not completely white background, force it to pure black
      if (data[i] < 255 || data[i+1] < 255 || data[i+2] < 255) {
        data[i] = 0;     // R
        data[i+1] = 0;   // G
        data[i+2] = 0;   // B
      }
    }
    tempCtx.putImageData(imgData, 0, 0);

    const dataUrl = tempCanvas.toDataURL('image/png');
    onSubmit(dataUrl);
    
    const context = canvas.getContext('2d');
    context.clearRect(0, 0, canvas.width, canvas.height);
    
    setTimeout(() => {
      submittedRef.current = false;
    }, 2000);
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
        className="drawing-canvas"
        style={{ cursor: mouseMode ? 'crosshair' : 'default' }}
      />

      {/* ── Mode toggle ── */}
      <button
        onClick={() => setMouseMode(m => !m)}
        style={{
          position: 'absolute', bottom: 12, left: 12, zIndex: 30,
          background: mouseMode ? '#FF5E7E' : '#38E4B7',
          color: 'white', border: 'none', borderRadius: 30,
          padding: '6px 16px', fontWeight: 900, fontSize: '0.95rem',
          cursor: 'pointer', boxShadow: '0 4px 0 rgba(0,0,0,0.15)',
          fontFamily: 'Nunito, sans-serif',
          transition: 'background 0.2s',
        }}
      >
        {mouseMode ? '🖱️ Mouse Mode ON' : '✋ Hand Mode'}
      </button>

      {/* ── Mouse-mode submit button ── */}
      {mouseMode && (
        <button
          onClick={() => !disabled && !submittedRef.current && (() => {
            submittedRef.current = true;
            handleSubmit(canvasRef.current);
          })()}
          disabled={disabled}
          style={{
            position: 'absolute', bottom: 12, left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 30,
            background: disabled ? '#ccc' : 'linear-gradient(135deg,#FF5E7E,#FF9F43)',
            color: 'white', border: 'none', borderRadius: 30,
            padding: '8px 28px', fontWeight: 900, fontSize: '1.05rem',
            cursor: disabled ? 'not-allowed' : 'pointer',
            boxShadow: '0 4px 0 rgba(0,0,0,0.15)',
            fontFamily: 'Nunito, sans-serif',
          }}
        >
          ✅ Submit
        </button>
      )}

      {/* ── Clear button ── */}
      <button
        className="btn"
        onClick={handleClear}
        style={{
          position: 'absolute', top: 10, right: 10, zIndex: 30,
          padding: '5px 15px', fontSize: '1rem',
        }}
      >
        Clear 🧹
      </button>
    </>
  );
};

export default DrawingCanvas;
