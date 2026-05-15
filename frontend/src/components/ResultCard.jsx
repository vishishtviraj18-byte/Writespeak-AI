import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { Volume2, RefreshCw } from 'lucide-react';

const ResultCard = ({ result, onClose, onPronounce }) => {
  const cardRef = useRef(null);

  useEffect(() => {
    gsap.fromTo(cardRef.current, 
      { scale: 0.5, opacity: 0, rotation: -10 },
      { scale: 1, opacity: 1, rotation: 0, duration: 0.6, ease: "elastic.out(1, 0.5)" }
    );
  }, []);

  return (
    <div className="modal-overlay">
      <div className="result-card glass" ref={cardRef}>
        <div className="result-category">{result.category}</div>
        <h2 className="result-word">{result.matchedWord}</h2>
        <p className="result-meaning">{result.meaning}</p>
        <p className="result-example">"{result.example}"</p>
        
        <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '20px' }}>
          <button className="btn-primary" onClick={onPronounce} style={{ backgroundColor: '#FF6B6B' }}>
            <Volume2 size={20} /> Pronounce
          </button>
          <button className="btn-primary" onClick={onClose}>
            <RefreshCw size={20} /> Try Again
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResultCard;
