import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import gsap from 'gsap';

const RewardPopup = ({ isMatch = true, message, onNext, reward, stars, xp, onClose }) => {
  const handleNext = onNext || onClose;

  useEffect(() => {
    if (isMatch) {
      confetti({
        particleCount: 220,
        spread: 100,
        origin: { y: 0.55 },
        colors: ['#FF5E7E', '#38E4B7', '#FFD166', '#00A5DC', '#FFFFFF'],
      });
      // Second burst
      setTimeout(() => {
        confetti({ particleCount: 100, spread: 60, origin: { x: 0.2, y: 0.6 } });
        confetti({ particleCount: 100, spread: 60, origin: { x: 0.8, y: 0.6 } });
      }, 400);

      gsap.fromTo('.emoji-reward',
        { y: -60, scale: 0.3, opacity: 0 },
        { y: 0, scale: 1, opacity: 1, duration: 1.1, ease: 'bounce.out', delay: 0.3 }
      );
    }

    gsap.fromTo('.reward-popup-card',
      { scale: 0.3, opacity: 0, y: 40 },
      { scale: 1, opacity: 1, y: 0, duration: 0.6, ease: 'back.out(1.7)' }
    );
  }, [isMatch]);

  if (isMatch) {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center"
        style={{ background: 'radial-gradient(ellipse at center, rgba(0,165,220,0.25) 0%, rgba(15,15,30,0.85) 100%)' }}
      >
        <div className="reward-popup-card flex flex-col items-center text-center gap-5 px-10 py-10 rounded-[32px] border-4 border-yellow-300 shadow-2xl"
          style={{ background: 'linear-gradient(135deg, #1a1a3e 0%, #0d2240 100%)', maxWidth: 400, width: '90%' }}
        >
          {/* Stars sparkle */}
          <div className="text-5xl animate-bounce select-none">⭐🌟⭐</div>

          <h2 className="text-5xl font-black text-yellow-300 drop-shadow-lg leading-tight">
            Amazing!
          </h2>

          {reward?.emoji && (
            <div className="emoji-reward text-9xl drop-shadow-2xl my-1 select-none">
              {reward.emoji}
            </div>
          )}

          <p className="text-2xl font-extrabold text-white leading-snug">
            {message || (reward?.name ? `${reward.name}!` : 'You did it! 🎉')}
          </p>

          {(stars || xp) && (
            <div className="flex gap-4 items-center">
              {stars && (
                <div className="bg-yellow-400/20 border border-yellow-400/50 rounded-xl px-4 py-2">
                  <span className="text-yellow-300 font-black text-lg">⭐ +{stars}</span>
                </div>
              )}
              {xp && (
                <div className="bg-blue-400/20 border border-blue-400/50 rounded-xl px-4 py-2">
                  <span className="text-blue-300 font-black text-lg">⚡ +{xp} XP</span>
                </div>
              )}
            </div>
          )}

          <button
            className="mt-2 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-400 hover:to-rose-400 text-white font-black text-xl px-12 py-3 rounded-full border-2 border-white/30 shadow-lg transition-all active:scale-95"
            onClick={handleNext}
          >
            Next ➡️
          </button>
        </div>
      </div>
    );
  }

  // Wrong answer — simple inline panel, no full-screen takeover
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="reward-popup-card flex flex-col items-center text-center gap-4 px-8 py-8 rounded-[28px] border-2 border-red-400/40 shadow-2xl"
        style={{ background: 'linear-gradient(135deg, #1a0a0a 0%, #2d0d0d 100%)', maxWidth: 360, width: '90%' }}
      >
        <div className="text-6xl select-none">😅</div>
        <h2 className="text-3xl font-black text-red-400">Almost!</h2>
        <p className="text-lg font-bold text-white/80">
          {message || "Nice try! Keep going — you'll get it! ✍️"}
        </p>
        <button
          className="mt-1 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white font-black text-lg px-10 py-2.5 rounded-full border-2 border-white/20 shadow-lg transition-all active:scale-95"
          onClick={handleNext}
        >
          Try Again 🔄
        </button>
      </div>
    </div>
  );
};

export default RewardPopup;
