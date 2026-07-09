import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useProgress } from '../hooks/useProgress';
import DrawingCanvas from './DrawingCanvas';
import RewardPopup from './RewardPopup';
import { ArrowLeft, Volume2, ChevronLeft, ChevronRight, CheckCircle, XCircle } from 'lucide-react';
import { createWorker } from 'tesseract.js';
import confetti from 'canvas-confetti';

const ALPHABETS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
const NUMBERS   = '0123456789'.split('');

const VOCAB = {
  A: { word: 'Apple',    emoji: '🍎' }, B: { word: 'Ball',    emoji: '⚽' },
  C: { word: 'Cat',      emoji: '🐱' }, D: { word: 'Dog',     emoji: '🐶' },
  E: { word: 'Egg',      emoji: '🥚' }, F: { word: 'Fish',    emoji: '🐟' },
  G: { word: 'Grapes',   emoji: '🍇' }, H: { word: 'Hat',     emoji: '🎩' },
  I: { word: 'Ice',      emoji: '🧊' }, J: { word: 'Juice',   emoji: '🧃' },
  K: { word: 'Kite',     emoji: '🪁' }, L: { word: 'Lion',    emoji: '🦁' },
  M: { word: 'Moon',     emoji: '🌙' }, N: { word: 'Nest',    emoji: '🪺' },
  O: { word: 'Orange',   emoji: '🍊' }, P: { word: 'Pen',     emoji: '🖊️' },
  Q: { word: 'Queen',    emoji: '👑' }, R: { word: 'Rain',    emoji: '🌧️' },
  S: { word: 'Sun',      emoji: '☀️' }, T: { word: 'Tree',    emoji: '🌳' },
  U: { word: 'Umbrella', emoji: '☂️' }, V: { word: 'Van',     emoji: '🚌' },
  W: { word: 'Water',    emoji: '💧' }, X: { word: 'X-ray',   emoji: '🩻' },
  Y: { word: 'Yacht',    emoji: '⛵' }, Z: { word: 'Zebra',   emoji: '🦓' },
};

// ─────────────────────────────────────────────────────────────
// OCR HELPERS
// ─────────────────────────────────────────────────────────────

/** Count dark pixels in a base64 image — detects if user actually drew */
const countInkPixels = (base64) => new Promise((resolve) => {
  const img = new Image();
  img.onload = () => {
    const c = document.createElement('canvas');
    c.width = img.width; c.height = img.height;
    const ctx = c.getContext('2d');
    ctx.drawImage(img, 0, 0);
    const d = ctx.getImageData(0, 0, c.width, c.height).data;
    let count = 0;
    for (let i = 0; i < d.length; i += 4) {
      if (d[i] < 180 || d[i+1] < 180 || d[i+2] < 180) count++;
    }
    resolve(count);
  };
  img.onerror = () => resolve(0);
  img.src = base64;
});

/** Template pixel similarity — renders target char, compares to drawing */
const TMPL = 64;
const templateCache = {};
const getTemplate = (char) => {
  if (templateCache[char]) return templateCache[char];
  const c = document.createElement('canvas');
  c.width = TMPL; c.height = TMPL;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, TMPL, TMPL);
  ctx.fillStyle = '#000';
  ctx.font = `bold ${TMPL * 0.78}px Arial Black, Arial, sans-serif`;
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(char.toUpperCase(), TMPL / 2, TMPL / 2);
  const d = ctx.getImageData(0, 0, TMPL, TMPL).data;
  const g = new Uint8Array(TMPL * TMPL);
  for (let i = 0; i < g.length; i++) g[i] = Math.round(255 - (d[i*4] + d[i*4+1] + d[i*4+2]) / 3);
  return (templateCache[char] = g);
};

const pixelSim = (a, b) => {
  let ab = 0, aa = 0, bb = 0;
  for (let i = 0; i < a.length; i++) { ab += a[i]*b[i]; aa += a[i]*a[i]; bb += b[i]*b[i]; }
  const d = Math.sqrt(aa * bb);
  return d === 0 ? 0 : ab / d;
};

