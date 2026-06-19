import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import gsap from 'gsap';

const RewardPopup = ({ isMatch, message, onNext, reward }) => {
  useEffect(() => {
    if (isMatch) {
      confetti({
        particleCount: 200,
        spread: 90,
        origin: { y: 0.6 },
        colors: ['#FF5E7E', '#38E4B7', '#FFD166', '#00A5DC']
      });
      gsap.fromTo('.emoji-reward',
        { y: -50, scale: 0.5, opacity: 0 },
        { y: 0, scale: 1, opacity: 1, duration: 1, ease: 'bounce.out', delay: 0.2 }
      );
    }

    gsap.fromTo('.reward-popup-card', 
      { scale: 0, rotation: -180 }, 
      { scale: 1, rotation: 0, duration: 0.8, ease: 'elastic.out(1, 0.4)' }
    );
  }, [isMatch]);

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
      <div className="reward-popup-card glass-panel max-w-sm w-full text-center flex flex-col items-center gap-4 border-accent">
        <h2 className="text-4xl font-black text-primary">
          {isMatch ? '🌟 Awesome! 🌟' : 'Oops!'}
        </h2>
        
        {isMatch && reward && (
           <div className="emoji-reward text-8xl drop-shadow-lg filter my-2">
             {reward.emoji}
           </div>
        )}
        
        <p className="text-2xl font-extrabold text-slate-700">
          {isMatch ? message || reward?.name : message}
        </p>
        
        <button 
          className="btn-dora bg-primary text-xl px-12 py-3 mt-4" 
          onClick={onNext}
        >
          {isMatch ? 'Next ➡️' : 'Try Again 🔄'}
        </button>
      </div>
    </div>
  );
};

export default RewardPopup;
