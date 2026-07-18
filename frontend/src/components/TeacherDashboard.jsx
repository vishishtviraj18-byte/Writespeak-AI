import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Copyright from './Copyright';
import {
  ArrowLeft, BarChart2, Users, ClipboardList, BookOpen,
  TrendingUp, Star, Zap, Target, Shield, ChevronDown,
  ChevronUp, Download, Lock, Unlock, RefreshCw, Save,
  CheckCircle, XCircle, AlertTriangle, Search, Filter,
  Settings, Award, Clock, ToggleLeft, ToggleRight, Eye
} from 'lucide-react';

/* ── Stars ─────────────────────────────────────────────────── */
const STARS = Array.from({ length: 60 }, (_, i) => ({
  id: i, s: Math.random() * 2.5 + 1,
  t: Math.random() * 100, l: Math.random() * 100,
  o: Math.random() * 0.45 + 0.1, d: Math.random() * 3 + 2, dl: Math.random() * 5,
}));

const ALPHABETS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
const NUMBERS   = '0123456789'.split('');

/* ── Default teacher config stored in localStorage ─────────── */
const DEFAULT_CONFIG = {
  testType: 'MIXED',
  questionCount: 5,
  timePerQuestion: 30,
  passingThreshold: 60,
  enabledAlphabets: [...ALPHABETS],
  enabledNumbers: [...NUMBERS],
  testLocked: false,
  difficulty: 'Intermediate',
};

const loadConfig = () => {
  try {
    const raw = localStorage.getItem('ws_teacher_config');
    return raw ? { ...DEFAULT_CONFIG, ...JSON.parse(raw) } : { ...DEFAULT_CONFIG };
  } catch { return { ...DEFAULT_CONFIG }; }
};

/* ── Mock students (fallback when backend offline) ──────────── */
const MOCK_STUDENTS = [
  { id: 1, name: 'Aarav Sharma',   score: 480, stars: 28, accuracy: 88, streak: 7,  alphabetsDone: ALPHABETS.slice(0,22), numbersDone: NUMBERS, testHistory: [{ grade:'A ⭐',accuracy:92,date:'2026-07-17' },{ grade:'B 👍',accuracy:74,date:'2026-07-15' }] },
  { id: 2, name: 'Ishita Patel',   score: 310, stars: 18, accuracy: 72, streak: 3,  alphabetsDone: ALPHABETS.slice(0,14), numbersDone: NUMBERS.slice(0,7), testHistory: [{ grade:'B 👍',accuracy:70,date:'2026-07-16' }] },
  { id: 3, name: 'Riya Mehta',     score: 590, stars: 35, accuracy: 95, streak: 12, alphabetsDone: ALPHABETS,             numbersDone: NUMBERS, testHistory: [{ grade:'A+ 🌟',accuracy:100,date:'2026-07-18' },{ grade:'A ⭐',accuracy:93,date:'2026-07-16' }] },
  { id: 4, name: 'Dev Kumar',      score: 145, stars: 8,  accuracy: 45, streak: 1,  alphabetsDone: ALPHABETS.slice(0,8),  numbersDone: NUMBERS.slice(0,4), testHistory: [{ grade:'C 😅',accuracy:45,date:'2026-07-14' }] },
  { id: 5, name: 'Ananya Singh',   score: 260, stars: 15, accuracy: 63, streak: 4,  alphabetsDone: ALPHABETS.slice(0,12), numbersDone: NUMBERS.slice(0,6), testHistory: [{ grade:'B 👍',accuracy:64,date:'2026-07-17' }] },
  { id: 6, name: 'Vivaan Gupta',   score: 420, stars: 24, accuracy: 81, streak: 6,  alphabetsDone: ALPHABETS.slice(0,20), numbersDone: NUMBERS, testHistory: [{ grade:'A ⭐',accuracy:85,date:'2026-07-18' }] },
];

/* ── Helpers ────────────────────────────────────────────────── */
const getAccuracyColor = (acc) =>
  acc >= 80 ? '#34D399' : acc >= 60 ? '#FFD700' : '#F87171';

const getAccuracyLabel = (acc) =>
  acc >= 80 ? 'Excelling 🌟' : acc >= 60 ? 'On Track 👍' : 'Needs Help ⚠️';

const levelOf = (score) => Math.floor(score / 100) + 1;

/* ═══════════════════════════════════════════════════════════ */
/* Sub-components                                              */
/* ═══════════════════════════════════════════════════════════ */

/* ── Stat Pill ─────────────────────────────────────────────── */
const Pill = ({ icon, label, value, color }) => (
  <div className="flex items-center gap-2.5 rounded-2xl px-4 py-3"
    style={{ background: 'rgba(255,255,255,0.05)', border: `1px solid ${color}33` }}>
    <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg shrink-0"
      style={{ background: `${color}22` }}>{icon}</div>
    <div>
      <p className="text-[9px] font-black uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.38)' }}>{label}</p>
      <p className="font-black text-base leading-tight" style={{ color }}>{value}</p>
    </div>
  </div>
);