const templateMatch = (base64, target, threshold = 0.38) => new Promise((resolve) => {
  const img = new Image();
  img.onload = () => {
    const c = document.createElement('canvas');
    c.width = TMPL; c.height = TMPL;
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, TMPL, TMPL);
    ctx.drawImage(img, 0, 0, TMPL, TMPL);
    const d = ctx.getImageData(0, 0, TMPL, TMPL).data;
    const drawn = new Uint8Array(TMPL * TMPL);
    let ink = 0;
    for (let i = 0; i < drawn.length; i++) {
      drawn[i] = Math.round(255 - (d[i*4] + d[i*4+1] + d[i*4+2]) / 3);
      if (drawn[i] > 30) ink++;
    }
    if (ink < 30) { resolve({ empty: true }); return; }

    const ALL = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'.split('');

    // Score ALL characters
    const scores = ALL.map(c => ({ char: c, score: pixelSim(drawn, getTemplate(c)) }));
    scores.sort((a, b) => b.score - a.score);

    const top3    = scores.slice(0, 3).map(s => s.char);
    const best    = scores[0];
    const targetScore = scores.find(s => s.char === target)?.score ?? 0;

    // Pass if: target is in top 3 AND target score is above minimum threshold
    const isTarget = top3.includes(target) && targetScore >= threshold;

    console.log(`Template top3: ${top3.join(',')} | target="${target}" score=${(targetScore*100).toFixed(1)}%`);
    resolve({ empty: false, bestChar: best.char, bestScore: best.score, targetScore, isTarget, top3 });
  };
  img.onerror = () => resolve({ empty: true });
  img.src = base64;
});


/** Run Tesseract at a given PSM mode */
const runTesseract = async (base64, psm = 8) => {
  try {
    const w = await createWorker('eng');
    await w.setParameters({
      tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
      tessedit_pageseg_mode: String(psm),
    });
    const { data } = await w.recognize(base64);
    await w.terminate();
    return { text: (data.text || '').trim().toUpperCase().replace(/[^A-Z0-9]/g, ''), confidence: data.confidence || 0 };
  } catch (_) { return { text: '', confidence: 0 }; }
};

