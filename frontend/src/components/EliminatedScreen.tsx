import React from 'react';

interface EliminatedScreenProps {
  progress: number;
  time: number;
  onRestart: () => void;
}

const EliminatedScreen: React.FC<EliminatedScreenProps> = ({ progress, time, onRestart }) => {
  const minutes = Math.floor(time / 60);
  const seconds = time % 60;
  const timeFormatted =
    minutes > 0
      ? `${minutes}:${Math.floor(seconds).toString().padStart(2, '0')}.${Math.floor((seconds % 1) * 10)}s`
      : `${seconds.toFixed(1)}s`;

  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-6 animate-fade-in-up">
      {/* Eliminated header */}
      <div className="mb-6">
        <div
          className="font-bebas text-game-red text-glow-red animate-shake"
          style={{ fontSize: 'clamp(3rem, 10vw, 7rem)', lineHeight: 1, letterSpacing: '0.05em' }}
        >
          ELIMINATED
        </div>
        <div className="font-bebas text-sm tracking-[0.5em] text-game-red/60 mt-1">
          YOU MOVED DURING RED LIGHT
        </div>
      </div>

      {/* Stats */}
      <div className="flex gap-8 mb-8">
        <div className="text-center">
          <div className="font-bebas text-xs tracking-widest text-game-dim mb-1">PROGRESS</div>
          <div className="font-bebas text-4xl text-game-white text-glow-white">
            {Math.floor(progress)}%
          </div>
        </div>
        <div className="w-px bg-game-border" />
        <div className="text-center">
          <div className="font-bebas text-xs tracking-widest text-game-dim mb-1">SURVIVED</div>
          <div className="font-bebas text-4xl text-game-white text-glow-white">
            {timeFormatted}
          </div>
        </div>
      </div>

      {/* Progress bar visual */}
      <div className="w-full max-w-xs mb-8">
        <div className="h-3 bg-game-border border border-game-border overflow-hidden">
          <div
            className="h-full bg-game-red transition-none"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex justify-between mt-1">
          <span className="font-bebas text-xs text-game-dim">0%</span>
          <span className="font-bebas text-xs text-game-dim">100%</span>
        </div>
      </div>

      {/* Restart button */}
      <button
        onClick={onRestart}
        className="font-bebas text-xl tracking-[0.3em] px-10 py-3 bg-transparent text-game-white border-2 border-game-white hover:bg-game-white hover:text-game-bg transition-all duration-200"
        style={{ clipPath: 'polygon(6px 0%, 100% 0%, calc(100% - 6px) 100%, 0% 100%)' }}
      >
        ↺ TRY AGAIN
      </button>
    </div>
  );
};

export default EliminatedScreen;
