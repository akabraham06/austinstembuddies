'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function DonationRing() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true });
    
    // Set size to match container
    const size = 320;
    renderer.setSize(size, size);
    containerRef.current.appendChild(renderer.domElement);

    // Create ring geometry with larger radius and thinner width
    const ringGeometry = new THREE.TorusGeometry(12, 0.15, 16, 100);
    const ringMaterial = new THREE.MeshPhongMaterial({
      color: 0x9DC88D,
      transparent: true,
      opacity: 0.2,
      shininess: 80
    });

    // Create sphere geometry for the balls
    const sphereGeometry = new THREE.SphereGeometry(0.4, 32, 32);
    const sphereMaterial = new THREE.MeshPhongMaterial({
      color: 0x9DC88D,
      transparent: true,
      opacity: 0.2,
      shininess: 100
    });

    // Function to create a ring with orbiting spheres
    function createRingWithSpheres(radius: number, numSpheres: number) {
      const group = new THREE.Group();
      
      // Add the ring
      const ring = new THREE.Mesh(ringGeometry, ringMaterial);
      group.add(ring);
      
      // Create a group for spheres
      const sphereGroup = new THREE.Group();
      
      // Add spheres to the sphere group
      for (let i = 0; i < numSpheres; i++) {
        const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
        // Store the initial angle and radius for animation
        sphere.userData.angle = (i / numSpheres) * Math.PI * 2;
        sphere.userData.radius = radius;
        sphere.position.x = Math.cos(sphere.userData.angle) * radius;
        sphere.position.z = Math.sin(sphere.userData.angle) * radius;
        sphereGroup.add(sphere);
      }
      
      group.add(sphereGroup);
      // Store the sphere group reference for animation
      group.userData.sphereGroup = sphereGroup;
      
      return group;
    }

    // Create three rings with different sizes and sphere counts
    const ring1 = createRingWithSpheres(12, 12);
    const ring2 = createRingWithSpheres(9, 9);
    const ring3 = createRingWithSpheres(15, 15);

    // Set initial rotations for vertical rings
    ring1.rotation.x = Math.PI / 2;
    ring2.rotation.x = Math.PI / 2;
    ring3.rotation.x = Math.PI / 2;

    scene.add(ring1);
    scene.add(ring2);
    scene.add(ring3);

    // Add lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xffffff, 1.2);
    pointLight.position.set(10, 10, 10);
    scene.add(pointLight);

    // Position camera
    camera.position.z = 35;

    // Animation
    let time = 0;
    function animate() {
      requestAnimationFrame(animate);
      time += 0.01;

      // Subtle hover animation for rings
      ring1.position.y = Math.sin(time * 0.5) * 0.2;
      ring2.position.y = Math.sin(time * 0.5 + 1) * 0.2;
      ring3.position.y = Math.sin(time * 0.5 + 2) * 0.2;

      // Rotate rings around Y axis
      ring1.rotation.y += 0.003;
      ring2.rotation.y += 0.004;
      ring3.rotation.y += 0.002;

      // Rotate spheres around their rings
      const updateSpheres = (group: THREE.Group) => {
        const sphereGroup = group.userData.sphereGroup as THREE.Group;
        sphereGroup.children.forEach((sphere) => {
          const speed = 0.0005; // Very slow rotation
          sphere.userData.angle += speed;
          sphere.position.x = Math.cos(sphere.userData.angle) * sphere.userData.radius;
          sphere.position.z = Math.sin(sphere.userData.angle) * sphere.userData.radius;
        });
      };

      updateSpheres(ring1);
      updateSpheres(ring2);
      updateSpheres(ring3);

      renderer.render(scene, camera);
    }

    animate();

    // Cleanup
    return () => {
      if (containerRef.current) {
        containerRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div 
      ref={containerRef} 
      className="absolute inset-0 flex items-center justify-center pointer-events-none"
      style={{ 
        transform: 'scale(1.1) translateY(-15%)',
        zIndex: 30,
        height: '100%'
      }}
    />
  );
} 