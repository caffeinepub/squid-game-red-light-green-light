import React from 'react';

interface ProgressBarProps {
  progress: number; // 0–100
  phase: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ progress, phase }) => {
  const isGreen = phase === 'green-light';
  const isRed = phase === 'red-light';

  const barColor = isGreen
    ? 'bg-game-green'
    : isRed
    ? 'bg-game-red'
    : 'bg-game-pink';

  const glowClass = isGreen
    ? 'shadow-[0_0_12px_rgba(0,255,136,0.6)]'
    : isRed
    ? 'shadow-[0_0_12px_rgba(255,51,51,0.6)]'
    : 'shadow-[0_0_12px_rgba(255,0,102,0.4)]';

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-1.5">
        <span className="font-bebas text-sm tracking-widest text-game-dim">PROGRESS</span>
        <span className="font-bebas text-sm tracking-widest text-game-white">
          {Math.floor(progress)}%
        </span>
      </div>
      <div className="relative h-4 bg-game-border rounded-none overflow-hidden border border-game-border">
        {/* Background grid lines */}
        <div className="absolute inset-0 flex">
          {Array.from({ length: 10 }).map((_, i) => (
            <div
              key={i}
              className="flex-1 border-r border-white/5 last:border-r-0"
            />
          ))}
        </div>
        {/* Progress fill */}
        <div
          className={`absolute left-0 top-0 h-full transition-all duration-100 ${barColor} ${glowClass}`}
          style={{ width: `${progress}%` }}
        />
        {/* Shine effect */}
        <div
          className="absolute left-0 top-0 h-1/2 bg-white/10"
          style={{ width: `${progress}%`, transition: 'width 100ms' }}
        />
      </div>
      {/* Milestone markers */}
      <div className="flex justify-between mt-1">
        {[25, 50, 75, 100].map((mark) => (
          <div
            key={mark}
            className={`font-bebas text-xs tracking-wider transition-colors duration-300 ${
              progress >= mark ? 'text-game-white' : 'text-game-dim/40'
            }`}
            style={{ marginLeft: mark === 25 ? '21%' : undefined }}
          >
            {mark === 100 ? '🏁' : `${mark}`}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProgressBar;
