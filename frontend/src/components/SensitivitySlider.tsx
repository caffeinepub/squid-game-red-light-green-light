interface SensitivitySliderProps {
  value: number;
  onChange: (value: number) => void;
}

function getSensitivityLabel(value: number): string {
  if (value <= 25) return 'FORGIVING';
  if (value <= 50) return 'NORMAL';
  if (value <= 75) return 'STRICT';
  return 'BRUTAL';
}

function getSensitivityColor(value: number): string {
  if (value <= 25) return '#00ff88';
  if (value <= 50) return '#f5c842';
  if (value <= 75) return '#ff8c00';
  return '#ff2d78';
}

export function SensitivitySlider({ value, onChange }: SensitivitySliderProps) {
  const label = getSensitivityLabel(value);
  const color = getSensitivityColor(value);

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-1">
        <span className="text-white/60 font-mono text-xs tracking-widest">SENSITIVITY</span>
        <span className="font-mono text-xs font-bold" style={{ color }}>
          {label}
        </span>
      </div>
      <input
        type="range"
        min={1}
        max={100}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-2 rounded-full appearance-none cursor-pointer"
        style={{
          background: `linear-gradient(to right, ${color} 0%, ${color} ${value}%, rgba(255,255,255,0.1) ${value}%, rgba(255,255,255,0.1) 100%)`,
          accentColor: color,
        }}
      />
    </div>
  );
}
