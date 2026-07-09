import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useProgress } from '../hooks/useProgress';
import SettingsPanel from './SettingsPanel';
import Copyright from './Copyright';
import { BookOpen, GraduationCap, Trophy, Users, LogOut, Settings, Award, Sparkles, Zap, Star } from 'lucide-react';

/* ─── Stars ───────────────────────────────────────────────────── */
const STARS = Array.from({ length: 60 }, (_, i) => ({
  id: i, s: Math.random() * 2.5 + 1,
  t: Math.random() * 100, l: Math.random() * 100,
  o: Math.random() * 0.5 + 0.2,
  d: Math.random() * 3 + 2, dl: Math.random() * 5,
}));

/* ─── Mode Cards ──────────────────────────────────────────────── */
const CARDS = [
  {
    id: 'alphabet',
    emoji: '🔤',
    title: 'Alphabet Fun',
    desc: 'Trace A-Z with air writing magic!',
    gradient: 'linear-gradient(135deg, #FF4E8E, #C70053)',
    glow: 'rgba(255,78,142,0.5)',
    border: 'rgba(255,78,142,0.4)',
    route: '/learning-alphabets',
    tag: '26 Letters',
  },
  {
    id: 'number',
    emoji: '🔢',
    title: 'Number Magic',
    desc: 'Learn digits 0-9 with Doraemon!',
    gradient: 'linear-gradient(135deg, #00A5DC, #0072B3)',
    glow: 'rgba(0,165,220,0.5)',
    border: 'rgba(0,165,220,0.4)',
    route: '/learning-numbers',
    tag: '10 Numbers',
  },
  {
    id: 'test',
    emoji: '🏆',
    title: 'Test Challenge',
    desc: 'Quick test — earn bonus stars!',
    gradient: 'linear-gradient(135deg, #FFD700, #F4A700)',
    glow: 'rgba(255,215,0,0.5)',
    border: 'rgba(255,215,0,0.4)',
    route: '/test-mode',
    tag: 'Win Stars',
  },
  {
    id: 'game',
    emoji: '🎲',
    title: 'Snake & Ladder',
    desc: 'Roll & play — unlock with 1 assessment!',
    gradient: 'linear-gradient(135deg, #7C3AED, #4F1DBE)',
    glow: 'rgba(124,58,237,0.5)',
    border: 'rgba(124,58,237,0.4)',
    route: '/snake-ladder',
    tag: 'Board Game',
  },
];

