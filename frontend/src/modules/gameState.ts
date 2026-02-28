// Game state machine logic — pure functions, no React dependencies

export type GamePhase =
  | 'idle'
  | 'countdown'
  | 'green-light'
  | 'red-light'
  | 'eliminated'
  | 'won';

export interface GameState {
  phase: GamePhase;
  progress: number;       // 0-100
  countdown: number;      // 3, 2, 1
  elapsedTime: number;    // ms
  lightDuration: number;  // ms for current light phase
  lightTimer: number;     // ms elapsed in current light phase
}

export const INITIAL_GAME_STATE: GameState = {
  phase: 'idle',
  progress: 0,
  countdown: 3,
  elapsedTime: 0,
  lightDuration: 3000,
  lightTimer: 0,
};

/**
 * Dead zone: if movement score is below this fraction of the threshold,
 * it is treated as no movement (forgiveness buffer for micro-movements / camera noise).
 */
export const DEAD_ZONE_PERCENTAGE = 0.10;

/**
 * Time confirmation window for red-light elimination (milliseconds).
 * Movement must stay above threshold for this duration before elimination is triggered.
 * A single frame or brief spike will NOT cause elimination.
 */
export const CONFIRMATION_WINDOW_MS = 200;

export function getRandomLightDuration(): number {
  // 2000–6000 ms
  return 2000 + Math.random() * 4000;
}

export function shouldAdvanceProgress(
  phase: GamePhase,
  movementScore: number,
  sensitivity: number
): boolean {
  if (phase !== 'green-light') return false;
  const threshold = 0.05 - (sensitivity / 100) * 0.045;
  // Dead zone guard: scores at or below 10% of the threshold do not advance progress
  // This acts as a second line of defence even if the score was already clamped upstream
  if (movementScore <= threshold * DEAD_ZONE_PERCENTAGE) return false;
  return movementScore > threshold;
}

export function shouldEliminate(
  phase: GamePhase,
  movementScore: number,
  sensitivity: number
): boolean {
  if (phase !== 'red-light') return false;
  const threshold = 0.05 - (sensitivity / 100) * 0.045;
  // Dead zone guard: scores at or below 10% of the threshold do NOT trigger elimination.
  // A score exactly equal to (threshold * 0.10) is treated as no movement — no elimination.
  // This acts as a second line of defence even if the score was already clamped upstream.
  if (movementScore <= threshold * DEAD_ZONE_PERCENTAGE) return false;
  return movementScore > threshold;
}

export function nextPhaseAfterLight(currentPhase: 'green-light' | 'red-light'): 'green-light' | 'red-light' {
  return currentPhase === 'green-light' ? 'red-light' : 'green-light';
}
