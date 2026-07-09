import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Copyright from './Copyright';
import { authApi } from '../utils/api';

/* ─── Floating Star Particle ─────────────────────────────────── */
const Star = ({ style }) => (
  <div className="absolute rounded-full bg-white" style={style} />
);

/* ─── Royal Doraemon SVG (full body, detailed) ───────────────── */
const DoraemonFull = () => (
  <svg viewBox="0 0 260 340" className="w-full h-full drop-shadow-2xl" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="bodyGrad" cx="40%" cy="35%">
        <stop offset="0%" stopColor="#1EC8F5" />
        <stop offset="100%" stopColor="#0085C3" />
      </radialGradient>
      <radialGradient id="faceGrad" cx="40%" cy="30%">
        <stop offset="0%" stopColor="#FFFFFF" />
        <stop offset="100%" stopColor="#F0F0F0" />
      </radialGradient>
      <radialGradient id="noseGrad" cx="35%" cy="35%">
        <stop offset="0%" stopColor="#FF6B9D" />
        <stop offset="100%" stopColor="#E8003D" />
      </radialGradient>
      <radialGradient id="bellGrad" cx="35%" cy="30%">
        <stop offset="0%" stopColor="#FFE066" />
        <stop offset="100%" stopColor="#F4A700" />
      </radialGradient>
      <filter id="glow">
        <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
        <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>
    </defs>

    {/* ── Body ── */}
    <ellipse cx="130" cy="260" rx="70" ry="65" fill="url(#bodyGrad)" stroke="#005A8E" strokeWidth="3"/>

    {/* ── Arms ── */}
    <ellipse cx="48" cy="220" rx="28" ry="18" fill="url(#bodyGrad)" stroke="#005A8E" strokeWidth="2.5" transform="rotate(-30 48 220)"/>
    <circle cx="30" cy="232" r="16" fill="url(#faceGrad)" stroke="#005A8E" strokeWidth="2"/>
    <ellipse cx="212" cy="220" rx="28" ry="18" fill="url(#bodyGrad)" stroke="#005A8E" strokeWidth="2.5" transform="rotate(30 212 220)"/>
    <circle cx="230" cy="232" r="16" fill="url(#faceGrad)" stroke="#005A8E" strokeWidth="2"/>

    {/* ── Legs ── */}
    <ellipse cx="100" cy="316" rx="28" ry="18" fill="url(#bodyGrad)" stroke="#005A8E" strokeWidth="2.5"/>
    <ellipse cx="100" cy="328" rx="30" ry="12" fill="url(#faceGrad)" stroke="#005A8E" strokeWidth="2"/>
    <ellipse cx="160" cy="316" rx="28" ry="18" fill="url(#bodyGrad)" stroke="#005A8E" strokeWidth="2.5"/>
    <ellipse cx="160" cy="328" rx="30" ry="12" fill="url(#faceGrad)" stroke="#005A8E" strokeWidth="2"/>

    {/* ── Head ── */}
    <circle cx="130" cy="110" r="90" fill="url(#bodyGrad)" stroke="#005A8E" strokeWidth="3.5"/>

    {/* ── Face white area ── */}
    <ellipse cx="130" cy="130" rx="68" ry="60" fill="url(#faceGrad)" stroke="#005A8E" strokeWidth="2.5"/>

    {/* ── Eyes ── */}
    <ellipse cx="105" cy="82" rx="18" ry="22" fill="white" stroke="#1E293B" strokeWidth="3"/>
    <ellipse cx="155" cy="82" rx="18" ry="22" fill="white" stroke="#1E293B" strokeWidth="3"/>
    {/* Pupils */}
    <circle cx="109" cy="85" r="8" fill="#1E293B"/>
    <circle cx="159" cy="85" r="8" fill="#1E293B"/>
    {/* Eye shine */}
    <circle cx="106" cy="81" r="3" fill="white"/>
    <circle cx="156" cy="81" r="3" fill="white"/>

    {/* ── Nose ── */}
    <circle cx="130" cy="105" r="13" fill="url(#noseGrad)" stroke="#A00025" strokeWidth="2" filter="url(#glow)"/>
    <circle cx="125" cy="101" r="4" fill="rgba(255,255,255,0.6)"/>

    {/* ── Philtrum (nose-mouth line) ── */}
    <line x1="130" y1="118" x2="130" y2="148" stroke="#1E293B" strokeWidth="2.5" strokeLinecap="round"/>

    {/* ── Mouth ── */}
    <path d="M 88 138 Q 130 178 172 138" fill="none" stroke="#1E293B" strokeWidth="3" strokeLinecap="round"/>

    {/* ── Whiskers ── */}
    <line x1="78" y1="112" x2="44" y2="106" stroke="#555" strokeWidth="2.5" strokeLinecap="round"/>
    <line x1="78" y1="122" x2="40" y2="122" stroke="#555" strokeWidth="2.5" strokeLinecap="round"/>
    <line x1="78" y1="132" x2="44" y2="138" stroke="#555" strokeWidth="2.5" strokeLinecap="round"/>
    <line x1="182" y1="112" x2="216" y2="106" stroke="#555" strokeWidth="2.5" strokeLinecap="round"/>
    <line x1="182" y1="122" x2="220" y2="122" stroke="#555" strokeWidth="2.5" strokeLinecap="round"/>
    <line x1="182" y1="132" x2="216" y2="138" stroke="#555" strokeWidth="2.5" strokeLinecap="round"/>

    {/* ── Collar ── */}
    <path d="M 68 188 Q 130 210 192 188" fill="none" stroke="#E8003D" strokeWidth="14" strokeLinecap="round"/>

    {/* ── Golden Bell ── */}
    <circle cx="130" cy="206" r="18" fill="url(#bellGrad)" stroke="#B8860B" strokeWidth="2.5" filter="url(#glow)"/>
    <circle cx="125" cy="200" r="5" fill="rgba(255,255,255,0.7)"/>
    <circle cx="130" cy="206" r="4" fill="#8B6914"/>
    <line x1="130" y1="210" x2="130" y2="224" stroke="#8B6914" strokeWidth="2.5" strokeLinecap="round"/>

    {/* ── Pocket ── */}
    <path d="M 98 248 Q 130 270 162 248" fill="none" stroke="#005A8E" strokeWidth="2.5" strokeLinecap="round"/>
    <path d="M 98 248 Q 98 278 130 278 Q 162 278 162 248" fill="rgba(0,80,140,0.2)" stroke="#005A8E" strokeWidth="2"/>
  </svg>
);

