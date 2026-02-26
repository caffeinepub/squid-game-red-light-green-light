import { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { SCENE_CONFIG } from '../modules/scene';

interface FollowCameraProps {
  playerZ: number;
}

export function FollowCamera({ playerZ }: FollowCameraProps) {
  const { camera } = useThree();
  const targetPositionRef = useRef(new THREE.Vector3(0, SCENE_CONFIG.CAMERA_Y_OFFSET, SCENE_CONFIG.CAMERA_Z_OFFSET));
  const targetLookAtRef = useRef(new THREE.Vector3(0, 1, playerZ + SCENE_CONFIG.CAMERA_LOOK_AHEAD));

  useFrame(() => {
    // Target camera position: behind and above player
    const desiredPos = new THREE.Vector3(
      0,
      SCENE_CONFIG.CAMERA_Y_OFFSET,
      playerZ + SCENE_CONFIG.CAMERA_Z_OFFSET
    );

    // Smooth camera follow
    targetPositionRef.current.lerp(desiredPos, 0.05);
    camera.position.copy(targetPositionRef.current);

    // Look ahead toward the doll
    const desiredLookAt = new THREE.Vector3(0, 1, playerZ + SCENE_CONFIG.CAMERA_LOOK_AHEAD);
    targetLookAtRef.current.lerp(desiredLookAt, 0.05);
    camera.lookAt(targetLookAtRef.current);
  });

  return null;
}
