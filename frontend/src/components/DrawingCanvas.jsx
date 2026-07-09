import React, { useEffect, useRef, useState, useCallback } from 'react';

/* ══════════════════════════════════════════════════════════════════
   KALMAN FILTER — best smoothing for noisy 1D signal
   Much better than simple LERP: adapts to motion speed
══════════════════════════════════════════════════════════════════ */
class Kalman1D {
  constructor(R = 0.12, Q = 0.6) {
    this.R   = R;   // measurement noise (higher = more smoothing)
    this.Q   = Q;   // process noise (lower = smoother, less snappy)
    this.cov = NaN;
    this.x   = NaN;
  }
  filter(z) {
    if (isNaN(this.x)) { this.x = z; this.cov = 1; return z; }
    const predX   = this.x;
    const predCov = this.cov + this.Q;
    const K = predCov / (predCov + this.R);
    this.x   = predX + K * (z - predX);
    this.cov = (1 - K) * predCov;
    return this.x;
  }
  reset() { this.cov = NaN; this.x = NaN; }
}

/* ══════════════════════════════════════════════════════════════════
   CATMULL-ROM spline segment between p1→p2 using p0 and p3
   Returns smooth bezier control points
══════════════════════════════════════════════════════════════════ */
const catmullToBezier = (p0, p1, p2, p3, tension = 0.5) => ({
  cp1x: p1.x + (p2.x - p0.x) / (6 * tension),
  cp1y: p1.y + (p2.y - p0.y) / (6 * tension),
  cp2x: p2.x - (p3.x - p1.x) / (6 * tension),
  cp2y: p2.y - (p3.y - p1.y) / (6 * tension),
});

