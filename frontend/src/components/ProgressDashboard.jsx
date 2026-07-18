import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import confetti from 'canvas-confetti';
import { useProgress } from '../hooks/useProgress';

const ProgressDashboard = () => {
  const navigate = useNavigate();
  const { progress, level, badges } = useProgress();
  const containerRef = React.useRef(null);

  useEffect(() => {
    gsap.fromTo(containerRef.current,
      { y: 40, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.6, ease: 'back.out(1.7)' }
    );
    if (progress.stars > 0) {
      confetti({ particleCount: 60, spread: 50, origin: { y: 0.5 }, colors: ['#FF5E7E', '#38E4B7', '#FFD166'] });
    }
  }, []);

  const alphabetPct = Math.round((progress.alphabetsDone.length / 26) * 100);
  const numberPct = Math.round((progress.numbersDone.length / 10) * 100);

  return (
    <div ref={containerRef} style={{ width: '100%', maxWidth: 720, margin: '0 auto', padding: 20 }}>
      <h1>📊 Your Progress</h1>

      {/* Stats Row */}
      <div className="dashboard" style={{ marginBottom: 24 }}>
        <div className="stat-box">⭐ Stars<br /><big>{progress.stars}</big></div>
        <div className="stat-box" style={{ background: 'var(--primary-color)' }}>🏅 Score<br /><big>{progress.score}</big></div>
        <div className="stat-box" style={{ background: 'var(--secondary-color)' }}>🔥 Streak<br /><big>{progress.streak}</big></div>
        <div className="stat-box" style={{ background: '#a29bfe' }}>🎯 Accuracy<br /><big>{progress.accuracy}%</big></div>
        <div className="stat-box" style={{ background: '#fd79a8' }}>📈 Level<br /><big>{level}</big></div>
      </div>

      {/* Progress bars */}
      <div className="card" style={{ marginBottom: 16 }}>
        <h3>🔤 Alphabets — {progress.alphabetsDone.length}/26</h3>
        <div style={{ background: '#f0f0f0', borderRadius: 10, height: 20, overflow: 'hidden', marginBottom: 8 }}>
          <div style={{
            height: '100%', borderRadius: 10,
            background: 'linear-gradient(90deg, #FF5E7E, #FFD166)',
            width: `${alphabetPct}%`, transition: 'width 0.5s ease'
          }} />
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
          {'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map(c => (
            <span key={c} style={{
              padding: '4px 10px', borderRadius: 8, fontWeight: 'bold', fontSize: '1rem',
              background: progress.alphabetsDone.includes(c) ? 'var(--secondary-color)' : '#e0e0e0',
              color: progress.alphabetsDone.includes(c) ? 'white' : '#999',
              transition: 'all 0.3s'
            }}>{c}</span>
          ))}
        </div>
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <h3>🔢 Numbers — {progress.numbersDone.length}/10</h3>
        <div style={{ background: '#f0f0f0', borderRadius: 10, height: 20, overflow: 'hidden', marginBottom: 8 }}>
          <div style={{
            height: '100%', borderRadius: 10,
            background: 'linear-gradient(90deg, #38E4B7, #a29bfe)',
            width: `${numberPct}%`, transition: 'width 0.5s ease'
          }} />
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
          {'1234567890'.split('').map(c => (
            <span key={c} style={{
              padding: '4px 14px', borderRadius: 8, fontWeight: 'bold', fontSize: '1.2rem',
              background: progress.numbersDone.includes(c) ? 'var(--primary-color)' : '#e0e0e0',
              color: progress.numbersDone.includes(c) ? 'white' : '#999',
              transition: 'all 0.3s'
            }}>{c}</span>
          ))}
        </div>
      </div>

      {/* Badges */}
      {badges.length > 0 && (
        <div className="card" style={{ marginBottom: 16 }}>
          <h3>🏅 Badges Earned</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center' }}>
            {badges.map((b, i) => (
              <div key={i} style={{
                background: 'var(--accent-color)', padding: '10px 16px', borderRadius: 16,
                fontWeight: 'bold', fontSize: '1.2rem', border: '3px solid white',
                boxShadow: '0 4px 0 rgba(0,0,0,0.1)'
              }}>
                {b.emoji} {b.label}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Navigation */}
      <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
        <button className="btn" onClick={() => navigate('/select')}>📚 Keep Learning</button>
        {(progress.alphabetsDone.length >= 3 || progress.numbersDone.length >= 3) && (
          <button className="btn btn-primary" onClick={() => navigate('/test')}>🧪 Take a Test</button>
        )}
        {(progress.alphabetsDone.length >= 5 || progress.numbersDone.length >= 5) && (
          <button className="btn btn-accent" onClick={() => navigate('/game')}>🎮 Mini Game</button>
        )}
      </div>
    </div>
  );
};

export default ProgressDashboard;
