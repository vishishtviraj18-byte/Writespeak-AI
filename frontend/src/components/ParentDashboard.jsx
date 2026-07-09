import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useProgress } from '../hooks/useProgress';
import Copyright from './Copyright';
import { ArrowLeft, FileText, Calendar, TrendingUp, Star, Zap, Target, Flame } from 'lucide-react';

/* ── Stars ─────────────────────────────────────────────────── */
const STARS = Array.from({ length: 55 }, (_, i) => ({
  id: i, s: Math.random() * 2.5 + 1,
  t: Math.random() * 100, l: Math.random() * 100,
  o: Math.random() * 0.5 + 0.15, d: Math.random() * 3 + 2, dl: Math.random() * 5,
}));

/* ── Stat Card ──────────────────────────────────────────────── */
const StatCard = ({ icon, label, value, color, glow }) => (
  <div className="flex items-center gap-3 rounded-2xl px-4 py-3"
    style={{ background: 'rgba(255,255,255,0.05)', border: `1px solid ${color}33` }}>
    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0"
      style={{ background: `${color}22`, boxShadow: `0 0 16px ${glow}` }}>
      {icon}
    </div>
    <div>
      <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.4)' }}>{label}</p>
      <p className="font-black text-lg leading-tight" style={{ color }}>{value}</p>
    </div>
  </div>
);

/* ── Progress Bar ───────────────────────────────────────────── */
const ProgressBar = ({ label, done, total, color }) => {
  const pct = Math.round((done / total) * 100);
  return (
    <div>
      <div className="flex justify-between text-xs font-black mb-1.5"
        style={{ color: 'rgba(255,255,255,0.5)' }}>
        <span>{label}</span>
        <span style={{ color }}>{done}/{total}</span>
      </div>
      <div className="w-full h-2.5 rounded-full overflow-hidden"
        style={{ background: 'rgba(255,255,255,0.08)' }}>
        <div className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, background: color, boxShadow: `0 0 10px ${color}88` }} />
      </div>
      <p className="text-right text-[10px] font-bold mt-0.5" style={{ color: 'rgba(255,255,255,0.3)' }}>{pct}% complete</p>
    </div>
  );
};

