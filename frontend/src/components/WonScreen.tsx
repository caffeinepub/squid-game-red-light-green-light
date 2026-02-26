import React from 'react';

interface WonScreenProps {
  time: number;
  onRestart: () => void;
}

const WonScreen: React.FC<WonScreenProps> = ({ time, onRestart }) => {
  const minutes = Math.floor(time / 60);
  const seconds = time % 60;
  const timeFormatted =
    minutes > 0
      ? `${minutes}:${Math.floor(seconds).toString().padStart(2, '0')}.${Math.floor((seconds % 1) * 10)}s`
      : `${seconds.toFixed(1)}s`;

  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-6 animate-fade-in-up">
      {/* Victory header */}
      <div className="mb-2">
        <div className="font-bebas text-xs tracking-[0.6em] text-game-green mb-3">
          ★ PLAYER WINS ★
        </div>
        <div
          className="font-bebas text-game-green text-glow-green animate-pulse-green"
          style={{ fontSize: 'clamp(3rem, 10vw, 7rem)', lineHeight: 1, letterSpacing: '0.05em' }}
        >
          YOU WIN!
        </div>
        <div className="font-bebas text-sm tracking-[0.4em] text-game-green/60 mt-1">
          REACHED 100% PROGRESS
        </div>
      </div>

      {/* Stats */}
      <div className="flex gap-8 my-8">
        <div className="text-center">
          <div className="font-bebas text-xs tracking-widest text-game-dim mb-1">PROGRESS</div>
          <div className="font-bebas text-4xl text-game-green text-glow-green">100%</div>
        </div>
        <div className="w-px bg-game-border" />
        <div className="text-center">
          <div className="font-bebas text-xs tracking-widest text-game-dim mb-1">TIME</div>
          <div className="font-bebas text-4xl text-game-white text-glow-white">{timeFormatted}</div>
        </div>
      </div>

      {/* Full progress bar */}
      <div className="w-full max-w-xs mb-8">
        <div className="h-3 bg-game-border border border-game-green overflow-hidden glow-green">
          <div className="h-full bg-game-green w-full" />
        </div>
        <div className="flex justify-between mt-1">
          <span className="font-bebas text-xs text-game-dim">0%</span>
          <span className="font-bebas text-xs text-game-green">🏁 100%</span>
        </div>
      </div>

      {/* Play again button */}
      <button
        onClick={onRestart}
        className="font-bebas text-xl tracking-[0.3em] px-10 py-3 bg-game-green text-game-bg border-2 border-game-green hover:bg-transparent hover:text-game-green transition-all duration-200 glow-green"
        style={{ clipPath: 'polygon(6px 0%, 100% 0%, calc(100% - 6px) 100%, 0% 100%)' }}
      >
        ▶ PLAY AGAIN
      </button>
    </div>
  );
};

export default WonScreen;
