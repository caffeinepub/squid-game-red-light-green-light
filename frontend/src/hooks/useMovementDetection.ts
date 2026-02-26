import { useRef, useEffect, useCallback } from 'react';

const SMOOTHING_WINDOW = 8;

interface MovementDetectionOptions {
  enabled: boolean;
  sensitivity: number; // 1–100
  onMovementScore: (score: number) => void;
}

export function useMovementDetection(
  videoRef: React.RefObject<HTMLVideoElement | null>,
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  options: MovementDetectionOptions
) {
  const { enabled, sensitivity, onMovementScore } = options;

  const prevFrameRef = useRef<ImageData | null>(null);
  const scoreHistoryRef = useRef<number[]>([]);
  const rafRef = useRef<number>(0);
  const enabledRef = useRef(enabled);
  const sensitivityRef = useRef(sensitivity);

  useEffect(() => { enabledRef.current = enabled; }, [enabled]);
  useEffect(() => { sensitivityRef.current = sensitivity; }, [sensitivity]);

  const onMovementScoreRef = useRef(onMovementScore);
  useEffect(() => { onMovementScoreRef.current = onMovementScore; }, [onMovementScore]);

  const processFrame = useCallback(() => {
    if (!enabledRef.current) {
      rafRef.current = requestAnimationFrame(processFrame);
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.readyState < 2) {
      rafRef.current = requestAnimationFrame(processFrame);
      return;
    }

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) {
      rafRef.current = requestAnimationFrame(processFrame);
      return;
    }

    const w = canvas.width;
    const h = canvas.height;

    // Draw current frame (mirrored for selfie view)
    ctx.save();
    ctx.scale(-1, 1);
    ctx.drawImage(video, -w, 0, w, h);
    ctx.restore();

    const currentFrame = ctx.getImageData(0, 0, w, h);

    let rawScore = 0;

    if (prevFrameRef.current) {
      const prev = prevFrameRef.current.data;
      const curr = currentFrame.data;
      const len = curr.length;
      let diff = 0;
      let pixelCount = 0;

      // Sample every 4th pixel for performance
      for (let i = 0; i < len; i += 16) {
        const dr = Math.abs(curr[i] - prev[i]);
        const dg = Math.abs(curr[i + 1] - prev[i + 1]);
        const db = Math.abs(curr[i + 2] - prev[i + 2]);
        const pixelDiff = (dr + dg + db) / 3;
        diff += pixelDiff;
        pixelCount++;
      }

      rawScore = pixelCount > 0 ? diff / pixelCount : 0;
    }

    prevFrameRef.current = currentFrame;

    // Add to smoothing window
    scoreHistoryRef.current.push(rawScore);
    if (scoreHistoryRef.current.length > SMOOTHING_WINDOW) {
      scoreHistoryRef.current.shift();
    }

    // Compute smoothed score
    const smoothed =
      scoreHistoryRef.current.reduce((a, b) => a + b, 0) /
      scoreHistoryRef.current.length;

    onMovementScoreRef.current(smoothed);

    rafRef.current = requestAnimationFrame(processFrame);
  }, [videoRef, canvasRef]);

  useEffect(() => {
    rafRef.current = requestAnimationFrame(processFrame);
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [processFrame]);

  const reset = useCallback(() => {
    prevFrameRef.current = null;
    scoreHistoryRef.current = [];
  }, []);

  return { reset };
}
