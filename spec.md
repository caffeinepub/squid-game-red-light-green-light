# Specification

## Summary
**Goal:** Build a single-page, client-side Squid Game "Red Light Green Light" game with webcam-based motion detection, Squid Game visual aesthetic, procedural audio, and full game state management.

**Planned changes:**
- Create a full-viewport React game page with Squid Game aesthetic: near-black background, hot pink/red accents (#FF0066/#FF3333), bold cinematic white typography
- Implement a game state machine: idle → countdown (3-2-1) → green-light ↔ red-light → eliminated/won, with randomized 2–6s durations and occasional dramatic long red-light holds
- Access the device webcam via `getUserMedia`, draw the feed onto a canvas, and perform frame-to-frame pixel comparison in a `requestAnimationFrame` loop to produce a smoothed movement score (averaged over last 5–10 frames)
- Progress bar (0–100%) that advances only during green-light when movement score exceeds the threshold; reaching 100% triggers the won state
- Immediate elimination (no grace period) if movement score exceeds threshold during red-light; eliminated screen shows progress % and survival time
- Adjustable sensitivity slider (range 1–100) that controls the movement detection threshold in real time
- Survival timer that starts after countdown and stops on elimination or win; final time shown on result screens
- Procedural sound effects via Web Audio API (no external files): buzzer on red-light, chime on green-light, elimination sound, victory fanfare
- Large status text: "GREEN LIGHT" in bright green (#00FF88), "RED LIGHT" in bright red/pink (#FF0066); countdown digits; idle/eliminated/won screens with Start/Restart buttons

**User-visible outcome:** The user can play a browser-based Red Light Green Light game using their webcam — moving during green light advances their progress, while any movement during red light results in instant elimination. The game features Squid Game visuals, procedural sounds, a sensitivity slider, and a survival timer.
