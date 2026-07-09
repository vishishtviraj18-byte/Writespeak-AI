import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../utils/api';
import Copyright from './Copyright';

/* ── Twinkling star ─────────────────────────────────────────── */
const STARS = Array.from({ length: 50 }, (_, i) => ({
  id: i, s: Math.random() * 2.5 + 1,
  t: Math.random() * 100, l: Math.random() * 100,
  o: Math.random() * 0.6 + 0.2,
  d: Math.random() * 3 + 2, dl: Math.random() * 4,
}));

/* ── Doraemon small head SVG ────────────────────────────────── */
const DoraHead = () => (
  <svg viewBox="0 0 100 100" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="hg" cx="40%" cy="35%">
        <stop offset="0%" stopColor="#1EC8F5"/><stop offset="100%" stopColor="#0085C3"/>
      </radialGradient>
      <radialGradient id="fg" cx="40%" cy="30%">
        <stop offset="0%" stopColor="#fff"/><stop offset="100%" stopColor="#f0f0f0"/>
      </radialGradient>
    </defs>
    <circle cx="50" cy="52" r="42" fill="url(#hg)" stroke="#005A8E" strokeWidth="2.5"/>
    <ellipse cx="50" cy="62" rx="34" ry="30" fill="url(#fg)" stroke="#005A8E" strokeWidth="2"/>
    <ellipse cx="38" cy="36" rx="10" ry="13" fill="white" stroke="#1E293B" strokeWidth="2"/>
    <ellipse cx="62" cy="36" rx="10" ry="13" fill="white" stroke="#1E293B" strokeWidth="2"/>
    <circle cx="42" cy="38" r="5" fill="#1E293B"/><circle cx="41" cy="36" r="2" fill="white"/>
    <circle cx="66" cy="38" r="5" fill="#1E293B"/><circle cx="65" cy="36" r="2" fill="white"/>
    <circle cx="50" cy="50" r="7" fill="#FF2E93" stroke="#A00025" strokeWidth="1.5"/>
    <circle cx="48" cy="48" r="2.5" fill="rgba(255,255,255,0.6)"/>
    <line x1="50" y1="57" x2="50" y2="74" stroke="#1E293B" strokeWidth="2" strokeLinecap="round"/>
    <path d="M 32 66 Q 50 82 68 66" fill="none" stroke="#1E293B" strokeWidth="2" strokeLinecap="round"/>
    <line x1="30" y1="51" x2="14" y2="48" stroke="#555" strokeWidth="1.5" strokeLinecap="round"/>
    <line x1="30" y1="57" x2="12" y2="57" stroke="#555" strokeWidth="1.5" strokeLinecap="round"/>
    <line x1="70" y1="51" x2="86" y2="48" stroke="#555" strokeWidth="1.5" strokeLinecap="round"/>
    <line x1="70" y1="57" x2="88" y2="57" stroke="#555" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M 28 86 Q 50 95 72 86" fill="none" stroke="#E8003D" strokeWidth="7" strokeLinecap="round"/>
    <circle cx="50" cy="92" r="7" fill="#FFD166" stroke="#B8860B" strokeWidth="1.5"/>
  </svg>
);

