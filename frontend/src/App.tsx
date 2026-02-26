import { useState, useCallback } from 'react';
import { useGameState } from './hooks/useGameState';
import { ThreeScene } from './components/ThreeScene';
import { WebcamOverlay } from './components/WebcamOverlay';
import { ProgressBar } from './components/ProgressBar';
import { SensitivitySlider } from './components/SensitivitySlider';
import { Timer } from './components/Timer';
import { StatusText } from './components/StatusText';
import { CountdownDisplay } from './components/CountdownDisplay';
import { IdleScreen } from './components/IdleScreen';
import { EliminatedScreen } from './components/EliminatedScreen';
import { WonScreen } from './components/WonScreen';

export default function App() {
  const [sensitivity, setSensitivity] = useState(50);
  const [movementScore, setMovementScore] = useState(0);

  const { phase, progress, countdown, elapsedTime, startGame, resetGame } = useGameState(
    movementScore,
    sensitivity
  );

  const handleMovementScore = useCallback((score: number) => {
    setMovementScore(score);
  }, []);

  // isGameActive covers countdown + green-light + red-light
  const isGameActive =
    phase === 'countdown' ||
    phase === 'green-light' ||
    phase === 'red-light';

  // showOverlay covers idle + eliminated + won (NOT countdown)
  const showOverlay =
    phase === 'idle' ||
    phase === 'eliminated' ||
    phase === 'won';

  // Phase-based border glow
  const borderGlow =
    phase === 'green-light'
      ? '0 0 0 3px rgba(0,255,136,0.5), inset 0 0 60px rgba(0,255,136,0.05)'
      : phase === 'red-light'
      ? '0 0 0 3px rgba(255,45,120,0.5), inset 0 0 60px rgba(255,45,120,0.05)'
      : 'none';

  return (
    <div
      className="relative w-screen h-screen overflow-hidden"
      style={{
        background: '#0a0a1a',
        boxShadow: borderGlow,
        transition: 'box-shadow 0.3s ease',
      }}
    >
      {/* 3D Scene — always rendered as background */}
      <ThreeScene progress={progress} phase={phase} />

      {/* HUD — shown during active gameplay and result screens */}
      {(isGameActive || phase === 'eliminated' || phase === 'won') && (
        <div className="absolute top-0 left-0 right-0 z-10 p-4 flex flex-col gap-3 pointer-events-none">
          {/* Top bar: progress + timer */}
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <ProgressBar progress={progress} phase={phase} />
            </div>
            {isGameActive && (
              <div className="pointer-events-none">
                <Timer elapsedTime={elapsedTime} />
              </div>
            )}
          </div>

          {/* Sensitivity slider — only during active game */}
          {isGameActive && (
            <div className="w-48 pointer-events-auto">
              <SensitivitySlider value={sensitivity} onChange={setSensitivity} />
            </div>
          )}
        </div>
      )}

      {/* Status text (GREEN LIGHT / RED LIGHT) */}
      {isGameActive && (
        <div className="absolute top-1/4 left-0 right-0 z-10 flex justify-center pointer-events-none">
          <StatusText phase={phase} />
        </div>
      )}

      {/* Countdown display */}
      {phase === 'countdown' && (
        <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
          <CountdownDisplay countdown={countdown} />
        </div>
      )}

      {/* Full-screen overlay for idle/eliminated/won */}
      {showOverlay && (
        <div
          className="absolute inset-0 z-30 flex items-center justify-center"
          style={{ background: 'rgba(10,10,26,0.85)', backdropFilter: 'blur(4px)' }}
        >
          {phase === 'idle' && <IdleScreen onStart={startGame} />}
          {phase === 'eliminated' && (
            <EliminatedScreen
              progress={progress}
              elapsedTime={elapsedTime}
              onRestart={resetGame}
            />
          )}
          {phase === 'won' && (
            <WonScreen elapsedTime={elapsedTime} onRestart={resetGame} />
          )}
        </div>
      )}

      {/* Webcam overlay — bottom right, shown when game is active (includes countdown) */}
      {isGameActive && (
        <WebcamOverlay isActive={true} onMovementScore={handleMovementScore} />
      )}

      {/* Footer */}
      <footer className="absolute bottom-0 left-0 right-0 z-10 pb-2 flex justify-center pointer-events-none">
        <p className="text-white/20 font-mono text-xs">
          © {new Date().getFullYear()} Built with{' '}
          <span style={{ color: '#ff2d78' }}>♥</span>{' '}
          using{' '}
          <a
            href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(
              typeof window !== 'undefined' ? window.location.hostname : 'squid-game-3d'
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="underline pointer-events-auto"
            style={{ color: '#ff2d78' }}
          >
            caffeine.ai
          </a>
        </p>
      </footer>
    </div>
  );
}
