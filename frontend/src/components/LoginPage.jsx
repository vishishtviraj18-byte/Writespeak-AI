import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import gsap from 'gsap';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ username: '', password: '' });
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
    setLoading(true);
    try {
      const res = await fetch('http://localhost:8080/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error('Invalid username or password');
      const data = await res.json();
      login(data); // { id, username, name, gender, age }
      navigate('/');
    } catch (err) {
      // Fallback: local-only login for demo
      const stored = JSON.parse(localStorage.getItem(`ws_localuser_${form.username}`) || 'null');
      if (stored && stored.password === form.password) {
        login({ ...stored, sessionId: form.username });
        navigate('/');
      } else {
        setError(err.message || 'Login failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, #87CEEB 0%, #E8F9FD 100%)' }}>
      <div ref={cardRef} className="card" style={{ maxWidth: 420, width: '90%', marginTop: 0 }}>
        {/* Doraemon header */}
        <div style={{ textAlign: 'center', fontSize: '5rem', marginBottom: 8 }}>🤖</div>
        <h2 style={{ margin: '0 0 24px', color: '#00A5DC', fontSize: '2.2rem' }}>Welcome Back!</h2>

        {error && (
          <div style={{ background: '#ffe0e0', border: '2px solid #FF5E7E', borderRadius: 12,
            padding: '10px 16px', marginBottom: 16, color: '#c0392b', fontWeight: 700 }}>
            ❌ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <label style={labelStyle}>
            👤 Username
            <input name="username" value={form.username} onChange={handleChange}
              required autoComplete="username" style={inputStyle} placeholder="Enter username" />
          </label>

          <label style={labelStyle}>
            🔒 Password
            <input name="password" type="password" value={form.password} onChange={handleChange}
              required autoComplete="current-password" style={inputStyle} placeholder="Enter password" />
          </label>

          <button type="submit" className="btn btn-primary" style={{ marginTop: 8 }} disabled={loading}>
            {loading ? '⏳ Logging in...' : '🚀 Login'}
          </button>
        </form>

        <p style={{ marginTop: 20, fontSize: '1.1rem' }}>
          New here?{' '}
          <Link to="/signup" style={{ color: '#FF5E7E', fontWeight: 900, textDecoration: 'none' }}>
            Create an account! ✨
          </Link>
        </p>
      </div>
    </div>
  );
};

const labelStyle = {
  display: 'flex', flexDirection: 'column', gap: 6,
  fontWeight: 900, fontSize: '1.1rem', textAlign: 'left',
};

const inputStyle = {
  padding: '12px 16px', borderRadius: 16, border: '3px solid #e0e0e0',
  fontSize: '1.1rem', fontFamily: 'Nunito, sans-serif', fontWeight: 700,
  outline: 'none', transition: 'border 0.2s',
};

export default LoginPage;
