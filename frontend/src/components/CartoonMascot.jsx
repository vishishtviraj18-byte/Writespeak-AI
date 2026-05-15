import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

const CartoonMascot = ({ message, emoji = "🦉" }) => {
  const mascotRef = useRef(null);

  useEffect(() => {
    // Gentle floating animation
    gsap.to(mascotRef.current, {
      y: -10,
      duration: 1.5,
      yoyo: true,
      repeat: -1,
      ease: "sine.inOut"
    });

    // Speak the message when it changes
    if (message && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(message);
      utterance.rate = 0.9;
      utterance.pitch = 1.2; // Higher pitch for kids
      window.speechSynthesis.speak(utterance);
    }
  }, [message]);

  return (
    <div className="mascot" ref={mascotRef}>
      {emoji}
    </div>
  );
};

export default CartoonMascot;
