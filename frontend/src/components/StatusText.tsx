import React from 'react';

interface StatusTextProps {
  phase: string;
}

const StatusText: React.FC<StatusTextProps> = ({ phase }) => {
  if (phase === 'green-light') {
    return (
      <div className="text-center animate-pulse-green">
        <div
          className="font-bebas tracking-widest text-game-green text-glow-green"
          style={{ fontSize: 'clamp(2.5rem, 8vw, 5rem)', lineHeight: 1 }}
        >
          GREEN LIGHT
        </div>
        <div className="font-bebas text-sm tracking-[0.4em] text-game-green/60 mt-1">
          MOVE FORWARD
        </div>
      </div>
    );
  }

  if (phase === 'red-light') {
    return (
      <div className="text-center animate-pulse-pink">
        <div
          className="font-bebas tracking-widest text-game-red text-glow-red"
          style={{ fontSize: 'clamp(2.5rem, 8vw, 5rem)', lineHeight: 1 }}
        >
          RED LIGHT
        </div>
        <div className="font-bebas text-sm tracking-[0.4em] text-game-red/60 mt-1">
          FREEZE NOW
        </div>
      </div>
    );
  }

  return null;
};

export default StatusText;
