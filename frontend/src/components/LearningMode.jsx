import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import CameraView from './CameraView';
import DrawingCanvas from './DrawingCanvas';
import RewardPopup from './RewardPopup';
import CartoonMascot from './CartoonMascot';
import AnimatedBackground from './AnimatedBackground';
import { useProgress } from '../hooks/useProgress';
import { useSettings } from '../context/SettingsContext';
import { useAuth } from '../context/AuthContext';

const alphabetRewards = {
  'A': { emoji: '🍎', name: 'Apple' },
  'B': { emoji: '🐦', name: 'Bird' },
  'C': { emoji: '🐱', name: 'Cat' },
  'D': { emoji: '🐶', name: 'Dog' },
  'E': { emoji: '🐘', name: 'Elephant' },
  'F': { emoji: '🐸', name: 'Frog' },
  'G': { emoji: '🦒', name: 'Giraffe' },
  'H': { emoji: '🐴', name: 'Horse' },
  'I': { emoji: '🍦', name: 'Ice Cream' },
  'J': { emoji: '🕹️', name: 'Joystick' },
  'K': { emoji: '🦘', name: 'Kangaroo' },
  'L': { emoji: '🦁', name: 'Lion' },
  'M': { emoji: '🐒', name: 'Monkey' },
  'N': { emoji: '🐾', name: 'Noodles' },
  'O': { emoji: '🦉', name: 'Owl' },
  'P': { emoji: '🐼', name: 'Panda' },
  'Q': { emoji: '👸', name: 'Queen' },
  'R': { emoji: '🌈', name: 'Rainbow' },
  'S': { emoji: '🌟', name: 'Star' },
  'T': { emoji: '🐯', name: 'Tiger' },
  'U': { emoji: '☂️', name: 'Umbrella' },
  'V': { emoji: '🎻', name: 'Violin' },
  'W': { emoji: '🌊', name: 'Wave' },
  'X': { emoji: '🎸', name: 'Xylophone' },
  'Y': { emoji: '🪀', name: 'Yo-yo' },
  'Z': { emoji: '🦓', name: 'Zebra' },
};

const numberRewards = {
  '1': { emoji: '1️⃣', name: 'One' },
  '2': { emoji: '2️⃣', name: 'Two' },
  '3': { emoji: '3️⃣', name: 'Three' },
  '4': { emoji: '4️⃣', name: 'Four' },
  '5': { emoji: '🎈🎈🎈🎈🎈', name: 'Five Balloons' },
  '6': { emoji: '6️⃣', name: 'Six' },
  '7': { emoji: '7️⃣', name: 'Seven' },
  '8': { emoji: '8️⃣', name: 'Eight' },
  '9': { emoji: '9️⃣', name: 'Nine' },
  '0': { emoji: '🌕', name: 'Zero' },
};

const getRewardForChar = (char, type) => {
  if (type === 'numbers') return numberRewards[char] || { emoji: '🎈', name: `${char}!` };
  return alphabetRewards[char] || { emoji: '🌟', name: 'Star' };
};