/* ════════════════════════════════════════════════════════════════ */
const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [username, setUsername]   = useState('');
  const [password, setPassword]   = useState('');
  const [error, setError]         = useState('');
  const [loading, setLoading]     = useState(false);
  const [showPass, setShowPass]   = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) { setError('Please fill in all fields!'); return; }
    setError(''); setLoading(true);
    try {
      const data = await authApi.login(username.trim(), password);
      login({ username: data.username, name: data.name, gender: data.gender, age: data.age }, data.token);
      navigate('/mode-selection');
    } catch (err) {
      setError(err.message || 'Wrong username or password!');
    } finally { setLoading(false); }
  };

  const handleGuest = async () => {
    setError(''); setLoading(true);
    try {
      // Try login guest first, if not found register then login
      let data;
      try { data = await authApi.login('guest', 'guest123'); }
      catch {
        await authApi.register('guest', 'guest123', 'Guest Explorer', 'other', 8);
        data = await authApi.login('guest', 'guest123');
      }
      login({ username: data.username, name: data.name || 'Guest Explorer', gender: data.gender, age: data.age }, data.token);
      navigate('/mode-selection');
    } catch (err) {
      setError('Guest login failed: ' + (err.message || 'Try again'));
    } finally { setLoading(false); }
  };

  const inp = `w-full rounded-xl px-4 py-3.5 text-white font-semibold text-base outline-none transition-all duration-200 placeholder-white/30`;
  const inpStyle = {
    background: 'rgba(255,255,255,0.07)',
    border: '1.5px solid rgba(255,255,255,0.15)',
  };
  const inpFocus = {
    border: '1.5px solid #00A5DC',
    background: 'rgba(0,165,220,0.1)',
    boxShadow: '0 0 0 3px rgba(0,165,220,0.15)',
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden select-none flex items-center justify-center"
      style={{ background: 'linear-gradient(135deg, #0a0e2e 0%, #0d1b4b 40%, #0a2060 70%, #061830 100%)' }}>

      <style>{`
        @keyframes twinkle { 0%,100%{opacity:.2;transform:scale(1)} 50%{opacity:1;transform:scale(1.4)} }
        @keyframes floatCard { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
        @keyframes shimmerBtn {
          0%{background-position:-200% center} 100%{background-position:200% center}
        }
        .card-float { animation: floatCard 4s ease-in-out infinite; }
        .inp-field:focus { border-color:#00A5DC!important; background:rgba(0,165,220,0.1)!important; box-shadow:0 0 0 3px rgba(0,165,220,0.15)!important; }
      `}</style>

      {/* Stars */}
      {STARS.map(s => (
        <div key={s.id} className="absolute rounded-full bg-white pointer-events-none"
          style={{ width:s.s, height:s.s, top:`${s.t}%`, left:`${s.l}%`, opacity:s.o,
            animation:`twinkle ${s.d}s ${s.dl}s ease-in-out infinite` }} />
      ))}

      {/* Glow orb */}
      <div className="absolute rounded-full pointer-events-none"
        style={{ width:500, height:500, top:'50%', left:'50%', transform:'translate(-50%,-50%)',
          background:'radial-gradient(circle, rgba(0,165,220,0.1) 0%, transparent 70%)', filter:'blur(40px)' }} />

      {/* Back home */}
      <button onClick={() => navigate('/')}
        className="absolute top-5 left-5 z-30 flex items-center gap-2 px-4 py-2 rounded-full font-bold text-sm text-white/70 hover:text-white transition-all"
        style={{ background:'rgba(255,255,255,0.08)', border:'1px solid rgba(255,255,255,0.15)' }}>
        ← Home
      </button>

      {/* Card */}
      <div className="relative z-10 w-full max-w-md px-5">
        <div className="card-float rounded-3xl p-8 backdrop-blur-xl"
          style={{
            background: 'rgba(10,20,60,0.7)',
            border: '1px solid rgba(0,165,220,0.3)',
            boxShadow: '0 32px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05), inset 0 1px 0 rgba(255,255,255,0.1)',
          }}>

          {/* Doraemon avatar */}
          <div className="flex justify-center mb-5">
            <div className="relative">
              <div className="w-20 h-20 rounded-full flex items-center justify-center"
                style={{ background:'linear-gradient(135deg,#00A5DC,#0072B3)', boxShadow:'0 8px 32px rgba(0,165,220,0.6)', padding:4 }}>
                <DoraHead />
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-yellow-400 flex items-center justify-center text-xs font-black border-2 border-slate-900">✦</div>
            </div>
          </div>

          {/* Title */}
          <div className="text-center mb-7">
            <h1 className="text-3xl font-black text-white mb-1" style={{ textShadow:'0 0 20px rgba(0,165,220,0.5)' }}>
              Welcome Back!
            </h1>
            <p className="text-white/50 text-sm font-semibold">Log in to continue your air writing journey ✍️</p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-5 px-4 py-3 rounded-xl text-sm font-bold text-red-300"
              style={{ background:'rgba(255,50,50,0.12)', border:'1px solid rgba(255,80,80,0.3)' }}>
              ⚠️ {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-white/60 text-xs font-bold uppercase tracking-widest mb-2">Username</label>
              <input
                type="text" value={username} onChange={e => setUsername(e.target.value)}
                placeholder="Enter your username…" disabled={loading}
                className={`${inp} inp-field`}
                style={inpStyle}
              />
            </div>

            <div>
              <label className="block text-white/60 text-xs font-bold uppercase tracking-widest mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="Enter your password…" disabled={loading}
                  className={`${inp} inp-field pr-12`}
                  style={inpStyle}
                />
                <button type="button" onClick={() => setShowPass(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/80 text-sm transition-colors">
                  {showPass ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            {/* Login button */}
            <button type="submit" disabled={loading}
              className="w-full py-4 rounded-xl font-black text-white text-base mt-2 transition-all duration-200 active:scale-95 cursor-pointer"
              style={{
                background: loading ? 'rgba(0,165,220,0.4)' : 'linear-gradient(135deg,#00A5DC,#0072B3)',
                boxShadow: '0 8px 32px rgba(0,165,220,0.4), 0 2px 0 rgba(0,50,100,0.6)',
                border:'1px solid rgba(255,255,255,0.15)',
              }}>
              {loading ? '⏳ Checking…' : '🚀 Let\'s Go!'}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px" style={{ background:'rgba(255,255,255,0.1)' }} />
            <span className="text-white/30 text-xs font-bold">OR</span>
            <div className="flex-1 h-px" style={{ background:'rgba(255,255,255,0.1)' }} />
          </div>

          {/* Guest button */}
          <button onClick={handleGuest} disabled={loading}
            className="w-full py-3.5 rounded-xl font-black text-white/80 text-sm transition-all duration-200 active:scale-95 cursor-pointer hover:text-white"
            style={{ background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.12)' }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.12)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}>
            {loading ? '⏳ Entering…' : '👤 Play as Guest'}
          </button>

          {/* Sign up link */}
          <p className="text-center text-white/40 text-sm font-semibold mt-5">
            New explorer?{' '}
            <Link to="/signup" className="text-sky-400 font-black hover:text-sky-300 transition-colors">
              Create Account →
            </Link>
          </p>
        </div>
      </div>

      <Copyright variant="dark" position="bottom-center" />
    </div>
  );
};

export default LoginPage;
