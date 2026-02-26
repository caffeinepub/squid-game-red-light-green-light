// MediaPipe Pose integration module
// Loads @mediapipe/pose via CDN script injection (not npm) since it's not in package.json

export interface PoseResults {
  poseLandmarks?: Array<{
    x: number;
    y: number;
    z: number;
    visibility?: number;
  }>;
}

export interface PoseConfig {
  modelComplexity?: 0 | 1 | 2;
  smoothLandmarks?: boolean;
  enableSegmentation?: boolean;
  minDetectionConfidence?: number;
  minTrackingConfidence?: number;
}

// MediaPipe Pose connections for skeleton drawing
export const POSE_CONNECTIONS: [number, number][] = [
  [11, 12], // shoulders
  [11, 13], [13, 15], // left arm
  [12, 14], [14, 16], // right arm
  [11, 23], [12, 24], // torso sides
  [23, 24], // hips
  [23, 25], [25, 27], // left leg
  [24, 26], [26, 28], // right leg
];

export type PoseResultCallback = (results: PoseResults) => void;

// Internal interface matching the MediaPipe Pose API shape
interface MediaPipePoseInstance {
  setOptions(options: Record<string, unknown>): void;
  onResults(callback: PoseResultCallback): void;
  send(input: { image: HTMLVideoElement }): Promise<void>;
  close(): void;
}

interface MediaPipePoseConstructor {
  new (config: { locateFile: (file: string) => string }): MediaPipePoseInstance;
}

// Declare the global that MediaPipe injects via script tag
declare global {
  interface Window {
    Pose?: MediaPipePoseConstructor;
  }
}

const MEDIAPIPE_POSE_CDN = 'https://cdn.jsdelivr.net/npm/@mediapipe/pose/pose.js';
const MEDIAPIPE_POSE_FILES_BASE = 'https://cdn.jsdelivr.net/npm/@mediapipe/pose';

let scriptLoadPromise: Promise<void> | null = null;

function loadMediaPipeScript(): Promise<void> {
  if (scriptLoadPromise) return scriptLoadPromise;

  scriptLoadPromise = new Promise((resolve, reject) => {
    // Already loaded
    if (window.Pose) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = MEDIAPIPE_POSE_CDN;
    script.crossOrigin = 'anonymous';
    script.onload = () => {
      // Give the script a moment to register the global
      setTimeout(() => resolve(), 100);
    };
    script.onerror = () => {
      scriptLoadPromise = null; // allow retry
      reject(new Error('Failed to load MediaPipe Pose script'));
    };
    document.head.appendChild(script);
  });

  return scriptLoadPromise;
}

/**
 * Initialize MediaPipe Pose instance via CDN script injection.
 * Returns a handle with send/close methods, or null on failure.
 */
export async function initPose(
  onResults: PoseResultCallback,
  config: PoseConfig = {}
): Promise<{ send: (input: { image: HTMLVideoElement }) => Promise<void>; close: () => void } | null> {
  try {
    await loadMediaPipeScript();

    const PoseClass = window.Pose;
    if (!PoseClass) {
      throw new Error('MediaPipe Pose not available after script load');
    }

    const pose = new PoseClass({
      locateFile: (file: string) => `${MEDIAPIPE_POSE_FILES_BASE}/${file}`,
    });

    pose.setOptions({
      modelComplexity: config.modelComplexity ?? 1,
      smoothLandmarks: config.smoothLandmarks ?? true,
      enableSegmentation: config.enableSegmentation ?? false,
      minDetectionConfidence: config.minDetectionConfidence ?? 0.5,
      minTrackingConfidence: config.minTrackingConfidence ?? 0.5,
    });

    pose.onResults(onResults);

    return {
      send: async (input: { image: HTMLVideoElement }) => {
        await pose.send(input);
      },
      close: () => {
        pose.close();
      },
    };
  } catch (err) {
    console.error('Failed to initialize MediaPipe Pose:', err);
    return null;
  }
}

/**
 * Draw pose skeleton on a canvas context.
 */
export function drawPoseSkeleton(
  ctx: CanvasRenderingContext2D,
  landmarks: Array<{ x: number; y: number; visibility?: number }>,
  canvasWidth: number,
  canvasHeight: number
): void {
  if (!landmarks || landmarks.length === 0) return;

  // Draw connections
  ctx.strokeStyle = '#00ff88';
  ctx.lineWidth = 2;
  ctx.lineCap = 'round';
  for (const [startIdx, endIdx] of POSE_CONNECTIONS) {
    const start = landmarks[startIdx];
    const end = landmarks[endIdx];
    if (!start || !end) continue;
    if ((start.visibility ?? 1) < 0.3 || (end.visibility ?? 1) < 0.3) continue;

    ctx.beginPath();
    ctx.moveTo(start.x * canvasWidth, start.y * canvasHeight);
    ctx.lineTo(end.x * canvasWidth, end.y * canvasHeight);
    ctx.stroke();
  }

  // Draw landmark dots
  for (let i = 0; i < landmarks.length; i++) {
    const lm = landmarks[i];
    if (!lm || (lm.visibility ?? 1) < 0.3) continue;

    const isCore = [11, 12, 23, 24].includes(i);
    ctx.fillStyle = isCore ? '#ff2d78' : '#ffffff';
    ctx.beginPath();
    ctx.arc(lm.x * canvasWidth, lm.y * canvasHeight, isCore ? 5 : 3, 0, Math.PI * 2);
    ctx.fill();
  }
}
