import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useProgress } from '../hooks/useProgress';
import CameraView from './CameraView';
import DrawingCanvas from './DrawingCanvas';
import AnimatedBackground from './AnimatedBackground';
import RewardPopup from './RewardPopup';
import CartoonMascot from './CartoonMascot';
import { ArrowLeft, Volume2, Sparkles, AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';
import { createWorker } from 'tesseract.js';
import confetti from 'canvas-confetti';
import gsap from 'gsap';

const ALPHABETS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
const NUMBERS = "0123456789".split("");

const LearningMode = ({ mode = "alphabet" }) => {
  const navigate = useNavigate();
  const { authFetch } = useAuth();
  const { progress, markCorrect, markWrong, refreshProgress } = useProgress();

  const chars = mode === "alphabet" ? ALPHABETS : NUMBERS;
  const [targetChar, setTargetChar] = useState(chars[0]);
  const [evaluating, setEvaluating] = useState(false);
  const [ocrText, setOcrText] = useState('');
  const [feedback, setFeedback] = useState('Select a character and trace inside the box!');
  const [feedbackEmoji, setFeedbackEmoji] = useState('🐱');
  const [showReward, setShowReward] = useState(false);
  
  // Vocabulary state for voice guidance
  const [wordData, setWordData] = useState(null);

  // Confetti trigger
  const triggerConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  // Speak function
  const speak = (msg) => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(msg);
      utterance.rate = 0.9;
      utterance.pitch = 1.25;
      window.speechSynthesis.speak(utterance);
    }
  };

  // Load Vocabulary for active character
  useEffect(() => {
    const fetchVocab = async () => {
      setWordData(null);
      let searchWord = '';
      if (mode === "alphabet") {
        if (targetChar === 'A') searchWord = 'APPLE';
        else if (targetChar === 'B') searchWord = 'BALL';
        else if (targetChar === 'C') searchWord = 'CAT';
        else if (targetChar === 'D') searchWord = 'DOG';
        else if (targetChar === 'S') searchWord = 'SUN';
      }

      if (searchWord) {
        try {
          const res = await authFetch(`http://localhost:8080/api/vocabulary/${searchWord}`);
          if (res.ok) {
            const data = await res.json();
            setWordData({ word: searchWord, ...data });
          }
        } catch (err) {
          console.error("Vocabulary fetch failed:", err);
        }
      }
    };

    fetchVocab();

    // Cute voice intro for the letter
    const introMsg = mode === "alphabet" 
      ? `Let's write the letter ${targetChar}! Draw it in the air!`
      : `Let's write the number ${targetChar}! Trace inside the box!`;
    
    setFeedback(introMsg);
    setFeedbackEmoji('🐱');
    speak(introMsg);
  }, [targetChar, mode]);

  const handlePronounce = () => {
    if (wordData) {
      speak(`${targetChar} is for ${wordData.word}. ${wordData.meaning}. E.g. ${wordData.example}`);
    } else {
      speak(targetChar);
    }
  };

  // Lens-based/heuristic matching to support messy kids drawing
  const isMatch = (detected, target) => {
    const d = detected.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
    const t = target.toUpperCase();

    if (d.includes(t)) return true;

    // Smart equivalencies for OCR confusion
    const rules = {
      'A': ['A', 'a', '4', '9', 'L\\\\', 'l\\\\', 'F', 'λ', '/\\\\'],
      'B': ['B', 'b', '8', '3', '83', 'S'],
      'C': ['C', 'c', '(', '<', 'O', '0'],
      'D': ['D', 'd', 'O', '0', '|)', 'P'],
      'E': ['E', 'e', '3'],
      'F': ['F', 'f', '7'],
      'G': ['G', 'g', '6', '9'],
      'H': ['H', 'h', '4', 'I-I', '1-1'],
      'I': ['I', 'i', '1', 'l', '|'],
      'J': ['J', 'j', '1', 'L'],
      'K': ['K', 'k', '<'],
      'L': ['L', 'l', '1', '|'],
      'M': ['M', 'm', 'N', 'W'],
      'N': ['N', 'n', 'H', 'M'],
      'O': ['O', 'o', '0', 'Q', 'D', 'C'],
      'P': ['P', 'p', 'D', 'R', '9'],
      'Q': ['Q', 'q', '0', 'O', '9'],
      'R': ['R', 'r', 'P', '12', 'B'],
      'S': ['S', 's', '5', '8', 'B'],
      'T': ['T', 't', '7', '+'],
      'U': ['U', 'u', 'V', 'v', 'Y'],
      'V': ['V', 'v', 'U', 'Y', '\\/'],
      'W': ['W', 'w', 'M', 'V'],
      'X': ['X', 'x', 'Y', '%', 'K'],
      'Y': ['Y', 'y', 'V', 'X'],
      'Z': ['Z', 'z', '2', '7'],
      '0': ['0', 'O', 'o', 'D'],
      '1': ['1', 'I', 'i', 'l', '|'],
      '2': ['2', 'Z', 'z'],
      '3': ['3', 'E', 'B', '8'],
      '4': ['4', 'H', 'A', '9'],
      '5': ['5', 'S', 's', '6'],
      '6': ['6', 'G', 'b', '5'],
      '7': ['7', 'T', '1', '>'],
      '8': ['8', 'B', 'S', '3', '0'],
      '9': ['9', 'g', 'q', 'P', '4']
    };

    const alternatives = rules[t] || [];
    for (const alt of alternatives) {
      if (d.includes(alt.toUpperCase())) {
        return true;
      }
    }

    return false;
  };

  const handleOcrSubmit = async (base64Image) => {
    setEvaluating(true);
    setFeedback('Doraemon is examining your drawing... 🔍');
    setFeedbackEmoji('🤔');
    speak("Let me check that!");

    try {
      // 1. Client-Side OCR processing
      const worker = await createWorker('eng');
      const ret = await worker.recognize(base64Image);
      await worker.terminate();

      const text = ret.data.text || '';
      const confidence = ret.data.confidence || 0;
      setOcrText(text);

      console.log(`OCR detected: "${text}" with confidence ${confidence}%`);

      let correct = isMatch(text, targetChar);

      // 2. If client OCR fails, call backend mock fallback so kids don't get stuck
      if (!correct) {
        console.log("Client-side OCR failed, executing backend mock fallback check...");
        const res = await authFetch('http://localhost:8080/api/ocr/process', {
          method: 'POST',
          body: JSON.stringify({ image: base64Image, targetChar })
        });
        if (res.ok) {
          const backendOcr = await res.json();
          correct = backendOcr.correct;
        }
      }

      if (correct) {
        setFeedback(`Fantastic! You successfully wrote ${targetChar}! 🎉`);
        setFeedbackEmoji('🌟');
        speak(`Fantastic! You successfully wrote ${targetChar}! Good job!`);
        triggerConfetti();
        setShowReward(true);

        // Save progress to MongoDB
        await markCorrect(mode, targetChar);
      } else {
        setFeedback(`Nice try, but it looks a bit different. Let's trace it again! ✍️`);
        setFeedbackEmoji('🥺');
        speak(`Nice try, but let's try writing ${targetChar} one more time!`);

        // Log attempts
        await markWrong();
      }
    } catch (err) {
      console.error("OCR submission error:", err);
      setFeedback("Oops! The camera feed is hazy. Let's try again! 📷");
      setFeedbackEmoji('⚠️');
      speak("Oops! Let's try drawing it again.");
    } finally {
      setEvaluating(false);
      refreshProgress();
    }
  };

  const handleNextChar = () => {
    const idx = chars.indexOf(targetChar);
    if (idx < chars.length - 1) {
      setTargetChar(chars[idx + 1]);
    } else {
      setTargetChar(chars[0]);
    }
  };

  return (
    <div className="relative w-screen h-screen flex flex-col md:flex-row overflow-hidden font-nunito bg-back text-slate-800">
      <AnimatedBackground />
      <CartoonMascot message={feedback} emoji={feedbackEmoji} />

      {/* Left Panel: Controls and Guides */}
      <div className="z-10 w-full md:w-[350px] bg-white/95 border-b-4 md:border-b-0 md:border-r-4 border-white backdrop-blur-md p-6 flex flex-col justify-between shadow-xl relative overflow-y-auto">
        <div>
          {/* Back button */}
          <button 
            onClick={() => navigate('/mode-selection')}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-800 font-black mb-6 cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" /> Back to Dashboard
          </button>

          <h2 className="text-3xl font-black text-slate-800 leading-none mb-1">
            {mode === "alphabet" ? 'Letter Tracing' : 'Number Tracing'}
          </h2>
          <span className="text-xs font-black text-primary bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200 mt-1 inline-block">
            ✍️ Air Writing Practice
          </span>

          {/* Dotted target guide */}
          <div className="my-6 flex flex-col items-center">
            <div className="w-40 h-52 bg-slate-50 border-4 border-dashed border-slate-300 rounded-[24px] flex items-center justify-center relative shadow-inner">
              <span className="text-[140px] font-black text-slate-300 font-sans tracking-wide">
                {targetChar}
              </span>
              <div className="absolute inset-x-0 top-1/2 border-t border-dashed border-slate-300"></div>
              <div className="absolute inset-y-0 left-1/2 border-l border-dashed border-slate-300"></div>
              
              {/* Pronounce voice assist */}
              <button
                onClick={handlePronounce}
                className="absolute bottom-2 right-2 bg-accent text-slate-800 border-2 border-white rounded-full p-2.5 hover:scale-105 active:scale-95 shadow cursor-pointer"
              >
                <Volume2 className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-slate-400 font-bold mt-2">Dotted Guide</p>
          </div>

          {/* Word assist box if alphabet */}
          {wordData && (
            <div className="bg-sky-50 border-2 border-sky-100 rounded-2xl p-4 mb-4 text-left shadow-sm">
              <h3 className="font-black text-doraBlue text-lg leading-none mb-1">💡 {targetChar} is for {wordData.word}!</h3>
              <p className="text-slate-600 text-xs font-bold leading-normal mb-1">{wordData.meaning}</p>
              <span className="text-xs font-black text-sky-600 block italic">"{wordData.example}"</span>
            </div>
          )}
        </div>

        {/* Character Carousel */}
        <div>
          <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Select Target:</h4>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
            {chars.map((char) => (
              <button
                key={char}
                onClick={() => setTargetChar(char)}
                className={`w-12 h-12 flex-shrink-0 rounded-xl font-black text-lg flex items-center justify-center border-2 transition-all ${
                  targetChar === char
                    ? 'bg-primary border-primary text-white scale-110 shadow-md'
                    : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'
                }`}
              >
                {char}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel: Active Canvas & Camera Section */}
      <div className="z-10 flex-1 flex flex-col justify-center items-center p-6 relative">
        <div className="relative w-[640px] h-[480px] bg-slate-950 border-8 border-white rounded-[32px] shadow-2xl overflow-hidden">
          {/* MediaPipe Webcam Feed */}
          <CameraView onFrame={(landmarks) => {
            if (window.handleLandmarks) {
              window.handleLandmarks(landmarks);
            }
          }} />

          {/* Guidelines Layer behind Transparent Canvas but in front of Video */}
          <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
            <div className="w-[200px] h-[320px] border-4 border-dashed border-white/30 rounded-3xl flex items-center justify-center relative">
              <span className="text-[260px] font-black text-white/15 select-none font-sans leading-none">
                {targetChar}
              </span>
              <div className="absolute inset-x-0 top-1/2 border-t border-dashed border-white/20"></div>
              <div className="absolute inset-y-0 left-1/2 border-l border-dashed border-white/20"></div>
            </div>
          </div>

          {/* Interactive Drawing Canvas overlay */}
          <DrawingCanvas 
            onSubmit={handleOcrSubmit} 
            disabled={evaluating} 
            onPronounce={handlePronounce}
          />
        </div>

        {/* Informative Status Banner */}
        <div className="mt-6 bg-white/80 backdrop-blur-sm border-2 border-white rounded-full px-6 py-2.5 max-w-lg text-center shadow-md flex items-center gap-3">
          <span className="text-xl">💡</span>
          <p className="text-sm font-bold text-slate-700 leading-snug">
            {evaluating ? 'Analyzing...' : 'Draw with index finger, or click "Mouse Mode" below! Submit drawing when done.'}
          </p>
        </div>
      </div>

      {/* Confetti / Rewards Popup */}
      {showReward && (
        <RewardPopup 
          onClose={() => setShowReward(false)} 
          stars={10} 
          xp={20}
          onNext={handleNextChar}
        />
      )}
    </div>
  );
};

export default LearningMode;
