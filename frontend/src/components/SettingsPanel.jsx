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
    <div style={{ position: 'fixed', top: 16, right: 16, zIndex: 9999 }}>
      {/* Toggle button */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          background: 'white', border: '3px solid #e0e0e0',
          borderRadius: '50%', width: 52, height: 52, fontSize: '1.5rem',
          cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        ⚙️
      </button>

      {/* Panel */}
      <div
        ref={panelRef}
        style={{
          position: 'absolute', top: 60, right: 0,
          background: 'white', borderRadius: 24, padding: 24,
          boxShadow: '0 15px 40px rgba(0,0,0,0.2)',
          border: '4px solid #f0f0f0',
          minWidth: 300,
          transformOrigin: 'top right',
          scaleY: 0, opacity: 0,
          overflow: 'hidden',
        }}
      >
        {/* User profile */}
        {user && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20,
            background: '#f8f9fa', borderRadius: 16, padding: '12px 16px' }}>
            <div style={{ fontSize: '2.5rem' }}>{genderAvatar}</div>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontWeight: 900, fontSize: '1.2rem', color: '#333' }}>{user.name}</div>
              <div style={{ fontSize: '0.9rem', color: '#666' }}>
                @{user.username} · Age {user.age} · {user.gender}
              </div>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Mute */}
          <div style={rowStyle}>
            <span style={labelStyle}>{settings.muted ? '🔇' : '🔊'} Voice</span>
            <button
              onClick={() => updateSetting('muted', !settings.muted)}
              style={{
                ...toggleStyle,
                background: settings.muted ? '#ccc' : '#38E4B7',
              }}
            >
              {settings.muted ? 'MUTED' : 'ON'}
            </button>
          </div>

          {/* Stroke color */}
          <div style={{ ...rowStyle, flexDirection: 'column', alignItems: 'flex-start', gap: 10 }}>
            <span style={labelStyle}>🎨 Pen Color</span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {COLORS.map(c => (
                <button
                  key={c.value}
                  title={c.label}
                  onClick={() => updateSetting('strokeColor', c.value)}
                  style={{
                    width: 34, height: 34, borderRadius: '50%',
                    background: c.value, border: 'none', cursor: 'pointer',
                    boxShadow: settings.strokeColor === c.value
                      ? `0 0 0 3px white, 0 0 0 5px ${c.value}`
                      : '0 2px 4px rgba(0,0,0,0.2)',
                    transform: settings.strokeColor === c.value ? 'scale(1.25)' : 'scale(1)',
                    transition: 'all 0.2s',
                  }}
                />
              ))}
            </div>
          </div>

          {/* Gesture Sensitivity */}
          <div style={{ ...rowStyle, flexDirection: 'column', alignItems: 'flex-start', gap: 8 }}>
            <span style={labelStyle}>
              ✋ Gesture Speed —{' '}
              <span style={{ color: '#FF5E7E' }}>
                {settings.gestureSensitivity <= 10 ? 'Fast' :
                 settings.gestureSensitivity <= 20 ? 'Normal' : 'Slow'}
              </span>
            </span>
            <input
              type="range" min={5} max={45} step={5}
              value={settings.gestureSensitivity}
              onChange={e => updateSetting('gestureSensitivity', parseInt(e.target.value))}
              style={{ width: '100%', accentColor: '#FF5E7E', height: 6 }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%',
              fontSize: '0.85rem', color: '#999', fontWeight: 700 }}>
              <span>⚡ Fast (5)</span><span>🐢 Slow (45)</span>
            </div>
          </div>

          {/* Logout */}
          {user && (
            <button
              onClick={logout}
              style={{
                background: 'none', border: '3px solid #FF5E7E', borderRadius: 16,
                color: '#FF5E7E', fontWeight: 900, fontSize: '1rem',
                padding: '8px 20px', cursor: 'pointer', fontFamily: 'Nunito, sans-serif',
              }}
            >
              🚪 Logout
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const rowStyle   = { display: 'flex', alignItems: 'center', justifyContent: 'space-between' };
const labelStyle = { fontWeight: 900, fontSize: '1rem', color: '#333' };
const toggleStyle = {
  border: 'none', borderRadius: 20, padding: '6px 18px',
  fontWeight: 900, fontSize: '0.9rem', color: 'white', cursor: 'pointer',
  transition: 'background 0.2s', fontFamily: 'Nunito, sans-serif',
};

export default SettingsPanel;
