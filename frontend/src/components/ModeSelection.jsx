import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import CartoonMascot from './CartoonMascot';

const ModeSelection = () => {
  const navigate = useNavigate();
  const buttonsRef = useRef([]);

  useEffect(() => {
    gsap.fromTo(buttonsRef.current, 
      { y: 50, opacity: 0 }, 
      { y: 0, opacity: 1, duration: 0.5, stagger: 0.2, ease: 'back.out(1.7)' }
    );
  }, []);

  const addToRefs = (el) => {
    if (el && !buttonsRef.current.includes(el)) {
      buttonsRef.current.push(el);
    }
  };

  return (
    <div className="card" style={{ marginTop: '80px' }}>
      <CartoonMascot message="What do you want to learn today?" emoji="🤔" />
      <h2>What do you want to learn today?</h2>
      <div style={{ display: 'flex', flexDirection: 'column', marginTop: '30px' }}>
        <button ref={addToRefs} className="btn" style={{ backgroundColor: '#FF9F43' }} onClick={() => navigate('/learn/alphabets')}>
          🅰️ Alphabets (A-Z)
        </button>
        <button ref={addToRefs} className="btn" style={{ backgroundColor: '#48dbfb' }} onClick={() => navigate('/learn/numbers')}>
          🔢 Numbers (0-9)
        </button>
        <button ref={addToRefs} className="btn btn-primary" onClick={() => navigate('/test')}>
          🧪 Test Mode
        </button>
        <button ref={addToRefs} className="btn btn-accent" onClick={() => navigate('/game')}>
          🎮 Mini Games
        </button>
        <button ref={addToRefs} className="btn" style={{ backgroundColor: '#a29bfe' }} onClick={() => navigate('/dashboard')}>
          📊 My Progress
        </button>
      </div>
    </div>
  );
};

export default ModeSelection;
