import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import confetti from 'canvas-confetti';
import { useProgress } from '../hooks/useProgress';

// ── Game 1: Match the Character ─────────────────────────────
const MatchGame = ({ chars, onComplete }) => {
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const btnRef = useRef([]);

  const char = chars[current];
  const options = (() => {
    const pool = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890'.split('').filter(c => c !== char);
    const wrong = pool.sort(() => Math.random() - 0.5).slice(0, 3);
    return [...wrong, char].sort(() => Math.random() - 0.5);
  })();

  const handleAnswer = (choice) => {
    const correct = choice === char;
    setFeedback({ correct, choice });
    if (correct) {
      setScore(s => s + 1);
      confetti({ particleCount: 80, spread: 50, origin: { y: 0.6 } });
    }
    setTimeout(() => {
      setFeedback(null);
      if (current + 1 < chars.length) setCurrent(c => c + 1);
      else onComplete(score + (correct ? 1 : 0), chars.length);
    }, 900);
  };

  return (
    <div className="card" style={{ maxWidth: 500, margin: '0 auto', textAlign: 'center' }}>
      <h2>🎯 Match the Character!</h2>
      <p style={{ fontSize: '1.2rem' }}>Question {current + 1} / {chars.length}</p>
      <div style={{ fontSize: '8rem', margin: '10px 0', filter: 'drop-shadow(0 5px 10px rgba(0,0,0,0.2))' }}>
        {char}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 16 }}>
        {options.map((opt, i) => (
          <button
            key={i}
            className="btn"
            style={{
              fontSize: '2.5rem', padding: '16px',
              background: feedback
                ? (opt === char ? '#55efc4' : opt === feedback.choice ? '#ff7675' : undefined)
                : undefined,
              transform: feedback && opt === char ? 'scale(1.1)' : undefined,
              transition: 'all 0.2s'
            }}
            onClick={() => !feedback && handleAnswer(opt)}
          >
            {opt}
          </button>
        ))}
      </div>
      {feedback && (
        <div style={{ fontSize: '2rem', marginTop: 10 }}>
          {feedback.correct ? '🌟 Correct!' : '❌ Oops!'}
        </div>
      )}
    </div>
  );
};

// ── Game 2: What's This? (Emoji → Letter) ───────────────────
const emojiMap = {
  'A': '🍎', 'B': '🐦', 'C': '🐱', 'D': '🐶', 'E': '🐘',
  'F': '🐸', 'G': '🦒', 'H': '🐴', 'I': '🍦', 'J': '🕹️',
  'K': '🦘', 'L': '🦁', 'M': '🐒', 'O': '🦉', 'P': '🐼',
  'R': '🌈', 'S': '🌟', 'T': '🐯', 'U': '☂️', 'W': '🌊', 'Z': '🦓',
};

const EmojiGame = ({ chars, onComplete }) => {
  const avail = chars.filter(c => emojiMap[c]);
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState(null);

  if (avail.length === 0) {
    return <div className="card"><h2>Not enough letters learned yet! Practice more first! 📚</h2></div>;
  }

  const char = avail[current % avail.length];
  const emoji = emojiMap[char];
  const options = (() => {
    const pool = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').filter(c => c !== char);
    return [...pool.sort(() => Math.random() - 0.5).slice(0, 3), char].sort(() => Math.random() - 0.5);
  })();

  const handleAnswer = (choice) => {
    const correct = choice === char;
    setFeedback({ correct, choice });
    if (correct) { setScore(s => s + 1); confetti({ particleCount: 60, spread: 40 }); }
    setTimeout(() => {
      setFeedback(null);
      if (current + 1 < avail.length) setCurrent(c => c + 1);
      else onComplete(score + (correct ? 1 : 0), avail.length);
    }, 900);
  };

  return (
    <div className="card" style={{ maxWidth: 500, margin: '0 auto', textAlign: 'center' }}>
      <h2>🤔 What's This?</h2>
      <p style={{ fontSize: '1.2rem' }}>Question {current + 1} / {avail.length} — Pick the starting letter!</p>
      <div style={{ fontSize: '7rem', margin: '10px 0' }}>{emoji}</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 16 }}>
        {options.map((opt, i) => (
          <button
            key={i}
            className="btn"
            style={{
              fontSize: '2.5rem', padding: '16px',
              background: feedback
                ? (opt === char ? '#55efc4' : opt === feedback.choice ? '#ff7675' : undefined)
                : undefined,
            }}
            onClick={() => !feedback && handleAnswer(opt)}
          >
            {opt}
          </button>
        ))}
      </div>
      {feedback && <div style={{ fontSize: '2rem', marginTop: 10 }}>{feedback.correct ? '🌟 Correct!' : `❌ It was ${char}!`}</div>}
    </div>
  );
};

