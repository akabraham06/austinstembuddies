'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function OrbitingShapes() {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const shapesRef = useRef<THREE.Group | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;
    cameraRef.current = camera;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Create shapes group
    const shapes = new THREE.Group();
    scene.add(shapes);
    shapesRef.current = shapes;

    // Create different geometric shapes
    const geometries = [
      new THREE.IcosahedronGeometry(0.5),
      new THREE.OctahedronGeometry(0.4),
      new THREE.TetrahedronGeometry(0.3),
      new THREE.DodecahedronGeometry(0.4),
    ];

    const material = new THREE.MeshBasicMaterial({
      color: 0x3b82f6,
      wireframe: true,
      transparent: true,
      opacity: 0.3,
    });

    // Create orbits
    geometries.forEach((geometry, index) => {
      const shape = new THREE.Mesh(geometry, material);
      const orbit = new THREE.Group();
      
      // Position shape in orbit
      shape.position.x = 2 + index * 0.5;
      
      // Add shape to orbit
      orbit.add(shape);
      
      // Rotate orbit
      orbit.rotation.x = Math.random() * Math.PI;
      orbit.rotation.y = Math.random() * Math.PI;
      
      shapes.add(orbit);
    });

    // Animation
    const animate = () => {
      if (!shapes) return;

      // Rotate the entire group
      shapes.rotation.y += 0.001;

      // Rotate each orbit
      shapes.children.forEach((orbit, index) => {
        orbit.rotation.y += 0.005 / (index + 1);
        orbit.rotation.x += 0.003 / (index + 1);
      });

      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    };

    animate();

    // Handle resize
    const handleResize = () => {
      if (!camera || !renderer) return;
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div 
      ref={containerRef} 
      className="absolute inset-0 pointer-events-none"
      style={{ zIndex: 0 }}
    />
  );
} 