import { Canvas } from '@react-three/fiber';
import { Stars } from '@react-three/drei';
import * as THREE from 'three';
import { Player } from './Player';
import { FollowCamera } from './FollowCamera';
import { SCENE_CONFIG, progressToZ } from '../modules/scene';
import { GamePhase } from '../modules/gameState';

interface ThreeSceneProps {
  progress: number;
  phase: GamePhase;
}

function Ground() {
  return (
    <group>
      {/* Main ground plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1, -40]} receiveShadow>
        <planeGeometry args={[SCENE_CONFIG.GROUND_WIDTH, SCENE_CONFIG.GROUND_LENGTH]} />
        <meshStandardMaterial color="#16213e" roughness={0.9} metalness={0.1} />
      </mesh>
      {/* Track lane markings */}
      {[-1, 0, 1].map((x, i) => (
        <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[x * 3, -0.99, -40]}>
          <planeGeometry args={[0.05, SCENE_CONFIG.GROUND_LENGTH]} />
          <meshStandardMaterial color="#ffffff" opacity={0.15} transparent />
        </mesh>
      ))}
    </group>
  );
}

function FinishLine() {
  return (
    <group position={[0, 0, SCENE_CONFIG.FINISH_Z]}>
      {/* Finish line bar */}
      <mesh position={[0, 0.5, 0]}>
        <boxGeometry args={[SCENE_CONFIG.GROUND_WIDTH, 0.15, 0.3]} />
        <meshStandardMaterial
          color="#ff2d78"
          emissive="#ff2d78"
          emissiveIntensity={0.8}
          roughness={0.3}
        />
      </mesh>
      {/* Finish line glow */}
      <pointLight color="#ff2d78" intensity={3} distance={15} position={[0, 2, 0]} />
      {/* Finish line posts */}
      {[-SCENE_CONFIG.GROUND_WIDTH / 2, SCENE_CONFIG.GROUND_WIDTH / 2].map((x, i) => (
        <mesh key={i} position={[x, 2, 0]}>
          <cylinderGeometry args={[0.15, 0.15, 4, 8]} />
          <meshStandardMaterial color="#ff2d78" emissive="#ff2d78" emissiveIntensity={0.5} />
        </mesh>
      ))}
    </group>
  );
}

function Doll() {
  return (
    <group position={[0, SCENE_CONFIG.DOLL_Y, SCENE_CONFIG.DOLL_Z]}>
      {/* Body */}
      <mesh position={[0, 0.5, 0]} castShadow>
        <cylinderGeometry args={[0.6, 0.7, 2.0, 16]} />
        <meshStandardMaterial color="#f5c842" emissive="#f5c842" emissiveIntensity={0.2} roughness={0.5} />
      </mesh>
      {/* Head */}
      <mesh position={[0, 2.2, 0]} castShadow>
        <sphereGeometry args={[0.65, 20, 20]} />
        <meshStandardMaterial color="#f5c842" emissive="#f5c842" emissiveIntensity={0.2} roughness={0.5} />
      </mesh>
      {/* Eyes */}
      <mesh position={[-0.22, 2.3, 0.6]}>
        <sphereGeometry args={[0.1, 8, 8]} />
        <meshStandardMaterial color="#1a1a2e" />
      </mesh>
      <mesh position={[0.22, 2.3, 0.6]}>
        <sphereGeometry args={[0.1, 8, 8]} />
        <meshStandardMaterial color="#1a1a2e" />
      </mesh>
      {/* Hair buns */}
      <mesh position={[-0.4, 2.7, 0]}>
        <sphereGeometry args={[0.22, 10, 10]} />
        <meshStandardMaterial color="#1a1a2e" />
      </mesh>
      <mesh position={[0.4, 2.7, 0]}>
        <sphereGeometry args={[0.22, 10, 10]} />
        <meshStandardMaterial color="#1a1a2e" />
      </mesh>
      {/* Arms */}
      <mesh position={[-0.9, 0.8, 0]} rotation={[0, 0, Math.PI / 6]}>
        <cylinderGeometry args={[0.18, 0.18, 1.2, 10]} />
        <meshStandardMaterial color="#f5c842" emissive="#f5c842" emissiveIntensity={0.1} />
      </mesh>
      <mesh position={[0.9, 0.8, 0]} rotation={[0, 0, -Math.PI / 6]}>
        <cylinderGeometry args={[0.18, 0.18, 1.2, 10]} />
        <meshStandardMaterial color="#f5c842" emissive="#f5c842" emissiveIntensity={0.1} />
      </mesh>
      {/* Doll glow */}
      <pointLight color="#f5c842" intensity={2} distance={12} position={[0, 2, 0]} />
    </group>
  );
}

function SceneLighting({ phase }: { phase: GamePhase }) {
  const ambientIntensity = 0.4;
  const lightColor = phase === 'green-light' ? '#00ff88' : phase === 'red-light' ? '#ff2d78' : '#ffffff';

  return (
    <>
      <ambientLight intensity={ambientIntensity} color="#334466" />
      <directionalLight
        position={[10, 20, 10]}
        intensity={1.2}
        color={lightColor}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      <pointLight position={[0, 10, -40]} intensity={1.5} color="#334466" distance={60} />
    </>
  );
}

export function ThreeScene({ progress, phase }: ThreeSceneProps) {
  const playerZ = progressToZ(progress);

  return (
    <Canvas
      style={{ position: 'absolute', inset: 0 }}
      camera={{ position: [0, SCENE_CONFIG.CAMERA_Y_OFFSET, SCENE_CONFIG.CAMERA_Z_OFFSET], fov: 60 }}
      shadows
      gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping }}
      onCreated={({ gl }) => {
        gl.setClearColor('#0a0a1a');
      }}
    >
      <SceneLighting phase={phase} />
      <Stars radius={100} depth={50} count={3000} factor={4} saturation={0} fade speed={1} />
      <Ground />
      <FinishLine />
      <Doll />
      <Player progress={progress} phase={phase} />
      <FollowCamera playerZ={playerZ} />
    </Canvas>
  );
}
