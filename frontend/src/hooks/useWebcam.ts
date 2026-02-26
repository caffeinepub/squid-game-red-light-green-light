import { useState, useEffect, useRef } from 'react';

export type WebcamStatus = 'idle' | 'requesting' | 'ready' | 'error';

export interface WebcamState {
  stream: MediaStream | null;
  status: WebcamStatus;
  error: string | null;
  videoRef: React.RefObject<HTMLVideoElement | null>;
}

export function useWebcam(enabled: boolean): WebcamState {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [status, setStatus] = useState<WebcamStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    let cancelled = false;
    setStatus('requesting');

    navigator.mediaDevices
      .getUserMedia({ video: { width: 640, height: 480, facingMode: 'user' } })
      .then((mediaStream) => {
        if (cancelled) {
          mediaStream.getTracks().forEach((t) => t.stop());
          return;
        }
        setStream(mediaStream);
        setStatus('ready');
        setError(null);
      })
      .catch((err: Error) => {
        if (cancelled) return;
        setStatus('error');
        setError(err.message || 'Camera access denied');
      });

    return () => {
      cancelled = true;
    };
  }, [enabled]);

  // Attach stream to video element
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !stream) return;
    video.srcObject = stream;
    video.play().catch(() => {});
  }, [stream]);

  // Cleanup stream on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach((t) => t.stop());
      }
    };
  }, [stream]);

  return { stream, status, error, videoRef };
}
