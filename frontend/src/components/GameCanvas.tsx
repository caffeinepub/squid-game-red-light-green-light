import React, { useRef, useEffect } from 'react';
import { useWebcam } from '../hooks/useWebcam';
import { useMovementDetection } from '../hooks/useMovementDetection';

interface GameCanvasProps {
  active: boolean;
  onMovementScore: (score: number) => void;
  sensitivity: number;
  onReset?: (resetFn: () => void) => void;
}

const GameCanvas: React.FC<GameCanvasProps> = ({ active, onMovementScore, sensitivity, onReset }) => {
  const { stream, status, error, videoRef } = useWebcam(active);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const { reset } = useMovementDetection(videoRef, canvasRef, {
    enabled: active && status === 'ready',
    sensitivity,
    onMovementScore,
  });

  useEffect(() => {
    if (onReset) {
      onReset(reset);
    }
  }, [onReset, reset]);

  return (
    <div className="relative w-full h-full flex items-center justify-center bg-black overflow-hidden">
      {/* Hidden video element for webcam feed */}
      <video
        ref={videoRef}
        className="hidden"
        autoPlay
        playsInline
        muted
      />

      {/* Canvas showing mirrored webcam feed */}
      <canvas
        ref={canvasRef}
        width={640}
        height={480}
        className="w-full h-full object-cover"
        style={{ transform: 'scaleX(1)' }}
      />

      {/* Status overlays */}
      {active && status === 'requesting' && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80">
          <div className="text-center">
            <div className="w-12 h-12 border-2 border-game-pink border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="font-bebas text-2xl text-game-white tracking-widest">REQUESTING CAMERA</p>
          </div>
        </div>
      )}

      {active && status === 'error' && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/90">
          <div className="text-center px-6">
            <div className="text-5xl mb-4">📷</div>
            <p className="font-bebas text-2xl text-game-red tracking-widest mb-2">CAMERA UNAVAILABLE</p>
            <p className="text-game-dim text-sm">{error || 'Camera access was denied'}</p>
            <p className="text-game-dim text-xs mt-2">Movement detection will not work without camera access.</p>
          </div>
        </div>
      )}

      {!active && (
        <div className="absolute inset-0 flex items-center justify-center bg-black">
          <div className="text-center">
            <div className="text-6xl mb-4 opacity-30">🎥</div>
            <p className="font-bebas text-xl text-game-dim tracking-widest">CAMERA STANDBY</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default GameCanvas;
