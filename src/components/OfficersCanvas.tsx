'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { inSphere } from 'maath/random';

const COUNT = 2000;
const RADIUS = 15;

export default function OfficersCanvas() {
  const pointsRef = useRef<THREE.Points>(null);
  const sphereRef = useRef<THREE.Mesh>(null);

  // Generate random points in a sphere
  const positions = useMemo(() => {
    const positions = new Float32Array(COUNT * 3);
    inSphere(positions, { radius: RADIUS });
    return positions;
  }, []);

  // Create animated sphere geometry
  const sphereGeometry = useMemo(() => {
    return new THREE.IcosahedronGeometry(RADIUS * 0.8, 1);
  }, []);

  useFrame((state) => {
    if (!pointsRef.current || !sphereRef.current) return;

    // Rotate the points
    pointsRef.current.rotation.y += 0.001;
    pointsRef.current.rotation.x += 0.0005;

    // Animate sphere vertices
    const time = state.clock.getElapsedTime();
    const positions = sphereRef.current.geometry.attributes.position;
    const count = positions.count;

    for (let i = 0; i < count; i++) {
      const x = positions.getX(i);
      const y = positions.getY(i);
      const z = positions.getZ(i);

      // Calculate distance from center
      const distance = Math.sqrt(x * x + y * y + z * z);
      
      // Create wave effect
      const wave = Math.sin(distance * 0.3 - time) * 0.3;
      positions.setXYZ(
        i,
        x * (1 + wave * 0.1),
        y * (1 + wave * 0.1),
        z * (1 + wave * 0.1)
      );
    }

    positions.needsUpdate = true;
  });

  return (
    <>
      {/* Animated wireframe sphere */}
      <mesh ref={sphereRef}>
        <primitive object={sphereGeometry} attach="geometry" />
        <meshBasicMaterial
          color="#9DC88D"
          wireframe
          transparent
          opacity={0.1}
        />
      </mesh>

      {/* Particle system */}
      <Points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={COUNT}
            array={positions}
            itemSize={3}
          />
        </bufferGeometry>
        <PointMaterial
          transparent
          vertexColors
          size={0.15}
          sizeAttenuation={true}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          color="#C4E3B5"
        />
      </Points>

      {/* Ambient light */}
      <ambientLight intensity={0.5} />

      {/* Directional lights for depth */}
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <directionalLight position={[-10, -10, -5]} intensity={0.5} />
    </>
  );
} 