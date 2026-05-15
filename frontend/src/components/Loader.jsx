import React from 'react';

const Loader = () => (
  <div className="modal-overlay">
    <div className="glass" style={{ padding: '40px', textAlign: 'center', borderRadius: '50%' }}>
      <div style={{ fontSize: '3rem', animation: 'spin 2s linear infinite' }}>🤔</div>
      <h3 style={{ marginTop: '15px' }}>Thinking...</h3>
    </div>
    <style>{`
      @keyframes spin { 100% { transform: rotate(360deg); } }
    `}</style>
  </div>
);

export default Loader;
