import React, { useEffect, useState } from 'react';

interface CountdownDisplayProps {
  value: number;
}

const CountdownDisplay: React.FC<CountdownDisplayProps> = ({ value }) => {
  const [key, setKey] = useState(value);

  useEffect(() => {
    setKey(value);
  }, [value]);

  return (
    <div className="text-center">
      <div className="font-bebas text-xs tracking-[0.5em] text-game-dim mb-2">GET READY</div>
      <div
        key={key}
        className="font-bebas text-game-white text-glow-white animate-countdown-pop"
        style={{ fontSize: 'clamp(6rem, 20vw, 12rem)', lineHeight: 1 }}
      >
        {value}
      </div>
      <div className="font-bebas text-sm tracking-[0.4em] text-game-dim mt-2">
        STAND STILL
      </div>
    </div>
  );
};

export default CountdownDisplay;