/* ─── Stars data ─────────────────────────────────────────────── */
const STARS = Array.from({ length: 80 }, (_, i) => ({
  id: i,
  width: Math.random() * 3 + 1,
  top: Math.random() * 100,
  left: Math.random() * 100,
  opacity: Math.random() * 0.7 + 0.2,
  animDuration: Math.random() * 3 + 2,
  animDelay: Math.random() * 4,
}));

/* ─── Shooting Stars ─────────────────────────────────────────── */
const SHOOTS = [
  { top: '15%', left: '10%', delay: '0s',   dur: '2.5s' },
  { top: '30%', left: '60%', delay: '3s',   dur: '2s'   },
  { top: '8%',  left: '80%', delay: '5.5s', dur: '2.2s' },
];

/* ════════════════════════════════════════════════════════════════
   COMPONENT
════════════════════════════════════════════════════════════════ */
const WelcomeScreen = () => {
  const navigate = useNavigate();
  const { user, login } = useAuth();
  const [isGuestLoading, setIsGuestLoading] = useState(false);
  const [showContent, setShowContent] = useState(false);
  const doraRef = useRef(null);

  useEffect(() => {
    setTimeout(() => setShowContent(true), 100);

    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance("Welcome to WriteSpeak AI! Let's write in the air together!");
      u.rate = 0.9; u.pitch = 1.2;
      window.speechSynthesis.speak(u);
    }
  }, []);

  const handleGuestLogin = async () => {
    setIsGuestLoading(true);
    try {
      const data = await authApi.login('guest', 'guestpassword123');
      login({ username: data.username, name: data.name, gender: data.gender, age: data.age }, data.token);
      navigate('/mode-selection');
    } catch {
      try {
        await authApi.register('guest', 'guestpassword123', 'Guest Explorer', 'other', 6);
        const data = await authApi.login('guest', 'guestpassword123');
        login({ username: data.username, name: data.name, gender: data.gender, age: data.age }, data.token);
        navigate('/mode-selection');
      } catch {
        alert('Guest mode unavailable. Please create an account!');
      }
    } finally {
      setIsGuestLoading(false);
    }
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden select-none"
      style={{ background: 'linear-gradient(135deg, #0a0e2e 0%, #0d1b4b 40%, #0a2060 70%, #061830 100%)' }}>

      {/* ── CSS animations ── */}
      <style>{`
        @keyframes twinkle {
          0%,100% { opacity: 0.2; transform: scale(1); }
          50%      { opacity: 1;   transform: scale(1.4); }
        }
        @keyframes floatDora {
          0%,100% { transform: translateY(0px) rotate(-1deg); }
          50%      { transform: translateY(-20px) rotate(1deg); }
        }
        @keyframes shoot {
          0%   { transform: translateX(0) translateY(0) rotate(-30deg); opacity: 1; width: 0; }
          70%  { opacity: 1; width: 120px; }
          100% { transform: translateX(250px) translateY(80px) rotate(-30deg); opacity: 0; width: 0; }
        }
        @keyframes glow-pulse {
          0%,100% { box-shadow: 0 0 20px rgba(0,165,220,0.4), 0 0 60px rgba(0,165,220,0.1); }
          50%      { box-shadow: 0 0 40px rgba(0,165,220,0.8), 0 0 100px rgba(0,165,220,0.3); }
        }
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(30px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes shimmer {
          0%   { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        .dora-float { animation: floatDora 3.5s ease-in-out infinite; }
        .glow-ring   { animation: glow-pulse 2.5s ease-in-out infinite; }
        .fade-up     { animation: fadeSlideUp 0.7s ease forwards; }
        .shimmer-text {
          background: linear-gradient(90deg, #FFD700 0%, #FFF 40%, #FFD700 60%, #FFF9C4 100%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmer 3s linear infinite;
        }
      `}</style>

      {/* ── Stars background ── */}
      {STARS.map(s => (
        <Star key={s.id} style={{
          width: s.width, height: s.width,
          top: `${s.top}%`, left: `${s.left}%`,
          opacity: s.opacity,
          animation: `twinkle ${s.animDuration}s ${s.animDelay}s ease-in-out infinite`,
        }} />
      ))}

      {/* ── Shooting stars ── */}
      {SHOOTS.map((s, i) => (
        <div key={i} className="absolute rounded-full"
          style={{
            top: s.top, left: s.left,
            height: '2px', width: '0',
            background: 'linear-gradient(90deg, transparent, white)',
            animation: `shoot ${s.dur} ${s.delay} ease-in-out infinite`,
          }} />
      ))}

      {/* ── Big glowing Doraemon blue orb behind ── */}
      <div className="absolute rounded-full pointer-events-none"
        style={{
          width: 600, height: 600,
          top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'radial-gradient(circle, rgba(0,165,220,0.12) 0%, transparent 70%)',
          filter: 'blur(40px)',
        }} />

      {/* ── MAIN LAYOUT ── */}
      <div className="relative z-10 w-full h-full flex items-center justify-center px-6">
        <div className="flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-16 max-w-6xl w-full">

          {/* LEFT: Doraemon ──────────────────────────────────────── */}
          <div className={`flex flex-col items-center transition-all duration-1000 ${showContent ? 'opacity-100' : 'opacity-0'}`}
            style={{ animationDelay: '0.2s' }}>

            {/* Glow ring platform */}
            <div className="glow-ring rounded-full flex items-end justify-center"
              style={{
                width: 280, height: 280,
                background: 'radial-gradient(ellipse, rgba(0,165,220,0.15) 0%, transparent 70%)',
                border: '1px solid rgba(0,165,220,0.3)',
              }}>
              <div
                ref={doraRef}
                className="dora-float cursor-pointer"
                style={{ width: 220, height: 290, marginBottom: -10 }}
                onClick={() => {
                  if (window.speechSynthesis) {
                    const u = new SpeechSynthesisUtterance("Hi! I am Doraemon! Tap start to begin writing adventure!");
                    u.rate = 0.9; u.pitch = 1.4;
                    window.speechSynthesis.speak(u);
                  }
                }}
              >
                <DoraemonFull />
              </div>
            </div>

            {/* "Click me" hint */}
            <p className="mt-3 text-blue-300/60 text-xs font-bold tracking-widest uppercase animate-pulse">
              ✨ Tap Doraemon to say hi!
            </p>
          </div>

          {/* RIGHT: Title + Buttons ───────────────────────────────── */}
          <div className="flex flex-col items-center lg:items-start gap-6 text-center lg:text-left max-w-lg">

            {/* Badge */}
            <div className={`fade-up px-4 py-1.5 rounded-full border text-xs font-black tracking-widest uppercase ${showContent ? '' : 'opacity-0'}`}
              style={{
                animationDelay: '0.3s',
                background: 'rgba(0,165,220,0.15)',
                border: '1px solid rgba(0,165,220,0.5)',
                color: '#7DD3F7',
              }}>
              🌟 Kids Air Writing Adventure
            </div>

            {/* Title */}
            <div className={`fade-up ${showContent ? '' : 'opacity-0'}`} style={{ animationDelay: '0.5s' }}>
              <h1 className="font-black leading-none" style={{ fontSize: 'clamp(3rem, 6vw, 5.5rem)' }}>
                <span className="shimmer-text">Write</span>
                <span className="shimmer-text">Speak</span>
                <br />
                <span style={{ color: '#00A5DC', textShadow: '0 0 40px rgba(0,165,220,0.8), 0 4px 0 rgba(0,80,140,0.8)' }}>
                  AI
                </span>
                <span className="text-white" style={{ textShadow: '0 4px 0 rgba(0,0,0,0.4)' }}> ✦</span>
              </h1>
              <p className="mt-3 font-semibold" style={{ color: 'rgba(180,220,255,0.7)', fontSize: '1.1rem' }}>
                Draw letters in the air with your hand —<br />
                <span style={{ color: '#FFD700' }}>Powered by AI magic ✨</span>
              </p>
            </div>

            {/* Feature pills */}
            <div className={`fade-up flex flex-wrap gap-2 justify-center lg:justify-start ${showContent ? '' : 'opacity-0'}`}
              style={{ animationDelay: '0.7s' }}>
              {['✋ Hand Gesture', '🔤 A-Z Letters', '🔢 0-9 Numbers', '🎯 Smart OCR'].map(f => (
                <span key={f} className="px-3 py-1 rounded-full text-xs font-bold"
                  style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: '#CBD5E1' }}>
                  {f}
                </span>
              ))}
            </div>

            {/* ── Buttons ── */}
            <div className={`fade-up flex flex-col sm:flex-row lg:flex-col xl:flex-row gap-3 w-full ${showContent ? '' : 'opacity-0'}`}
              style={{ animationDelay: '0.9s' }}>

              {user ? (
                /* Logged in — single CTA */
                <button
                  id="btn-start"
                  onClick={() => navigate('/mode-selection')}
                  className="relative overflow-hidden font-black text-white rounded-2xl px-8 py-4 text-lg transition-all duration-200 active:scale-95 cursor-pointer"
                  style={{
                    background: 'linear-gradient(135deg, #00A5DC, #0072B3)',
                    boxShadow: '0 8px 32px rgba(0,165,220,0.5), 0 2px 0 rgba(0,60,120,0.8)',
                    border: '1px solid rgba(255,255,255,0.2)',
                  }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  <span className="relative z-10">🚀 Start Adventure</span>
                  <div className="absolute inset-0 bg-white opacity-0 hover:opacity-10 transition-opacity" />
                </button>
              ) : (
                <>
                  {/* Primary: Create account */}
                  <button
                    id="btn-signup"
                    onClick={() => navigate('/signup')}
                    disabled={isGuestLoading}
                    className="relative font-black text-white rounded-2xl px-7 py-4 text-base transition-all duration-200 active:scale-95 cursor-pointer flex-1"
                    style={{
                      background: 'linear-gradient(135deg, #FF4E8E, #C70053)',
                      boxShadow: '0 8px 32px rgba(255,78,142,0.45), 0 2px 0 rgba(120,0,50,0.8)',
                      border: '1px solid rgba(255,255,255,0.2)',
                    }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                  >
                    🎒 Create Account
                  </button>

                  {/* Secondary: Login */}
                  <button
                    id="btn-login-shortcut"
                    onClick={() => navigate('/login')}
                    disabled={isGuestLoading}
                    className="relative font-black text-white rounded-2xl px-7 py-4 text-base transition-all duration-200 active:scale-95 cursor-pointer flex-1"
                    style={{
                      background: 'linear-gradient(135deg, #00A5DC, #0072B3)',
                      boxShadow: '0 8px 32px rgba(0,165,220,0.4), 0 2px 0 rgba(0,50,100,0.8)',
                      border: '1px solid rgba(255,255,255,0.2)',
                    }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                  >
                    🔑 Log In
                  </button>

                  {/* Ghost: Guest */}
                  <button
                    id="btn-guest"
                    onClick={handleGuestLogin}
                    disabled={isGuestLoading}
                    className="font-bold text-blue-300 rounded-2xl px-6 py-3 text-sm transition-all duration-200 active:scale-95 cursor-pointer w-full sm:w-auto"
                    style={{
                      background: 'rgba(255,255,255,0.06)',
                      border: '1px solid rgba(255,255,255,0.15)',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.12)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }}
                  >
                    {isGuestLoading ? '⏳ Entering...' : '👤 Play as Guest'}
                  </button>
                </>
              )}
            </div>

            {/* Welcome back message if logged in */}
            {user && (
              <p className="text-blue-200/60 text-sm font-semibold">
                Welcome back, <span className="text-yellow-400 font-black">{user.name || user.username}</span>! 👋
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ── Bottom decorative bar ── */}
      <div className="absolute bottom-0 left-0 right-0 h-1"
        style={{ background: 'linear-gradient(90deg, transparent, #00A5DC, #FF4E8E, #FFD700, #00A5DC, transparent)' }} />

      <Copyright variant="dark" position="bottom-center" />
    </div>
  );
};

export default WelcomeScreen;
