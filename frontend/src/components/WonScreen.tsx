import { ProgressBar } from './ProgressBar';
import { Timer } from './Timer';

interface WonScreenProps {
  elapsedTime: number;
  onRestart: () => void;
}

export function WonScreen({ elapsedTime, onRestart }: WonScreenProps) {
  return (
    <div className="flex flex-col items-center gap-6 max-w-md mx-auto text-center px-4">
      <div>
        <div className="text-white/40 font-mono text-xs tracking-[0.4em] mb-2">YOU SURVIVED</div>
        <h2
          className="font-display text-5xl md:text-6xl"
          style={{
            color: '#00ff88',
            textShadow: '0 0 30px rgba(0,255,136,0.8)',
          }}
        >
          YOU WIN!
        </h2>
      </div>

      <div className="w-full space-y-3">
        <div className="flex justify-between font-mono text-sm">
          <span className="text-white/60">PROGRESS</span>
          <span className="text-white">100%</span>
        </div>
        <ProgressBar progress={100} phase="won" />
        <div className="flex justify-between font-mono text-sm">
          <span className="text-white/60">FINAL TIME</span>
          <Timer elapsedTime={elapsedTime} />
        </div>
      </div>

      <button
        onClick={onRestart}
        className="w-full py-4 font-display text-2xl tracking-widest text-black rounded-lg transition-all duration-200 hover:scale-105 active:scale-95"
        style={{
          background: 'linear-gradient(135deg, #00ff88, #00cc66)',
          boxShadow: '0 0 30px rgba(0,255,136,0.5)',
        }}
      >
        PLAY AGAIN
      </button>
    </div>
  );
}
