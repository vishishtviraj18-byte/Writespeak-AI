import React, { useState, useRef, useEffect } from 'react';
import { useSettings } from '../context/SettingsContext';
import { useAuth } from '../context/AuthContext';
import gsap from 'gsap';

const COLORS = [
  { label: '🌹 Pink',    value: '#FF5E7E' },
  { label: '🌊 Teal',   value: '#38E4B7' },
  { label: '⭐ Gold',   value: '#FFD166' },
  { label: '💜 Purple', value: '#a29bfe' },
  { label: '🧊 Blue',   value: '#74b9ff' },
  { label: '🔥 Orange', value: '#e17055' },
  { label: '🍓 Red',    value: '#d63031' },
  { label: '🌿 Green',  value: '#00b894' },
];

const SettingsPanel = () => {
  const { settings, updateSetting } = useSettings();
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const panelRef = useRef(null);

  useEffect(() => {
    if (panelRef.current) {
      gsap.to(panelRef.current, {
        scaleY: open ? 1 : 0, opacity: open ? 1 : 0,
        duration: 0.3, ease: open ? 'back.out(1.5)' : 'power2.in',
        transformOrigin: 'top right',
      });
    }
  }, [open]);

  const genderAvatar = user?.gender === 'female' ? '👧' : '👦';

  return (
    <div className="fixed top-4 right-4 z-[999]">
      {/* Toggle Gear Button */}
      <button
        onClick={() => setOpen(o => !o)}
        className="bg-white border-4 border-slate-100 rounded-full w-14 h-14 text-2xl flex items-center justify-center cursor-pointer shadow-lg active:scale-95 transition-all"
      >
        ⚙️
      </button>

      {/* Settings Options Panel */}
      <div
        ref={panelRef}
        className="absolute top-[70px] right-0 bg-white border-4 border-slate-100 rounded-[28px] p-6 shadow-2xl min-w-[320px] scale-y-0 opacity-0 flex flex-col gap-6"
      >
        {/* User Card */}
        {user && (
          <div className="flex items-center gap-3 bg-slate-50 border border-slate-100 p-3 rounded-2xl">
            <div className="text-4xl">{genderAvatar}</div>
            <div className="text-left">
              <div className="font-black text-slate-700 text-lg leading-tight">{user.name}</div>
              <div className="text-xs font-bold text-slate-400">
                @{user.username} · Age {user.age}
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-5 text-left">
          {/* Mute Toggle */}
          <div className="flex items-center justify-between">
            <span className="font-extrabold text-slate-600 text-base">{settings.muted ? '🔇' : '🔊'} Voice Audio</span>
            <button
              onClick={() => updateSetting('muted', !settings.muted)}
              className={`font-black text-xs text-white px-4 py-1.5 rounded-full shadow-sm cursor-pointer transition-colors ${
                settings.muted ? 'bg-slate-400' : 'bg-secondary'
              }`}
            >
              {settings.muted ? 'MUTED' : 'ENABLED'}
            </button>
          </div>

          {/* Pen Color */}
          <div className="flex flex-col gap-2">
            <span className="font-extrabold text-slate-600 text-base">🎨 Writing Pen Color</span>
            <div className="flex flex-wrap gap-2">
              {COLORS.map(c => (
                <button
                  key={c.value}
                  title={c.label}
                  onClick={() => updateSetting('strokeColor', c.value)}
                  style={{ background: c.value }}
                  className={`w-8 h-8 rounded-full border-2 border-white transition-all cursor-pointer ${
                    settings.strokeColor === c.value
                      ? 'scale-125 ring-2 ring-slate-400'
                      : 'shadow-sm hover:scale-105'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Gesture Sensitivity */}
          <div className="flex flex-col gap-2">
            <span className="font-extrabold text-slate-600 text-base">
              ✋ Gesture Trigger Hold
            </span>
            <input
              type="range" min={5} max={30} step={5}
              value={settings.gestureSensitivity}
              onChange={e => updateSetting('gestureSensitivity', parseInt(e.target.value))}
              className="w-full accent-primary h-2 bg-slate-100 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-xs font-black text-slate-400">
              <span>⚡ Fast (5f)</span>
              <span>🐢 Slow (30f)</span>
            </div>
          </div>

          {/* Logout Button */}
          {user && (
            <button
              onClick={logout}
              className="border-4 border-primary text-primary font-black text-center py-2.5 rounded-2xl hover:bg-primary/5 active:scale-[0.98] transition-all cursor-pointer"
            >
              🚪 Sign Out
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;
