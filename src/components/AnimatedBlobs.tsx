import { motion, useAnimation, useMotionValue } from 'framer-motion';
import { useEffect, useState, useRef } from 'react';

interface Blob {
  id: number;
  x: number;
  y: number;
  scale: number;
  velocity: { x: number; y: number };
  size: number;
  color: string;
  opacity: number;
  split: number;
}

export default function AnimatedBlobs() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [blobs, setBlobs] = useState<Blob[]>([]);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const animationFrameRef = useRef<number>();

  // Initialize blobs with random positions within container
  useEffect(() => {
    if (!containerRef.current) return;
    
    const { width, height } = containerRef.current.getBoundingClientRect();
    setContainerSize({ width, height });

    // Calculate positions to ensure blobs are spread out
    const positions = [
      { x: width * 0.2, y: height * 0.3 },
      { x: width * 0.5, y: height * 0.2 },
      { x: width * 0.8, y: height * 0.3 },
      { x: width * 0.3, y: height * 0.7 },
      { x: width * 0.7, y: height * 0.7 },
      { x: width * 0.4, y: height * 0.4 },
      { x: width * 0.6, y: height * 0.6 },
      { x: width * 0.2, y: height * 0.5 },
    ];

    // Water-like colors with varying opacity
    const colors = [
      'rgba(74, 124, 89, 0.6)',    // Deep green
      'rgba(157, 200, 141, 0.55)', // Medium green
      'rgba(196, 227, 181, 0.5)',  // Light green
      'rgba(142, 209, 145, 0.55)', // Fresh green
      'rgba(86, 171, 104, 0.6)',   // Vibrant green
      'rgba(157, 200, 141, 0.5)',  // Medium green
      'rgba(126, 184, 121, 0.55)', // Forest green
      'rgba(196, 227, 181, 0.5)',  // Light green
    ];

    const newBlobs = Array.from({ length: 8 }, (_, i) => ({
      id: i,
      x: positions[i].x,
      y: positions[i].y,
      scale: 1,
      velocity: { 
        x: (Math.random() - 0.5) * 0.6, 
        y: (Math.random() - 0.5) * 0.6 
      },
      size: 140 + Math.random() * 60, // Random size between 140 and 200
      color: colors[i],
      opacity: 0.6 + Math.random() * 0.2, // Random opacity between 0.6 and 0.8
      split: 0
    }));

    setBlobs(newBlobs);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // Handle mouse movement
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      
      const rect = containerRef.current.getBoundingClientRect();
      setMousePosition({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('mousemove', handleMouseMove);
      return () => container.removeEventListener('mousemove', handleMouseMove);
    }
  }, []);

  // Update blob positions with water-like physics
  useEffect(() => {
    if (blobs.length === 0) return;

    const updateBlobPositions = () => {
      setBlobs(prevBlobs => {
        return prevBlobs.map(blob => {
          // Mouse interaction
          const dx = mousePosition.x - blob.x;
          const dy = mousePosition.y - blob.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          // Calculate split effect based on mouse proximity
          let split = 0;
          const splitRadius = blob.size * 1.2;
          if (distance < splitRadius) {
            split = Math.pow((1 - distance / splitRadius), 1.5); // Smoother split effect
          }

          // Repulsion force
          const repulsionRadius = 180;
          const repulsionStrength = 0.4;
          let newVelocity = { ...blob.velocity };

          if (distance < repulsionRadius) {
            const force = (1 - distance / repulsionRadius) * repulsionStrength;
            newVelocity.x -= dx * force * 0.15;
            newVelocity.y -= dy * force * 0.15;
          }

          // Add water-like movement
          newVelocity.x += Math.sin(Date.now() * 0.001 + blob.id) * 0.02;
          newVelocity.y += Math.cos(Date.now() * 0.001 + blob.id) * 0.02;

          // Apply damping (water resistance)
          newVelocity.x *= 0.98;
          newVelocity.y *= 0.98;

          // Calculate new position
          let newX = blob.x + newVelocity.x;
          let newY = blob.y + newVelocity.y;

          // Bounce off container walls with water-like physics
          const padding = blob.size / 2;
          const bounceFactor = 0.6; // Lower bounce for water-like effect
          
          if (newX < padding) {
            newX = padding;
            newVelocity.x = Math.abs(newVelocity.x) * bounceFactor;
          } else if (newX > containerSize.width - padding) {
            newX = containerSize.width - padding;
            newVelocity.x = -Math.abs(newVelocity.x) * bounceFactor;
          }
          
          if (newY < padding) {
            newY = padding;
            newVelocity.y = Math.abs(newVelocity.y) * bounceFactor;
          } else if (newY > containerSize.height - padding) {
            newY = containerSize.height - padding;
            newVelocity.y = -Math.abs(newVelocity.y) * bounceFactor;
          }

          // Add minimum velocity to prevent stagnation
          const minVelocity = 0.1;
          if (Math.abs(newVelocity.x) < minVelocity && Math.abs(newVelocity.y) < minVelocity) {
            newVelocity.x += (Math.random() - 0.5) * minVelocity * 2;
            newVelocity.y += (Math.random() - 0.5) * minVelocity * 2;
          }

          // Calculate scale based on velocity for squash and stretch effect
          const speed = Math.sqrt(newVelocity.x * newVelocity.x + newVelocity.y * newVelocity.y);
          const baseScale = 1 + Math.sin(Date.now() * 0.002 + blob.id) * 0.03; // Subtle pulsing
          const velocityScale = 1 + speed * 0.1; // Stretch based on speed

          return {
            ...blob,
            x: newX,
            y: newY,
            velocity: newVelocity,
            split,
            scale: baseScale * velocityScale
          };
        });
      });

      animationFrameRef.current = requestAnimationFrame(updateBlobPositions);
    };

    animationFrameRef.current = requestAnimationFrame(updateBlobPositions);
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [mousePosition, containerSize]);

  return (
    <div 
      ref={containerRef}
      className="absolute inset-0 overflow-hidden pointer-events-auto"
      style={{ minHeight: '90vh', zIndex: 0 }}
    >
      {blobs.map((blob) => (
        <div key={blob.id} style={{ position: 'absolute', left: blob.x, top: blob.y }}>
          {/* Split effect with water-like appearance */}
          <motion.div
            className="absolute rounded-full backdrop-blur-sm"
            style={{
              width: blob.size,
              height: blob.size,
              backgroundColor: blob.color,
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15), inset 0 2px 4px rgba(255, 255, 255, 0.4)',
              transform: `translate(-50%, -50%) scale(${blob.scale}) translateX(${-blob.split * 40}px) rotate(${-blob.split * 10}deg)`,
              transition: 'transform 0.2s ease-out',
            }}
          />
          <motion.div
            className="absolute rounded-full backdrop-blur-sm"
            style={{
              width: blob.size,
              height: blob.size,
              backgroundColor: blob.color,
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15), inset 0 2px 4px rgba(255, 255, 255, 0.4)',
              transform: `translate(-50%, -50%) scale(${blob.scale}) translateX(${blob.split * 40}px) rotate(${blob.split * 10}deg)`,
              transition: 'transform 0.2s ease-out',
            }}
          />
        </div>
      ))}
    </div>
  );
} 