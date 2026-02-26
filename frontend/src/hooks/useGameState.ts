import { useState, useEffect, useRef, useCallback } from 'react';
import {
  playGreenLightSound,
  playRedLightSound,
  playEliminationSound,
  playVictorySound,
  playCountdownBeep,
} from '../utils/audioEffects';

export type GamePhase =
  | 'idle'
  | 'countdown'
  | 'green-light'
  | 'red-light'
  | 'eliminated'
  | 'won';

export interface GameState {
  phase: GamePhase;
  countdown: number; // 3, 2, 1
  progress: number;  // 0–100
  survivalTime: number; // seconds
  finalProgress: number;
  finalTime: number;
}

interface UseGameStateOptions {
  movementScore: number;
  sensitivity: number; // 1–100
  onReset?: () => void;
}

// Convert sensitivity slider (1–100) to a pixel-diff threshold
// Lower sensitivity = higher threshold (more forgiving)
// Higher sensitivity = lower threshold (more strict)
function sensitivityToThreshold(sensitivity: number): number {
  // sensitivity 1 → threshold ~25 (very forgiving)
  // sensitivity 50 → threshold ~8
  // sensitivity 100 → threshold ~2 (very strict)
  return Math.max(1.5, 28 - (sensitivity / 100) * 26);
}

// Random duration between min and max seconds
function randomDuration(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

// Occasionally produce a dramatic long red-light hold
function randomRedLightDuration(): number {
  const dramatic = Math.random() < 0.25; // 25% chance of dramatic hold
  if (dramatic) return randomDuration(8, 13);
  return randomDuration(2, 6);
}

export function useGameState({ movementScore, sensitivity, onReset }: UseGameStateOptions) {
  const [phase, setPhase] = useState<GamePhase>('idle');
  const [countdown, setCountdown] = useState(3);
  const [progress, setProgress] = useState(0);
  const [survivalTime, setSurvivalTime] = useState(0);
  const [finalProgress, setFinalProgress] = useState(0);
  const [finalTime, setFinalTime] = useState(0);

  const phaseRef = useRef<GamePhase>('idle');
  const progressRef = useRef(0);
  const survivalStartRef = useRef<number>(0);
  const survivalTimeRef = useRef(0);
  const lightTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const survivalTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const movementScoreRef = useRef(movementScore);
  const sensitivityRef = useRef(sensitivity);

  useEffect(() => { movementScoreRef.current = movementScore; }, [movementScore]);
  useEffect(() => { sensitivityRef.current = sensitivity; }, [sensitivity]);

  const clearLightTimer = useCallback(() => {
    if (lightTimerRef.current) {
      clearTimeout(lightTimerRef.current);
      lightTimerRef.current = null;
    }
  }, []);

  const clearSurvivalTimer = useCallback(() => {
    if (survivalTimerRef.current) {
      clearInterval(survivalTimerRef.current);
      survivalTimerRef.current = null;
    }
  }, []);

  const startSurvivalTimer = useCallback(() => {
    survivalStartRef.current = Date.now();
    survivalTimerRef.current = setInterval(() => {
      const elapsed = (Date.now() - survivalStartRef.current) / 1000;
      survivalTimeRef.current = elapsed;
      setSurvivalTime(elapsed);
    }, 100);
  }, []);

  const transitionToGreenLight = useCallback(() => {
    phaseRef.current = 'green-light';
    setPhase('green-light');
    playGreenLightSound();

    const duration = randomDuration(2, 6) * 1000;
    lightTimerRef.current = setTimeout(() => {
      transitionToRedLight();
    }, duration);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const transitionToRedLight = useCallback(() => {
    phaseRef.current = 'red-light';
    setPhase('red-light');
    playRedLightSound();

    const duration = randomRedLightDuration() * 1000;
    lightTimerRef.current = setTimeout(() => {
      transitionToGreenLight();
    }, duration);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Progress update loop during green-light
  useEffect(() => {
    if (phase !== 'green-light') return;

    const interval = setInterval(() => {
      const threshold = sensitivityToThreshold(sensitivityRef.current);
      const score = movementScoreRef.current;

      if (score > threshold) {
        const increment = Math.min(score * 0.08, 1.5); // scale progress with movement
        const newProgress = Math.min(progressRef.current + increment, 100);
        progressRef.current = newProgress;
        setProgress(newProgress);

        if (newProgress >= 100) {
          clearInterval(interval);
          clearLightTimer();
          clearSurvivalTimer();
          const finalT = survivalTimeRef.current;
          setFinalProgress(100);
          setFinalTime(finalT);
          phaseRef.current = 'won';
          setPhase('won');
          playVictorySound();
        }
      }
    }, 50);

    return () => clearInterval(interval);
  }, [phase, clearLightTimer, clearSurvivalTimer]);

  // Elimination check during red-light
  useEffect(() => {
    if (phase !== 'red-light') return;

    const interval = setInterval(() => {
      const threshold = sensitivityToThreshold(sensitivityRef.current);
      const score = movementScoreRef.current;

      if (score > threshold) {
        clearInterval(interval);
        clearLightTimer();
        clearSurvivalTimer();
        const finalT = survivalTimeRef.current;
        const finalP = progressRef.current;
        setFinalProgress(finalP);
        setFinalTime(finalT);
        phaseRef.current = 'eliminated';
        setPhase('eliminated');
        playEliminationSound();
      }
    }, 50);

    return () => clearInterval(interval);
  }, [phase, clearLightTimer, clearSurvivalTimer]);

  const startGame = useCallback(() => {
    // Reset state
    progressRef.current = 0;
    survivalTimeRef.current = 0;
    setProgress(0);
    setSurvivalTime(0);
    setFinalProgress(0);
    setFinalTime(0);
    clearLightTimer();
    clearSurvivalTimer();
    onReset?.();

    // Start countdown
    setCountdown(3);
    phaseRef.current = 'countdown';
    setPhase('countdown');
    playCountdownBeep(false);

    let count = 3;
    const countInterval = setInterval(() => {
      count--;
      if (count > 0) {
        setCountdown(count);
        playCountdownBeep(count === 1);
      } else {
        clearInterval(countInterval);
        startSurvivalTimer();
        transitionToGreenLight();
      }
    }, 1000);
  }, [clearLightTimer, clearSurvivalTimer, startSurvivalTimer, transitionToGreenLight, onReset]);

  const restartGame = useCallback(() => {
    clearLightTimer();
    clearSurvivalTimer();
    phaseRef.current = 'idle';
    setPhase('idle');
    progressRef.current = 0;
    survivalTimeRef.current = 0;
    setProgress(0);
    setSurvivalTime(0);
    setFinalProgress(0);
    setFinalTime(0);
    onReset?.();
  }, [clearLightTimer, clearSurvivalTimer, onReset]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearLightTimer();
      clearSurvivalTimer();
    };
  }, [clearLightTimer, clearSurvivalTimer]);

  return {
    phase,
    countdown,
    progress,
    survivalTime,
    finalProgress,
    finalTime,
    startGame,
    restartGame,
  };
}
