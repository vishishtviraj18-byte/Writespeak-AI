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
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[999] flex items-center justify-center p-4">
      <div 
        ref={cardRef} 
        className="glass-panel max-w-md w-full text-center flex flex-col items-center gap-4"
      >
        <div className="text-sm font-black tracking-widest text-slate-400 uppercase">
          {result.category}
        </div>
        <h2 className="text-6xl font-black text-primary my-1 drop-shadow-md">
          {result.matchedWord}
        </h2>
        <p className="text-xl font-bold text-slate-600">
          {result.meaning}
        </p>
        <p className="text-lg italic text-slate-400 font-bold bg-slate-50 px-4 py-2 rounded-2xl w-full">
          "{result.example}"
        </p>
        
        <div className="flex gap-4 w-full mt-4">
          <button 
            className="btn-dora bg-primary flex-1 flex items-center justify-center gap-2 text-lg py-3"
            onClick={onPronounce}
          >
            <Volume2 size={20} /> Pronounce
          </button>
          <button 
            className="btn-dora bg-secondary flex-1 flex items-center justify-center gap-2 text-lg py-3"
            onClick={onClose}
          >
            <RefreshCw size={20} /> Try Again
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResultCard;
