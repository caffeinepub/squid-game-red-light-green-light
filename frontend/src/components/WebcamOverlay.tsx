import { useRef, useEffect } from 'react';
import { useCamera } from '../camera/useCamera';
import { usePoseTracking } from '../hooks/usePoseTracking';

interface WebcamOverlayProps {
  isActive: boolean;
  onMovementScore: (score: number) => void;
}

export function WebcamOverlay({ isActive, onMovementScore }: WebcamOverlayProps) {
  const overlayCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const {
    isActive: cameraActive,
    isSupported,
    error: cameraError,
    isLoading,
    startCamera,
    videoRef,
  } = useCamera({ facingMode: 'user', width: 320, height: 240 });

  const { movementScore, isReady, error: poseError } = usePoseTracking(
    videoRef,
    overlayCanvasRef,
    cameraActive && isActive
  );

  // Start camera when component becomes active
  useEffect(() => {
    if (isActive && !cameraActive && !isLoading) {
      startCamera();
    }
  }, [isActive, cameraActive, isLoading, startCamera]);

  // Report movement score to parent
  useEffect(() => {
    onMovementScore(movementScore);
  }, [movementScore, onMovementScore]);

  if (isSupported === false) {
    return (
      <div className="fixed bottom-4 right-4 z-50 bg-black/80 border border-game-pink/50 rounded-lg p-3 text-game-pink text-xs font-mono">
        Camera not supported
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-2">
      {/* Webcam + skeleton overlay */}
      <div
        className="relative rounded-lg overflow-hidden border-2"
        style={{
          width: 200,
          height: 150,
          borderColor: isReady ? '#00ff88' : '#ff2d78',
          boxShadow: isReady ? '0 0 12px rgba(0,255,136,0.4)' : '0 0 12px rgba(255,45,120,0.4)',
        }}
      >
        {/*
          Video element must NOT use display:none — that prevents playback in some browsers.
          Instead, position it absolutely behind the canvas with zero opacity so it plays
          but is visually hidden (the canvas renders the mirrored feed on top).
        */}
        <video
          ref={videoRef as React.RefObject<HTMLVideoElement>}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            opacity: 0,
            pointerEvents: 'none',
          }}
          playsInline
          muted
          autoPlay
        />

        {/* Canvas for mirrored video + skeleton — rendered on top of the hidden video */}
        <canvas
          ref={overlayCanvasRef}
          width={200}
          height={150}
          className="w-full h-full"
          style={{ background: '#0a0a1a', position: 'relative', zIndex: 1 }}
        />

        {/* Status indicator */}
        <div className="absolute top-1 left-1 flex items-center gap-1" style={{ zIndex: 2 }}>
          <div
            className="w-2 h-2 rounded-full"
            style={{
              background: isReady ? '#00ff88' : cameraError ? '#ff2d78' : '#f5c842',
              boxShadow: isReady ? '0 0 6px #00ff88' : 'none',
            }}
          />
          <span className="text-white text-xs font-mono" style={{ fontSize: 9 }}>
            {isReady ? 'TRACKING' : isLoading ? 'INIT...' : cameraError ? 'ERROR' : 'READY'}
          </span>
        </div>

        {/* Loading overlay */}
        {(isLoading || (!cameraActive && !cameraError)) && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60" style={{ zIndex: 3 }}>
            <div className="text-game-pink text-xs font-mono text-center">
              {isLoading ? 'Starting camera...' : 'Waiting...'}
            </div>
          </div>
        )}

        {/* Error overlay */}
        {cameraError && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80 p-2" style={{ zIndex: 3 }}>
            <div className="text-game-pink text-xs font-mono text-center leading-tight">
              {cameraError.message}
            </div>
          </div>
        )}
      </div>

      {/* Pose error */}
      {poseError && (
        <div className="bg-black/80 border border-game-pink/50 rounded px-2 py-1 text-game-pink text-xs font-mono max-w-[200px] text-center">
          {poseError}
        </div>
      )}

      {/* Movement score bar */}
      <div className="bg-black/70 border border-white/20 rounded px-2 py-1 w-[200px]">
        <div className="flex justify-between items-center mb-1">
          <span className="text-white/60 font-mono" style={{ fontSize: 9 }}>MOVEMENT</span>
          <span className="text-white font-mono" style={{ fontSize: 9 }}>
            {(movementScore * 100).toFixed(0)}%
          </span>
        </div>
        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-100"
            style={{
              width: `${movementScore * 100}%`,
              background: movementScore > 0.5 ? '#ff2d78' : '#00ff88',
            }}
          />
        </div>
      </div>
    </div>
  );
}
