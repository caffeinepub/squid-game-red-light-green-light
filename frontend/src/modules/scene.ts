// Scene configuration constants for the 3D world layout

export const SCENE_CONFIG = {
  // Track length - player travels from z=0 to FINISH_Z
  TRACK_LENGTH: 80,
  FINISH_Z: -80,

  // Ground plane
  GROUND_WIDTH: 20,
  GROUND_LENGTH: 120,
  GROUND_Y: -1,

  // Doll position (at the finish line)
  DOLL_Z: -85,
  DOLL_Y: 1.5,

  // Player start position
  PLAYER_START_Z: 0,
  PLAYER_Y: 0,

  // Camera offsets from player
  CAMERA_Y_OFFSET: 5,
  CAMERA_Z_OFFSET: 10,
  CAMERA_LOOK_AHEAD: -20,

  // Colors
  GROUND_COLOR: '#1a1a2e',
  TRACK_COLOR: '#16213e',
  FINISH_LINE_COLOR: '#ff2d78',
  DOLL_COLOR: '#f5c842',
  PLAYER_COLOR: '#00ff88',
  SKY_COLOR: '#0a0a1a',
};

// Calculate player Z position from progress (0-100)
export function progressToZ(progress: number): number {
  return SCENE_CONFIG.PLAYER_START_Z + (progress / 100) * (SCENE_CONFIG.FINISH_Z - SCENE_CONFIG.PLAYER_START_Z);
}
