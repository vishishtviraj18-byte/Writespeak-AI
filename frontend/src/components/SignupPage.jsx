import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../utils/api';
import AnimatedBackground from './AnimatedBackground';
import Loader from './Loader';

const SignupPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [age, setAge] = useState(6);
  const [gender, setGender] = useState('boy'); // boy, girl, other
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim() || !name.trim()) {
      setError('Please fill in all fields to create your character!');
      return;
    }

    setError('');
    setLoading(true);

    try {
      // 1. Sign up on backend
      const regData = await authApi.register(username, password, name, gender, age);
      // 2. Log in directly
      const logData = await authApi.login(username, password);
      login(logData.user, logData.token);
      navigate('/mode-selection');
    } catch (err) {
      setError(err.message || 'Username might be taken, pick another one!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative w-screen h-screen flex flex-col items-center justify-center overflow-hidden font-nunito select-none">
      <AnimatedBackground />

      <div className="z-10 w-full max-w-lg px-4 max-h-[90vh] overflow-y-auto">
        <div className="glass-panel text-center my-6">
          {/* Back button */}
          <button 
            onClick={() => navigate('/')} 
            className="absolute top-4 left-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold p-2.5 rounded-full border-2 border-slate-200 cursor-pointer text-sm shadow-sm transition-all"
          >
            🏠 Home
          </button>

          {/* Doraemon badge */}
          <div className="w-20 h-20 bg-primary border-4 border-white rounded-full flex items-center justify-center text-4xl mx-auto -mt-16 shadow-md">
            🎒
          </div>

          <h2 className="text-3xl font-black text-slate-800 mt-4 mb-2">Create Explorer!</h2>
          <p className="text-slate-500 font-bold text-sm mb-6">Choose details for your learning character!</p>

          {error && (
            <div className="bg-rose-50 border-4 border-rose-200 text-rose-600 font-black rounded-2xl py-3 px-4 mb-5 text-sm">
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-left">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-600 font-black text-sm mb-1 ml-1">Real Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Nobita"
                  className="w-full bg-slate-50 border-4 border-slate-200 focus:border-primary focus:bg-white rounded-2xl py-2.5 px-4 text-slate-800 font-black text-lg outline-none transition-colors"
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-slate-600 font-black text-sm mb-1 ml-1">Username ID</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. supernobita"
                  className="w-full bg-slate-50 border-4 border-slate-200 focus:border-primary focus:bg-white rounded-2xl py-2.5 px-4 text-slate-800 font-black text-lg outline-none transition-colors"
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-600 font-black text-sm mb-1 ml-1">Secret Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Choose a safe password"
                className="w-full bg-slate-50 border-4 border-slate-200 focus:border-primary focus:bg-white rounded-2xl py-2.5 px-4 text-slate-800 font-black text-lg outline-none transition-colors"
                disabled={loading}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-600 font-black text-sm mb-1.5 ml-1">Age: <span className="text-primary text-lg font-black">{age} years</span></label>
                <input
                  type="range"
                  min="3"
                  max="12"
                  value={age}
                  onChange={(e) => setAge(parseInt(e.target.value))}
                  className="w-full h-3 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary"
                  disabled={loading}
                />
                <div className="flex justify-between text-xs text-slate-400 font-bold mt-1 px-1">
                  <span>Age 3</span>
                  <span>12</span>
                </div>
              </div>

              <div>
                <label className="block text-slate-600 font-black text-sm mb-1 ml-1">Explorer Avatar</label>
                <div className="flex gap-2">
                  {[
                    { val: 'boy', label: '👦 Boy' },
                    { val: 'girl', label: '👧 Girl' },
                    { val: 'other', label: '🦄 Other' },
                  ].map((g) => (
                    <button
                      key={g.val}
                      type="button"
                      onClick={() => setGender(g.val)}
                      className={`flex-1 border-4 rounded-xl py-2 font-black transition-all ${
                        gender === g.val
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-slate-200 bg-slate-50 text-slate-500 hover:bg-slate-100'
                      }`}
                      disabled={loading}
                    >
                      {g.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="btn-dora bg-primary hover:bg-rose-400 w-full mt-6 flex justify-center items-center"
              disabled={loading}
            >
              {loading ? <Loader /> : '🎁 CREATE ADVENTURER!'}
            </button>
          </form>

          <div className="mt-5 border-t-2 border-dashed border-slate-200 pt-4">
            <p className="text-slate-500 font-bold">
              Already have character?{' '}
              <Link to="/login" className="text-doraBlue hover:underline font-black">
                Log in here!
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
