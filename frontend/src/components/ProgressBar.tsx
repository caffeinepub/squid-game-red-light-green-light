interface ProgressBarProps {
  progress: number;
  phase: string;
}

export function ProgressBar({ progress, phase }: ProgressBarProps) {
  const barColor =
    phase === 'green-light' ? '#00ff88' :
    phase === 'red-light' ? '#ff2d78' :
    phase === 'won' ? '#00ff88' :
    '#ff2d78';

  const glowColor =
    phase === 'green-light' ? 'rgba(0,255,136,0.6)' :
    phase === 'red-light' ? 'rgba(255,45,120,0.6)' :
    phase === 'won' ? 'rgba(0,255,136,0.6)' :
    'rgba(255,45,120,0.3)';

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-1">
        <span className="text-white/60 font-mono text-xs tracking-widest">PROGRESS</span>
        <span className="text-white font-mono text-xs">{Math.round(progress)}%</span>
      </div>
      <div className="h-3 bg-white/10 rounded-full overflow-hidden relative">
        {/* Milestone markers */}
        {[25, 50, 75].map((m) => (
          <div
            key={m}
            className="absolute top-0 bottom-0 w-px bg-white/20"
            style={{ left: `${m}%` }}
          />
        ))}
        {/* Progress fill */}
        <div
          className="h-full rounded-full transition-all duration-200 relative overflow-hidden"
          style={{
            width: `${progress}%`,
            background: barColor,
            boxShadow: `0 0 8px ${glowColor}`,
          }}
        >
          {/* Shine */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        </div>
      </div>
    </div>
  );
}
