import React from 'react';

interface TimerProps {
  time: number; // seconds
  label?: string;
}

const Timer: React.FC<TimerProps> = ({ time, label = 'TIME' }) => {
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  const tenths = Math.floor((time % 1) * 10);

  const formatted =
    minutes > 0
      ? `${minutes}:${seconds.toString().padStart(2, '0')}.${tenths}`
      : `${seconds}.${tenths}s`;

  return (
    <div className="text-center">
      <div className="font-bebas text-xs tracking-widest text-game-dim mb-0.5">{label}</div>
      <div className="font-bebas text-3xl tracking-wider text-game-white text-glow-white">
        {formatted}
      </div>
    </div>
  );
};

export default Timer;