const LearningMode = () => {
  const { type } = useParams();
  const navigate = useNavigate();
  const { progress, level, badges, markCorrect, markWrong } = useProgress();
  const { settings } = useSettings();
  const { user } = useAuth();

  const alphabets = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  const numbers = '1234567890'.split('');
  const sequence = type === 'alphabets' ? alphabets : numbers;

  const startIndex = (() => {
    const done = type === 'alphabets' ? progress.alphabetsDone : progress.numbersDone;
    const next = sequence.findIndex(c => !done.includes(c));
    return next === -1 ? 0 : next;
  })();

  const [currentIndex, setCurrentIndex] = useState(startIndex);
  const [result, setResult] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');

  const currentCharacter = sequence[currentIndex];
  const currentReward = getRewardForChar(currentCharacter, type);

  // Muted-aware speak helper
  const speak = useCallback((text) => {
    if (settings.muted || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utt = new SpeechSynthesisUtterance(text);
    utt.pitch = 1.2;
    utt.rate  = 0.9;
    window.speechSynthesis.speak(utt);
  }, [settings.muted]);

  const speakSuccess = useCallback(() => {
    const msg = type === 'alphabets'
      ? `${currentCharacter} for ${currentReward.name}!`
      : `Good job! ${currentReward.name}!`;
    speak(msg);
  }, [currentCharacter, currentReward, type, speak]);

  const handlePronounce = useCallback(() => {
    speak(`Write the ${type === 'alphabets' ? 'letter' : 'number'} ${currentCharacter}`);
  }, [currentCharacter, type, speak]);

  const handleSubmitDrawing = async (base64Image) => {
    setIsProcessing(true);
    setStatusMsg('🔍 Reading your writing...');
    try {
      if (!window.Tesseract) throw new Error('Tesseract not loaded');
      const workerResult = await window.Tesseract.recognize(base64Image, 'eng');
      const recognized = workerResult.data.text.toUpperCase().trim().replace(/[^A-Z0-9]/g, '');
      console.log('OCR Raw:', recognized, '| Expected:', currentCharacter);

      const isMatch = recognized.includes(currentCharacter);

      if (isMatch) {
        await markCorrect(type === 'alphabets' ? 'alphabet' : 'number', currentCharacter);
        speakSuccess();
        setResult({ isMatch: true, message: 'Great job! 🎉' });
      } else {
        await markWrong();
        if (window.speechSynthesis) {
          window.speechSynthesis.cancel();
          window.speechSynthesis.speak(new SpeechSynthesisUtterance("Oops! Let's try again."));
        }
        setResult({
          isMatch: false,
          message: recognized ? `I saw "${recognized[0] || '?'}". Try again!` : "I couldn't read it. Try writing bigger!",
        });
      }
    } catch (err) {
      console.error('OCR error:', err);
      setResult({ isMatch: false, message: 'OCR failed. Please try again.' });
    } finally {
      setIsProcessing(false);
      setStatusMsg('');
    }
  };

  const handleNext = () => {
    if (result?.isMatch) {
      if (currentIndex < sequence.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        if (window.speechSynthesis)
          window.speechSynthesis.speak(new SpeechSynthesisUtterance('You completed all! Amazing!'));
        navigate('/dashboard');
      }
    }
    setResult(null);
  };

  const charType = type === 'alphabets' ? 'alphabet' : 'number';
  const done = type === 'alphabets' ? progress.alphabetsDone.length : progress.numbersDone.length;
  const total = sequence.length;

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      {/* Header */}
      <div style={{ display: 'flex', gap: 24, alignItems: 'center', marginBottom: 10 }}>
        <h1 style={{ margin: 0 }}>
          Write: <span style={{ color: 'var(--primary-color)', fontSize: '4rem' }}>{currentCharacter}</span>
        </h1>
        <div className="stat-box" style={{ fontSize: '1.2rem', padding: '8px 16px' }}>
          ⭐ {progress.stars} &nbsp;|&nbsp; 🔥 {progress.streak} &nbsp;|&nbsp; {done}/{total}
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ width: 640, height: 12, background: '#e0e0e0', borderRadius: 10, marginBottom: 10, overflow: 'hidden' }}>
        <div style={{
          height: '100%', borderRadius: 10,
          background: 'linear-gradient(90deg, var(--secondary-color), var(--primary-color))',
          width: `${(done / total) * 100}%`,
          transition: 'width 0.4s ease'
        }} />
      </div>

      {/* Camera area */}
      <div className="camera-container">
        <AnimatedBackground />
        <CameraView onFrame={(landmarks) => window.handleLandmarks && window.handleLandmarks(landmarks)} />
        <div className="tracing-guide">{currentCharacter}</div>
        <DrawingCanvas
          onSubmit={handleSubmitDrawing}
          disabled={isProcessing || result !== null}
          onPronounce={handlePronounce}
        />
        {isProcessing && (
          <div style={{
            position: 'absolute', bottom: 20, left: '50%', transform: 'translateX(-50%)',
            background: 'rgba(0,0,0,0.7)', color: 'white', padding: '8px 20px',
            borderRadius: 20, fontWeight: 'bold', zIndex: 50, fontSize: '1.1rem'
          }}>
            {statusMsg}
          </div>
        )}
      </div>

      {/* Gesture guide */}
      <div className="card" style={{ padding: '12px 24px', marginTop: 16, width: 600 }}>
        <div style={{ display: 'flex', justifyContent: 'space-around', fontSize: '1rem', fontWeight: 'bold' }}>
          <span>☝️ Draw</span>
          <span>✊ Submit</span>
          <span>✋ Clear</span>
          <span>👍 Hear Again</span>
        </div>
      </div>

      <button className="btn" onClick={() => navigate(-1)} style={{ marginTop: 8 }}>🔙 Back</button>

      {result && (
        <RewardPopup
          isMatch={result.isMatch}
          message={result.message}
          onNext={handleNext}
          reward={currentReward}
        />
      )}
    </div>
  );
};

export default LearningMode;
