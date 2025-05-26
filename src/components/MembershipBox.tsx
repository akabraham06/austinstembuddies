'use client';

import { motion } from 'framer-motion';
import { useEffect, useRef } from 'react';
import gsap from 'gsap';

interface MembershipBoxProps {
  onPointsClick: () => void;
  onSubmitClick: () => void;
}

const BouncyDecoration = () => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden">
    {/* Animated circles */}
    <motion.div
      className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-gradient-to-br from-brand-primary/10 to-brand-secondary/5"
      animate={{
        scale: [1, 1.1, 1],
        rotate: [0, 10, 0],
      }}
      transition={{
        duration: 6,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    />
    <motion.div
      className="absolute -bottom-16 -left-16 w-64 h-64 rounded-full bg-gradient-to-tr from-brand-secondary/10 to-brand-primary/5"
      animate={{
        scale: [1, 1.2, 1],
        rotate: [0, -15, 0],
      }}
      transition={{
        duration: 8,
        repeat: Infinity,
        ease: "easeInOut",
        delay: 1
      }}
    />

    {/* Decorative lines */}
    <svg className="absolute top-0 right-0 w-full h-full" viewBox="0 0 400 400">
      <motion.path
        d="M350,0 Q400,200 350,400"
        stroke="rgba(157, 200, 141, 0.2)"
        strokeWidth="2"
        fill="none"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{
          duration: 2,
          ease: "easeInOut"
        }}
      />
      <motion.path
        d="M0,350 Q200,400 400,350"
        stroke="rgba(196, 227, 181, 0.2)"
        strokeWidth="2"
        fill="none"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{
          duration: 2,
          delay: 0.5,
          ease: "easeInOut"
        }}
      />
    </svg>

    {/* Floating particles */}
    {[...Array(8)].map((_, i) => (
      <motion.div
        key={i}
        className="absolute w-2 h-2 rounded-full bg-brand-primary/30"
        style={{
          top: `${20 + i * 10}%`,
          left: `${10 + i * 10}%`,
        }}
        animate={{
          y: [0, -20, 0],
          x: [0, 10, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 3 + i,
          repeat: Infinity,
          ease: "easeInOut",
          delay: i * 0.2,
        }}
      />
    ))}
  </div>
);

export default function MembershipBox({ onPointsClick, onSubmitClick }: MembershipBoxProps) {
  const boxRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (boxRef.current && contentRef.current) {
      gsap.fromTo(
        boxRef.current,
        { opacity: 0, y: 50 },
        { opacity: 1, y: 0, duration: 1, ease: "power3.out" }
      );

      gsap.fromTo(
        contentRef.current.children,
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.1,
          ease: "power2.out",
          delay: 0.3
        }
      );
    }
  }, []);

  return (
    <div
      ref={boxRef}
      className="relative bg-white rounded-xl [max-width:600px]:border-[1px] [max-width:600px]:border-black/20 [max-width:600px]:bg-white sm:bg-brand-primary/5 sm:rounded-2xl sm:border-brand-primary/10 shadow-sm sm:shadow-lg p-8 xl:p-12 overflow-hidden"
      style={{ willChange: 'transform, opacity' }}
    >
      <BouncyDecoration />
      
      <div ref={contentRef} className="relative z-10 flex flex-col items-start">
        <h2 className="font-freckle text-4xl xl:text-5xl text-brand-dark mb-8 w-full text-center">
          Member Activities & Points
        </h2>

        {/* Animated Card Container */}
        <div className="w-full flex flex-col md:flex-row gap-8 xl:gap-12 justify-start items-stretch">
          {/* Activities Card */}
          <div
            className="flex-1 min-w-[320px] max-w-xl bg-white rounded-xl [max-width:600px]:border-[1px] [max-width:600px]:border-black/20 [max-width:600px]:bg-white sm:bg-gradient-to-br sm:from-white/80 sm:to-background-light/80 sm:rounded-2xl sm:border-none shadow-sm sm:shadow-2xl p-8 flex flex-col justify-center"
            style={{ willChange: 'transform' }}
          >
            <h3 className="font-freckle text-2xl text-brand-dark mb-4">
              Member Activities
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {["Organize STEM workshops","Develop educational content","Mentor students","Community outreach","School collaboration","Event planning"].map((activity, i) => (
                <div
                  key={activity}
                  className="flex items-center space-x-2 text-text-secondary"
                >
                  <div className="w-2 h-2 rounded-full bg-brand-primary/50 flex-shrink-0" />
                  <span className="text-base xl:text-lg">{activity}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Points Card */}
          <div
            className="flex-1 min-w-[320px] max-w-xl bg-white rounded-xl [max-width:600px]:border-[1px] [max-width:600px]:border-black/20 [max-width:600px]:bg-white sm:bg-white/60 sm:rounded-2xl sm:border-brand-primary/10 shadow-sm sm:shadow-2xl p-8 flex flex-col justify-center relative overflow-hidden sm:backdrop-blur-lg"
            style={{ willChange: 'transform' }}
          >
            {/* Animated floating shapes - Only visible on larger screens */}
            <div className="hidden sm:block absolute -top-8 -right-8 w-32 h-32 bg-brand-primary/10 rounded-full z-0" />
            <div className="hidden sm:block absolute -bottom-8 -left-8 w-24 h-24 bg-brand-secondary/10 rounded-full z-0" />
            
            <h3 className="font-freckle text-2xl text-brand-dark mb-4 relative z-10">
              Points System
            </h3>
            <p className="text-base xl:text-lg text-text-secondary mb-6 relative z-10">
              Track your involvement and earn rewards
            </p>
            <div className="flex flex-col space-y-3 relative z-10">
              <a
                href="/points"
                className="w-full bg-brand-primary text-white px-6 py-3 rounded-lg text-lg font-medium hover:bg-brand-secondary transition-colors text-center shadow-lg"
              >
                Check Points
              </a>
              <button
                onClick={onSubmitClick}
                className="w-full bg-brand-primary/10 text-brand-dark px-6 py-3 rounded-lg text-lg font-medium hover:bg-brand-primary/20 transition-colors text-center shadow"
              >
                Submit Points
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 