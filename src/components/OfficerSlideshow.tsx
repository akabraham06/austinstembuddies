'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Canvas } from '@react-three/fiber';
import Image from 'next/image';
import { Officer } from '@/lib/firebase-types';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import OfficersCanvas from './OfficersCanvas';

interface OfficerSlideshowProps {
  officers: Officer[];
}

export default function OfficerSlideshow({ officers }: OfficerSlideshowProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  if (!officers || officers.length === 0) {
    return (
      <div className="relative w-full h-full bg-background-accent/50 backdrop-blur-sm rounded-2xl flex items-center justify-center">
        <p className="text-text-secondary">No officers available</p>
      </div>
    );
  }

  useEffect(() => {
    if (currentIndex >= officers.length) {
      setCurrentIndex(0);
    }
  }, [currentIndex, officers.length]);

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? '100%' : '-100%',
      opacity: 0,
      scale: 0.9
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
      scale: 1
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? '100%' : '-100%',
      opacity: 0,
      scale: 0.9
    })
  };

  const swipeConfidenceThreshold = 10000;
  const swipePower = (offset: number, velocity: number) => {
    return Math.abs(offset) * velocity;
  };

  const paginate = (newDirection: number) => {
    setDirection(newDirection);
    setCurrentIndex((prevIndex) => {
      let nextIndex = prevIndex + newDirection;
      if (nextIndex < 0) nextIndex = officers.length - 1;
      if (nextIndex >= officers.length) nextIndex = 0;
      return nextIndex;
    });
  };

  useEffect(() => {
    const interval = setInterval(() => {
      paginate(1);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {/* Slideshow Content */}
      <div className="relative z-10 w-full flex items-center justify-center">
        <div className="w-full">
          <AnimatePresence initial={false} custom={direction} mode="wait">
            {officers[currentIndex] && (
              <motion.div
                key={currentIndex}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{
                  x: { type: "spring", stiffness: 300, damping: 30 },
                  opacity: { duration: 0.2 },
                  scale: { duration: 0.3 }
                }}
                className="w-full"
              >
                <div className="p-8 flex flex-col items-center gap-8">
                  <motion.div 
                    className="relative w-56 h-56 flex-shrink-0"
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="absolute inset-0 rounded-full overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-tr from-brand-primary/30 to-transparent z-10" />
                      <div className="absolute inset-0 border-4 border-brand-primary/40 rounded-full z-20" />
                      {officers[currentIndex]?.image ? (
                        <Image
                          src={officers[currentIndex].image}
                          alt={officers[currentIndex].name}
                          fill
                          className="object-cover z-0"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                      ) : (
                        <div className="absolute inset-0 bg-background-light/20 flex items-center justify-center">
                          <span className="text-text-secondary text-lg">No image</span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                  <div className="text-center">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="space-y-4"
                    >
                      <h3 className="text-3xl font-semibold text-brand-dark font-freckle">
                        {officers[currentIndex].name}
                      </h3>
                      <p className="text-2xl text-brand-secondary font-medium">
                        {officers[currentIndex].position}
                      </p>
                      <p className="text-lg text-text-secondary leading-relaxed line-clamp-3 hover:line-clamp-none transition-all duration-300 max-w-2xl mx-auto">
                        {officers[currentIndex].bio}
                      </p>
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Navigation Arrows */}
        <button
          className="absolute -left-2 top-1/2 -translate-y-1/2 bg-white hover:bg-background-light backdrop-blur-md rounded-full p-2 text-brand-dark hover:text-brand-primary transition-all duration-300 transform hover:scale-110 shadow-md z-50"
          onClick={() => paginate(-1)}
        >
          <ChevronLeftIcon className="w-5 h-5" />
        </button>
        <button
          className="absolute -right-2 top-1/2 -translate-y-1/2 bg-white hover:bg-background-light backdrop-blur-md rounded-full p-2 text-brand-dark hover:text-brand-primary transition-all duration-300 transform hover:scale-110 shadow-md z-50"
          onClick={() => paginate(1)}
        >
          <ChevronRightIcon className="w-5 h-5" />
        </button>

        {/* Dots Navigation */}
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex space-x-2">
          {officers.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setDirection(index > currentIndex ? 1 : -1);
                setCurrentIndex(index);
              }}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === currentIndex
                  ? 'w-6 bg-brand-primary'
                  : 'w-2 bg-brand-primary/30 hover:bg-brand-primary/50'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
} 