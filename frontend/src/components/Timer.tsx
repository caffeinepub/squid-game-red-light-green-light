interface TimerProps {
  elapsedTime: number; // ms
}

export function Timer({ elapsedTime }: TimerProps) {
  const totalSeconds = elapsedTime / 1000;
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.floor(totalSeconds % 60);
  const tenths = Math.floor((totalSeconds % 1) * 10);

  const formatted =
    minutes > 0
      ? `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${tenths}`
      : `${String(seconds).padStart(2, '0')}.${tenths}s`;

  return (
    <div className="font-display text-white/80 text-lg tracking-widest">
      {formatted}
    </div>
  );
}
