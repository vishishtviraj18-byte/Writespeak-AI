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
        colors: ['#FF5E7E', '#38E4B7', '#FFD166']
      });
      // Bounce the emoji
      gsap.fromTo('.emoji-reward',
        { y: -50, scale: 0.5, opacity: 0 },
        { y: 0, scale: 1, opacity: 1, duration: 1, ease: 'bounce.out', delay: 0.2 }
      );
    }

    gsap.fromTo('.reward-popup', 
      { scale: 0, rotation: -180 }, 
      { scale: 1, rotation: 0, duration: 0.8, ease: 'elastic.out(1, 0.4)' }
    );
  }, [isMatch]);

  return (
    <>
      <div className="overlay" />
      <div className="reward-popup">
        <h2>{isMatch ? '🌟 Awesome! 🌟' : 'Oops!'}</h2>
        
        {isMatch && reward && (
           <div className="emoji-reward">{reward.emoji}</div>
        )}
        
        <p style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>
          {isMatch ? message || reward?.name : message}
        </p>
        
        <button className="btn btn-primary" onClick={onNext} style={{ marginTop: '20px' }}>
          {isMatch ? 'Next ➡️' : 'Try Again 🔄'}
        </button>
      </div>
    </>
  );
};

export default RewardPopup;
