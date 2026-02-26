import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { progressToZ, SCENE_CONFIG } from '../modules/scene';

interface PlayerProps {
  progress: number;
  phase: string;
}

export function Player({ progress, phase }: PlayerProps) {
  const groupRef = useRef<THREE.Group>(null);
  const targetZ = progressToZ(progress);

  useFrame(() => {
    if (!groupRef.current) return;
    // Smooth interpolation toward target position
    groupRef.current.position.z += (targetZ - groupRef.current.position.z) * 0.1;
  });

  const isEliminated = phase === 'eliminated';
  const isWon = phase === 'won';

  return (
    <group ref={groupRef} position={[0, SCENE_CONFIG.PLAYER_Y, 0]}>
      {/* Body (capsule approximated with cylinder + spheres) */}
      <mesh position={[0, 1.2, 0]} castShadow>
        <cylinderGeometry args={[0.35, 0.35, 1.2, 16]} />
        <meshStandardMaterial
          color={isEliminated ? '#ff2d78' : isWon ? '#f5c842' : '#00ff88'}
          emissive={isEliminated ? '#ff0000' : isWon ? '#f5c842' : '#00ff88'}
          emissiveIntensity={0.3}
          roughness={0.4}
          metalness={0.3}
        />
      </mesh>
      {/* Head */}
      <mesh position={[0, 2.1, 0]} castShadow>
        <sphereGeometry args={[0.35, 16, 16]} />
        <meshStandardMaterial
          color={isEliminated ? '#ff2d78' : isWon ? '#f5c842' : '#00ff88'}
          emissive={isEliminated ? '#ff0000' : isWon ? '#f5c842' : '#00ff88'}
          emissiveIntensity={0.3}
          roughness={0.4}
          metalness={0.3}
        />
      </mesh>
      {/* Left leg */}
      <mesh position={[-0.2, 0.3, 0]} castShadow>
        <cylinderGeometry args={[0.15, 0.15, 0.8, 12]} />
        <meshStandardMaterial
          color={isEliminated ? '#cc0033' : '#009955'}
          roughness={0.5}
        />
      </mesh>
      {/* Right leg */}
      <mesh position={[0.2, 0.3, 0]} castShadow>
        <cylinderGeometry args={[0.15, 0.15, 0.8, 12]} />
        <meshStandardMaterial
          color={isEliminated ? '#cc0033' : '#009955'}
          roughness={0.5}
        />
      </mesh>
      {/* Player glow point light */}
      <pointLight
        color={isEliminated ? '#ff2d78' : isWon ? '#f5c842' : '#00ff88'}
        intensity={1.5}
        distance={6}
      />
    </group>
  );
}
