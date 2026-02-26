import { GamePhase } from '../modules/gameState';

interface StatusTextProps {
  phase: GamePhase;
}

export function StatusText({ phase }: StatusTextProps) {
  if (phase !== 'green-light' && phase !== 'red-light') return null;

  const isGreen = phase === 'green-light';

  return (
    <div
      className="font-display text-4xl md:text-6xl tracking-widest text-center animate-pulse"
      style={{
        color: isGreen ? '#00ff88' : '#ff2d78',
        textShadow: isGreen
          ? '0 0 20px rgba(0,255,136,0.8), 0 0 40px rgba(0,255,136,0.4)'
          : '0 0 20px rgba(255,45,120,0.8), 0 0 40px rgba(255,45,120,0.4)',
      }}
    >
      {isGreen ? '🟢 GREEN LIGHT' : '🔴 RED LIGHT'}
    </div>
  );
}
