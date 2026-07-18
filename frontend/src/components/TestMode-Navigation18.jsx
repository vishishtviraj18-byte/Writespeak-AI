import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useProgress } from '../hooks/useProgress';
import CameraView from './CameraView';
import DrawingCanvas from './DrawingCanvas';
import AnimatedBackground from './AnimatedBackground';
import CartoonMascot from './CartoonMascot';
import { ArrowLeft, Clock, Sparkles, Trophy, ChevronRight, Play } from 'lucide-react';
import { createWorker } from 'tesseract.js';
import confetti from 'canvas-confetti';
import gsap from 'gsap';

const TestMode = () => {
  const navigate = useNavigate();
  const { authFetch } = useAuth();
  const { progress, refreshProgress } = useProgress();

  const [testState, setTestState] = useState('start'); // start | playing | finished
  const [testType, setTestType] = useState('ALPHABET'); // ALPHABET | NUMBER | MIXED
  const [queue, setQueue] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState([]); // Array of { target, correct, detected }
  
  const [evaluating, setEvaluating] = useState(false);
  const [feedback, setFeedback] = useState('Are you ready to test your skills?');
  const [feedbackEmoji, setFeedbackEmoji] = useState('🦉');
  
  // Timer state
  const [timer, setTimer] = useState(30);
  const timerIntervalRef = useRef(null);

  // Score & Grade results from backend
  const [testResult, setTestResult] = useState(null);

  // Speak function
  const speak = (msg) => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(msg);
      utterance.rate = 0.95;
      utterance.pitch = 1.2;
      window.speechSynthesis.speak(utterance);
    }
  };

  useEffect(() => {
    speak("Welcome to the challenge arena! Choose your test type to begin!");
  }, []);

  // Timer loop
  useEffect(() => {
    if (testState === 'playing') {
      setTimer(30);
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      
      timerIntervalRef.current = setInterval(() => {
        setTimer((t) => {
          if (t <= 1) {
            // Out of time: auto-submit blank or skip
            handleSkip();
            return 30;
          }
          return t - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [testState, currentIdx]);

  const handleStartTest = async (type) => {
    setTestType(type);
    setEvaluating(true);
    setFeedback('Generating your customized test paper... 📜');

    try {
      // Fetch dynamic queue from backend based on what the child has completed
      const doneAlphabets = progress.alphabetsDone || [];
      const doneNumbers = progress.numbersDone || [];

      // If user has not practiced, populate full list as backup
      const payload = {
        alphabetsDone: type === 'NUMBER' ? [] : (doneAlphabets.length > 0 ? doneAlphabets : "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("")),
        numbersDone: type === 'ALPHABET' ? [] : (doneNumbers.length > 0 ? doneNumbers : "0123456789".split("")),
        count: 5 // 5 questions is perfect for kid attention span
      };

      const res = await authFetch('http://localhost:8080/api/test/generate-queue', {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        let q = await res.json();
        // Fallback if empty
        if (!q || q.length === 0) {
          q = type === 'NUMBER' ? ['1', '2', '3', '4', '5'] : ['A', 'B', 'C', 'D', 'E'];
        }
        setQueue(q);
        setCurrentIdx(0);
        setAnswers([]);
        setTestState('playing');
        setFeedback(`Write the character shown without any guidelines. You have 30 seconds!`);
        setFeedbackEmoji('✍️');
        speak(`Question one: Draw the character ${q[0]}`);
      } else {
        throw new Error("Queue generation failed");
      }
    } catch (err) {
      console.error(err);
      // Hardcoded fallback
      const q = type === 'NUMBER' ? ['1', '2', '3', '4', '5'] : ['A', 'B', 'C', 'D', 'E'];
      setQueue(q);
      setCurrentIdx(0);
      setAnswers([]);
      setTestState('playing');
    } finally {
      setEvaluating(false);
    }
  };

  // Lens-based/heuristic matching
  const isMatch = (detected, target) => {
    const d = detected.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
    const t = target.toUpperCase();
    if (d.includes(t)) return true;

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
    if (evaluating) return;
    setEvaluating(true);
    speak("Saving your drawing!");

    const target = queue[currentIdx];
    let correct = false;
    let detectedText = '?';

    try {
      const worker = await createWorker('eng');
      const ret = await worker.recognize(base64Image);
      await worker.terminate();

      detectedText = ret.data.text || '';
      correct = isMatch(detectedText, target);

      // Backend fallback check for kids lenient grading
      if (!correct) {
        const res = await authFetch('http://localhost:8080/api/ocr/process', {
          method: 'POST',
          body: JSON.stringify({ image: base64Image, targetChar: target })
        });
        if (res.ok) {
          const backendOcr = await res.json();
          correct = backendOcr.correct;
          if (correct) detectedText = target;
        }
      }
    } catch (err) {
      console.error(err);
    }

    const nextAnswers = [...answers, { target, correct, detected: detectedText.trim() }];
    setAnswers(nextAnswers);
    proceedNext(nextAnswers);
  };

  const handleSkip = () => {
    const target = queue[currentIdx];
    const nextAnswers = [...answers, { target, correct: false, detected: '[Timeout/Skip]' }];
    setAnswers(nextAnswers);
    proceedNext(nextAnswers);
  };

  const proceedNext = (currAnswers) => {
    setEvaluating(false);
    if (currentIdx < queue.length - 1) {
      const nextIdx = currentIdx + 1;
      setCurrentIdx(nextIdx);
      speak(`Next question: Draw the character ${queue[nextIdx]}`);
    } else {
      // Evaluate test results
      finishTest(currAnswers);
    }
  };

  const finishTest = async (finalAnswers) => {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    setTestState('evaluating');
    setFeedback('Grading paper and totaling bonus stars... 📊');
    setFeedbackEmoji('🦉');

    try {
      const res = await authFetch('http://localhost:8080/api/test/evaluate', {
        method: 'POST',
        body: JSON.stringify({
          testType,
          answers: finalAnswers
        })
      });

      if (res.ok) {
        const result = await res.json();
        setTestResult(result);
        setTestState('finished');
        speak(`Test completed! You scored ${result.correctAnswers} out of ${result.totalQuestions}! Your grade is ${result.grade.split(" ")[0]}`);
        
        // Unlocks game triggers! Trigger beautiful custom confetti!
        if (result.accuracy >= 60) {
          confetti({ particleCount: 150, spread: 80 });
        }
      } else {
        throw new Error("Evaluation error");
      }
    } catch (err) {
      console.error(err);
      // Fallback display
      const correct = finalAnswers.filter(a => a.correct).length;
      setTestResult({
        totalQuestions: queue.length,
        correctAnswers: correct,
        accuracy: Math.round(correct / queue.length * 100),
        score: correct * 15,
        grade: correct >= 4 ? 'A ⭐ Great!' : 'B 👍 Try Harder!',
        wrongChars: []
      });
      setTestState('finished');
    } finally {
      refreshProgress();
    }
  };

  return (
    <div className="relative w-screen h-screen flex flex-col items-center justify-center overflow-hidden font-nunito bg-back text-slate-800 select-none">
      <AnimatedBackground />
      <CartoonMascot message={feedback} emoji={feedbackEmoji} />

      {/* Back to Selection button */}
      <button 
        onClick={() => navigate('/mode-selection')}
        className="absolute top-4 left-4 bg-white hover:bg-slate-100 text-slate-600 font-black px-4 py-2.5 rounded-full border-2 border-white shadow z-20 flex items-center gap-2 cursor-pointer transition-colors"
      >
        <ArrowLeft className="w-5 h-5" /> Dashboard
      </button>

      {/* 1. START STATE */}
      {testState === 'start' && (
        <div className="z-10 w-full max-w-xl px-4">
          <div className="glass-panel text-center">
            <div className="w-20 h-20 bg-accent border-4 border-white rounded-full flex items-center justify-center text-4xl mx-auto -mt-16 shadow-md animate-bounce">
              🎓
            </div>
            <h2 className="text-3xl font-black text-slate-800 mt-4 mb-2">Challenge Arena</h2>
            <p className="text-slate-500 font-bold text-sm mb-6">
              Write letters or numbers from memory. Guidelines will be hidden! Earn 15 bonus XP per correct character.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <button
                onClick={() => handleStartTest('ALPHABET')}
                className="btn-dora bg-primary hover:bg-rose-400 py-4 text-lg"
              >
                🔤 Alphabets
              </button>
              <button
                onClick={() => handleStartTest('NUMBER')}
                className="btn-dora bg-secondary hover:bg-teal-400 py-4 text-lg"
              >
                🔢 Numbers
              </button>
              <button
                onClick={() => handleStartTest('MIXED')}
                className="btn-dora bg-doraBlue hover:bg-sky-400 py-4 text-lg"
              >
                🌀 Mixed
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. PLAYING STATE */}
      {testState === 'playing' && queue.length > 0 && (
        <div className="z-10 flex flex-col items-center">
          {/* Question Banner & Timer */}
          <div className="flex gap-4 items-center mb-4 bg-white/90 border-4 border-white px-6 py-2 rounded-full shadow-md">
            <span className="font-black text-slate-700 text-lg">
              Question {currentIdx + 1} of {queue.length}
            </span>
            <div className="w-px h-6 bg-slate-200"></div>
            <div className={`flex items-center gap-1.5 font-black text-lg ${timer < 10 ? 'text-primary animate-pulse' : 'text-slate-600'}`}>
              <Clock className="w-5 h-5" />
              <span>{timer}s</span>
            </div>
            <div className="w-px h-6 bg-slate-200"></div>
            <span className="font-black text-doraBlue text-xl">
              Write: "{queue[currentIdx]}"
            </span>
          </div>

          <div className="relative w-[640px] h-[480px] bg-slate-950 border-8 border-white rounded-[32px] shadow-2xl overflow-hidden">
            {/* Webcam Feed */}
            <CameraView onFrame={(landmarks) => {
              if (window.handleLandmarks) {
                window.handleLandmarks(landmarks);
              }
            }} />

            {/* Guideline is hidden in Test Mode. Only a soft target label indicator in corner */}
            <div className="absolute top-4 left-4 z-10 bg-slate-900/60 border border-white/20 text-white rounded-xl px-4 py-1.5 font-black text-sm">
              Target: <span className="text-accent">{queue[currentIdx]}</span>
            </div>

            {/* Drawing Canvas overlay */}
            <DrawingCanvas 
              onSubmit={handleOcrSubmit} 
              disabled={evaluating} 
              onPronounce={() => speak(queue[currentIdx])}
            />
          </div>

          {/* Skip buttons */}
          <div className="mt-4 flex gap-3">
            <button
              onClick={handleSkip}
              className="bg-white hover:bg-slate-50 border-2 border-slate-200 text-slate-600 px-5 py-2 rounded-full font-black text-sm shadow cursor-pointer transition-colors active:scale-95"
            >
              ⏭️ Skip / Time Out
            </button>
          </div>
        </div>
      )}

      {/* 3. EVALUATING LOADING STATE */}
      {testState === 'evaluating' && (
        <div className="z-10 text-center bg-white/90 border-4 border-white px-8 py-6 rounded-[32px] shadow-lg max-w-md w-full flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent mb-4"></div>
          <h3 className="text-xl font-black text-slate-800">Evaluating answers...</h3>
        </div>
      )}

      {/* 4. FINISHED STATE */}
      {testState === 'finished' && testResult && (
        <div className="z-10 w-full max-w-md px-4">
          <div className="glass-panel text-center flex flex-col items-center gap-4 relative">
            <div className="w-20 h-20 bg-yellow-400 border-4 border-white rounded-full flex items-center justify-center text-4xl mx-auto -mt-16 shadow-md">
              🏆
            </div>
            
            <h2 className="text-3xl font-black text-slate-800 mt-2">Test Completed!</h2>
            <div className="text-sm font-black text-primary bg-rose-50 border border-rose-200 rounded-full px-3 py-1 mt-1 inline-block">
              {testResult.grade}
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-2 gap-4 w-full my-4">
              <div className="bg-slate-50 border-2 border-slate-100 rounded-2xl p-3">
                <div className="text-xs font-bold text-slate-400">CORRECT ANSWERS</div>
                <div className="text-2xl font-black text-slate-800">
                  {testResult.correctAnswers} / {testResult.totalQuestions}
                </div>
              </div>

              <div className="bg-slate-50 border-2 border-slate-100 rounded-2xl p-3">
                <div className="text-xs font-bold text-slate-400">ACCURACY</div>
                <div className="text-2xl font-black text-emerald-600">
                  {testResult.accuracy}%
                </div>
              </div>
            </div>

            <div className="bg-sky-50 border-2 border-sky-100 text-sky-700 font-bold rounded-2xl p-4 w-full text-sm leading-normal">
              🌟 You earned <span className="font-black text-sky-800">+{testResult.score} XP</span>. The Snakes & Ladders game has been unlocked! Go play against Doraemon!
            </div>

            {/* Control buttons */}
            <div className="flex flex-col gap-3 w-full mt-4">
              <button
                onClick={() => navigate('/snake-ladder')}
                className="btn-dora bg-primary hover:bg-rose-400 flex items-center justify-center gap-2 text-lg py-3.5"
              >
                🎲 Play Snakes & Ladders
              </button>

              <button
                onClick={() => setTestState('start')}
                className="btn-dora bg-secondary hover:bg-teal-400 flex items-center justify-center gap-2 text-lg py-3.5"
              >
                🔄 Take Another Test
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TestMode;
