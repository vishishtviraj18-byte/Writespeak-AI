import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../utils/api';
import AnimatedBackground from './AnimatedBackground';
import Loader from './Loader';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('Please fill in all fields!');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const data = await authApi.login(username, password);
      const user = {
        username: data.username,
        name: data.name,
        gender: data.gender,
        age: data.age
      };
      login(user, data.token);
      navigate('/mode-selection');
    } catch (err) {
      setError(err.message || 'Incorrect username or password. Let\'s try again!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative w-screen h-screen flex flex-col items-center justify-center overflow-hidden font-nunito select-none">
      <AnimatedBackground />

      <div className="z-10 w-full max-w-md px-4">
        <div className="glass-panel text-center">
          {/* Back button */}
          <button 
            onClick={() => navigate('/')} 
            className="absolute top-4 left-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold p-2.5 rounded-full border-2 border-slate-200 cursor-pointer text-sm shadow-sm transition-all"
          >
            🏠 Home
          </button>

          {/* Doraemon cartoon head emoji badge */}
          <div className="w-20 h-20 bg-doraBlue border-4 border-white rounded-full flex items-center justify-center text-4xl mx-auto -mt-16 shadow-md">
            🐱
          </div>

          <h2 className="text-3xl font-black text-slate-800 mt-4 mb-2">Welcome Back!</h2>
          <p className="text-slate-500 font-bold text-sm mb-6">Log in to continue your air writing journey!</p>

          {error && (
            <div className="bg-rose-50 border-4 border-rose-200 text-rose-600 font-black rounded-2xl py-3 px-4 mb-5 text-sm">
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-left">
            <div>
              <label className="block text-slate-600 font-black text-sm mb-1.5 ml-1">Username (ID)</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username..."
                className="w-full bg-slate-50 border-4 border-slate-200 focus:border-doraBlue focus:bg-white rounded-2xl py-3 px-4 text-slate-800 font-black text-lg outline-none transition-colors"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-slate-600 font-black text-sm mb-1.5 ml-1">Secret Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password..."
                className="w-full bg-slate-50 border-4 border-slate-200 focus:border-doraBlue focus:bg-white rounded-2xl py-3 px-4 text-slate-800 font-black text-lg outline-none transition-colors"
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              className="btn-dora bg-doraBlue hover:bg-sky-400 w-full mt-6 flex justify-center items-center"
              disabled={loading}
            >
              {loading ? <Loader /> : '🚀 LET\'S GO!'}
            </button>
          </form>

          <div className="mt-6 border-t-2 border-dashed border-slate-200 pt-5">
            <p className="text-slate-500 font-bold">
              New explorer?{' '}
              <Link to="/signup" className="text-primary hover:underline font-black">
                Create character!
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
