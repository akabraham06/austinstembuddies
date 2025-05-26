'use client';

import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { inSphere } from 'maath/random';

const ParticleCloud = () => {
  const ref = useRef<THREE.Points>(null);
  const positions = new Float32Array(5000 * 3);
  inSphere(positions, { radius: 20 });

  useFrame((state) => {
    if (!ref.current) return;
    ref.current.rotation.x = state.clock.elapsedTime * 0.05;
    ref.current.rotation.y = state.clock.elapsedTime * 0.03;
  });

  return (
    <Points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={5000}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <PointMaterial
        transparent
        size={0.02}
        sizeAttenuation={true}
        color="#9DC88D"
        opacity={0.5}
        depthWrite={false}
      />
    </Points>
  );
};

export default function ParticleField() {
  return (
    <div className="absolute inset-0 -z-5">
      <Canvas
        camera={{ position: [0, 0, 15], fov: 60 }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.5} />
        <ParticleCloud />
      </Canvas>
    </div>
  );
} 