import { useEffect, useRef, useState, useCallback } from 'react';
import { initPose, drawPoseSkeleton, PoseResults } from '../modules/poseTracking';
import { computeMovementScore, Landmark } from '../modules/movementDetection';

const LANDMARK_BUFFER_SIZE = 12;

export interface PoseTrackingResult {
  movementScore: number;
  landmarks: Landmark[] | null;
  isReady: boolean;
  error: string | null;
}

export function usePoseTracking(
  videoRef: React.RefObject<HTMLVideoElement | null>,
  overlayCanvasRef: React.RefObject<HTMLCanvasElement | null>,
  isActive: boolean
): PoseTrackingResult {
  const [movementScore, setMovementScore] = useState(0);
  const [landmarks, setLandmarks] = useState<Landmark[] | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const poseRef = useRef<{ send: (input: { image: HTMLVideoElement }) => Promise<void>; close: () => void } | null>(null);
  const landmarkBufferRef = useRef<Landmark[][]>([]);
  const rafRef = useRef<number | null>(null);
  const processingRef = useRef(false);
  const videoReadyRef = useRef(false);

  // Draw the current video frame onto the canvas (called every RAF tick)
  const drawVideoFrame = useCallback(() => {
    const video = videoRef.current;
    const canvas = overlayCanvasRef.current;
    if (!video || !canvas) return;
    if (video.readyState < 4) return; // HAVE_ENOUGH_DATA

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.save();
    ctx.scale(-1, 1);
    ctx.drawImage(video, -canvas.width, 0, canvas.width, canvas.height);
    ctx.restore();
  }, [videoRef, overlayCanvasRef]);

  const processFrame = useCallback(async () => {
    const video = videoRef.current;

    // Gate: only proceed when video is truly ready
    if (!video || !poseRef.current || !videoReadyRef.current || video.readyState < 4) {
      // Still draw whatever we can while waiting
      drawVideoFrame();
      rafRef.current = requestAnimationFrame(processFrame);
      return;
    }

    // Always draw the video frame first so the feed is visible even between pose frames
    drawVideoFrame();

    if (!processingRef.current) {
      processingRef.current = true;
      try {
        await poseRef.current.send({ image: video });
      } catch {
        // ignore individual frame errors
      }
      processingRef.current = false;
    }

    rafRef.current = requestAnimationFrame(processFrame);
  }, [videoRef, drawVideoFrame]);

  useEffect(() => {
    if (!isActive) return;

    let cancelled = false;

    const setup = async () => {
      try {
        const pose = await initPose((results: PoseResults) => {
          if (cancelled) return;

          const canvas = overlayCanvasRef.current;
          const video = videoRef.current;

          if (canvas && video && video.readyState >= 4) {
            const ctx = canvas.getContext('2d');
            if (ctx) {
              // Draw mirrored video frame as background
              ctx.save();
              ctx.scale(-1, 1);
              ctx.drawImage(video, -canvas.width, 0, canvas.width, canvas.height);
              ctx.restore();

              if (results.poseLandmarks && results.poseLandmarks.length > 0) {
                // Mirror landmarks for display (since video is mirrored)
                const mirroredLandmarks = results.poseLandmarks.map(lm => ({
                  ...lm,
                  x: 1 - lm.x,
                }));
                drawPoseSkeleton(ctx, mirroredLandmarks, canvas.width, canvas.height);
              }
            }
          }

          if (results.poseLandmarks && results.poseLandmarks.length > 0) {
            const lms = results.poseLandmarks as Landmark[];
            setLandmarks(lms);

            landmarkBufferRef.current.push(lms);
            if (landmarkBufferRef.current.length > LANDMARK_BUFFER_SIZE) {
              landmarkBufferRef.current.shift();
            }

            const score = computeMovementScore(landmarkBufferRef.current);
            setMovementScore(score);
          }
        });

        if (!pose) {
          if (!cancelled) setError('Failed to initialize pose tracking');
          return;
        }

        poseRef.current = pose;

        if (cancelled) return;

        // Wait for the video element to be ready before starting the loop
        const video = videoRef.current;
        if (video) {
          const startLoop = () => {
            if (cancelled) return;
            videoReadyRef.current = true;
            setIsReady(true);
            if (rafRef.current === null) {
              rafRef.current = requestAnimationFrame(processFrame);
            }
          };

          if (video.readyState >= 4) {
            // Already ready
            startLoop();
          } else {
            // Wait for the playing event
            const onPlaying = () => {
              video.removeEventListener('playing', onPlaying);
              video.removeEventListener('canplaythrough', onCanPlayThrough);
              startLoop();
            };
            const onCanPlayThrough = () => {
              video.removeEventListener('playing', onPlaying);
              video.removeEventListener('canplaythrough', onCanPlayThrough);
              startLoop();
            };
            video.addEventListener('playing', onPlaying);
            video.addEventListener('canplaythrough', onCanPlayThrough);

            // Also poll as a fallback in case events already fired
            const pollInterval = setInterval(() => {
              if (cancelled) {
                clearInterval(pollInterval);
                return;
              }
              if (video.readyState >= 4) {
                clearInterval(pollInterval);
                video.removeEventListener('playing', onPlaying);
                video.removeEventListener('canplaythrough', onCanPlayThrough);
                startLoop();
              }
            }, 200);
          }
        } else {
          // No video ref yet — start loop anyway and let the gate handle it
          setIsReady(true);
          rafRef.current = requestAnimationFrame(processFrame);
        }
      } catch (err) {
        if (!cancelled) {
          setError('Pose tracking initialization failed');
          console.error(err);
        }
      }
    };

    setup();

    return () => {
      cancelled = true;
      videoReadyRef.current = false;
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      if (poseRef.current) {
        poseRef.current.close();
        poseRef.current = null;
      }
      landmarkBufferRef.current = [];
      setIsReady(false);
      setMovementScore(0);
      setLandmarks(null);
    };
  }, [isActive, processFrame, videoRef, overlayCanvasRef]);

  return { movementScore, landmarks, isReady, error };
}
