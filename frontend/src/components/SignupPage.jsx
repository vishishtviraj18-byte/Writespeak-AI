import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../utils/api';
import Copyright from './Copyright';

const STARS = Array.from({ length: 50 }, (_, i) => ({
  id: i, s: Math.random() * 2.5 + 1,
  t: Math.random() * 100, l: Math.random() * 100,
  o: Math.random() * 0.6 + 0.2,
  d: Math.random() * 3 + 2, dl: Math.random() * 4,
}));

const AVATARS = [
  { val: 'boy',   label: '👦', name: 'Explorer' },
  { val: 'girl',  label: '👧', name: 'Star'     },
  { val: 'other', label: '🦄', name: 'Legend'   },
];

const SignupPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [name,     setName]     = useState('');
  const [age,      setAge]      = useState(8);
  const [gender,   setGender]   = useState('boy');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [step,     setStep]     = useState(1); // 1=info, 2=credentials

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim() || !name.trim()) {
      setError('Please fill in all fields!'); return;
    }
    if (password.length < 4) { setError('Password must be at least 4 characters!'); return; }
    setError(''); setLoading(true);
    try {
      await authApi.register(username.trim(), password, name.trim(), gender, age);
      const data = await authApi.login(username.trim(), password);
      login({ username: data.username, name: data.name, gender: data.gender, age: data.age }, data.token);
      navigate('/mode-selection');
    } catch (err) {
      setError(err.message || 'Username might already be taken!');
    } finally { setLoading(false); }
  };

  const inpBase = `w-full rounded-xl px-4 py-3.5 text-white font-semibold text-base outline-none transition-all duration-200 placeholder-white/30 inp-field`;
  const inpStyle = { background: 'rgba(255,255,255,0.07)', border: '1.5px solid rgba(255,255,255,0.15)' };

  return (
    <div className="relative w-screen h-screen overflow-hidden select-none flex items-center justify-center"
      style={{ background: 'linear-gradient(135deg, #0a0e2e 0%, #0d1b4b 40%, #0a2060 70%, #061830 100%)' }}>

      <style>{`
        @keyframes twinkle { 0%,100%{opacity:.2;transform:scale(1)} 50%{opacity:1;transform:scale(1.4)} }
        @keyframes floatCard { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
        .card-float { animation: floatCard 4s ease-in-out infinite; }
        .inp-field:focus { border-color:#FF4E8E!important; background:rgba(255,78,142,0.08)!important; box-shadow:0 0 0 3px rgba(255,78,142,0.15)!important; }
      `}</style>

      {/* Stars */}
      {STARS.map(s => (
        <div key={s.id} className="absolute rounded-full bg-white pointer-events-none"
          style={{ width:s.s, height:s.s, top:`${s.t}%`, left:`${s.l}%`, opacity:s.o,
            animation:`twinkle ${s.d}s ${s.dl}s ease-in-out infinite` }} />
      ))}

      <div className="absolute rounded-full pointer-events-none"
        style={{ width:500, height:500, top:'50%', left:'50%', transform:'translate(-50%,-50%)',
          background:'radial-gradient(circle, rgba(255,78,142,0.08) 0%, transparent 70%)', filter:'blur(40px)' }} />

      {/* Back */}
      <button onClick={() => navigate('/')}
        className="absolute top-5 left-5 z-30 flex items-center gap-2 px-4 py-2 rounded-full font-bold text-sm text-white/70 hover:text-white transition-all"
        style={{ background:'rgba(255,255,255,0.08)', border:'1px solid rgba(255,255,255,0.15)' }}>
        ← Home
      </button>

      {/* Card */}
      <div className="relative z-10 w-full max-w-md px-5 py-6 overflow-y-auto max-h-screen">
        <div className="card-float rounded-3xl p-7 backdrop-blur-xl"
          style={{
            background: 'rgba(10,20,60,0.7)',
            border: '1px solid rgba(255,78,142,0.3)',
            boxShadow: '0 32px 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.08)',
          }}>

          {/* Header */}
          <div className="text-center mb-6">
            {/* Big avatar selector on top */}
            <div className="flex justify-center gap-3 mb-4">
              {AVATARS.map(a => (
                <button key={a.val} type="button" onClick={() => setGender(a.val)}
                  className="flex flex-col items-center gap-1 px-4 py-3 rounded-2xl transition-all duration-200 cursor-pointer"
                  style={{
                    background: gender === a.val ? 'rgba(255,78,142,0.25)' : 'rgba(255,255,255,0.06)',
                    border: `2px solid ${gender === a.val ? '#FF4E8E' : 'rgba(255,255,255,0.12)'}`,
                    transform: gender === a.val ? 'scale(1.08)' : 'scale(1)',
                    boxShadow: gender === a.val ? '0 0 20px rgba(255,78,142,0.4)' : 'none',
                  }}>
                  <span className="text-3xl">{a.label}</span>
                  <span className="text-xs font-black" style={{ color: gender === a.val ? '#FF4E8E' : 'rgba(255,255,255,0.4)' }}>{a.name}</span>
                </button>
              ))}
            </div>
            <h1 className="text-2xl font-black text-white mb-1" style={{ textShadow:'0 0 20px rgba(255,78,142,0.5)' }}>
              Create Your Explorer!
            </h1>
            <p className="text-white/40 text-sm font-semibold">Join the air writing adventure 🌟</p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-4 px-4 py-3 rounded-xl text-sm font-bold text-red-300"
              style={{ background:'rgba(255,50,50,0.12)', border:'1px solid rgba(255,80,80,0.3)' }}>
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name + Username row */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-white/50 text-xs font-bold uppercase tracking-widest mb-1.5">Your Name</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)}
                  placeholder="e.g. Nobita" disabled={loading}
                  className={inpBase} style={inpStyle} />
              </div>
              <div>
                <label className="block text-white/50 text-xs font-bold uppercase tracking-widest mb-1.5">Username</label>
                <input type="text" value={username} onChange={e => setUsername(e.target.value)}
                  placeholder="e.g. nobita7" disabled={loading}
                  className={inpBase} style={inpStyle} />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-white/50 text-xs font-bold uppercase tracking-widest mb-1.5">Password</label>
              <div className="relative">
                <input type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="Choose a password (min 4 chars)" disabled={loading}
                  className={`${inpBase} pr-12`} style={inpStyle} />
                <button type="button" onClick={() => setShowPass(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/80 text-sm">
                  {showPass ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            {/* Age slider */}
            <div>
              <label className="block text-white/50 text-xs font-bold uppercase tracking-widest mb-2">
                Age: <span className="text-pink-400 font-black">{age} years old</span>
              </label>
              <input type="range" min="3" max="16" value={age}
                onChange={e => setAge(parseInt(e.target.value))} disabled={loading}
                className="w-full h-2 rounded-lg cursor-pointer"
                style={{ accentColor: '#FF4E8E' }} />
              <div className="flex justify-between text-xs text-white/30 font-bold mt-1">
                <span>3</span><span>16</span>
              </div>
            </div>

            {/* Submit */}
            <button type="submit" disabled={loading}
              className="w-full py-4 rounded-xl font-black text-white text-base mt-1 transition-all duration-200 active:scale-95 cursor-pointer"
              style={{
                background: loading ? 'rgba(255,78,142,0.4)' : 'linear-gradient(135deg,#FF4E8E,#C70053)',
                boxShadow: '0 8px 32px rgba(255,78,142,0.4), 0 2px 0 rgba(120,0,50,0.6)',
                border:'1px solid rgba(255,255,255,0.15)',
              }}>
              {loading ? '⏳ Creating…' : '🎁 Create Adventurer!'}
            </button>
          </form>

          <p className="text-center text-white/40 text-sm font-semibold mt-5">
            Already have account?{' '}
            <Link to="/login" className="text-sky-400 font-black hover:text-sky-300 transition-colors">
              Log In →
            </Link>
          </p>
        </div>
      </div>

      <Copyright variant="dark" position="bottom-center" />
    </div>
  );
};

export default SignupPage;
