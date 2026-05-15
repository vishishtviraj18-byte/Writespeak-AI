import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import './WelcomeScreen.css';

const WelcomeScreen = () => {
  const navigate = useNavigate();
  const doraRef   = useRef(null);
  const titleRef  = useRef(null);
  const cloudRef1 = useRef(null);
  const cloudRef2 = useRef(null);
  const btnRef    = useRef(null);
  const starsRef  = useRef(null);

  useEffect(() => {
    // Doraemon entrance
    gsap.fromTo(doraRef.current,
      { y: 200, opacity: 0, scale: 0.5 },
      { y: 0, opacity: 1, scale: 1, duration: 1.2, ease: 'elastic.out(1, 0.4)', delay: 0.2 }
    );

    // Floating loop
    gsap.to(doraRef.current, {
      y: -18, duration: 1.8, yoyo: true, repeat: -1, ease: 'sine.inOut', delay: 1.4
    });

    // Title letter-by-letter
    gsap.fromTo(titleRef.current,
      { y: -60, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, ease: 'back.out(2)', delay: 0.6 }
    );

    // Clouds drifting in
    gsap.fromTo(cloudRef1.current,
      { x: -300, opacity: 0 },
      { x: 0, opacity: 1, duration: 1.5, ease: 'power2.out', delay: 0.1 }
    );
    gsap.fromTo(cloudRef2.current,
      { x: 300, opacity: 0 },
      { x: 0, opacity: 1, duration: 1.5, ease: 'power2.out', delay: 0.1 }
    );

    // Button pop-in
    gsap.fromTo(btnRef.current,
      { scale: 0, opacity: 0 },
      { scale: 1, opacity: 1, duration: 0.7, ease: 'elastic.out(1, 0.5)', delay: 1.2 }
    );

    // Stars twinkling
    gsap.to('.ws-star', {
      opacity: 0.2, scale: 0.6, duration: 0.8, stagger: 0.15, yoyo: true, repeat: -1, ease: 'sine.inOut'
    });
  }, []);

  const handleStart = () => {
    gsap.to([doraRef.current, titleRef.current, btnRef.current], {
      y: -30, opacity: 0, duration: 0.4, ease: 'power2.in',
      onComplete: () => navigate('/select')
    });
  };

  return (
    <div className="ws-root">

      {/* Animated sky gradient background */}
      <div className="ws-sky" />

      {/* Stars scattered */}
      <div ref={starsRef} className="ws-stars">
        {[...Array(18)].map((_, i) => (
          <div key={i} className="ws-star" style={{
            left: `${Math.random() * 100}%`,
            top:  `${Math.random() * 60}%`,
            width: `${Math.random() * 12 + 6}px`,
            height: `${Math.random() * 12 + 6}px`,
            animationDelay: `${Math.random() * 2}s`
          }} />
        ))}
      </div>

      {/* Ground */}
      <div className="ws-ground" />

      {/* Clouds */}
      <div ref={cloudRef1} className="ws-cloud ws-cloud-left" />
      <div ref={cloudRef2} className="ws-cloud ws-cloud-right" />

      {/* Title */}
      <div ref={titleRef} className="ws-title-block">
        <div className="ws-subtitle">✨ Welcome to ✨</div>
        <div className="ws-title">WriteSpeak AI</div>
        <div className="ws-tagline">🖊️ Write in the Air, Learn with Fun!</div>
      </div>

      {/* Doraemon SVG character */}
      <div ref={doraRef} className="ws-doraemon">
        {/* SVG Doraemon illustration */}
        <svg viewBox="0 0 220 280" xmlns="http://www.w3.org/2000/svg" className="ws-dora-svg">
          {/* Body */}
          <ellipse cx="110" cy="190" rx="80" ry="75" fill="#00A5DC" />
          {/* Belly */}
          <ellipse cx="110" cy="200" rx="55" ry="50" fill="white" />
          {/* Pocket */}
          <ellipse cx="110" cy="220" rx="38" ry="12" fill="none" stroke="#00A5DC" strokeWidth="3" />
          <path d="M72 220 Q110 230 148 220" fill="none" stroke="#00A5DC" strokeWidth="3" />
          {/* Head */}
          <circle cx="110" cy="95" r="80" fill="#00A5DC" />
          {/* Face */}
          <circle cx="110" cy="105" r="60" fill="white" />
          {/* Eyes */}
          <circle cx="88"  cy="85"  r="16" fill="white" />
          <circle cx="132" cy="85"  r="16" fill="white" />
          <circle cx="91"  cy="87"  r="9"  fill="#111" />
          <circle cx="135" cy="87"  r="9"  fill="#111" />
          {/* Eye shine */}
          <circle cx="94"  cy="83"  r="3"  fill="white" />
          <circle cx="138" cy="83"  r="3"  fill="white" />
          {/* Nose */}
          <circle cx="110" cy="107" r="10" fill="#FF4444" />
          {/* Mouth line */}
          <path d="M85 125 Q110 148 135 125" fill="none" stroke="#333" strokeWidth="3" strokeLinecap="round" />
          {/* Whiskers left */}
          <line x1="20"  y1="112" x2="80"  y2="112" stroke="#333" strokeWidth="2" />
          <line x1="15"  y1="123" x2="80"  y2="120" stroke="#333" strokeWidth="2" />
          <line x1="20"  y1="134" x2="80"  y2="129" stroke="#333" strokeWidth="2" />
          {/* Whiskers right */}
          <line x1="140" y1="112" x2="200" y2="112" stroke="#333" strokeWidth="2" />
          <line x1="140" y1="120" x2="205" y2="123" stroke="#333" strokeWidth="2" />
          <line x1="140" y1="129" x2="200" y2="134" stroke="#333" strokeWidth="2" />
          {/* Red collar */}
          <rect x="48" y="155" width="124" height="16" rx="8" fill="#FF0000" />
          {/* Bell */}
          <ellipse cx="110" cy="163" rx="11" ry="11" fill="#FFD700" />
          <ellipse cx="110" cy="163" rx="7"  ry="7"  fill="#FFA500" />
          <circle  cx="110" cy="163" r="2"   fill="#333" />
          {/* Arms */}
          <ellipse cx="28"  cy="205" rx="28" ry="18" fill="#00A5DC" transform="rotate(-20 28 205)" />
          <ellipse cx="192" cy="205" rx="28" ry="18" fill="#00A5DC" transform="rotate(20 192 205)" />
          {/* Hands */}
          <circle cx="15"  cy="218" r="20" fill="white" />
          <circle cx="205" cy="218" r="20" fill="white" />
          {/* Legs */}
          <ellipse cx="80"  cy="268" rx="32" ry="16" fill="#00A5DC" />
          <ellipse cx="140" cy="268" rx="32" ry="16" fill="#00A5DC" />
          {/* Feet */}
          <ellipse cx="80"  cy="276" rx="36" ry="10" fill="white" />
          <ellipse cx="140" cy="276" rx="36" ry="10" fill="white" />
        </svg>

        {/* Speech bubble */}
        <div className="ws-bubble">
          Let's write and learn! 🌟
        </div>
      </div>

      {/* Start Button */}
      <div ref={btnRef} className="ws-btn-wrap">
        <button className="ws-start-btn" onClick={handleStart}>
          🚀 Let's Start!
        </button>
        <div className="ws-hint">👆 Tap to begin the adventure</div>
      </div>

      {/* Floating items */}
      <div className="ws-float-items">
        <span className="ws-fi ws-fi-1">🅰️</span>
        <span className="ws-fi ws-fi-2">🔢</span>
        <span className="ws-fi ws-fi-3">⭐</span>
        <span className="ws-fi ws-fi-4">🎈</span>
        <span className="ws-fi ws-fi-5">🏆</span>
        <span className="ws-fi ws-fi-6">📚</span>
      </div>
    </div>
  );
};

export default WelcomeScreen;
