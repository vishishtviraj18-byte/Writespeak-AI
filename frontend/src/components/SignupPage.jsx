import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import gsap from 'gsap';
import { useAuth } from '../context/AuthContext';

const COLORS = ['#FF5E7E', '#38E4B7', '#FFD166', '#a29bfe', '#00cec9', '#fd79a8', '#e17055', '#74b9ff'];

const SignupPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({
    name: '', gender: 'male', age: '', username: '', password: '', confirmPassword: '',
    favoriteColor: COLORS[0],
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const cardRef = useRef(null);

  useEffect(() => {
    gsap.fromTo(cardRef.current, { y: 60, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, ease: 'back.out(1.7)' });
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirmPassword) return setError("Passwords don't match!");
    if (form.password.length < 4) return setError('Password must be at least 4 characters');
    if (!form.name.trim()) return setError('Please enter your name');
    if (!form.age || form.age < 2 || form.age > 15) return setError('Please enter a valid age (2–15)');

    setLoading(true);
    try {
      const res = await fetch('http://localhost:8080/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name, gender: form.gender, age: parseInt(form.age),
          username: form.username, password: form.password,
        }),
      });
      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || 'Registration failed');
      }
      const data = await res.json();
      login({ ...data, favoriteColor: form.favoriteColor });
      navigate('/');
    } catch (err) {
      // Fallback: save locally for demo
      const existing = localStorage.getItem(`ws_localuser_${form.username}`);
      if (existing) return setError('Username already taken!');
      const userData = {
        sessionId: form.username, username: form.username, name: form.name,
        gender: form.gender, age: parseInt(form.age), favoriteColor: form.favoriteColor,
        password: form.password,
      };
      localStorage.setItem(`ws_localuser_${form.username}`, JSON.stringify(userData));
      login(userData);
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const genderAvatar = form.gender === 'female' ? '👧' : '👦';

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, #87CEEB 0%, #E8F9FD 100%)', padding: '20px 0' }}>
      <div ref={cardRef} className="card" style={{ maxWidth: 460, width: '90%', marginTop: 0 }}>
        <div style={{ textAlign: 'center', fontSize: '4rem', marginBottom: 4 }}>{genderAvatar}</div>
        <h2 style={{ margin: '0 0 20px', color: '#00A5DC', fontSize: '2rem' }}>Create Account!</h2>

        {error && (
          <div style={{ background: '#ffe0e0', border: '2px solid #FF5E7E', borderRadius: 12,
            padding: '10px 16px', marginBottom: 14, color: '#c0392b', fontWeight: 700 }}>
            ❌ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* Name */}
          <label style={labelStyle}>
            ✏️ Full Name
            <input name="name" value={form.name} onChange={handleChange}
              required style={inputStyle} placeholder="What's your name?" />
          </label>

          {/* Gender + Age row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <label style={labelStyle}>
              🧑 Gender
              <select name="gender" value={form.gender} onChange={handleChange} style={inputStyle}>
                <option value="male">👦 Boy</option>
                <option value="female">👧 Girl</option>
                <option value="other">🧑 Other</option>
              </select>
            </label>
            <label style={labelStyle}>
              🎂 Age
              <input name="age" type="number" min={2} max={15} value={form.age} onChange={handleChange}
                required style={inputStyle} placeholder="Age" />
            </label>
          </div>

          {/* Favorite Color */}
          <label style={labelStyle}>
            🎨 Favorite Color (for your pen!)
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 6 }}>
              {COLORS.map(c => (
                <button type="button" key={c} onClick={() => setForm({ ...form, favoriteColor: c })}
                  style={{
                    width: 36, height: 36, borderRadius: '50%', background: c, border: 'none',
                    cursor: 'pointer', boxShadow: form.favoriteColor === c ? `0 0 0 4px white, 0 0 0 6px ${c}` : '0 2px 4px rgba(0,0,0,0.2)',
                    transform: form.favoriteColor === c ? 'scale(1.2)' : 'scale(1)',
                    transition: 'all 0.2s',
                  }}
                />
              ))}
            </div>
          </label>

          <hr style={{ border: 'none', borderTop: '2px dashed #e0e0e0' }} />

          {/* Username */}
          <label style={labelStyle}>
            👤 Username (Login ID)
            <input name="username" value={form.username} onChange={handleChange}
              required autoComplete="username" style={inputStyle} placeholder="Choose a username" />
          </label>

          {/* Password */}
          <label style={labelStyle}>
            🔒 Password
            <input name="password" type="password" value={form.password} onChange={handleChange}
              required autoComplete="new-password" style={inputStyle} placeholder="At least 4 characters" />
          </label>

          {/* Confirm Password */}
          <label style={labelStyle}>
            🔒 Confirm Password
            <input name="confirmPassword" type="password" value={form.confirmPassword} onChange={handleChange}
              required autoComplete="new-password" style={inputStyle} placeholder="Repeat password" />
          </label>

          <button type="submit" className="btn btn-primary" style={{ marginTop: 6 }} disabled={loading}>
            {loading ? '⏳ Creating...' : '🌟 Create Account!'}
          </button>
        </form>

        <p style={{ marginTop: 18, fontSize: '1.1rem' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: '#FF5E7E', fontWeight: 900, textDecoration: 'none' }}>
            Login here! 🚀
          </Link>
        </p>
      </div>
    </div>
  );
};

const labelStyle = {
  display: 'flex', flexDirection: 'column', gap: 5,
  fontWeight: 900, fontSize: '1.05rem', textAlign: 'left',
};

const inputStyle = {
  padding: '11px 14px', borderRadius: 14, border: '3px solid #e0e0e0',
  fontSize: '1rem', fontFamily: 'Nunito, sans-serif', fontWeight: 700,
  outline: 'none',
};

export default SignupPage;
