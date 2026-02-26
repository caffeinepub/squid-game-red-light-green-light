interface CountdownDisplayProps {
  countdown: number;
}

export function CountdownDisplay({ countdown }: CountdownDisplayProps) {
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="text-white/60 font-mono text-sm tracking-widest">GET READY</div>
      <div
        key={countdown}
        className="font-display text-8xl md:text-9xl text-white"
        style={{
          textShadow: '0 0 30px rgba(255,255,255,0.6)',
          animation: 'countdownPop 0.4s ease-out',
        }}
      >
        {countdown}
      </div>
      <div className="text-white/40 font-mono text-xs tracking-widest">DON'T MOVE ON RED LIGHT</div>
    </div>
  );
}
