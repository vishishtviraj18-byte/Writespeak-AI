import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

const CartoonMascot = ({ message, emoji = "🦉" }) => {
  const mascotRef = useRef(null);

  useEffect(() => {
    // Floating loop animation
    gsap.to(mascotRef.current, {
      y: -10,
      duration: 1.5,
      yoyo: true,
      repeat: -1,
      ease: "sine.inOut"
    });

    // Voice instructions (Web Speech API)
    if (message && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(message);
      utterance.rate = 0.9;
      utterance.pitch = 1.25; // Sightly higher pitch for child-friendly feedback
      window.speechSynthesis.speak(utterance);
    }
  }, [message]);

  return (
    <div 
      ref={mascotRef}
      className="absolute -top-12 left-1/2 -translate-x-1/2 text-7xl select-none filter drop-shadow-md z-30"
    >
      {emoji}
    </div>
  );
};

export default CartoonMascot;
