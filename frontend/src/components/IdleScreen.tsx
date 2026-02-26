import React from 'react';

interface IdleScreenProps {
  onStart: () => void;
}

const IdleScreen: React.FC<IdleScreenProps> = ({ onStart }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-6 animate-fade-in-up">
      {/* Title */}
      <div className="mb-2">
        <div className="font-bebas text-xs tracking-[0.6em] text-game-pink mb-3">
          ▶ SQUID GAME
        </div>
        <h1
          className="font-bebas text-game-white leading-none"
          style={{ fontSize: 'clamp(2.5rem, 8vw, 5.5rem)', letterSpacing: '0.05em' }}
        >
          RED LIGHT
        </h1>
        <div className="flex items-center justify-center gap-3 my-1">
          <div className="h-px flex-1 bg-game-border max-w-16" />
          <span className="font-bebas text-game-dim text-sm tracking-widest">VS</span>
          <div className="h-px flex-1 bg-game-border max-w-16" />
        </div>
        <h1
          className="font-bebas text-game-green leading-none"
          style={{ fontSize: 'clamp(2.5rem, 8vw, 5.5rem)', letterSpacing: '0.05em' }}
        >
          GREEN LIGHT
        </h1>
      </div>

      {/* Instructions */}
      <div className="mt-6 mb-8 max-w-sm">
        <div className="bg-game-card border border-game-border p-4 text-left space-y-2">
          <div className="flex items-start gap-3">
            <span className="text-game-green font-bebas text-lg leading-none mt-0.5">●</span>
            <p className="text-game-dim text-sm leading-relaxed">
              <span className="text-game-green font-semibold">GREEN LIGHT</span> — Move to advance your progress bar
            </p>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-game-red font-bebas text-lg leading-none mt-0.5">●</span>
            <p className="text-game-dim text-sm leading-relaxed">
              <span className="text-game-red font-semibold">RED LIGHT</span> — Freeze completely or be eliminated
            </p>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-game-pink font-bebas text-lg leading-none mt-0.5">●</span>
            <p className="text-game-dim text-sm leading-relaxed">
              Reach <span className="text-game-white font-semibold">100%</span> progress to win
            </p>
          </div>
        </div>
      </div>

      {/* Start button */}
      <button
        onClick={onStart}
        className="relative group font-bebas text-2xl tracking-[0.3em] px-12 py-4 bg-game-pink text-game-white border-2 border-game-pink hover:bg-transparent hover:text-game-pink transition-all duration-200 glow-pink"
        style={{ clipPath: 'polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%)' }}
      >
        <span className="relative z-10">▶ START GAME</span>
      </button>

      <p className="mt-4 text-game-dim text-xs tracking-widest">
        ALLOW CAMERA ACCESS FOR MOVEMENT DETECTION
      </p>
    </div>
  );
};

export default IdleScreen;
