# Specification

## Summary
**Goal:** Strengthen the dead zone mechanic in the Squid Game: Red Light Green Light app so that small movements (below 10% of the threshold) never cause player elimination.

**Planned changes:**
- In `movementDetection.ts`, clamp any smoothed movement score strictly below `threshold × 0.10` to zero before returning it to callers.
- In `gameState.ts`, add an explicit guard that blocks the elimination transition unless the movement score is strictly greater than `threshold × 0.10`, acting as a second line of defence.
- In `useGameState.ts`, ensure all movement score consumption for elimination and progress decisions uses the post-clamp value from `movementDetection.ts`, removing any intermediate raw-landmark re-evaluation that bypasses the dead zone.

**User-visible outcome:** Players will no longer be eliminated for very small or incidental movements; only motion exceeding 10% of the sensitivity threshold will register as meaningful movement during Red Light.
