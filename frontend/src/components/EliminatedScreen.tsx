import { ProgressBar } from './ProgressBar';
import { Timer } from './Timer';

interface EliminatedScreenProps {
  progress: number;
  elapsedTime: number;
  onRestart: () => void;
}

export function EliminatedScreen({ progress, elapsedTime, onRestart }: EliminatedScreenProps) {
  return (
    <div className="flex flex-col items-center gap-6 max-w-md mx-auto text-center px-4">
      <div>
        <div className="text-white/40 font-mono text-xs tracking-[0.4em] mb-2">GAME OVER</div>
        <h2
          className="font-display text-5xl md:text-6xl"
          style={{
            color: '#ff2d78',
            textShadow: '0 0 30px rgba(255,45,120,0.8)',
          }}
        >
          ELIMINATED
        </h2>
      </div>

      <div className="w-full space-y-3">
        <div className="flex justify-between font-mono text-sm">
          <span className="text-white/60">PROGRESS</span>
          <span className="text-white">{Math.round(progress)}%</span>
        </div>
        <ProgressBar progress={progress} phase="eliminated" />
        <div className="flex justify-between font-mono text-sm">
          <span className="text-white/60">SURVIVAL TIME</span>
          <Timer elapsedTime={elapsedTime} />
        </div>
      </div>

      <button
        onClick={onRestart}
        className="w-full py-4 font-display text-2xl tracking-widest text-black rounded-lg transition-all duration-200 hover:scale-105 active:scale-95"
        style={{
          background: 'linear-gradient(135deg, #ff2d78, #ff6b9d)',
          boxShadow: '0 0 30px rgba(255,45,120,0.5)',
        }}
      >
        TRY AGAIN
      </button>
    </div>
  );
}
