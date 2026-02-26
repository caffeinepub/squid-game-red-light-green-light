import React, { useState, useCallback, useRef } from 'react';
import GameCanvas from './components/GameCanvas';
import ProgressBar from './components/ProgressBar';
import SensitivitySlider from './components/SensitivitySlider';
import Timer from './components/Timer';
import StatusText from './components/StatusText';
import CountdownDisplay from './components/CountdownDisplay';
import IdleScreen from './components/IdleScreen';
import EliminatedScreen from './components/EliminatedScreen';
import WonScreen from './components/WonScreen';
import { useGameState } from './hooks/useGameState';

export default function App() {
  const [sensitivity, setSensitivity] = useState(35);
  const [movementScore, setMovementScore] = useState(0);
  const resetMovementRef = useRef<(() => void) | null>(null);

  const handleReset = useCallback(() => {
    resetMovementRef.current?.();
  }, []);

  const {
    phase,
    countdown,
    progress,
    survivalTime,
    finalProgress,
    finalTime,
    startGame,
    restartGame,
  } = useGameState({
    movementScore,
    sensitivity,
    onReset: handleReset,
  });

  const isActive =
    phase === 'countdown' ||
    phase === 'green-light' ||
    phase === 'red-light';

  const showCamera = phase !== 'idle';

  const handleResetFn = useCallback((fn: () => void) => {
    resetMovementRef.current = fn;
  }, []);

  // Background glow based on phase
  const bgGlow =
    phase === 'green-light'
      ? 'shadow-[inset_0_0_80px_rgba(0,255,136,0.06)]'
      : phase === 'red-light'
      ? 'shadow-[inset_0_0_80px_rgba(255,51,51,0.08)]'
      : phase === 'eliminated'
      ? 'shadow-[inset_0_0_80px_rgba(255,51,51,0.05)]'
      : phase === 'won'
      ? 'shadow-[inset_0_0_80px_rgba(0,255,136,0.08)]'
      : '';

  const borderColor =
    phase === 'green-light'
      ? 'border-game-green/30'
      : phase === 'red-light'
      ? 'border-game-red/30'
      : phase === 'eliminated'
      ? 'border-game-red/20'
      : phase === 'won'
      ? 'border-game-green/30'
      : 'border-game-border';

  return (
    <div
      className="w-screen h-screen bg-game-bg flex flex-col overflow-hidden"
      style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
    >
      {/* Header */}
      <header className="flex-shrink-0 flex items-center justify-between px-4 py-2 border-b border-game-border bg-game-card">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-game-pink animate-pulse" />
          <span className="font-bebas text-sm tracking-[0.3em] text-game-white">
            SQUID GAME
          </span>
          <span className="font-bebas text-xs tracking-widest text-game-dim">
            RED LIGHT · GREEN LIGHT
          </span>
        </div>
        <div className="flex items-center gap-4">
          {isActive && (
            <Timer time={survivalTime} label="SURVIVAL" />
          )}
          {/* Phase indicator */}
          <div
            className={`font-bebas text-xs tracking-widest px-2 py-1 border ${
              phase === 'green-light'
                ? 'text-game-green border-game-green/40 bg-game-green/10'
                : phase === 'red-light'
                ? 'text-game-red border-game-red/40 bg-game-red/10'
                : phase === 'countdown'
                ? 'text-game-white border-game-border bg-game-card'
                : phase === 'eliminated'
                ? 'text-game-red border-game-red/40'
                : phase === 'won'
                ? 'text-game-green border-game-green/40'
                : 'text-game-dim border-game-border'
            }`}
          >
            {phase === 'idle' && 'STANDBY'}
            {phase === 'countdown' && 'COUNTDOWN'}
            {phase === 'green-light' && '● GREEN LIGHT'}
            {phase === 'red-light' && '● RED LIGHT'}
            {phase === 'eliminated' && '✕ ELIMINATED'}
            {phase === 'won' && '★ WINNER'}
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden min-h-0">
        {/* Camera / Game area */}
        <div className={`relative flex-1 border ${borderColor} ${bgGlow} transition-all duration-500 overflow-hidden`}>
          {/* Camera feed */}
          <GameCanvas
            active={showCamera}
            onMovementScore={setMovementScore}
            sensitivity={sensitivity}
            onReset={handleResetFn}
          />

          {/* Overlay screens */}
          {phase === 'idle' && (
            <div className="absolute inset-0 bg-black/85 flex items-center justify-center">
              <IdleScreen onStart={startGame} />
            </div>
          )}

          {phase === 'countdown' && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <CountdownDisplay value={countdown} />
            </div>
          )}

          {(phase === 'green-light' || phase === 'red-light') && (
            <div className="absolute bottom-0 left-0 right-0 flex items-end justify-center pb-6 pointer-events-none">
              <StatusText phase={phase} />
            </div>
          )}

          {phase === 'eliminated' && (
            <div className="absolute inset-0 bg-black/90 flex items-center justify-center">
              <EliminatedScreen
                progress={finalProgress}
                time={finalTime}
                onRestart={restartGame}
              />
            </div>
          )}

          {phase === 'won' && (
            <div className="absolute inset-0 bg-black/85 flex items-center justify-center">
              <WonScreen time={finalTime} onRestart={restartGame} />
            </div>
          )}

          {/* Movement indicator (during active play) */}
          {isActive && phase !== 'countdown' && (
            <div className="absolute top-3 left-3 flex items-center gap-2 bg-black/60 px-2 py-1 border border-game-border">
              <span className="font-bebas text-xs tracking-widest text-game-dim">MOTION</span>
              <div className="w-16 h-1.5 bg-game-border overflow-hidden">
                <div
                  className={`h-full transition-all duration-75 ${
                    phase === 'red-light' ? 'bg-game-red' : 'bg-game-green'
                  }`}
                  style={{
                    width: `${Math.min((movementScore / 20) * 100, 100)}%`,
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Side panel */}
        <aside className="flex-shrink-0 w-full lg:w-64 xl:w-72 bg-game-card border-t lg:border-t-0 lg:border-l border-game-border flex flex-col">
          {/* Progress section */}
          <div className="p-4 border-b border-game-border">
            <ProgressBar progress={progress} phase={phase} />
          </div>

          {/* Sensitivity section */}
          <div className="p-4 border-b border-game-border">
            <SensitivitySlider
              value={sensitivity}
              onChange={setSensitivity}
              disabled={isActive}
            />
            {isActive && (
              <p className="font-bebas text-xs text-game-dim/50 tracking-wider mt-2">
                ADJUST BETWEEN ROUNDS
              </p>
            )}
          </div>

          {/* How to play */}
          <div className="p-4 flex-1">
            <div className="font-bebas text-xs tracking-widest text-game-dim mb-3">HOW TO PLAY</div>
            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 rounded-full bg-game-green mt-1.5 flex-shrink-0" />
                <p className="text-game-dim text-xs leading-relaxed">
                  <span className="text-game-green">Green Light</span> — move your body to fill the progress bar
                </p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 rounded-full bg-game-red mt-1.5 flex-shrink-0" />
                <p className="text-game-dim text-xs leading-relaxed">
                  <span className="text-game-red">Red Light</span> — stay completely still or you're eliminated
                </p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 rounded-full bg-game-pink mt-1.5 flex-shrink-0" />
                <p className="text-game-dim text-xs leading-relaxed">
                  Reach <span className="text-game-white">100%</span> progress to win the game
                </p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 rounded-full bg-game-dim mt-1.5 flex-shrink-0" />
                <p className="text-game-dim text-xs leading-relaxed">
                  Adjust sensitivity if detection is too strict or too lenient
                </p>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          {(phase === 'eliminated' || phase === 'won') && (
            <div className="p-4 border-t border-game-border">
              <button
                onClick={restartGame}
                className="w-full font-bebas text-lg tracking-[0.2em] py-3 bg-game-pink text-game-white border border-game-pink hover:bg-transparent hover:text-game-pink transition-all duration-200"
              >
                ↺ RESTART
              </button>
            </div>
          )}

          {phase === 'idle' && (
            <div className="p-4 border-t border-game-border">
              <button
                onClick={startGame}
                className="w-full font-bebas text-lg tracking-[0.2em] py-3 bg-game-pink text-game-white border border-game-pink hover:bg-transparent hover:text-game-pink transition-all duration-200"
              >
                ▶ START
              </button>
            </div>
          )}
        </aside>
      </main>

      {/* Footer */}
      <footer className="flex-shrink-0 flex items-center justify-between px-4 py-2 border-t border-game-border bg-game-card">
        <div className="font-bebas text-xs tracking-widest text-game-dim/40">
          © {new Date().getFullYear()} SQUID GAME: RED LIGHT GREEN LIGHT
        </div>
        <div className="font-bebas text-xs tracking-wider text-game-dim/40">
          Built with{' '}
          <span className="text-game-pink">♥</span>{' '}
          using{' '}
          <a
            href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(
              typeof window !== 'undefined' ? window.location.hostname : 'squid-game-rlgl'
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-game-pink hover:text-game-white transition-colors"
          >
            caffeine.ai
          </a>
        </div>
      </footer>
    </div>
  );
}