/* ════════════════════════════════════════════════════════════ */
const ParentDashboard = () => {
  const navigate = useNavigate();
  const { authFetch } = useAuth();
  const { progress, level } = useProgress();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [show, setShow] = useState(false);

  useEffect(() => {
    setTimeout(() => setShow(true), 80);
    const fetch = async () => {
      try {
        const res = await authFetch('http://localhost:8080/api/test/history');
        if (res.ok) setHistory(await res.json());
      } catch { /* backend offline */ }
      finally { setLoading(false); }
    };
    fetch();
  }, []);

  /* ── SVG Trend Chart ── */
  const renderChart = () => {
    if (history.length === 0) {
      return (
        <div className="h-44 flex flex-col items-center justify-center gap-2 rounded-2xl"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <TrendingUp className="w-10 h-10" style={{ color: 'rgba(0,165,220,0.3)' }} />
          <p className="text-sm font-bold" style={{ color: 'rgba(255,255,255,0.3)' }}>Complete some tests to see your trend chart 📈</p>
        </div>
      );
    }
    const data = [...history].slice(0, 7).reverse();
    const W = 500, H = 140, P = 24;
    const pts = data.map((t, i) => ({
      x: P + (i * (W - P * 2)) / Math.max(1, data.length - 1),
      y: H - P - (t.accuracy * (H - P * 2)) / 100,
      acc: t.accuracy,
    }));
    const path = pts.reduce((s, p, i) => i === 0 ? `M${p.x},${p.y}` : `${s} L${p.x},${p.y}`, '');
    const area = `${path} L${pts[pts.length - 1].x},${H - P} L${pts[0].x},${H - P} Z`;

    return (
      <div className="rounded-2xl p-4" style={{ background: 'rgba(0,165,220,0.06)', border: '1px solid rgba(0,165,220,0.2)' }}>
        <p className="text-[10px] font-black uppercase tracking-widest mb-3" style={{ color: 'rgba(0,165,220,0.7)' }}>
          📈 Accuracy Trend (last {data.length} tests)
        </p>
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
          <defs>
            <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#00A5DC" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#00A5DC" stopOpacity="0.02" />
            </linearGradient>
          </defs>
          <line x1={P} y1={P} x2={W - P} y2={P} stroke="rgba(255,255,255,0.06)" strokeDasharray="4 4" />
          <line x1={P} y1={H / 2} x2={W - P} y2={H / 2} stroke="rgba(255,255,255,0.06)" strokeDasharray="4 4" />
          <line x1={P} y1={H - P} x2={W - P} y2={H - P} stroke="rgba(255,255,255,0.1)" strokeWidth="1.5" />
          {pts.length > 1 && <path d={area} fill="url(#areaGrad)" />}
          {pts.length > 1 && <path d={path} fill="none" stroke="#00A5DC" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />}
          {pts.map((p, i) => (
            <g key={i}>
              <circle cx={p.x} cy={p.y} r="6" fill="#FF4E8E" stroke="#0a0e2e" strokeWidth="2" />
              <text x={p.x} y={p.y - 11} textAnchor="middle" fontSize="9" fontWeight="900" fill="rgba(255,255,255,0.7)">{Math.round(p.acc)}%</text>
            </g>
          ))}
        </svg>
      </div>
    );
  };

  return (
    <div className="relative w-screen h-screen flex flex-col overflow-hidden select-none"
      style={{ background: 'linear-gradient(135deg,#0a0e2e 0%,#0d1b4b 40%,#0a2060 70%,#061830 100%)' }}>

      <style>{`
        @keyframes twinkle3 { 0%,100%{opacity:.12;transform:scale(1)} 50%{opacity:.8;transform:scale(1.5)} }
        @keyframes fadeUpD  { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes shimmerG {
          0%{background-position:-200% center} 100%{background-position:200% center}
        }
        .fade-up-d { animation: fadeUpD .55s ease forwards; }
        .shimmer-gold {
          background: linear-gradient(90deg,#FFD700 0%,#FFF 40%,#FFD700 60%,#FFE566 100%);
          background-size:200% auto; -webkit-background-clip:text; -webkit-text-fill-color:transparent;
          background-clip:text; animation: shimmerG 3s linear infinite;
        }
        .royal-row:hover { background: rgba(255,255,255,0.06)!important; }
        .scroll-royal::-webkit-scrollbar { width:5px; }
        .scroll-royal::-webkit-scrollbar-track { background:rgba(255,255,255,0.04); }
        .scroll-royal::-webkit-scrollbar-thumb { background:rgba(0,165,220,0.3); border-radius:99px; }
      `}</style>

      {/* Stars */}
      {STARS.map(s => (
        <div key={s.id} className="absolute rounded-full bg-white pointer-events-none"
          style={{ width: s.s, height: s.s, top: `${s.t}%`, left: `${s.l}%`, opacity: s.o,
            animation: `twinkle3 ${s.d}s ${s.dl}s ease-in-out infinite` }} />
      ))}

      {/* Top glow */}
      <div className="absolute pointer-events-none"
        style={{ width: 700, height: 250, top: -80, left: '50%', transform: 'translateX(-50%)',
          background: 'radial-gradient(ellipse,rgba(0,165,220,0.1) 0%,transparent 70%)', filter: 'blur(40px)' }} />

      {/* ── HEADER ── */}
      <div className="relative z-20 flex items-center justify-between px-6 py-4"
        style={{ background: 'rgba(8,18,55,0.75)', borderBottom: '1px solid rgba(0,165,220,0.2)', backdropFilter: 'blur(20px)' }}>

        <button onClick={() => navigate('/mode-selection')}
          className="flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-all"
          style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.7)' }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.13)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.07)'}>
          <ArrowLeft className="w-4 h-4" /> Dashboard
        </button>

        <h1 className="font-black text-xl flex items-center gap-2">
          <span className="shimmer-gold">Parent Performance</span>
          <span className="text-white"> Portal</span>
          <span style={{ color: '#00A5DC' }}>✦</span>
        </h1>

        <div className="px-3 py-1.5 rounded-xl text-xs font-black"
          style={{ background: 'rgba(255,215,0,0.12)', border: '1px solid rgba(255,215,0,0.3)', color: '#FFD700' }}>
          ⚡ Level {level}
        </div>
      </div>

      {/* ── BODY ── */}
      <div className="relative z-10 flex-1 overflow-y-auto scroll-royal p-5">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* ── LEFT PANEL ── */}
          <div className={`lg:col-span-1 flex flex-col gap-4 ${show ? 'fade-up-d' : 'opacity-0'}`} style={{ animationDelay: '0.1s' }}>

            {/* Stats Card */}
            <div className="rounded-3xl p-5 backdrop-blur-xl"
              style={{ background: 'rgba(8,18,55,0.7)', border: '1px solid rgba(0,165,220,0.25)',
                boxShadow: '0 16px 48px rgba(0,0,0,0.4)' }}>

              <div className="flex flex-col items-center mb-5">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-3"
                  style={{ background: 'linear-gradient(135deg,#00A5DC,#0072B3)', boxShadow: '0 8px 24px rgba(0,165,220,0.5)' }}>
                  🎓
                </div>
                <h2 className="font-black text-white text-xl">Learning Stats</h2>
                <p className="text-[10px] font-black uppercase tracking-widest mt-0.5" style={{ color: 'rgba(0,165,220,0.6)' }}>
                  Doraemon Companion Guide
                </p>
              </div>

              {/* Top stripe */}
              <div className="h-px w-full mb-4" style={{ background: 'rgba(0,165,220,0.2)' }} />

              <div className="flex flex-col gap-2.5">
                <StatCard icon="⚡" label="XP Score"          value={`${progress.score} XP`}              color="#34D399" glow="rgba(52,211,153,0.4)" />
                <StatCard icon="⭐" label="Gold Stars"        value={`${progress.stars} stars`}           color="#FFD700" glow="rgba(255,215,0,0.4)" />
                <StatCard icon="🔥" label="Active Streak"     value={`${progress.streak} days`}           color="#FF6B35" glow="rgba(255,107,53,0.4)" />
                <StatCard icon="🎯" label="Learning Accuracy" value={`${Math.round(progress.accuracy)}%`} color="#00A5DC" glow="rgba(0,165,220,0.4)" />
              </div>
            </div>

            {/* Progress Card */}
            <div className="rounded-3xl p-5 backdrop-blur-xl"
              style={{ background: 'rgba(8,18,55,0.7)', border: '1px solid rgba(255,78,142,0.2)',
                boxShadow: '0 16px 48px rgba(0,0,0,0.4)' }}>
              <h3 className="font-black text-white text-base mb-4 flex items-center gap-2">
                <span className="text-lg">📊</span> Completed Items
              </h3>
              <div className="flex flex-col gap-4">
                <ProgressBar
                  label="Alphabets Practice" done={progress.alphabetsDone?.length || 0}
                  total={26} color="#FF4E8E" />
                <ProgressBar
                  label="Numbers Practice" done={progress.numbersDone?.length || 0}
                  total={10} color="#00A5DC" />
              </div>
            </div>
          </div>

          {/* ── RIGHT PANEL ── */}
          <div className={`lg:col-span-2 flex flex-col gap-4 ${show ? 'fade-up-d' : 'opacity-0'}`} style={{ animationDelay: '0.2s' }}>

            {/* Trend chart */}
            <div className="rounded-3xl p-5 backdrop-blur-xl"
              style={{ background: 'rgba(8,18,55,0.7)', border: '1px solid rgba(0,165,220,0.2)',
                boxShadow: '0 16px 48px rgba(0,0,0,0.4)' }}>
              <h3 className="font-black text-white text-base mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5" style={{ color: '#00A5DC' }} />
                <span>Performance Trend</span>
              </h3>
              {renderChart()}
            </div>

            {/* History table */}
            <div className="rounded-3xl p-5 backdrop-blur-xl flex-1"
              style={{ background: 'rgba(8,18,55,0.7)', border: '1px solid rgba(255,215,0,0.15)',
                boxShadow: '0 16px 48px rgba(0,0,0,0.4)' }}>
              <h3 className="font-black text-white text-base mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5" style={{ color: '#FFD700' }} />
                <span>Assessment Log History</span>
              </h3>

              {loading ? (
                <div className="flex flex-col items-center justify-center py-10 gap-3">
                  <div className="w-10 h-10 rounded-full border-4 animate-spin"
                    style={{ borderColor: 'rgba(0,165,220,0.3)', borderTopColor: '#00A5DC' }} />
                  <p className="text-sm font-bold" style={{ color: 'rgba(255,255,255,0.4)' }}>Loading logs…</p>
                </div>
              ) : history.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 gap-2">
                  <span className="text-4xl">📝</span>
                  <p className="font-bold text-sm" style={{ color: 'rgba(255,255,255,0.35)' }}>
                    No assessment results yet. Take a Test to see results!
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                        {['Date', 'Type', 'Score', 'Accuracy', 'Grade', 'XP'].map(h => (
                          <th key={h} className="pb-3 text-[10px] font-black uppercase tracking-widest pr-4"
                            style={{ color: 'rgba(255,255,255,0.35)' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {history.map((t, i) => (
                        <tr key={t.id || i}
                          className="royal-row transition-colors"
                          style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                          <td className="py-3.5 pr-4 text-sm font-bold flex items-center gap-1.5"
                            style={{ color: 'rgba(255,255,255,0.6)' }}>
                            <Calendar className="w-3.5 h-3.5" style={{ color: 'rgba(255,255,255,0.3)' }} />
                            {new Date(t.date || Date.now()).toLocaleDateString()}
                          </td>
                          <td className="py-3.5 pr-4">
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black"
                              style={t.testType === 'NUMBER'
                                ? { background: 'rgba(0,165,220,0.15)', border: '1px solid rgba(0,165,220,0.3)', color: '#7DD3F7' }
                                : { background: 'rgba(255,78,142,0.15)', border: '1px solid rgba(255,78,142,0.3)', color: '#FF9EBA' }}>
                              {t.testType}
                            </span>
                          </td>
                          <td className="py-3.5 pr-4 text-sm font-black text-white">
                            {t.correctAnswers}/{t.totalQuestions}
                          </td>
                          <td className="py-3.5 pr-4">
                            <span className="font-black text-sm"
                              style={{ color: t.accuracy >= 80 ? '#34D399' : t.accuracy >= 50 ? '#FFD700' : '#F87171' }}>
                              {Math.round(t.accuracy)}%
                            </span>
                          </td>
                          <td className="py-3.5 pr-4 text-sm font-black" style={{ color: '#FF4E8E' }}>
                            {t.grade?.split(' ')[0]}
                          </td>
                          <td className="py-3.5 text-sm font-black" style={{ color: '#34D399' }}>
                            +{t.score}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>

      <Copyright variant="dark" position="bottom-center" />
    </div>
  );
};

export default ParentDashboard;