/* ── Tab Button ────────────────────────────────────────────── */
const Tab = ({ id, icon, label, active, onClick }) => (
  <button id={`teacher-tab-${id}`} onClick={() => onClick(id)}
    className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-sm transition-all duration-200"
    style={active
      ? { background: 'rgba(0,165,220,0.2)', border: '1px solid rgba(0,165,220,0.5)', color: '#00A5DC' }
      : { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.45)' }}
    onMouseEnter={e => { if (!active) e.currentTarget.style.color = 'rgba(255,255,255,0.75)'; }}
    onMouseLeave={e => { if (!active) e.currentTarget.style.color = 'rgba(255,255,255,0.45)'; }}>
    {icon} {label}
  </button>
);

/* ── Section Card ──────────────────────────────────────────── */
const Card = ({ children, className = '', borderColor = 'rgba(0,165,220,0.2)', style = {} }) => (
  <div className={`rounded-3xl p-5 backdrop-blur-xl ${className}`}
    style={{ background: 'rgba(8,18,55,0.7)', border: `1px solid ${borderColor}`, boxShadow: '0 16px 48px rgba(0,0,0,0.4)', ...style }}>
    {children}
  </div>
);

/* ── Slider ────────────────────────────────────────────────── */
const Slider = ({ label, id, min, max, value, onChange, unit, color = '#00A5DC' }) => (
  <div>
    <div className="flex justify-between text-xs font-black mb-2" style={{ color: 'rgba(255,255,255,0.55)' }}>
      <label htmlFor={id}>{label}</label>
      <span style={{ color }}>{value}{unit}</span>
    </div>
    <input id={id} type="range" min={min} max={max} value={value} onChange={e => onChange(Number(e.target.value))}
      className="w-full h-2 rounded-full appearance-none cursor-pointer"
      style={{ accentColor: color, background: `linear-gradient(to right, ${color} ${((value - min) / (max - min)) * 100}%, rgba(255,255,255,0.15) 0%)` }} />
    <div className="flex justify-between text-[9px] mt-1" style={{ color: 'rgba(255,255,255,0.25)' }}>
      <span>{min}{unit}</span><span>{max}{unit}</span>
    </div>
  </div>
);

/* ── Char Toggle Button ─────────────────────────────────────── */
const CharBtn = ({ char, active, onClick }) => (
  <button id={`char-btn-${char}`} onClick={() => onClick(char)}
    className="w-9 h-9 rounded-xl font-black text-sm transition-all duration-150"
    style={active
      ? { background: 'rgba(0,165,220,0.25)', border: '1px solid rgba(0,165,220,0.6)', color: '#7DD3F7' }
      : { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.3)' }}
    title={active ? 'Enabled — click to disable' : 'Disabled — click to enable'}>
    {char}
  </button>
);

/* ═══════════════════════════════════════════════════════════ */
/* Overview Tab                                                */
/* ═══════════════════════════════════════════════════════════ */
const OverviewTab = ({ students }) => {
  const totalStudents = students.length;
  const avgAccuracy   = students.length ? Math.round(students.reduce((s,st) => s + st.accuracy, 0) / students.length) : 0;
  const totalXP       = students.reduce((s,st) => s + st.score, 0);
  const struggling    = students.filter(s => s.accuracy < 60).length;

  /* trend: average accuracy per student's last test */
  const trendData = [...students]
    .sort((a, b) => (b.testHistory[0]?.accuracy || 0) - (a.testHistory[0]?.accuracy || 0))
    .slice(0, 5);

  const W = 500, H = 130, P = 24;
  const accValues = trendData.map(s => s.testHistory[0]?.accuracy || 0);
  const pts = accValues.map((acc, i) => ({
    x: P + (i * (W - P * 2)) / Math.max(1, accValues.length - 1),
    y: H - P - (acc * (H - P * 2)) / 100,
    acc,
    name: s => trendData[i].name.split(' ')[0],
  }));
  const path = pts.reduce((s, p, i) => i === 0 ? `M${p.x},${p.y}` : `${s} L${p.x},${p.y}`, '');
  const area = pts.length > 1 ? `${path} L${pts[pts.length-1].x},${H-P} L${pts[0].x},${H-P} Z` : '';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

      {/* KPI strip */}
      <div className="lg:col-span-3 grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Pill icon="👥" label="Total Students"    value={totalStudents}         color="#00A5DC" />
        <Pill icon="🎯" label="Class Accuracy"    value={`${avgAccuracy}%`}     color="#34D399" />
        <Pill icon="⚡" label="Total XP Earned"   value={`${totalXP} XP`}       color="#FFD700" />
        <Pill icon="⚠️" label="Need Attention"    value={`${struggling} kids`}  color="#F87171" />
      </div>

      {/* Top Performers */}
      <Card borderColor="rgba(255,215,0,0.2)" className="lg:col-span-1">
        <h3 className="font-black text-white text-base mb-4 flex items-center gap-2">
          <Award className="w-5 h-5" style={{ color: '#FFD700' }} /> Top Performers
        </h3>
        <div className="flex flex-col gap-2">
          {[...students].sort((a,b) => b.accuracy - a.accuracy).slice(0,5).map((s, i) => (
            <div key={s.id} className="flex items-center gap-3 rounded-xl px-3 py-2.5"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <span className="text-lg font-black w-6 text-center"
                style={{ color: i === 0 ? '#FFD700' : i === 1 ? '#CBD5E1' : i === 2 ? '#CD7F32' : 'rgba(255,255,255,0.3)' }}>
                {i + 1}
              </span>
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-base font-black shrink-0"
                style={{ background: `${getAccuracyColor(s.accuracy)}22`, border: `2px solid ${getAccuracyColor(s.accuracy)}55` }}>
                {s.name[0]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-black text-white text-sm truncate">{s.name}</p>
                <p className="text-[10px] font-bold" style={{ color: 'rgba(255,255,255,0.35)' }}>Lv.{levelOf(s.score)} · {s.stars}⭐</p>
              </div>
              <span className="text-sm font-black" style={{ color: getAccuracyColor(s.accuracy) }}>{s.accuracy}%</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Chart */}
      <Card borderColor="rgba(0,165,220,0.2)" className="lg:col-span-2">
        <h3 className="font-black text-white text-base mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5" style={{ color: '#00A5DC' }} /> Last Test Accuracy by Student
        </h3>
        {pts.length > 0 ? (
          <div className="rounded-2xl p-3" style={{ background: 'rgba(0,165,220,0.05)', border: '1px solid rgba(0,165,220,0.15)' }}>
            <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
              <defs>
                <linearGradient id="teachAreaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#00A5DC" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#00A5DC" stopOpacity="0.02" />
                </linearGradient>
              </defs>
              <line x1={P} y1={P} x2={W-P} y2={P} stroke="rgba(255,255,255,0.06)" strokeDasharray="4 4" />
              <line x1={P} y1={H/2} x2={W-P} y2={H/2} stroke="rgba(255,255,255,0.06)" strokeDasharray="4 4" />
              <line x1={P} y1={H-P} x2={W-P} y2={H-P} stroke="rgba(255,255,255,0.1)" strokeWidth="1.5" />
              {pts.length > 1 && <path d={area} fill="url(#teachAreaGrad)" />}
              {pts.length > 1 && <path d={path} fill="none" stroke="#00A5DC" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />}
              {pts.map((p, i) => (
                <g key={i}>
                  <circle cx={p.x} cy={p.y} r="6" fill={getAccuracyColor(accValues[i])} stroke="#0a0e2e" strokeWidth="2" />
                  <text x={p.x} y={p.y - 12} textAnchor="middle" fontSize="9" fontWeight="900" fill="rgba(255,255,255,0.7)">{accValues[i]}%</text>
                  <text x={p.x} y={H - 4} textAnchor="middle" fontSize="9" fill="rgba(255,255,255,0.4)">{trendData[i].name.split(' ')[0]}</text>
                </g>
              ))}
            </svg>
          </div>
        ) : (
          <div className="h-32 flex items-center justify-center" style={{ color: 'rgba(255,255,255,0.3)' }}>No data yet</div>
        )}
      </Card>

      {/* Recent Activity */}
      <Card borderColor="rgba(255,78,142,0.2)" className="lg:col-span-3">
        <h3 className="font-black text-white text-base mb-4 flex items-center gap-2">
          <Zap className="w-5 h-5" style={{ color: '#FF4E8E' }} /> Recent Activity Feed
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                {['Student', 'Date', 'Grade', 'Accuracy', 'Status'].map(h => (
                  <th key={h} className="pb-3 text-[10px] font-black uppercase tracking-widest pr-4"
                    style={{ color: 'rgba(255,255,255,0.35)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {students.flatMap(s => s.testHistory.map(t => ({ ...t, studentName: s.name, studentId: s.id })))
                .sort((a, b) => new Date(b.date) - new Date(a.date))
                .slice(0, 8)
                .map((t, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td className="py-3 pr-4 font-black text-sm text-white">{t.studentName}</td>
                    <td className="py-3 pr-4 text-sm font-bold" style={{ color: 'rgba(255,255,255,0.5)' }}>{t.date}</td>
                    <td className="py-3 pr-4">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black"
                        style={{ background: 'rgba(255,78,142,0.15)', border: '1px solid rgba(255,78,142,0.3)', color: '#FF9EBA' }}>
                        {t.grade}
                      </span>
                    </td>
                    <td className="py-3 pr-4 font-black text-sm" style={{ color: getAccuracyColor(t.accuracy) }}>{t.accuracy}%</td>
                    <td className="py-3 text-sm font-black" style={{ color: getAccuracyColor(t.accuracy) }}>
                      {getAccuracyLabel(t.accuracy)}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════ */
/* Students Tab                                                */
/* ═══════════════════════════════════════════════════════════ */
const StudentsTab = ({ students }) => {
  const [filter, setFilter]     = useState('all');
  const [search, setSearch]     = useState('');
  const [expanded, setExpanded] = useState(null);

  const filtered = students
    .filter(s => filter === 'all' || (filter === 'struggling' && s.accuracy < 60) || (filter === 'excelling' && s.accuracy >= 80))
    .filter(s => s.name.toLowerCase().includes(search.toLowerCase()));

  const exportData = () => {
    const blob = new Blob([JSON.stringify(students, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'writespeak_class_report.json'; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="flex items-center gap-2 rounded-xl px-3 py-2 flex-1 min-w-[180px]"
          style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)' }}>
          <Search className="w-4 h-4 shrink-0" style={{ color: 'rgba(255,255,255,0.35)' }} />
          <input id="student-search" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search student..." className="bg-transparent outline-none text-sm font-bold w-full"
            style={{ color: 'rgba(255,255,255,0.8)', caretColor: '#00A5DC' }} />
        </div>
        {/* Filter pills */}
        {[['all','All Students','#00A5DC'],['excelling','Excelling ≥80%','#34D399'],['struggling','Needs Help <60%','#F87171']].map(([id, label, col]) => (
          <button key={id} id={`filter-${id}`} onClick={() => setFilter(id)}
            className="px-4 py-2 rounded-xl text-xs font-black transition-all"
            style={filter === id
              ? { background: `${col}22`, border: `1px solid ${col}66`, color: col }
              : { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.45)' }}>
            {label}
          </button>
        ))}
        {/* Export */}
        <button id="export-btn" onClick={exportData}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all ml-auto"
          style={{ background: 'rgba(255,215,0,0.1)', border: '1px solid rgba(255,215,0,0.3)', color: '#FFD700' }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,215,0,0.2)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,215,0,0.1)'}>
          <Download className="w-4 h-4" /> Export JSON
        </button>
      </div>

      {/* Student Cards */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 font-bold" style={{ color: 'rgba(255,255,255,0.3)' }}>No students match this filter.</div>
      ) : (
        filtered.map(s => {
          const isOpen = expanded === s.id;
          const accColor = getAccuracyColor(s.accuracy);
          return (
            <Card key={s.id} borderColor={`${accColor}33`}>
              {/* Header row */}
              <button id={`student-card-${s.id}`} className="w-full flex items-center gap-4 text-left" onClick={() => setExpanded(isOpen ? null : s.id)}>
                {/* Avatar */}
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl font-black shrink-0"
                  style={{ background: `${accColor}18`, border: `2px solid ${accColor}44` }}>
                  {s.name[0]}
                </div>
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-black text-white text-base">{s.name}</p>
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full"
                      style={{ background: `${accColor}18`, border: `1px solid ${accColor}44`, color: accColor }}>
                      {getAccuracyLabel(s.accuracy)}
                    </span>
                  </div>
                  <div className="flex gap-4 mt-0.5 text-xs font-bold" style={{ color: 'rgba(255,255,255,0.45)' }}>
                    <span>Lv.{levelOf(s.score)}</span>
                    <span>⚡ {s.score} XP</span>
                    <span>⭐ {s.stars}</span>
                    <span>🔥 {s.streak}d</span>
                  </div>
                </div>
                {/* Accuracy ring */}
                <div className="shrink-0 text-center">
                  <p className="font-black text-2xl" style={{ color: accColor }}>{s.accuracy}%</p>
                  <p className="text-[9px] font-black uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.3)' }}>Accuracy</p>
                </div>
                {/* Expand chevron */}
                <div className="shrink-0 ml-2" style={{ color: 'rgba(255,255,255,0.35)' }}>
                  {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </div>
              </button>

              {/* Expanded detail */}
              {isOpen && (
                <div className="mt-5 pt-5 flex flex-col gap-4" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                  {/* Progress bars */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <div className="flex justify-between text-xs font-black mb-1.5" style={{ color: 'rgba(255,255,255,0.5)' }}>
                        <span>Alphabets Mastered</span>
                        <span style={{ color: '#FF4E8E' }}>{s.alphabetsDone.length}/26</span>
                      </div>
                      <div className="w-full h-2.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
                        <div className="h-full rounded-full" style={{ width: `${Math.round(s.alphabetsDone.length/26*100)}%`, background: '#FF4E8E', boxShadow: '0 0 10px #FF4E8E88' }} />
                      </div>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {ALPHABETS.map(ch => (
                          <span key={ch} className="text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-md"
                            style={s.alphabetsDone.includes(ch)
                              ? { background: 'rgba(255,78,142,0.2)', color: '#FF9EBA' }
                              : { background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.18)' }}>
                            {ch}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs font-black mb-1.5" style={{ color: 'rgba(255,255,255,0.5)' }}>
                        <span>Numbers Mastered</span>
                        <span style={{ color: '#00A5DC' }}>{s.numbersDone.length}/10</span>
                      </div>
                      <div className="w-full h-2.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
                        <div className="h-full rounded-full" style={{ width: `${Math.round(s.numbersDone.length/10*100)}%`, background: '#00A5DC', boxShadow: '0 0 10px #00A5DC88' }} />
                      </div>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {NUMBERS.map(ch => (
                          <span key={ch} className="text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-md"
                            style={s.numbersDone.includes(ch)
                              ? { background: 'rgba(0,165,220,0.2)', color: '#7DD3F7' }
                              : { background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.18)' }}>
                            {ch}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Test history mini-table */}
                  {s.testHistory.length > 0 && (
                    <div>
                      <p className="text-xs font-black uppercase tracking-widest mb-2" style={{ color: 'rgba(255,255,255,0.3)' }}>Test History</p>
                      <table className="w-full text-left">
                        <thead>
                          <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                            {['Date', 'Grade', 'Accuracy'].map(h => (
                              <th key={h} className="pb-2 text-[9px] font-black uppercase tracking-widest pr-4" style={{ color: 'rgba(255,255,255,0.3)' }}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {s.testHistory.map((t, i) => (
                            <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                              <td className="py-2 pr-4 text-xs font-bold" style={{ color: 'rgba(255,255,255,0.5)' }}>{t.date}</td>
                              <td className="py-2 pr-4">
                                <span className="text-xs font-black px-2 py-0.5 rounded-full"
                                  style={{ background: 'rgba(255,78,142,0.12)', border: '1px solid rgba(255,78,142,0.25)', color: '#FF9EBA' }}>
                                  {t.grade}
                                </span>
                              </td>
                              <td className="py-2 text-xs font-black" style={{ color: getAccuracyColor(t.accuracy) }}>{t.accuracy}%</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </Card>
          );
        })
      )}
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════ */
/* Test Control Tab                                            */
/* ═══════════════════════════════════════════════════════════ */
const TestControlTab = ({ config, setConfig, onSave, saved }) => {
  const [preview, setPreview] = useState(false);

  const toggleType = (type) => setConfig(c => ({ ...c, testType: type }));

  const previewQ = () => {
    const pool = config.testType === 'ALPHABET' ? config.enabledAlphabets
               : config.testType === 'NUMBER'   ? config.enabledNumbers
               : [...config.enabledAlphabets, ...config.enabledNumbers];
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.min(config.questionCount, pool.length));
  };
  const previewQueue = previewQ();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

      {/* Config Form */}
      <div className="lg:col-span-2 flex flex-col gap-4">

        {/* Test type selector */}
        <Card borderColor="rgba(0,165,220,0.25)">
          <h3 className="font-black text-white text-base mb-4 flex items-center gap-2">
            <ClipboardList className="w-5 h-5" style={{ color: '#00A5DC' }} /> Test Type
          </h3>
          <div className="grid grid-cols-3 gap-3">
            {[['ALPHABET','🔤','#FF4E8E'],['NUMBER','🔢','#00A5DC'],['MIXED','🌀','#FFD700']].map(([type, emoji, col]) => (
              <button key={type} id={`test-type-${type.toLowerCase()}`}
                onClick={() => toggleType(type)}
                className="py-3.5 rounded-2xl font-black text-sm transition-all"
                style={config.testType === type
                  ? { background: `${col}22`, border: `2px solid ${col}66`, color: col, boxShadow: `0 0 20px ${col}33` }
                  : { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.45)' }}>
                {emoji} {type}
              </button>
            ))}
          </div>
        </Card>

        {/* Sliders */}
        <Card borderColor="rgba(52,211,153,0.2)">
          <h3 className="font-black text-white text-base mb-5 flex items-center gap-2">
            <Settings className="w-5 h-5" style={{ color: '#34D399' }} /> Test Parameters
          </h3>
          <div className="flex flex-col gap-6">
            <Slider id="q-count"    label="Number of Questions"    min={3}  max={15} value={config.questionCount}     onChange={v => setConfig(c => ({...c, questionCount: v}))}     unit=" Q"  color="#34D399" />
            <Slider id="q-time"     label="Time Per Question (sec)" min={15} max={60} value={config.timePerQuestion}   onChange={v => setConfig(c => ({...c, timePerQuestion: v}))}   unit="s"   color="#00A5DC" />
            <Slider id="q-passing"  label="Passing Threshold"       min={40} max={100} value={config.passingThreshold} onChange={v => setConfig(c => ({...c, passingThreshold: v}))} unit="%"   color="#FFD700" />
          </div>
        </Card>

        {/* Difficulty preset */}
        <Card borderColor="rgba(124,58,237,0.25)">
          <h3 className="font-black text-white text-base mb-4 flex items-center gap-2">
            <Star className="w-5 h-5" style={{ color: '#A78BFA' }} /> Difficulty Preset
          </h3>
          <div className="grid grid-cols-3 gap-3">
            {[['Beginner','🌱','#34D399',10,20,50],['Intermediate','⚡','#FFD700',5,30,60],['Advanced','🔥','#F87171',3,45,80]].map(([diff,emoji,col,qc,tpq,pt]) => (
              <button key={diff} id={`diff-${diff.toLowerCase()}`}
                onClick={() => setConfig(c => ({ ...c, difficulty: diff, questionCount: qc, timePerQuestion: tpq, passingThreshold: pt }))}
                className="py-3 rounded-2xl font-black text-sm transition-all"
                style={config.difficulty === diff
                  ? { background: `${col}18`, border: `2px solid ${col}55`, color: col }
                  : { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.4)' }}>
                {emoji} {diff}
              </button>
            ))}
          </div>
        </Card>

        {/* Lock toggle + save */}
        <Card borderColor={config.testLocked ? 'rgba(241,97,97,0.35)' : 'rgba(52,211,153,0.2)'}>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              {config.testLocked
                ? <Lock className="w-5 h-5" style={{ color: '#F87171' }} />
                : <Unlock className="w-5 h-5" style={{ color: '#34D399' }} />}
              <div>
                <p className="font-black text-white text-sm">Test Mode Access</p>
                <p className="text-xs font-bold" style={{ color: 'rgba(255,255,255,0.4)' }}>
                  {config.testLocked ? '🔒 Students cannot take tests right now' : '✅ Students can access the test mode'}
                </p>
              </div>
            </div>
            <button id="lock-toggle-btn"
              onClick={() => setConfig(c => ({ ...c, testLocked: !c.testLocked }))}
              className="flex items-center gap-2 px-4 py-2 rounded-xl font-black text-sm transition-all"
              style={config.testLocked
                ? { background: 'rgba(241,97,97,0.2)', border: '1px solid rgba(241,97,97,0.5)', color: '#F87171' }
                : { background: 'rgba(52,211,153,0.15)', border: '1px solid rgba(52,211,153,0.4)', color: '#34D399' }}>
              {config.testLocked ? <><Lock className="w-4 h-4"/>Locked</> : <><Unlock className="w-4 h-4"/>Unlocked</>}
            </button>
          </div>
        </Card>

        {/* Save & Reset row */}
        <div className="flex gap-3">
          <button id="save-config-btn" onClick={onSave}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl font-black text-sm transition-all"
            style={{ background: 'linear-gradient(135deg,#00A5DC,#0072B3)', boxShadow: '0 8px 24px rgba(0,165,220,0.35)', color: '#fff' }}
            onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
            {saved ? <><CheckCircle className="w-4 h-4"/>Saved!</> : <><Save className="w-4 h-4"/>Save Configuration</>}
          </button>
          <button id="reset-config-btn"
            onClick={() => setConfig({ ...DEFAULT_CONFIG })}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl font-black text-sm transition-all"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.5)' }}
            onMouseEnter={e => e.currentTarget.style.color = '#fff'}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.5)'}>
            <RefreshCw className="w-4 h-4" /> Reset
          </button>
        </div>
      </div>

      {/* Preview Sidebar */}
      <div className="lg:col-span-1 flex flex-col gap-4">
        <Card borderColor="rgba(255,215,0,0.2)">
          <h3 className="font-black text-white text-base mb-4 flex items-center gap-2">
            <Eye className="w-5 h-5" style={{ color: '#FFD700' }} /> Config Summary
          </h3>
          <div className="flex flex-col gap-2.5 text-sm">
            {[
              ['Test Type', config.testType, '#00A5DC'],
              ['Questions', `${config.questionCount} Q`, '#34D399'],
              ['Time/Q', `${config.timePerQuestion}s`, '#A78BFA'],
              ['Pass Score', `${config.passingThreshold}%`, '#FFD700'],
              ['Difficulty', config.difficulty, '#FF4E8E'],
              ['Status', config.testLocked ? '🔒 Locked' : '✅ Open', config.testLocked ? '#F87171' : '#34D399'],
            ].map(([key, val, col]) => (
              <div key={key} className="flex justify-between items-center py-2 px-3 rounded-xl"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <span className="font-bold" style={{ color: 'rgba(255,255,255,0.45)' }}>{key}</span>
                <span className="font-black" style={{ color: col }}>{val}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card borderColor="rgba(255,78,142,0.2)">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-black text-white text-base flex items-center gap-2">
              <Eye className="w-5 h-5" style={{ color: '#FF4E8E' }} /> Test Preview
            </h3>
            <button id="refresh-preview-btn" onClick={() => setPreview(v => !v)}
              className="p-1.5 rounded-lg transition-all"
              style={{ background: 'rgba(255,78,142,0.1)', border: '1px solid rgba(255,78,142,0.3)' }}>
              <RefreshCw className="w-3.5 h-3.5" style={{ color: '#FF9EBA' }} />
            </button>
          </div>
          <p className="text-xs font-bold mb-3" style={{ color: 'rgba(255,255,255,0.35)' }}>
            Sample question order students would see:
          </p>
          <div className="flex flex-wrap gap-2">
            {previewQueue.map((ch, i) => (
              <div key={i} className="flex flex-col items-center gap-0.5">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-base"
                  style={{ background: 'rgba(0,165,220,0.12)', border: '1px solid rgba(0,165,220,0.3)', color: '#7DD3F7' }}>
                  {ch}
                </div>
                <span className="text-[9px] font-bold" style={{ color: 'rgba(255,255,255,0.25)' }}>Q{i+1}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════ */
/* Curriculum Tab                                              */
/* ═══════════════════════════════════════════════════════════ */
const CurriculumTab = ({ config, setConfig, onSave, saved }) => {
  const toggleChar = (pool, ch) => {
    const current = config[pool];
    const next = current.includes(ch) ? current.filter(c => c !== ch) : [...current, ch];
    setConfig(c => ({ ...c, [pool]: next }));
  };

  const setDifficulty = (diff) => {
    if (diff === 'Beginner')     setConfig(c => ({ ...c, difficulty: diff, enabledAlphabets: ALPHABETS.slice(0,13), enabledNumbers: NUMBERS.slice(0,5) }));
    if (diff === 'Intermediate') setConfig(c => ({ ...c, difficulty: diff, enabledAlphabets: [...ALPHABETS], enabledNumbers: NUMBERS.slice(0,8) }));
    if (diff === 'Advanced')     setConfig(c => ({ ...c, difficulty: diff, enabledAlphabets: [...ALPHABETS], enabledNumbers: [...NUMBERS] }));
  };

  const enableAll  = (pool, chars) => setConfig(c => ({ ...c, [pool]: [...chars] }));
  const disableAll = (pool)         => setConfig(c => ({ ...c, [pool]: [] }));

  return (
    <div className="flex flex-col gap-4">

      {/* Difficulty quick select */}
      <Card borderColor="rgba(124,58,237,0.3)">
        <h3 className="font-black text-white text-base mb-4 flex items-center gap-2">
          <Star className="w-5 h-5" style={{ color: '#A78BFA' }} /> Teaching Unit / Difficulty
        </h3>
        <div className="grid grid-cols-3 gap-3">
          {[
            ['Beginner','🌱','#34D399','A–M + 0–4'],
            ['Intermediate','⚡','#FFD700','A–Z + 0–7'],
            ['Advanced','🔥','#F87171','A–Z + 0–9'],
          ].map(([diff,emoji,col,desc]) => (
            <button key={diff} id={`curr-diff-${diff.toLowerCase()}`} onClick={() => setDifficulty(diff)}
              className="py-4 rounded-2xl font-black text-sm flex flex-col items-center gap-1 transition-all"
              style={config.difficulty === diff
                ? { background: `${col}18`, border: `2px solid ${col}55`, color: col, boxShadow: `0 0 16px ${col}22` }
                : { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.4)' }}>
              <span className="text-2xl">{emoji}</span>
              <span>{diff}</span>
              <span className="text-[10px] font-bold opacity-70">{desc}</span>
            </button>
          ))}
        </div>
      </Card>

      {/* Alphabet grid */}
      <Card borderColor="rgba(255,78,142,0.25)">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-black text-white text-base flex items-center gap-2">
            <BookOpen className="w-5 h-5" style={{ color: '#FF4E8E' }} /> Alphabet Curriculum
            <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: 'rgba(255,78,142,0.15)', color: '#FF9EBA' }}>
              {config.enabledAlphabets.length}/26 active
            </span>
          </h3>
          <div className="flex gap-2">
            <button id="alpha-enable-all" onClick={() => enableAll('enabledAlphabets', ALPHABETS)}
              className="text-[10px] font-black px-2.5 py-1 rounded-lg transition-all"
              style={{ background: 'rgba(52,211,153,0.15)', border: '1px solid rgba(52,211,153,0.4)', color: '#34D399' }}>
              All On
            </button>
            <button id="alpha-disable-all" onClick={() => disableAll('enabledAlphabets')}
              className="text-[10px] font-black px-2.5 py-1 rounded-lg transition-all"
              style={{ background: 'rgba(241,97,97,0.12)', border: '1px solid rgba(241,97,97,0.4)', color: '#F87171' }}>
              All Off
            </button>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {ALPHABETS.map(ch => (
            <CharBtn key={ch} char={ch} active={config.enabledAlphabets.includes(ch)} onClick={ch => toggleChar('enabledAlphabets', ch)} />
          ))}
        </div>
        <p className="mt-3 text-[10px] font-bold" style={{ color: 'rgba(255,255,255,0.28)' }}>
          Disabled letters will not appear in tests or learning mode suggestions.
        </p>
      </Card>

      {/* Numbers grid */}
      <Card borderColor="rgba(0,165,220,0.25)">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-black text-white text-base flex items-center gap-2">
            <Target className="w-5 h-5" style={{ color: '#00A5DC' }} /> Number Curriculum
            <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: 'rgba(0,165,220,0.15)', color: '#7DD3F7' }}>
              {config.enabledNumbers.length}/10 active
            </span>
          </h3>
          <div className="flex gap-2">
            <button id="num-enable-all" onClick={() => enableAll('enabledNumbers', NUMBERS)}
              className="text-[10px] font-black px-2.5 py-1 rounded-lg transition-all"
              style={{ background: 'rgba(52,211,153,0.15)', border: '1px solid rgba(52,211,153,0.4)', color: '#34D399' }}>
              All On
            </button>
            <button id="num-disable-all" onClick={() => disableAll('enabledNumbers')}
              className="text-[10px] font-black px-2.5 py-1 rounded-lg transition-all"
              style={{ background: 'rgba(241,97,97,0.12)', border: '1px solid rgba(241,97,97,0.4)', color: '#F87171' }}>
              All Off
            </button>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {NUMBERS.map(ch => (
            <CharBtn key={ch} char={ch} active={config.enabledNumbers.includes(ch)} onClick={ch => toggleChar('enabledNumbers', ch)} />
          ))}
        </div>
      </Card>

      {/* Save */}
      <button id="save-curriculum-btn" onClick={onSave}
        className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-black text-sm transition-all"
        style={{ background: 'linear-gradient(135deg,#FF4E8E,#C70053)', boxShadow: '0 8px 24px rgba(255,78,142,0.35)', color: '#fff' }}>
        {saved ? <><CheckCircle className="w-4 h-4"/>Curriculum Saved!</> : <><Save className="w-4 h-4"/>Save Curriculum Settings</>}
      </button>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════ */
/* Main TeacherDashboard Component                             */
/* ═══════════════════════════════════════════════════════════ */
const TeacherDashboard = () => {
  const navigate  = useNavigate();
  const { authFetch } = useAuth();

  const [activeTab, setActiveTab] = useState('overview');
  const [students,  setStudents]  = useState(MOCK_STUDENTS);
  const [loading,   setLoading]   = useState(false);
  const [show,      setShow]      = useState(false);
  const [config,    setConfig]    = useState(loadConfig);
  const [saved,     setSaved]     = useState(false);

  /* Animate in */
  useEffect(() => { setTimeout(() => setShow(true), 80); }, []);

  /* Try to fetch real student data */
  useEffect(() => {
    const fetchStudents = async () => {
      setLoading(true);
      try {
        const res = await authFetch('http://localhost:8080/api/admin/students');
        if (res.ok) {
          const data = await res.json();
          if (data && data.length > 0) setStudents(data);
        }
      } catch { /* backend offline — keep mock */ }
      finally { setLoading(false); }
    };
    fetchStudents();
  }, []);

  /* Save config */
  const handleSave = useCallback(() => {
    localStorage.setItem('ws_teacher_config', JSON.stringify(config));
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }, [config]);

  const TABS = [
    { id: 'overview',    icon: <BarChart2 className="w-4 h-4" />,     label: 'Overview'     },
    { id: 'students',    icon: <Users className="w-4 h-4" />,          label: 'Students'     },
    { id: 'test',        icon: <ClipboardList className="w-4 h-4" />,  label: 'Test Control' },
    { id: 'curriculum',  icon: <BookOpen className="w-4 h-4" />,       label: 'Curriculum'   },
  ];

  return (
    <div className="relative w-screen h-screen flex flex-col overflow-hidden select-none"
      style={{ background: 'linear-gradient(135deg,#0a0e2e 0%,#0d1b4b 40%,#0a2060 70%,#061830 100%)' }}>

      <style>{`
        @keyframes twinkleT { 0%,100%{opacity:.1;transform:scale(1)} 50%{opacity:.75;transform:scale(1.5)} }
        @keyframes fadeUpT  { from{opacity:0;transform:translateY(22px)} to{opacity:1;transform:translateY(0)} }
        @keyframes shimmerT {
          0%{background-position:-200% center} 100%{background-position:200% center}
        }
        .fade-up-t { animation: fadeUpT .55s ease forwards; }
        .shimmer-teal {
          background: linear-gradient(90deg,#00A5DC 0%,#7DD3F7 40%,#00A5DC 60%,#34D399 100%);
          background-size:200% auto; -webkit-background-clip:text; -webkit-text-fill-color:transparent;
          background-clip:text; animation: shimmerT 3s linear infinite;
        }
        .scroll-t::-webkit-scrollbar { width:5px; }
        .scroll-t::-webkit-scrollbar-track { background:rgba(255,255,255,0.04); }
        .scroll-t::-webkit-scrollbar-thumb { background:rgba(0,165,220,0.3); border-radius:99px; }
        input[type=range]::-webkit-slider-thumb { -webkit-appearance:none; width:16px; height:16px; border-radius:50%; cursor:pointer; }
      `}</style>

      {/* Stars */}
      {STARS.map(s => (
        <div key={s.id} className="absolute rounded-full bg-white pointer-events-none"
          style={{ width: s.s, height: s.s, top: `${s.t}%`, left: `${s.l}%`, opacity: s.o,
            animation: `twinkleT ${s.d}s ${s.dl}s ease-in-out infinite` }} />
      ))}

      {/* Glow orbs */}
      <div className="absolute pointer-events-none" style={{ width: 600, height: 220, top: -70, left: '50%', transform: 'translateX(-50%)',
        background: 'radial-gradient(ellipse,rgba(0,165,220,0.12) 0%,transparent 70%)', filter: 'blur(40px)' }} />
      <div className="absolute pointer-events-none" style={{ width: 350, height: 350, bottom: -80, right: -80,
        background: 'radial-gradient(circle,rgba(255,78,142,0.07) 0%,transparent 70%)', filter: 'blur(50px)' }} />

      {/* ── HEADER ── */}
      <div className="relative z-20 flex items-center justify-between px-6 py-4"
        style={{ background: 'rgba(8,18,55,0.8)', borderBottom: '1px solid rgba(0,165,220,0.2)', backdropFilter: 'blur(20px)' }}>

        <button id="teacher-back-btn" onClick={() => navigate('/mode-selection')}
          className="flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-all"
          style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.7)' }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.13)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.07)'}>
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        <div className="flex flex-col items-center">
          <h1 className="font-black text-xl flex items-center gap-2">
            <span className="shimmer-teal">Teacher</span>
            <span className="text-white">Dashboard</span>
            <span style={{ color: '#00A5DC' }}>✦</span>
          </h1>
          <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: 'rgba(0,165,220,0.6)' }}>
            WriteSpeak AI · Educator Control Panel
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 rounded-xl text-xs font-black"
            style={{ background: 'rgba(52,211,153,0.12)', border: '1px solid rgba(52,211,153,0.3)', color: '#34D399' }}>
            🎓 Teacher View
          </div>
          {config.testLocked && (
            <div className="px-3 py-1.5 rounded-xl text-xs font-black"
              style={{ background: 'rgba(241,97,97,0.15)', border: '1px solid rgba(241,97,97,0.4)', color: '#F87171' }}>
              🔒 Tests Locked
            </div>
          )}
        </div>
      </div>

      {/* ── TAB BAR ── */}
      <div className="relative z-20 flex items-center gap-3 px-6 py-3 overflow-x-auto"
        style={{ background: 'rgba(8,18,55,0.6)', borderBottom: '1px solid rgba(255,255,255,0.07)', backdropFilter: 'blur(12px)' }}>
        {TABS.map(t => (
          <Tab key={t.id} id={t.id} icon={t.icon} label={t.label} active={activeTab === t.id} onClick={setActiveTab} />
        ))}
      </div>

      {/* ── BODY ── */}
      <div className="relative z-10 flex-1 overflow-y-auto scroll-t p-5">
        <div className={`max-w-6xl mx-auto ${show ? 'fade-up-t' : 'opacity-0'}`}>

          {activeTab === 'overview'   && <OverviewTab students={students} />}
          {activeTab === 'students'   && <StudentsTab students={students} />}
          {activeTab === 'test'       && <TestControlTab config={config} setConfig={setConfig} onSave={handleSave} saved={saved} />}
          {activeTab === 'curriculum' && <CurriculumTab  config={config} setConfig={setConfig} onSave={handleSave} saved={saved} />}

        </div>
      </div>

      <Copyright variant="dark" position="bottom-center" />
    </div>
  );
};

export default TeacherDashboard;