/* ═══════════════════════════════════════════════════════════════ */
const ModeSelection = () => {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const { progress, level, badges, loading } = useProgress();
  const [showSettings, setShowSettings] = useState(false);
  const [hovered, setHovered] = useState(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    setTimeout(() => setShow(true), 80);
    if (window.speechSynthesis && user) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(`Hello ${user.name}! Choose your adventure!`);
      u.rate = 0.95; u.pitch = 1.25;
      window.speechSynthesis.speak(u);
    }
  }, [user]);

  const avatarEmoji = user?.gender === 'girl' ? '👧' : user?.gender === 'boy' ? '👦' : '🦄';

  return (
    <div className="relative w-screen h-screen flex flex-col overflow-hidden select-none"
      style={{ background: 'linear-gradient(135deg, #0a0e2e 0%, #0d1b4b 40%, #0a2060 70%, #061830 100%)' }}>

      <style>{`
        @keyframes twinkle  { 0%,100%{opacity:.15;transform:scale(1)} 50%{opacity:1;transform:scale(1.5)} }
        @keyframes fadeUp   { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
        @keyframes shimmer  { 0%{background-position:-200% center} 100%{background-position:200% center} }
        @keyframes pulse-glow { 0%,100%{box-shadow:0 0 20px var(--glow),0 8px 32px rgba(0,0,0,0.4)} 50%{box-shadow:0 0 40px var(--glow),0 8px 48px rgba(0,0,0,0.5)} }
        .fade-up    { animation: fadeUp .6s ease forwards; }
        .card-hover { transition: transform .2s ease, box-shadow .2s ease; }
        .card-hover:hover { transform: translateY(-6px) scale(1.02); }
        .shimmer-gold {
          background: linear-gradient(90deg, #FFD700 0%, #FFF 40%, #FFD700 60%, #FFE566 100%);
          background-size: 200% auto;
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmer 3s linear infinite;
        }
      `}</style>

      {/* Stars */}
      {STARS.map(s => (
        <div key={s.id} className="absolute rounded-full bg-white pointer-events-none"
          style={{ width:s.s, height:s.s, top:`${s.t}%`, left:`${s.l}%`, opacity:s.o,
            animation:`twinkle ${s.d}s ${s.dl}s ease-in-out infinite` }} />
      ))}

      {/* Top glow orb */}
      <div className="absolute pointer-events-none"
        style={{ width:700, height:300, top:-100, left:'50%', transform:'translateX(-50%)',
          background:'radial-gradient(ellipse, rgba(0,165,220,0.12) 0%, transparent 70%)', filter:'blur(40px)' }} />

      {/* ══ HEADER ══════════════════════════════════════════════ */}
      <div className={`relative z-20 flex items-center justify-between px-6 py-4 ${show ? 'fade-up' : 'opacity-0'}`}
        style={{
          background: 'rgba(10,20,60,0.65)',
          borderBottom: '1px solid rgba(0,165,220,0.2)',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 4px 32px rgba(0,0,0,0.3)',
        }}>

        {/* Left — User info */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full flex items-center justify-center text-2xl font-black border-2"
            style={{ background:'linear-gradient(135deg,#00A5DC,#0072B3)', borderColor:'rgba(0,165,220,0.6)',
              boxShadow:'0 0 20px rgba(0,165,220,0.5)' }}>
            {avatarEmoji}
          </div>
          <div>
            <p className="text-white/50 text-[10px] font-bold uppercase tracking-widest">Welcome back</p>
            <h2 className="text-white font-black text-lg leading-tight">{user?.name || 'Explorer'}</h2>
          </div>
          <div className="ml-2 px-3 py-1 rounded-full text-xs font-black"
            style={{ background:'rgba(255,215,0,0.15)', border:'1px solid rgba(255,215,0,0.4)', color:'#FFD700' }}>
            ⚡ Level {level}
          </div>
        </div>

        {/* Center — Stats */}
        <div className="hidden md:flex items-center gap-3">
          {[
            { icon:'⭐', label:'Stars',  val: progress.stars,         color:'#FFD700' },
            { icon:'🔥', label:'Streak', val:`${progress.streak}d`,   color:'#FF6B35' },
            { icon:'🎯', label:'Score',  val: progress.score,         color:'#00A5DC' },
          ].map(s => (
            <div key={s.label} className="flex items-center gap-2 px-4 py-2 rounded-xl"
              style={{ background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.1)' }}>
              <span className="text-xl">{s.icon}</span>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color:'rgba(255,255,255,0.4)' }}>{s.label}</p>
                <p className="text-sm font-black" style={{ color: s.color }}>{s.val}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Right — Controls */}
        <div className="flex items-center gap-2">
          <button onClick={() => navigate('/parent-dashboard')}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl font-bold text-xs text-white/70 hover:text-white transition-all"
            style={{ background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.12)' }}
            onMouseEnter={e => e.currentTarget.style.background='rgba(255,255,255,0.14)'}
            onMouseLeave={e => e.currentTarget.style.background='rgba(255,255,255,0.07)'}>
            <Users className="w-3.5 h-3.5" /> Parent
          </button>
          <button onClick={() => setShowSettings(true)}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-white/60 hover:text-white transition-all"
            style={{ background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.12)' }}>
            <Settings className="w-4 h-4" />
          </button>
          <button onClick={() => { logout(); navigate('/'); }}
            className="w-9 h-9 rounded-xl flex items-center justify-center transition-all"
            style={{ background:'rgba(255,78,142,0.15)', border:'1px solid rgba(255,78,142,0.3)', color:'#FF4E8E' }}
            onMouseEnter={e => e.currentTarget.style.background='rgba(255,78,142,0.28)'}
            onMouseLeave={e => e.currentTarget.style.background='rgba(255,78,142,0.15)'}>
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ══ BODY ════════════════════════════════════════════════ */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 py-6 overflow-y-auto">

        {/* Title section */}
        <div className={`text-center mb-8 ${show ? 'fade-up' : 'opacity-0'}`} style={{ animationDelay:'0.1s' }}>
          <h1 className="font-black leading-none mb-2" style={{ fontSize:'clamp(1.8rem,3.5vw,2.8rem)' }}>
            <span className="shimmer-gold">Choose Your</span>{' '}
            <span className="text-white">Adventure</span>
            <span style={{ color:'#00A5DC' }}> ✦</span>
          </h1>
          <p className="text-white/40 font-semibold text-sm">Pick a mode and start your air writing journey</p>
        </div>

        {/* Mode Cards Grid */}
        <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-5xl w-full ${show ? 'fade-up' : 'opacity-0'}`}
          style={{ animationDelay: '0.2s' }}>
          {CARDS.map((c, i) => (
            <div key={c.id}
              onClick={() => navigate(c.route)}
              onMouseEnter={() => setHovered(c.id)}
              onMouseLeave={() => setHovered(null)}
              className="card-hover cursor-pointer rounded-3xl p-6 flex flex-col items-center text-center relative overflow-hidden"
              style={{
                background: hovered === c.id
                  ? `linear-gradient(135deg, rgba(10,20,70,0.95), rgba(10,20,60,0.9))`
                  : 'rgba(10,20,60,0.6)',
                border: `1px solid ${hovered === c.id ? c.border : 'rgba(255,255,255,0.08)'}`,
                boxShadow: hovered === c.id
                  ? `0 0 40px ${c.glow}, 0 20px 60px rgba(0,0,0,0.5)`
                  : '0 8px 32px rgba(0,0,0,0.3)',
                backdropFilter: 'blur(20px)',
                animationDelay: `${0.1 * i + 0.3}s`,
              }}>

              {/* Top glow streak on hover */}
              {hovered === c.id && (
                <div className="absolute top-0 left-0 right-0 h-0.5 rounded-t-3xl"
                  style={{ background: c.gradient }} />
              )}

              {/* Icon bubble */}
              <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl mb-5 transition-transform duration-200"
                style={{
                  background: hovered === c.id ? c.gradient : 'rgba(255,255,255,0.08)',
                  boxShadow: hovered === c.id ? `0 8px 32px ${c.glow}` : 'none',
                  transform: hovered === c.id ? 'scale(1.1) rotate(5deg)' : 'scale(1)',
                  border: `1px solid ${c.border}`,
                }}>
                {c.emoji}
              </div>

              {/* Tag */}
              <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full mb-2"
                style={{ background: hovered === c.id ? c.gradient : 'rgba(255,255,255,0.08)',
                  color: hovered === c.id ? 'white' : 'rgba(255,255,255,0.4)' }}>
                {c.tag}
              </span>

              <h3 className="text-white font-black text-xl mb-1">{c.title}</h3>
              <p className="text-white/40 font-semibold text-sm mb-5 flex-1">{c.desc}</p>

              {/* Play button */}
              <button
                onClick={e => { e.stopPropagation(); navigate(c.route); }}
                className="w-full py-3 rounded-xl font-black text-sm transition-all duration-200 active:scale-95"
                style={{
                  background: hovered === c.id ? c.gradient : 'rgba(255,255,255,0.08)',
                  color: 'white',
                  border: `1px solid ${hovered === c.id ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.1)'}`,
                  boxShadow: hovered === c.id ? `0 4px 20px ${c.glow}` : 'none',
                }}>
                {hovered === c.id ? '🚀 Let\'s Go!' : 'Play →'}
              </button>
            </div>
          ))}
        </div>

        {/* Badges */}
        {badges.length > 0 && (
          <div className={`mt-7 max-w-2xl w-full ${show ? 'fade-up' : 'opacity-0'}`} style={{ animationDelay:'0.5s' }}>
            <div className="rounded-2xl px-6 py-4"
              style={{ background:'rgba(255,215,0,0.06)', border:'1px solid rgba(255,215,0,0.2)', backdropFilter:'blur(12px)' }}>
              <p className="text-center text-[10px] font-black uppercase tracking-widest mb-3" style={{ color:'rgba(255,215,0,0.6)' }}>
                🎖️ My Badge Collection
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                {badges.map((b, i) => (
                  <span key={i} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black"
                    style={{ background:'rgba(255,215,0,0.12)', border:'1px solid rgba(255,215,0,0.25)', color:'#FFD700' }}>
                    {b.emoji} {b.label}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Mobile stats (visible on small screens only) */}
      <div className="md:hidden relative z-20 flex items-center justify-center gap-4 px-4 pb-3">
        {[
          { icon:'⭐', val: progress.stars, label:'Stars' },
          { icon:'🔥', val:`${progress.streak}d`, label:'Streak' },
          { icon:'🎯', val: progress.score, label:'Score' },
        ].map(s => (
          <div key={s.label} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl"
            style={{ background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.1)' }}>
            <span>{s.icon}</span>
            <span className="text-white/70 text-xs font-bold">{s.val} {s.label}</span>
          </div>
        ))}
      </div>

      {showSettings && <SettingsPanel onClose={() => setShowSettings(false)} />}
      <Copyright variant="dark" position="bottom-center" />
    </div>
  );
};

export default ModeSelection;
