// Movement detection from MediaPipe pose landmarks

export interface Landmark {
  x: number;
  y: number;
  z: number;
  visibility?: number;
}

// Core body point indices in MediaPipe Pose
// 11=left shoulder, 12=right shoulder, 23=left hip, 24=right hip
export const CORE_LANDMARK_INDICES = [11, 12, 23, 24];

const SMOOTHING_FRAMES = 8;

/**
 * Dead zone: if movement score is below this fraction of the threshold,
 * it is treated as no movement (forgiveness buffer for micro-movements / camera noise).
 */
export const DEAD_ZONE_PERCENTAGE = 0.10;

/**
 * Compute smoothed movement score from a buffer of recent landmark frames.
 * Returns a value in [0, 1] representing how much movement was detected.
 */
export function computeMovementScore(
  landmarkBuffer: Landmark[][]
): number {
  if (landmarkBuffer.length < 2) return 0;

  let totalDelta = 0;
  let count = 0;

  // Compare consecutive frames
  const framesToCompare = Math.min(landmarkBuffer.length - 1, SMOOTHING_FRAMES);
  for (let i = landmarkBuffer.length - framesToCompare - 1; i < landmarkBuffer.length - 1; i++) {
    const frameA = landmarkBuffer[i];
    const frameB = landmarkBuffer[i + 1];
    if (!frameA || !frameB) continue;

    for (const idx of CORE_LANDMARK_INDICES) {
      const lmA = frameA[idx];
      const lmB = frameB[idx];
      if (!lmA || !lmB) continue;
      if ((lmA.visibility ?? 1) < 0.3 || (lmB.visibility ?? 1) < 0.3) continue;

      const dx = lmB.x - lmA.x;
      const dy = lmB.y - lmA.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      totalDelta += dist;
      count++;
    }
  }

  if (count === 0) return 0;

  const avgDelta = totalDelta / count;
  // Normalize: typical movement is 0.001–0.05 range in normalized coords
  // Scale to 0-1 where 0.02 = full movement
  return Math.min(avgDelta / 0.02, 1);
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
