import React from 'react';

const Loader = () => (
  <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[9999] flex items-center justify-center">
    <div className="bg-white/95 border-4 border-white p-10 text-center rounded-[32px] shadow-2xl flex flex-col items-center">
      <div className="text-6xl animate-spin">🤔</div>
      <h3 className="text-2xl font-black mt-4 text-doraBlue">Thinking...</h3>
    </div>
  </div>
);

export default Loader;
