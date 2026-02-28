import { useState, useEffect, useRef, useCallback } from 'react';
import {
  GamePhase,
  INITIAL_GAME_STATE,
  getRandomLightDuration,
  shouldAdvanceProgress,
  shouldEliminate,
  nextPhaseAfterLight,
  CONFIRMATION_WINDOW_MS,
} from '../modules/gameState';
import { clampToDeadZone, resetMovementSmoother } from '../modules/movementDetection';
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

  /**
   * Time confirmation window state for red-light elimination.
   * confirmationStartRef: timestamp (ms) when sustained movement above threshold began.
   * null means no active confirmation timer.
   */
  const confirmationStartRef = useRef<number | null>(null);

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
      // Reset confirmation timer whenever the light phase changes
      confirmationStartRef.current = null;
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
    // Reset the exponential smoother so stale state from a previous game doesn't bleed in
    resetMovementSmoother();
    confirmationStartRef.current = null;
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
    resetMovementSmoother();
    confirmationStartRef.current = null;
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
        // Reset confirmation timer when entering green light
        confirmationStartRef.current = null;

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
        // Time confirmation window for elimination:
        // Only eliminate if movement stays above threshold for CONFIRMATION_WINDOW_MS continuously.
        //
        // Guard 1 (dead zone): score must be > 0 after clampToDeadZone (already applied above).
        // Guard 2 (shouldEliminate): score must exceed the sensitivity threshold.
        // Guard 3 (time window): movement must be sustained for ≥ CONFIRMATION_WINDOW_MS.

        if (shouldEliminate(currentPhase, score, sens)) {
          // Movement is above threshold — start or continue the confirmation timer
          if (confirmationStartRef.current === null) {
            // First frame above threshold — start the timer
            confirmationStartRef.current = Date.now();
          } else {
            // Check if the confirmation window has elapsed
            const elapsed = Date.now() - confirmationStartRef.current;
            if (elapsed >= CONFIRMATION_WINDOW_MS) {
              // Sustained movement confirmed — eliminate the player
              clearAllTimers();
              confirmationStartRef.current = null;
              setPhaseAndRef('eliminated');
              playEliminationSound();
              return;
            }
            // Still within the window — keep waiting
          }
        } else {
          // Movement dropped below threshold — reset the confirmation timer
          confirmationStartRef.current = null;
        }
      }
    };

    const interval = setInterval(checkMovement, 50);
    return () => {
      clearInterval(interval);
      // Reset confirmation timer when the effect re-runs (phase change)
      confirmationStartRef.current = null;
    };
  }, [phase, clearAllTimers, setPhaseAndRef]);

  // Cleanup on unmount
  useEffect(() => {
    return () => clearAllTimers();
  }, [clearAllTimers]);

  return { phase, progress, countdown, elapsedTime, startGame, resetGame };
}
