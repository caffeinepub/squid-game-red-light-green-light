# Specification

## Summary
**Goal:** Eliminate the smoothing delay when a player stops moving, so the movement score drops to zero instantly upon freezing.

**Planned changes:**
- In `movementDetection.ts`, make exponential smoothing asymmetric: when all per-landmark deltas are at or below the base threshold, immediately reset the smoothed score to zero instead of decaying it gradually.
- Retain the existing slow decay formula (`prevDelta × 0.8 + currentDelta × 0.2`) only when active movement is detected (at least one landmark delta exceeds the base threshold).

**User-visible outcome:** When the player stops moving during Red Light or Green Light, the movement score drops to zero immediately with no visible lag, preventing false eliminations and halting progress advancement instantly.
