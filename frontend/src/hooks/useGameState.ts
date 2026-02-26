import { useState, useEffect, useRef, useCallback } from 'react';
import {
  GamePhase,
  INITIAL_GAME_STATE,
  getRandomLightDuration,
  shouldAdvanceProgress,
  shouldEliminate,
  nextPhaseAfterLight,
} from '../modules/gameState';
import { clampToDeadZone } from '../modules/movementDetection';
import {
  playGreenLightSound,
  playRedLightSound,
  playEliminationSound,
  playVictorySound,
  playCountdownBeep,
} from '../utils/audioEffects';

export interface GameStateResult {
  phase: GamePhase;
  progress: number;
  countdown: number;
  elapsedTime: number;
  startGame: () => void;
  resetGame: () => void;
}

export function useGameState(
  movementScore: number,
  sensitivity: number
): GameStateResult {
  const [phase, setPhase] = useState<GamePhase>('idle');
  const [progress, setProgress] = useState(0);
  const [countdown, setCountdown] = useState(3);
  const [elapsedTime, setElapsedTime] = useState(0);

  const phaseRef = useRef<GamePhase>('idle');
  const progressRef = useRef(0);
  const lightTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const timerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const countdownIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const movementScoreRef = useRef(movementScore);
  const sensitivityRef = useRef(sensitivity);

  // Keep refs in sync
  useEffect(() => {
    movementScoreRef.current = movementScore;
  }, [movementScore]);

  useEffect(() => {
    sensitivityRef.current = sensitivity;
  }, [sensitivity]);

  const clearAllTimers = useCallback(() => {
    if (lightTimerRef.current) clearTimeout(lightTimerRef.current);
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    lightTimerRef.current = null;
    timerIntervalRef.current = null;
    countdownIntervalRef.current = null;
  }, []);

  const setPhaseAndRef = useCallback((p: GamePhase) => {
    phaseRef.current = p;
    setPhase(p);
  }, []);

  const scheduleNextLight = useCallback((currentPhase: 'green-light' | 'red-light') => {
    const duration = getRandomLightDuration();
    lightTimerRef.current = setTimeout(() => {
      const next = nextPhaseAfterLight(currentPhase);
      setPhaseAndRef(next);
      if (next === 'green-light') {
        playGreenLightSound();
      } else {
        playRedLightSound();
      }
      scheduleNextLight(next);
    }, duration);
  }, [setPhaseAndRef]);

  const startSurvivalTimer = useCallback(() => {
    const startTime = Date.now();
    timerIntervalRef.current = setInterval(() => {
      setElapsedTime(Date.now() - startTime);
    }, 100);
  }, []);

  const startGame = useCallback(() => {
    clearAllTimers();
    setPhaseAndRef('countdown');
    setProgress(0);
    progressRef.current = 0;
    setElapsedTime(0);
    setCountdown(3);

    let count = 3;
    playCountdownBeep();
    countdownIntervalRef.current = setInterval(() => {
      count -= 1;
      if (count > 0) {
        setCountdown(count);
        playCountdownBeep();
      } else {
        clearInterval(countdownIntervalRef.current!);
        countdownIntervalRef.current = null;
        setPhaseAndRef('green-light');
        playGreenLightSound();
        startSurvivalTimer();
        scheduleNextLight('green-light');
      }
    }, 1000);
  }, [clearAllTimers, setPhaseAndRef, startSurvivalTimer, scheduleNextLight]);

  const resetGame = useCallback(() => {
    clearAllTimers();
    setPhaseAndRef('idle');
    setProgress(0);
    progressRef.current = 0;
    setElapsedTime(0);
    setCountdown(3);
  }, [clearAllTimers, setPhaseAndRef]);

  // Movement detection loop — uses the clamped score exclusively
  useEffect(() => {
    if (phase !== 'green-light' && phase !== 'red-light') return;

    const checkMovement = () => {
      const currentPhase = phaseRef.current;
      const rawScore = movementScoreRef.current;
      const sens = sensitivityRef.current;

      // Apply dead zone clamp BEFORE any game state evaluation.
      // Any score at or below (threshold × 0.10) is clamped to 0 here,
      // so no downstream logic ever sees a non-zero sub-dead-zone score.
      const score = clampToDeadZone(rawScore, sens);

      if (currentPhase === 'green-light') {
        if (shouldAdvanceProgress(currentPhase, score, sens)) {
          const newProgress = Math.min(progressRef.current + 0.3, 100);
          progressRef.current = newProgress;
          setProgress(newProgress);

          if (newProgress >= 100) {
            clearAllTimers();
            setPhaseAndRef('won');
            playVictorySound();
            return;
          }
        }
      } else if (currentPhase === 'red-light') {
        if (shouldEliminate(currentPhase, score, sens)) {
          clearAllTimers();
          setPhaseAndRef('eliminated');
          playEliminationSound();
          return;
        }
      }
    };

    const interval = setInterval(checkMovement, 50);
    return () => clearInterval(interval);
  }, [phase, clearAllTimers, setPhaseAndRef]);

  // Cleanup on unmount
  useEffect(() => {
    return () => clearAllTimers();
  }, [clearAllTimers]);

  return { phase, progress, countdown, elapsedTime, startGame, resetGame };
}
