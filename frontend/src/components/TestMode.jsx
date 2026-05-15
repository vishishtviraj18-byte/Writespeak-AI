import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import confetti from 'canvas-confetti';
import CameraView from './CameraView';
import DrawingCanvas from './DrawingCanvas';
import AnimatedBackground from './AnimatedBackground';
import { useProgress } from '../hooks/useProgress';

const TestMode = () => {
  const navigate = useNavigate();
  const { progress, markCorrect, markWrong } = useProgress();

  // Build test queue from completed chars
  const buildQueue = () => {
    const chars = [...progress.alphabetsDone, ...progress.numbersDone];
    if (chars.length === 0) return ['A', 'B', 'C'];
    const shuffled = [...chars].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.min(10, shuffled.length));
  };

  const [queue] = useState(buildQueue);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const headerRef = useRef(null);

  useEffect(() => {
    gsap.fromTo(headerRef.current,
      { scale: 0.8, opacity: 0 },
      { scale: 1, opacity: 1, duration: 0.5, ease: 'back.out(1.7)' }
    );
  }, [currentIdx]);

  const currentChar = queue[currentIdx];
  const charType = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.includes(currentChar) ? 'alphabet' : 'number';

  const handleSubmit = async (base64Image) => {
    setIsProcessing(true);
    setStatusMsg('🔍 Checking...');
    try {
      const workerResult = await window.Tesseract.recognize(base64Image, 'eng');
      const recognized = workerResult.data.text.toUpperCase().trim().replace(/[^A-Z0-9]/g, '');
      const isMatch = recognized.includes(currentChar);

      const newAnswer = { target: currentChar, detected: recognized[0] || '?', correct: isMatch };
      const newAnswers = [...answers, newAnswer];
      setAnswers(newAnswers);

      if (isMatch) {
        await markCorrect(charType, currentChar);
        if (window.speechSynthesis) {
          window.speechSynthesis.cancel();
          window.speechSynthesis.speak(new SpeechSynthesisUtterance('Correct!'));
        }
      } else {
        await markWrong();
      }

      if (currentIdx + 1 < queue.length) {
        setTimeout(() => { setCurrentIdx(i => i + 1); setStatusMsg(''); }, 1000);
      } else {
        // Evaluate
        const correct = newAnswers.filter(a => a.correct).length;
        const total = newAnswers.length;
        const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;
        const score = correct * 15;
        const grade =
          accuracy >= 90 ? 'A+ 🌟 Outstanding!' :
          accuracy >= 80 ? 'A  ⭐ Excellent!'    :
          accuracy >= 70 ? 'B  👍 Good Job!'     :
          accuracy >= 60 ? 'C  💪 Keep Going!'   :
                           'D  📚 Practice More!';

        setTestResult({ totalQuestions: total, correctAnswers: correct, accuracy, score, grade, answers: newAnswers });
        setShowResult(true);
        if (accuracy >= 70) confetti({ particleCount: 200, spread: 80, origin: { y: 0.5 } });
      }
    } catch (e) {
      console.error(e);
      setStatusMsg('OCR failed. Try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (showResult && testResult) {
    return (
      <div style={{ maxWidth: 600, margin: '40px auto', textAlign: 'center' }}>
        <div className="card">
          <h1>🎓 Test Complete!</h1>
          <div style={{ fontSize: '3rem', margin: '16px 0' }}>{testResult.grade}</div>
          <div className="dashboard" style={{ justifyContent: 'center', gap: 16, flexWrap: 'wrap' }}>
            <div className="stat-box">✅ Correct<br /><big>{testResult.correctAnswers}/{testResult.totalQuestions}</big></div>
            <div className="stat-box" style={{ background: 'var(--primary-color)' }}>🎯 Accuracy<br /><big>{testResult.accuracy}%</big></div>
            <div className="stat-box" style={{ background: 'var(--secondary-color)' }}>🏅 Score<br /><big>{testResult.score}</big></div>
          </div>
          <div style={{ marginTop: 20 }}>
            <h3>📋 Answer Review</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
              {testResult.answers.map((a, i) => (
                <div key={i} style={{
                  padding: '6px 14px', borderRadius: 10, fontWeight: 'bold',
                  background: a.correct ? '#55efc4' : '#ff7675',
                  color: 'white', fontSize: '1.1rem'
                }}>
                  {a.target} {a.correct ? '✅' : `❌(${a.detected})`}
                </div>
              ))}
            </div>
          </div>
          <div style={{ marginTop: 24, display: 'flex', gap: 12, justifyContent: 'center' }}>
            <button className="btn" onClick={() => navigate('/dashboard')}>📊 Dashboard</button>
            <button className="btn btn-primary" onClick={() => navigate('/select')}>📚 Keep Learning</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div ref={headerRef}>
        <h1>🧪 Test Mode — Write: <span style={{ color: 'var(--primary-color)', fontSize: '4rem' }}>{currentChar}</span></h1>
        <p style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '1.2rem' }}>
          Question {currentIdx + 1} / {queue.length}
        </p>
      </div>

      <div className="camera-container">
        <AnimatedBackground />
        <CameraView onFrame={(landmarks) => window.handleLandmarks && window.handleLandmarks(landmarks)} />
        <div className="tracing-guide">{currentChar}</div>
        <DrawingCanvas
          onSubmit={handleSubmit}
          disabled={isProcessing}
          onPronounce={() => {
            if (window.speechSynthesis) {
              window.speechSynthesis.cancel();
              window.speechSynthesis.speak(new SpeechSynthesisUtterance(`Write the ${charType} ${currentChar}`));
            }
          }}
        />
        {statusMsg && (
          <div style={{
            position: 'absolute', bottom: 20, left: '50%', transform: 'translateX(-50%)',
            background: 'rgba(0,0,0,0.75)', color: 'white', padding: '8px 22px',
            borderRadius: 20, fontWeight: 'bold', zIndex: 50
          }}>
            {statusMsg}
          </div>
        )}
      </div>

      <div className="card" style={{ padding: '10px 24px', marginTop: 14 }}>
        <div style={{ display: 'flex', justifyContent: 'space-around', fontSize: '1rem', fontWeight: 'bold' }}>
          <span>☝️ Draw</span><span>✊ Submit</span><span>✋ Clear</span><span>👍 Hear Again</span>
        </div>
      </div>
      <button className="btn" onClick={() => navigate('/dashboard')} style={{ marginTop: 8 }}>🔙 Exit Test</button>
    </div>
  );
};

export default TestMode;