// ─────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────
const LearningMode = ({ mode = 'alphabet' }) => {
  const navigate = useNavigate();
  const { authFetch } = useAuth();
  const { markCorrect, markWrong, refreshProgress } = useProgress();

  const chars     = mode === 'alphabet' ? ALPHABETS : NUMBERS;
  const [idx, setIdx]             = useState(0);
  const targetChar                 = chars[idx];
  const vocab                      = VOCAB[targetChar];

  const [evaluating, setEvaluating]     = useState(false);
  const [status, setStatus]             = useState(null);
  const [ocrResult, setOcrResult]       = useState('');
  const [showReward, setShowReward]     = useState(false);
  const [resultIsMatch, setResultIsMatch] = useState(false);

  const speak = useCallback((msg) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(msg);
    u.rate = 0.9; u.pitch = 1.2;
    window.speechSynthesis.speak(u);
  }, []);

  useEffect(() => {
    setStatus(null); setOcrResult('');
    speak(mode === 'alphabet'
      ? `Let's draw the letter ${targetChar}! ${vocab ? `${targetChar} is for ${vocab.word}` : ''}`
      : `Let's draw the number ${targetChar}!`);
  }, [targetChar, mode]);

  const handleOcrSubmit = useCallback(async (base64Image) => {
    if (evaluating) return;
    if (!base64Image) { speak(`Please draw ${targetChar} first!`); return; }

    setEvaluating(true);
    setStatus(null);
    speak('Let me check!');

    try {
      let correct = false;
      let info = '';

      // ── LAYER 1: Backend (always correct:true when server is running) ──
      try {
        const res = await authFetch('http://localhost:8080/api/ocr/process', {
          method: 'POST',
          body: JSON.stringify({ image: base64Image, targetChar }),
        });
        if (res.ok) {
          const data = await res.json();
          correct = data.correct;
          info = `backend:${correct ? 'PASS' : 'fail'}`;
        }
      } catch (_) { info = 'backend:offline'; }

      // ── LAYER 2: Template pixel similarity (threshold 35%) ─────────────
      if (!correct) {
        const t = await templateMatch(base64Image, targetChar, 0.35);
        if (!t.empty) {
          info += ` | tmpl:${t.bestChar}(${(t.bestScore*100).toFixed(0)}%) tgt(${(t.targetScore*100).toFixed(0)}%)`;
          correct = t.isTarget;
        }
      }

      // ── LAYER 3: Tesseract (lenient 40%) ───────────────────────────────
      if (!correct) {
        for (const psm of [8, 7, 10]) {
          const { text, confidence } = await runTesseract(base64Image, psm);
          info += ` | t${psm}:"${text}"(${Math.round(confidence)}%)`;
          if (confidence >= 40 && text.includes(targetChar)) { correct = true; break; }
        }
      }

      setOcrResult(info);
      console.log(`OCR "${targetChar}": ${correct} | ${info}`);

      if (correct) {
        setStatus('correct'); setResultIsMatch(true);
        speak(`Amazing! You drew ${targetChar} perfectly!`);
        confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
        setShowReward(true);
        await markCorrect(mode, targetChar);
      } else {
        setStatus('wrong'); setResultIsMatch(false);
        speak(`Nice try! Draw ${targetChar} a bit more clearly!`);
        setShowReward(true);
        await markWrong();
      }
    } catch (err) {
      console.error('OCR error:', err);
      setStatus('wrong'); setResultIsMatch(false);
      speak('Oops! Try again!');
      setShowReward(true);
    } finally {
      setEvaluating(false);
      refreshProgress();
    }
  }, [evaluating, targetChar, mode, authFetch, markCorrect, markWrong, refreshProgress, speak]);

  const goPrev = () => setIdx(i => Math.max(0, i - 1));
  const goNext = () => setIdx(i => Math.min(chars.length - 1, i + 1));

  return (
    <div className="relative w-screen h-screen flex overflow-hidden font-nunito bg-slate-950 select-none">

      {/* ── FULL SCREEN DRAWING CANVAS ── */}
      <div className="absolute inset-0 z-0">
        <DrawingCanvas
          onSubmit={handleOcrSubmit}
          disabled={evaluating}
          onPronounce={() => speak(vocab ? `${targetChar} is for ${vocab.word}` : targetChar)}
        />
      </div>

      {/* Ghost letter watermark */}
      <div className="absolute inset-0 z-[1] flex items-center justify-center pointer-events-none">
        <span className="font-black text-white select-none leading-none"
          style={{ fontSize: 'min(60vh, 60vw)', opacity: 0.04, fontFamily: 'Arial Black, sans-serif' }}>
          {targetChar}
        </span>
      </div>

      {/* ── RIGHT SIDE PANEL ── */}
      <div className="absolute right-0 top-0 h-full w-[220px] z-20 flex flex-col bg-black/60 backdrop-blur-xl border-l border-white/10 shadow-2xl">
        <button onClick={() => navigate('/mode-selection')}
          className="flex items-center gap-1 text-white/70 hover:text-white font-bold text-xs px-4 pt-4 pb-2 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        <div className="flex-1 flex flex-col items-center px-4 gap-4 overflow-y-auto py-2">
          <div className="text-center">
            <p className="text-white/50 text-xs font-bold uppercase tracking-widest">
              {mode === 'alphabet' ? 'Letter' : 'Number'}
            </p>
            <h2 className="text-white font-black text-lg leading-tight">Tracing</h2>
          </div>

          {/* Big letter display */}
          <div className="w-full aspect-square bg-white/10 rounded-2xl border-2 border-white/20 flex items-center justify-center relative shadow-inner">
            <span className="font-black text-white" style={{ fontSize: '6rem', lineHeight: 1, fontFamily: 'Arial Black, sans-serif' }}>
              {targetChar}
            </span>
            <button onClick={() => speak(vocab ? `${targetChar} is for ${vocab.word}` : targetChar)}
              className="absolute bottom-2 right-2 w-9 h-9 rounded-full bg-yellow-400 hover:bg-yellow-300 flex items-center justify-center shadow-lg transition-transform active:scale-90">
              <Volume2 className="w-4 h-4 text-slate-800" />
            </button>
          </div>

          {/* Vocab hint */}
          {vocab && (
            <div className="w-full bg-white/10 rounded-xl p-3 text-center border border-white/10">
              <div className="text-3xl mb-1">{vocab.emoji}</div>
              <p className="text-white font-black text-sm">{vocab.word}</p>
              <p className="text-white/50 text-xs">{targetChar} is for {vocab.word}</p>
            </div>
          )}

          {/* Nav arrows */}
          <div className="flex w-full gap-2">
            <button onClick={goPrev} disabled={idx === 0}
              className="flex-1 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-black text-sm flex items-center justify-center gap-1 disabled:opacity-30 transition-colors">
              <ChevronLeft className="w-4 h-4" />{idx > 0 ? chars[idx - 1] : ''}
            </button>
            <button onClick={goNext} disabled={idx === chars.length - 1}
              className="flex-1 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-black text-sm flex items-center justify-center gap-1 disabled:opacity-30 transition-colors">
              {idx < chars.length - 1 ? chars[idx + 1] : ''}<ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Character selector grid */}
          <div>
            <p className="text-white/40 text-xs font-bold uppercase tracking-widest mb-2 text-center">
              All {mode === 'alphabet' ? 'Letters' : 'Numbers'}
            </p>
            <div className="grid grid-cols-5 gap-1">
              {chars.map((c, i) => (
                <button key={c} onClick={() => setIdx(i)}
                  className={`w-8 h-8 rounded-lg font-black text-sm flex items-center justify-center border transition-all ${
                    i === idx
                      ? 'bg-pink-500 border-pink-400 text-white scale-110 shadow-md'
                      : 'bg-white/10 border-white/10 text-white/60 hover:bg-white/20'
                  }`}>
                  {c}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Status strip */}
        <div className="px-4 pb-4 pt-2">
          {evaluating && (
            <div className="bg-blue-500/30 border border-blue-400/40 rounded-xl p-2 text-center">
              <p className="text-blue-200 text-xs font-bold animate-pulse">🔍 Analyzing…</p>
            </div>
          )}
          {!evaluating && status === 'correct' && (
            <div className="bg-green-500/30 border border-green-400/40 rounded-xl p-2 text-center flex items-center justify-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-300" />
              <p className="text-green-200 text-xs font-bold">Correct! 🎉</p>
            </div>
          )}
          {!evaluating && status === 'wrong' && (
            <div className="bg-red-500/30 border border-red-400/40 rounded-xl p-2 text-center flex items-center justify-center gap-2">
              <XCircle className="w-4 h-4 text-red-300" />
              <p className="text-red-200 text-xs font-bold">Try again! ✍️</p>
            </div>
          )}
        </div>
      </div>

      {/* Top-left hint */}
      <div className="absolute top-4 left-4 z-20 bg-black/50 backdrop-blur-sm rounded-2xl px-4 py-2 border border-white/10">
        <p className="text-white/70 text-xs font-bold">
          ✏️ Draw <span className="text-pink-400 font-black text-sm">{targetChar}</span> anywhere on screen
        </p>
        <p className="text-white/40 text-[10px] mt-0.5">Mouse · touch · or ✋ Hand mode. Submit when done!</p>
      </div>

      {/* Reward popup */}
      {showReward && (
        <RewardPopup
          isMatch={resultIsMatch}
          message={
            resultIsMatch
              ? `You drew ${targetChar} perfectly! ${vocab ? `${targetChar} is for ${vocab.word} ${vocab.emoji}` : ''}`
              : `Draw ${targetChar} a bit more clearly!`
          }
          reward={vocab ? { emoji: vocab.emoji, name: vocab.word } : undefined}
          stars={10} xp={20}
          onClose={() => setShowReward(false)}
          onNext={() => { setShowReward(false); if (resultIsMatch) goNext(); }}
        />
      )}
    </div>
  );
};

export default LearningMode;