/* ══════════════════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════════════════ */
const DrawingCanvas = ({ onSubmit, disabled, onPronounce }) => {
  const canvasRef = useRef(null);
  const ctxRef    = useRef(null);

  // Mouse / Touch
  const isDownRef  = useRef(false);
  const touchBuf   = useRef([]);   // rolling buffer for touch bezier

  // Hand tracking
  const [handMode, setHandMode] = useState(false);
  const handModeRef              = useRef(false);
  const videoRef                 = useRef(null);
  const rafRef                   = useRef(null);
  const handsRef                 = useRef(null);

  // Kalman filters (separate for X and Y)
  const kx = useRef(new Kalman1D(0.005, 2));
  const ky = useRef(new Kalman1D(0.005, 2));

  // Stroke state
  const penDownRef   = useRef(false);
  const handBuf      = useRef([]);   // rolling points for catmull-rom
  const lastSpeedRef = useRef(0);    // for pressure simulation

  // Gesture counters
  const fistRef = useRef(0);
  const palmRef = useRef(0);
  const FIST_HOLD = 18; // frames @~15fps ≈ 1.2s
  const PALM_HOLD = 14;

  // UI state
  const [cursor, setCursor]   = useState(null);  // {x%,y%}
  const [label, setLabel]     = useState('');
  const [fistPct, setFistPct] = useState(0);
  const [palmPct, setPalmPct] = useState(0);

  const BASE_WIDTH = 22;
  const MINPX      = 8;    // px threshold — higher = less jitter

  /* ── canvas setup ─────────────────────────────────────────── */
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctxRef.current = ctx;

    const resize = () => {
      const { width, height } = canvas.getBoundingClientRect();
      const snap = canvas.toDataURL();
      canvas.width = width; canvas.height = height;
      const img = new Image();
      img.onload = () => { ctx.drawImage(img, 0, 0); };
      img.src = snap;
      ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    return () => ro.disconnect();
  }, []);

  /* ── draw helpers ─────────────────────────────────────────── */

  // Catmull-Rom spline draw (for both touch and hand mode)
  const drawCatmull = useCallback((buf, ctx, width = BASE_WIDTH) => {
    if (buf.length < 2) return;
    ctx.lineWidth   = width;
    ctx.lineCap     = 'round';
    ctx.lineJoin    = 'round';
    ctx.strokeStyle = '#FF5E7E';
    ctx.shadowBlur  = 12;
    ctx.shadowColor = '#FF5E7E';

    if (buf.length === 2) {
      ctx.beginPath();
      ctx.moveTo(buf[0].x, buf[0].y);
      ctx.lineTo(buf[1].x, buf[1].y);
      ctx.stroke();
      ctx.shadowBlur = 0;
      return;
    }

    // Use Catmull-Rom through last 4 points
    const n  = buf.length;
    const p0 = buf[Math.max(0, n - 4)];
    const p1 = buf[Math.max(0, n - 3)];
    const p2 = buf[n - 2];
    const p3 = buf[n - 1];

    const { cp1x, cp1y, cp2x, cp2y } = catmullToBezier(p0, p1, p2, p3);

    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, p2.x, p2.y);
    ctx.stroke();
    ctx.shadowBlur = 0;
  }, []);

  /* ── Mouse / Touch ────────────────────────────────────────── */
  useEffect(() => {
    const canvas = canvasRef.current;
    const getPos = (e) => {
      const r = canvas.getBoundingClientRect();
      const s = e.touches ? e.touches[0] : e;
      return {
        x: (s.clientX - r.left) * (canvas.width  / r.width),
        y: (s.clientY - r.top)  * (canvas.height / r.height),
      };
    };

    const start = (e) => {
      if (disabled || handModeRef.current) return;
      e.preventDefault();
      isDownRef.current = true;
      touchBuf.current  = [getPos(e)];
    };

    const move = (e) => {
      if (!isDownRef.current || disabled || handModeRef.current) return;
      e.preventDefault();
      const p = getPos(e);
      touchBuf.current.push(p);
      if (touchBuf.current.length > 6) touchBuf.current.shift();
      drawCatmull(touchBuf.current, ctxRef.current);
    };

    const end = () => { isDownRef.current = false; touchBuf.current = []; };

    canvas.addEventListener('mousedown',  start);
    canvas.addEventListener('mousemove',  move);
    canvas.addEventListener('mouseup',    end);
    canvas.addEventListener('mouseleave', end);
    canvas.addEventListener('touchstart', start, { passive: false });
    canvas.addEventListener('touchmove',  move,  { passive: false });
    canvas.addEventListener('touchend',   end);
    return () => {
      canvas.removeEventListener('mousedown',  start);
      canvas.removeEventListener('mousemove',  move);
      canvas.removeEventListener('mouseup',    end);
      canvas.removeEventListener('mouseleave', end);
      canvas.removeEventListener('touchstart', start);
      canvas.removeEventListener('touchmove',  move);
      canvas.removeEventListener('touchend',   end);
    };
  }, [disabled, drawCatmull]);

  /* ── Clear ───────────────────────────────────────────────── */
  const handleClear = useCallback(() => {
    const c = canvasRef.current;
    if (c) ctxRef.current.clearRect(0, 0, c.width, c.height);
    handBuf.current  = [];
    touchBuf.current = [];
  }, []);

  /* ── Submit ──────────────────────────────────────────────── */
  const handleSubmit = useCallback(() => {
    if (disabled) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = ctxRef.current;
    const { width, height } = canvas;

    const id = ctx.getImageData(0, 0, width, height).data;
    let x0 = width, y0 = height, x1 = 0, y1 = 0;
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        if (id[(y * width + x) * 4 + 3] > 10) {
          if (x < x0) x0 = x; if (x > x1) x1 = x;
          if (y < y0) y0 = y; if (y > y1) y1 = y;
        }
      }
    }
    if (x0 >= x1 || y0 >= y1) { onSubmit(null); return; }

    const pad = 40;
    const cx = Math.max(0, x0 - pad), cy = Math.max(0, y0 - pad);
    const cw = Math.min(width,  x1 + pad) - cx;
    const ch = Math.min(height, y1 + pad) - cy;

    const S = 512, INN = 452, OFF = 30;
    const out = document.createElement('canvas');
    out.width = S; out.height = S;
    const oc = out.getContext('2d');
    oc.fillStyle = '#fff'; oc.fillRect(0, 0, S, S);
    for (const [dx, dy] of [[0,0],[-3,0],[3,0],[0,-3],[0,3],[-2,-2],[2,-2],[-2,2],[2,2]])
      oc.drawImage(canvas, cx, cy, cw, ch, OFF + dx, OFF + dy, INN, INN);

    const od = oc.getImageData(0, 0, S, S);
    for (let i = 0; i < od.data.length; i += 4) {
      const bright = (od.data[i] + od.data[i+1] + od.data[i+2]) / 3;
      const ink = od.data[i+3] > 15 && bright < 240;
      od.data[i] = od.data[i+1] = od.data[i+2] = ink ? 0 : 255;
      od.data[i+3] = 255;
    }
    oc.putImageData(od, 0, 0);
    onSubmit(out.toDataURL('image/png'));
    handleClear();
  }, [disabled, onSubmit, handleClear]);

  /* ── MediaPipe Hand Tracking ─────────────────────────────── */
  useEffect(() => {
    handModeRef.current = handMode;

    const reset = () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      kx.current.reset(); ky.current.reset();
      penDownRef.current = false; handBuf.current = [];
      fistRef.current = 0; palmRef.current = 0;
      setCursor(null); setLabel(''); setFistPct(0); setPalmPct(0);
    };

    if (!handMode) { reset(); return; }
    if (!window.Hands) {
      alert('MediaPipe not loaded — check internet connection.');
      setHandMode(false); return;
    }

    let stopped = false;

    /* Init MediaPipe */
    const hands = new window.Hands({
      locateFile: f => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${f}`
    });
    hands.setOptions({
      maxNumHands: 1,
      modelComplexity: 0,
      minDetectionConfidence: 0.65,
      minTrackingConfidence: 0.65,
    });
    handsRef.current = hands;

    hands.onResults((res) => {
      if (stopped || disabled) return;
      const canvas = canvasRef.current;
      if (!canvas) return;

      /* No hand detected */
      if (!res.multiHandLandmarks?.length) {
        kx.current.reset(); ky.current.reset();
        penDownRef.current = false; handBuf.current = [];
        fistRef.current = 0; palmRef.current = 0;
        setCursor(null); setLabel('👋 Show your hand');
        setFistPct(0); setPalmPct(0);
        return;
      }

      const lm = res.multiHandLandmarks[0];

      /* ── Kalman-filtered position (index fingertip, mirrored X) ── */
      const fx = kx.current.filter((1 - lm[8].x) * canvas.width);
      const fy = ky.current.filter(lm[8].y * canvas.height);

      /* Update cursor */
      setCursor({ x: fx / canvas.width * 100, y: fy / canvas.height * 100 });

      /* ── Gesture classification ──────────────────────────────── */
      // Robust: compare tip Y to PIP Y with a margin
      const up = (tip, pip, margin = 0.025) => lm[tip].y < lm[pip].y - margin;
      const indexUp  = up(8,  6);
      const middleUp = up(12, 10);
      const ringUp   = up(16, 14);
      const pinkyUp  = up(20, 18);

      const isFist = !indexUp && !middleUp && !ringUp && !pinkyUp;
      const isPalm = indexUp  &&  middleUp &&  ringUp &&  pinkyUp;
      const isDraw = indexUp  && !middleUp && !ringUp && !pinkyUp;

      /* ── FIST → Submit ──────────────────────────────────────── */
      if (isFist) {
        fistRef.current++; palmRef.current = 0;
        penDownRef.current = false; handBuf.current = [];
        const pct = Math.min(100, Math.round(fistRef.current / FIST_HOLD * 100));
        setFistPct(pct); setPalmPct(0);
        setLabel(`✊ Hold fist to submit… ${pct}%`);
        if (fistRef.current >= FIST_HOLD) {
          fistRef.current = 0; setFistPct(0);
          setLabel('✊ Submitting!');
          handleSubmit();
        }
        return;
      }

      /* ── PALM → Clear ───────────────────────────────────────── */
      if (isPalm) {
        palmRef.current++; fistRef.current = 0;
        penDownRef.current = false; handBuf.current = [];
        const pct = Math.min(100, Math.round(palmRef.current / PALM_HOLD * 100));
        setPalmPct(pct); setFistPct(0);
        setLabel(`✋ Hold palm to clear… ${pct}%`);
        if (palmRef.current >= PALM_HOLD) {
          palmRef.current = 0; setPalmPct(0);
          setLabel('✋ Cleared!');
          handleClear();
        }
        return;
      }

      fistRef.current = 0; palmRef.current = 0;
      setFistPct(0); setPalmPct(0);

      /* ── DRAW ───────────────────────────────────────────────── */
      if (isDraw) {
        setLabel('☝️ Drawing…');
        const prev = handBuf.current.at?.(-1);
        const dist = prev ? Math.hypot(fx - prev.x, fy - prev.y) : Infinity;

        if (!penDownRef.current) {
          // Fresh stroke start
          penDownRef.current = true;
          handBuf.current = [{ x: fx, y: fy }];
          lastSpeedRef.current = 0;
        } else if (dist >= MINPX) {
          // Speed-based stroke width (faster = slightly thinner = natural feel)
          const speed    = dist;
          const smoothSp = lastSpeedRef.current * 0.7 + speed * 0.3;
          lastSpeedRef.current = smoothSp;
          const dynamicW = Math.max(12, Math.min(28, BASE_WIDTH - smoothSp * 0.15));

          handBuf.current.push({ x: fx, y: fy });
          if (handBuf.current.length > 8) handBuf.current.shift();
          drawCatmull(handBuf.current, ctxRef.current, dynamicW);
        }
      } else {
        penDownRef.current = false;
        handBuf.current = [];
        setLabel('✌️ Point only index finger to draw');
      }
    });

    /* Start webcam */
    navigator.mediaDevices.getUserMedia({
      video: { width: 320, height: 240, facingMode: 'user', frameRate: { ideal: 15, max: 20 } }
    }).then(stream => {
      if (stopped) { stream.getTracks().forEach(t => t.stop()); return; }
      videoRef.current.srcObject = stream;
      return videoRef.current.play();
    }).then(() => {
      /* Fixed 10fps interval — predictable, smooth, no frame rush */
      let busy = false;
      rafRef.current = setInterval(async () => {
        if (stopped || busy || !videoRef.current || videoRef.current.readyState < 2) return;
        busy = true;
        try { await handsRef.current.send({ image: videoRef.current }); } catch (_) {}
        busy = false;
      }, 100); // 10 fps — stable and smooth
    }).catch(() => {
      alert('Camera permission denied.');
      setHandMode(false);
    });

    return () => {
      stopped = true;
      clearInterval(rafRef.current);
      try { handsRef.current?.close(); } catch (_) {}
      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(t => t.stop());
        videoRef.current.srcObject = null;
      }
      kx.current.reset(); ky.current.reset();
      handBuf.current = [];
    };
  }, [handMode, disabled, drawCatmull, handleSubmit, handleClear]);

  /* ── Gesture ring SVG ─────────────────────────────────────── */
  const Ring = ({ pct, color }) => {
    const r = 22, circ = 2 * Math.PI * r;
    const dash = circ * pct / 100;
    return (
      <svg width={52} height={52} className="absolute pointer-events-none"
        style={{ left: '50%', top: '50%', transform: 'translate(-50%,-50%)' }}>
        <circle cx={26} cy={26} r={r} fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth={4} />
        <circle cx={26} cy={26} r={r} fill="none" stroke={color} strokeWidth={4}
          strokeDasharray={`${dash} ${circ}`}
          strokeLinecap="round"
          transform="rotate(-90 26 26)" />
      </svg>
    );
  };

  return (
    <div className="relative w-full h-full select-none">
      <video ref={videoRef} autoPlay playsInline muted style={{ display: 'none' }} />

      {/* Full-screen drawing canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ cursor: handMode ? 'none' : 'crosshair', touchAction: 'none' }}
      />

      {/* Kalman-filtered cursor dot with gesture ring */}
      {handMode && cursor && (
        <div className="absolute pointer-events-none z-30"
          style={{ left: `${cursor.x}%`, top: `${cursor.y}%`, transform: 'translate(-50%,-50%)' }}>
          {/* Progress ring: fist=pink, palm=green */}
          {fistPct > 0 && <Ring pct={fistPct} color="#FF5E7E" />}
          {palmPct > 0 && <Ring pct={palmPct} color="#38E4B7" />}
          {/* Cursor dot */}
          <div className="w-5 h-5 rounded-full border-3 border-white"
            style={{
              background: '#FF5E7E',
              boxShadow: '0 0 0 2px white, 0 0 16px #FF5E7E, 0 0 32px rgba(255,94,126,0.4)',
            }}
          />
        </div>
      )}

      {/* Gesture label */}
      {handMode && label && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30
          bg-black/60 text-white text-sm font-black px-5 py-2 rounded-full
          backdrop-blur-sm border border-white/10 shadow-lg">
          {label}
        </div>
      )}

      {/* Control bar */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30
        flex gap-2 items-center flex-wrap justify-center">

        <button
          onClick={() => setHandMode(m => !m)}
          className={`font-black text-sm text-white px-4 py-2 rounded-full
            border-2 border-white shadow-md transition-all duration-200
            ${handMode ? 'bg-violet-600 scale-105' : 'bg-slate-600 hover:bg-slate-500'}`}>
          {handMode ? '✋ Hand ON' : '✋ Hand OFF'}
        </button>

        {onPronounce && (
          <button onClick={onPronounce}
            className="bg-yellow-400 text-slate-800 text-sm font-black
              border-2 border-white rounded-full py-2 px-4 shadow
              hover:brightness-105 active:scale-95 transition-all">
            🔊 Hear
          </button>
        )}

        <button onClick={handleClear}
          className="bg-slate-500 text-white text-sm font-black
            border-2 border-white rounded-full py-2 px-4 shadow
            hover:bg-slate-400 active:scale-95 transition-all">
          🧹 Clear
        </button>

        <button onClick={handleSubmit} disabled={disabled}
          className={`text-white text-sm font-black border-2 border-white
            rounded-full py-2 px-5 shadow transition-all
            ${disabled
              ? 'bg-slate-300 cursor-not-allowed'
              : 'bg-green-500 hover:bg-green-400 active:scale-95'}`}>
          {disabled ? '⏳ Checking…' : '✅ Submit'}
        </button>
      </div>
    </div>
  );
};

export default DrawingCanvas;
