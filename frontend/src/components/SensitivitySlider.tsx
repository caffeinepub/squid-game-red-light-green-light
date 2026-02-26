import React from 'react';

interface SensitivitySliderProps {
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
}

const SensitivitySlider: React.FC<SensitivitySliderProps> = ({ value, onChange, disabled }) => {
  const label =
    value <= 25 ? 'FORGIVING' : value <= 50 ? 'NORMAL' : value <= 75 ? 'STRICT' : 'BRUTAL';

  const labelColor =
    value <= 25
      ? 'text-game-green'
      : value <= 50
      ? 'text-game-white'
      : value <= 75
      ? 'text-yellow-400'
      : 'text-game-red';

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        <span className="font-bebas text-sm tracking-widest text-game-dim">SENSITIVITY</span>
        <span className={`font-bebas text-sm tracking-widest ${labelColor}`}>{label}</span>
      </div>
      <div className="relative">
        <input
          type="range"
          min={1}
          max={100}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          disabled={disabled}
          className="w-full h-2 appearance-none cursor-pointer disabled:cursor-not-allowed"
          style={{
            background: `linear-gradient(to right, #FF0066 0%, #FF0066 ${value}%, #2a2a2a ${value}%, #2a2a2a 100%)`,
            borderRadius: '0',
            outline: 'none',
          }}
        />
      </div>
      <div className="flex justify-between mt-1">
        <span className="font-bebas text-xs text-game-green tracking-wider">LOW</span>
        <span className="font-bebas text-xs text-game-red tracking-wider">HIGH</span>
      </div>
    </div>
  );
};

export default SensitivitySlider;
