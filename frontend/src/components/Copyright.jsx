import React from 'react';

/**
 * Copyright badge — small, subtle, shown on every page.
 * variant: 'dark' (for dark bg pages) | 'light' (for light bg pages)
 * position: 'bottom-center' | 'bottom-left' | 'bottom-right'
 */
const Copyright = ({ variant = 'dark', position = 'bottom-center', className = '' }) => {
  const posMap = {
    'bottom-center': 'bottom-3 left-1/2 -translate-x-1/2',
    'bottom-left':   'bottom-3 left-4',
    'bottom-right':  'bottom-3 right-4',
  };

  const textColor  = variant === 'dark'  ? 'rgba(255,255,255,0.28)' : 'rgba(30,41,59,0.45)';
  const borderCol  = variant === 'dark'  ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';
  const bgCol      = variant === 'dark'  ? 'rgba(0,0,0,0.25)'       : 'rgba(255,255,255,0.5)';

  return (
    <div
      className={`fixed z-50 ${posMap[position]} ${className} pointer-events-none select-none`}
    >
      <p
        className="text-[10px] font-semibold px-3 py-1 rounded-full whitespace-nowrap backdrop-blur-sm"
        style={{ color: textColor, background: bgCol, border: `1px solid ${borderCol}`, letterSpacing: '0.04em' }}
      >
        © 2025 WriteSpeak AI · All rights reserved by{' '}
        <span style={{ fontWeight: 800 }}>Vishisht</span>
      </p>
    </div>
  );
};

export default Copyright;
