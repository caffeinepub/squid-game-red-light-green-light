// Movement detection from MediaPipe pose landmarks

export interface Landmark {
  x: number;
  y: number;
  z: number;
  visibility?: number;
}

/**
 * Stable landmark indices only — nose, shoulders, hips.
 * Wrists (15, 16) and ankles (27, 28) are excluded because they jitter heavily.
 * 0=nose, 11=left shoulder, 12=right shoulder, 23=left hip, 24=right hip
 */
export const CORE_LANDMARK_INDICES = [0, 11, 12, 23, 24];

/**
 * Base movement threshold pre-filter.
 * Per-landmark deltas below this value are zeroed out before entering the
 * exponential smoother, eliminating micro-jitter at the source.
 */
export const BASE_MOVEMENT_THRESHOLD = 0.025;

/**
 * Dead zone: if movement score is below this fraction of the threshold,
 * it is treated as no movement (forgiveness buffer for micro-movements / camera noise).
 */
export const DEAD_ZONE_PERCENTAGE = 0.10;

/**
 * Exponential smoothing factor for the previous smoothed value.
 * smoothedDelta = (prevSmoothed × SMOOTH_PREV) + (currentDelta × SMOOTH_CURR)
 * Only applied when active movement is detected.
 */
const SMOOTH_PREV = 0.8;
const SMOOTH_CURR = 0.2;

/**
 * Module-level state that persists the previous smoothed delta across animation frames.
 * This is intentionally module-level so it survives between RAF ticks.
 */
let prevSmoothedDelta = 0;

/**
 * Reset the exponential smoother state (call when starting a new game).
 */
export function resetMovementSmoother(): void {
  prevSmoothedDelta = 0;
}

/**
 * Compute exponentially-smoothed movement score from the two most recent landmark frames.
 *
 * Pipeline:
 *   1. Compute per-landmark delta between the last two frames.
 *   2. Apply BASE_MOVEMENT_THRESHOLD pre-filter (zero out sub-threshold deltas).
 *   3. Average the filtered deltas across stable landmarks.
 *   4. Asymmetric smoothing:
 *      - If avgDelta === 0 (no active movement detected), immediately reset to 0.
 *      - If avgDelta > 0 (active movement), apply exponential smoothing: prev×0.8 + current×0.2
 *   5. Normalize to [0, 1].
 *
 * Returns a value in [0, 1] representing how much movement was detected.
 */
export function computeMovementScore(
  landmarkBuffer: Landmark[][]
): number {
  if (landmarkBuffer.length < 2) return prevSmoothedDelta;

  const frameA = landmarkBuffer[landmarkBuffer.length - 2];
  const frameB = landmarkBuffer[landmarkBuffer.length - 1];
  if (!frameA || !frameB) return prevSmoothedDelta;

  let totalDelta = 0;
  let count = 0;

  for (const idx of CORE_LANDMARK_INDICES) {
    const lmA = frameA[idx];
    const lmB = frameB[idx];
    if (!lmA || !lmB) continue;
    if ((lmA.visibility ?? 1) < 0.3 || (lmB.visibility ?? 1) < 0.3) continue;

    const dx = lmB.x - lmA.x;
    const dy = lmB.y - lmA.y;
    const rawDist = Math.sqrt(dx * dx + dy * dy);

    // Step 2: Pre-filter — zero out deltas below the base threshold
    const filteredDist = rawDist < BASE_MOVEMENT_THRESHOLD ? 0 : rawDist;

    totalDelta += filteredDist;
    count++;
  }

  if (count === 0) {
    // No visible landmarks — immediately reset to zero (no decay)
    prevSmoothedDelta = 0;
    return 0;
  }

  // Step 3: Average across stable landmarks
  const avgDelta = totalDelta / count;

  // Step 4: Asymmetric smoothing
  // When no active movement is detected (all landmarks below base threshold),
  // immediately reset to 0 — no decay tail-off.
  // When active movement is detected, apply exponential smoothing to attenuate spikes.
  let smoothed: number;
  if (avgDelta === 0) {
    // Player has stopped — reset immediately, no delay
    smoothed = 0;
  } else {
    // Active movement — apply exponential smoothing
    smoothed = (prevSmoothedDelta * SMOOTH_PREV) + (avgDelta * SMOOTH_CURR);
  }

  prevSmoothedDelta = smoothed;

  // Step 5: Normalize — typical movement is 0.001–0.05 range in normalized coords
  // Scale to 0-1 where 0.02 = full movement
  return Math.min(smoothed / 0.02, 1);
}

/**
 * Map a sensitivity slider value (1–100) to a threshold value.
 * sensitivity 1 = very forgiving (high threshold, hard to trigger)
 * sensitivity 100 = very strict (low threshold, easy to trigger)
 */
export function sensitivityToThreshold(sensitivity: number): number {
  return 0.05 - (sensitivity / 100) * 0.045;
}

/**
 * Clamp a raw movement score to 0 if it falls within the dead zone
 * (i.e., below DEAD_ZONE_PERCENTAGE of the threshold for the given sensitivity).
 *
 * This must be applied AFTER smoothing and BEFORE any game state evaluation,
 * so no downstream code ever receives a non-zero sub-dead-zone score.
 *
 * @param score     Raw smoothed movement score from computeMovementScore
 * @param sensitivity  Current sensitivity slider value (1–100)
 * @returns 0 if score is within the dead zone, otherwise the original score
 */
export function clampToDeadZone(score: number, sensitivity: number): number {
  const threshold = sensitivityToThreshold(sensitivity);
  const deadZoneBoundary = threshold * DEAD_ZONE_PERCENTAGE;
  // Scores at or below the dead zone boundary are clamped to 0
  if (score <= deadZoneBoundary) return 0;
  return score;
}

/**
 * Check if movement exceeds the given threshold (0-100 slider value).
 * Threshold maps: 1 = very sensitive (0.001), 100 = very strict (0.05)
 *
 * Dead zone: if the score is below DEAD_ZONE_PERCENTAGE of the threshold,
 * it is treated as no movement regardless of phase.
 */
export function isMovementAboveThreshold(score: number, sensitivity: number): boolean {
  const threshold = sensitivityToThreshold(sensitivity);
  // Dead zone: scores at or below 10% of the threshold are ignored
  if (score <= threshold * DEAD_ZONE_PERCENTAGE) return false;
  return score > threshold;
}
