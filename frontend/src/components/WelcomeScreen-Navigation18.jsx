import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { useAuth } from '../context/AuthContext';
import AnimatedBackground from './AnimatedBackground';

const WelcomeScreen = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const titleRef = useRef(null);
  const subtitleRef = useRef(null);
  const mascotRef = useRef(null);
  const buttonsRef = useRef(null);

  useEffect(() => {
    // Play greeting sound/voice instruction
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      const intro = new SpeechSynthesisUtterance("Welcome to Write Speak A I! Let's write in the air together!");
      intro.rate = 0.9;
      intro.pitch = 1.2;
      window.speechSynthesis.speak(intro);
    }

    const tl = gsap.timeline();
    // Bounce title in
    tl.fromTo(titleRef.current, 
      { y: -100, opacity: 0, scale: 0.5 },
      { y: 0, opacity: 1, scale: 1, duration: 1.2, ease: "bounce.out" }
    );
    // Slide subtitle in
    tl.fromTo(subtitleRef.current,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" },
      "-=0.4"
    );
    // Bounce mascot
    tl.fromTo(mascotRef.current,
      { scale: 0, rotation: -45 },
      { scale: 1, rotation: 0, duration: 0.8, ease: "back.out(1.7)" },
      "-=0.3"
    );
    // Slide buttons
    tl.fromTo(buttonsRef.current,
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" },
      "-=0.2"
    );

    // Floating loop for Doraemon
    gsap.to(mascotRef.current, {
      y: -15,
      duration: 2,
      yoyo: true,
      repeat: -1,
      ease: "sine.inOut"
    });
  }, []);

  const handleStart = () => {
    if (user) {
      navigate('/mode-selection');
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="relative w-screen h-screen flex flex-col items-center justify-center overflow-hidden font-nunito select-none">
      <AnimatedBackground />

      <div className="z-10 flex flex-col items-center max-w-2xl px-6 text-center">
        {/* Title */}
        <h1 
          ref={titleRef} 
          className="text-6xl md:text-8xl font-black text-doraBlue tracking-wider drop-shadow-[0_6px_0_#FFF] mb-2"
        >
          WriteSpeak <span className="text-primary drop-shadow-[0_6px_0_#FFF]">AI</span>
        </h1>
        
        {/* Subtitle */}
        <p 
          ref={subtitleRef} 
          className="text-xl md:text-2xl font-bold text-slate-700 bg-white/70 backdrop-blur-sm px-6 py-2 rounded-full border-2 border-white inline-block mb-10 shadow-sm"
        >
          ✍️ Kid's Air Writing Adventure! 🌟
        </p>

        {/* Mascot - Animated Doraemon SVG */}
        <div 
          ref={mascotRef} 
          className="w-64 h-64 md:w-80 md:h-80 mb-10 cursor-pointer transition-transform hover:scale-105 active:scale-95 filter drop-shadow-lg"
          onClick={() => {
            if (window.speechSynthesis) {
              const cheer = new SpeechSynthesisUtterance("Hi there! I am Doraemon, your air writing companion! Tap the start button to begin!");
              cheer.rate = 0.95;
              cheer.pitch = 1.3;
              window.speechSynthesis.speak(cheer);
            }
          }}
        >
          <svg viewBox="0 0 200 200" className="w-full h-full">
            {/* Doraemon Face/Head */}
            <circle cx="100" cy="100" r="70" fill="#00A5DC" stroke="#1E293B" strokeWidth="4" />
            <circle cx="100" cy="108" r="56" fill="#FFF" stroke="#1E293B" strokeWidth="3" />
            
            {/* Eyes */}
            <ellipse cx="85" cy="62" rx="14" ry="18" fill="#FFF" stroke="#1E293B" strokeWidth="3" />
            <ellipse cx="115" cy="62" rx="14" ry="18" fill="#FFF" stroke="#1E293B" strokeWidth="3" />
            
            {/* Pupil */}
            <circle cx="90" cy="62" r="4.5" fill="#000" />
            <circle cx="90" cy="60" r="1.5" fill="#FFF" />
            <circle cx="110" cy="62" r="4.5" fill="#000" />
            <circle cx="110" cy="60" r="1.5" fill="#FFF" />

            {/* Nose */}
            <circle cx="100" cy="80" r="9" fill="#FF2E93" stroke="#1E293B" strokeWidth="3" />
            <circle cx="97" cy="77" r="3" fill="#FFF" /> {/* highlight */}

            {/* Nose-Mouth Bridge */}
            <line x1="100" y1="89" x2="100" y2="128" stroke="#1E293B" strokeWidth="3" />

            {/* Mouth */}
            <path d="M 64 106 Q 100 148 136 106" fill="none" stroke="#1E293B" strokeWidth="3" strokeLinecap="round" />

            {/* Whiskers */}
            <line x1="60" y1="88" x2="36" y2="84" stroke="#1E293B" strokeWidth="3" strokeLinecap="round" />
            <line x1="60" y1="99" x2="32" y2="99" stroke="#1E293B" strokeWidth="3" strokeLinecap="round" />
            <line x1="60" y1="110" x2="36" y2="114" stroke="#1E293B" strokeWidth="3" strokeLinecap="round" />
            
            <line x1="140" y1="88" x2="164" y2="84" stroke="#1E293B" strokeWidth="3" strokeLinecap="round" />
            <line x1="140" y1="99" x2="168" y2="99" stroke="#1E293B" strokeWidth="3" strokeLinecap="round" />
            <line x1="140" y1="110" x2="164" y2="114" stroke="#1E293B" strokeWidth="3" strokeLinecap="round" />

            {/* Collar & Bell */}
            <path d="M 60 160 Q 100 178 140 160" fill="none" stroke="#E63946" strokeWidth="10" strokeLinecap="round" />
            <circle cx="100" cy="172" r="12" fill="#FFD166" stroke="#1E293B" strokeWidth="3" />
            <circle cx="100" cy="168" r="3" fill="#1E293B" />
            <line x1="100" y1="171" x2="100" y2="183" stroke="#1E293B" strokeWidth="3" />
          </svg>
        </div>

        {/* Buttons Panel */}
        <div ref={buttonsRef} className="flex flex-col sm:flex-row gap-4 items-center justify-center">
          <button 
            id="btn-start"
            onClick={handleStart}
            className="btn-dora bg-primary hover:bg-rose-400 w-64 text-center font-black"
          >
            🚀 START ADVENTURE
          </button>
          
          {!user && (
            <button 
              id="btn-login-shortcut"
              onClick={() => navigate('/login')}
              className="btn-dora bg-doraBlue hover:bg-sky-400 w-64 text-center font-black"
            >
              🔑 LOG IN
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default WelcomeScreen;
