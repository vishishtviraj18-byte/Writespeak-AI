import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useProgress } from '../hooks/useProgress';
import AnimatedBackground from './AnimatedBackground';
import SettingsPanel from './SettingsPanel';
import { BookOpen, GraduationCap, Trophy, Users, LogOut, Settings, Award } from 'lucide-react';
import gsap from 'gsap';

const ModeSelection = () => {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const { progress, level, badges, loading } = useProgress();
  const [showSettings, setShowSettings] = useState(false);

  const statsRef = useRef(null);
  const gridRef = useRef(null);

  useEffect(() => {
    // Say a cute welcome message using Web Speech API
    if (window.speechSynthesis && user) {
      window.speechSynthesis.cancel();
      const welcomeMsg = `Hello ${user.name}! Choose an adventure! Alphabet study, numbers, or a fun challenge!`;
      const utterance = new SpeechSynthesisUtterance(welcomeMsg);
      utterance.rate = 0.95;
      utterance.pitch = 1.25;
      window.speechSynthesis.speak(utterance);
    }

    // GSAP animations
    gsap.fromTo(statsRef.current,
      { y: -50, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, ease: "back.out" }
    );

    gsap.fromTo(gridRef.current.children,
      { scale: 0.8, opacity: 0 },
      { scale: 1, opacity: 1, duration: 0.6, stagger: 0.1, ease: "back.out(1.5)" }
    );
  }, [user]);

  const cards = [
    {
      id: 'alphabet',
      title: 'Alphabet Fun!',
      desc: 'Trace capital letters A to Z with air writing!',
      icon: <BookOpen className="w-12 h-12 text-white" />,
      color: 'bg-primary border-rose-300',
      action: () => navigate('/learning-alphabets'),
    },
    {
      id: 'number',
      title: 'Number Magic!',
      desc: 'Learn to trace digits 0 to 9 with Doraemon!',
      icon: <GraduationCap className="w-12 h-12 text-white" />,
      color: 'bg-secondary border-teal-300',
      action: () => navigate('/learning-numbers'),
    },
    {
      id: 'test',
      title: 'Test Time!',
      desc: 'Take a quick test and earn bonus stars!',
      icon: <Award className="w-12 h-12 text-white" />,
      color: 'bg-accent border-yellow-300',
      action: () => navigate('/test-mode'),
    },
    {
      id: 'game',
      title: 'Snakes & Ladders',
      desc: 'Roll dice and play. Unlocked with 1 assessment!',
      icon: <Trophy className="w-12 h-12 text-white" />,
      color: 'bg-doraBlue border-sky-300',
      action: () => navigate('/snake-ladder'),
    },
  ];

  return (
    <div className="relative w-screen h-screen flex flex-col overflow-hidden font-nunito bg-back text-slate-800">
      <AnimatedBackground />

      {/* Header Panel */}
      <div 
        ref={statsRef}
        className="z-10 bg-white/90 border-b-4 border-white backdrop-blur-md px-6 py-4 flex flex-wrap gap-4 justify-between items-center shadow-md relative"
      >
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-doraBlue border-2 border-white flex items-center justify-center text-2xl shadow-sm">
            {progress.gender === 'girl' ? '👧' : progress.gender === 'boy' ? '👦' : '🦄'}
          </div>
          <div>
            <h2 className="font-black text-xl text-slate-800 leading-none">Hi, {user?.name || 'Explorer'}!</h2>
            <span className="text-xs font-black text-doraBlue bg-sky-50 px-2 py-0.5 rounded-full border border-sky-200 mt-1 inline-block">
              🎖️ Level {level}
            </span>
          </div>
        </div>

        {/* Stats Row */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 bg-yellow-50 border-2 border-yellow-200 rounded-full px-4 py-1.5 shadow-sm">
            <span className="text-2xl">🌟</span>
            <div className="text-left leading-none">
              <div className="text-xs font-bold text-slate-500">STARS</div>
              <div className="text-lg font-black text-yellow-600">{progress.stars}</div>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-rose-50 border-2 border-rose-200 rounded-full px-4 py-1.5 shadow-sm">
            <span className="text-2xl">🔥</span>
            <div className="text-left leading-none">
              <div className="text-xs font-bold text-slate-500">STREAK</div>
              <div className="text-lg font-black text-primary">{progress.streak} days</div>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-teal-50 border-2 border-teal-200 rounded-full px-4 py-1.5 shadow-sm">
            <span className="text-2xl">🏆</span>
            <div className="text-left leading-none">
              <div className="text-xs font-bold text-slate-500">SCORE</div>
              <div className="text-lg font-black text-emerald-600">{progress.score}</div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/parent-dashboard')}
            className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border-2 border-slate-300 font-black rounded-full px-4 py-2 text-sm shadow-sm cursor-pointer transition-colors"
          >
            <Users className="w-4 h-4" /> Parent Zone
          </button>
          
          <button
            onClick={() => setShowSettings(true)}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 border-2 border-slate-300 font-black rounded-full p-2 shadow-sm cursor-pointer transition-colors"
          >
            <Settings className="w-5 h-5" />
          </button>

          <button
            onClick={logout}
            className="bg-rose-50 hover:bg-rose-100 text-rose-600 border-2 border-rose-200 font-black rounded-full p-2 shadow-sm cursor-pointer transition-colors"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Grid Section */}
      <div className="z-10 flex-1 flex flex-col justify-center items-center px-6 py-8">
        <div 
          ref={gridRef}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl w-full"
        >
          {cards.map((c) => (
            <div
              key={c.id}
              onClick={c.action}
              className="bg-white border-4 border-slate-100 rounded-[32px] p-6 shadow-lg flex flex-col items-center justify-between text-center cursor-pointer transition-all duration-200 transform hover:-translate-y-2 hover:shadow-2xl hover:border-slate-200 group active:scale-95"
            >
              <div className={`w-24 h-24 rounded-[24px] ${c.color} border-4 border-white flex items-center justify-center shadow-md mb-6 transform transition-transform group-hover:scale-110 group-hover:rotate-6`}>
                {c.icon}
              </div>
              <div>
                <h3 className="text-2xl font-black text-slate-800 mb-2">{c.title}</h3>
                <p className="text-slate-500 font-bold text-sm mb-6 px-2">{c.desc}</p>
              </div>
              <button 
                onClick={(e) => { e.stopPropagation(); c.action(); }}
                className="w-full bg-slate-100 group-hover:bg-primary group-hover:text-white text-slate-600 border-2 border-slate-200 group-hover:border-primary font-black py-2.5 rounded-2xl shadow-sm transition-colors cursor-pointer"
              >
                Let's Play! 🚀
              </button>
            </div>
          ))}
        </div>

        {/* Display Badges */}
        {badges.length > 0 && (
          <div className="mt-12 bg-white/70 backdrop-blur-sm border-2 border-white rounded-[24px] px-6 py-3 max-w-xl w-full text-center shadow-sm">
            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">My Badge Collection 🎖️</h4>
            <div className="flex flex-wrap gap-3 justify-center">
              {badges.map((b, idx) => (
                <span 
                  key={idx}
                  title={b.label}
                  className="bg-white/80 border border-slate-200 rounded-full px-3 py-1 text-sm font-black text-slate-700 shadow-sm flex items-center gap-1.5"
                >
                  <span>{b.emoji}</span> <span>{b.label}</span>
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Settings Dialog Overlay */}
      {showSettings && <SettingsPanel onClose={() => setShowSettings(false)} />}
    </div>
  );
};

export default ModeSelection;