// ── Game 3: Memory Flash ─────────────────────────────────────
const MemoryGame = ({ chars, onComplete }) => {
  const [phase, setPhase] = useState('show'); // show | pick
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState(null);

  const char = chars[current];
  const options = (() => {
    const pool = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890'.split('').filter(c => c !== char);
    return [...pool.sort(() => Math.random() - 0.5).slice(0, 3), char].sort(() => Math.random() - 0.5);
  })();

  useEffect(() => {
    setPhase('show');
    const t = setTimeout(() => setPhase('pick'), 2000);
    return () => clearTimeout(t);
  }, [current]);

  const handleAnswer = (choice) => {
    const correct = choice === char;
    setFeedback({ correct, choice });
    if (correct) { setScore(s => s + 1); confetti({ particleCount: 60, spread: 40 }); }
    setTimeout(() => {
      setFeedback(null);
      if (current + 1 < chars.length) setCurrent(c => c + 1);
      else onComplete(score + (correct ? 1 : 0), chars.length);
    }, 900);
  };

  return (
    <div className="card" style={{ maxWidth: 500, margin: '0 auto', textAlign: 'center' }}>
      <h2>🧠 Memory Flash!</h2>
      <p style={{ fontSize: '1.2rem' }}>Question {current + 1} / {chars.length}</p>
      {phase === 'show' ? (
        <div>
          <p style={{ fontWeight: 'bold' }}>Remember this!</p>
          <div style={{
            fontSize: '9rem', margin: '10px 0',
            animation: 'pulse 0.4s infinite alternate',
            color: 'var(--primary-color)',
            textShadow: '0 0 30px var(--accent-color)'
          }}>
            {char}
          </div>
        </div>
      ) : (
        <div>
          <p style={{ fontWeight: 'bold' }}>What was it? 🤔</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 16 }}>
            {options.map((opt, i) => (
              <button
                key={i}
                className="btn"
                style={{
                  fontSize: '2.5rem', padding: '16px',
                  background: feedback
                    ? (opt === char ? '#55efc4' : opt === feedback.choice ? '#ff7675' : undefined)
                    : undefined
                }}
                onClick={() => !feedback && handleAnswer(opt)}
              >
                {opt}
              </button>
            ))}
          </div>
          {feedback && <div style={{ fontSize: '2rem', marginTop: 10 }}>{feedback.correct ? '🌟 Correct!' : `❌ It was ${char}!`}</div>}
        </div>
      )}
    </div>
  );
};

// ── Main MiniGame Selector ────────────────────────────────────
const MiniGame = () => {
  const navigate = useNavigate();
  const { progress } = useProgress();
  const [gameType, setGameType] = useState(null); // null | 'match' | 'emoji' | 'memory'
  const [gameOver, setGameOver] = useState(null);

  const allChars = [...new Set([...progress.alphabetsDone, ...progress.numbersDone])];

  const handleComplete = (score, total) => {
    setGameOver({ score, total, pct: Math.round((score / total) * 100) });
    if (score / total >= 0.7)
      confetti({ particleCount: 200, spread: 80, origin: { y: 0.5 } });
  };

  if (gameOver) {
    return (
      <div style={{ maxWidth: 500, margin: '40px auto', textAlign: 'center' }}>
        <div className="card">
          <h1>🎮 Game Over!</h1>
          <div style={{ fontSize: '3rem' }}>
            {gameOver.pct >= 80 ? '🏆 Amazing!' : gameOver.pct >= 60 ? '👍 Good!' : '💪 Try Again!'}
          </div>
          <div className="dashboard" style={{ justifyContent: 'center', gap: 16, marginTop: 16 }}>
            <div className="stat-box">✅ Score<br /><big>{gameOver.score}/{gameOver.total}</big></div>
            <div className="stat-box" style={{ background: 'var(--primary-color)' }}>🎯 Accuracy<br /><big>{gameOver.pct}%</big></div>
          </div>
          <div style={{ marginTop: 20, display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="btn" onClick={() => { setGameOver(null); setGameType(null); }}>🔄 Play Again</button>
            <button className="btn btn-primary" onClick={() => navigate('/dashboard')}>📊 Dashboard</button>
          </div>
        </div>
      </div>
    );
  }

  if (!gameType) {
    return (
      <div style={{ maxWidth: 600, margin: '40px auto', textAlign: 'center' }}>
        <h1>🎮 Mini Games</h1>
        {allChars.length < 3 ? (
          <div className="card">
            <h2>📚 Learn at least 3 letters first!</h2>
            <button className="btn btn-primary" onClick={() => navigate('/select')}>Go Learn!</button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'center' }}>
            <button className="btn" style={{ width: 320, fontSize: '1.6rem' }} onClick={() => setGameType('match')}>
              🎯 Match the Character
            </button>
            <button className="btn btn-primary" style={{ width: 320, fontSize: '1.6rem' }} onClick={() => setGameType('emoji')}>
              🤔 What's This? (Emoji → Letter)
            </button>
            <button className="btn btn-accent" style={{ width: 320, fontSize: '1.6rem' }} onClick={() => setGameType('memory')}>
              🧠 Memory Flash
            </button>
            <button className="btn" onClick={() => navigate('/dashboard')}>🔙 Back</button>
          </div>
        )}
      </div>
    );
  }

  const shuffled = [...allChars].sort(() => Math.random() - 0.5).slice(0, 8);

  return (
    <div style={{ padding: 20 }}>
      {gameType === 'match'  && <MatchGame  chars={shuffled} onComplete={handleComplete} />}
      {gameType === 'emoji'  && <EmojiGame  chars={shuffled} onComplete={handleComplete} />}
      {gameType === 'memory' && <MemoryGame chars={shuffled} onComplete={handleComplete} />}
      <div style={{ textAlign: 'center', marginTop: 16 }}>
        <button className="btn" onClick={() => { setGameType(null); setGameOver(null); }}>🔙 Change Game</button>
      </div>
    </div>
  );
};

export default MiniGame;
