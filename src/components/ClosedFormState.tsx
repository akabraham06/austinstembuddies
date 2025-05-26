'use client';

import { motion } from 'framer-motion';

interface ClosedFormStateProps {
  title: string;
  message: string;
}

export default function ClosedFormState({ title, message }: ClosedFormStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white/95 backdrop-blur-md rounded-2xl p-8 md:p-10 xl:p-12 shadow-2xl border border-white/20 h-full flex flex-col items-center justify-center text-center"
    >
      <div className="w-16 h-16 mb-6 relative">
        <motion.div
          className="absolute inset-0 bg-brand-primary/10 rounded-full"
          animate={{
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <svg
          className="w-full h-full text-brand-primary"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
          />
        </svg>
      </div>

      <h3 className="text-2xl font-semibold text-brand-dark mb-4 font-freckle">
        {title}
      </h3>

      <p className="text-lg text-text-secondary leading-relaxed max-w-md">
        {message}
      </p>

      <motion.div
        className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-brand-primary/20 via-brand-secondary/20 to-brand-primary/20"
        animate={{
          backgroundPosition: ["0% 0%", "100% 0%"],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "linear"
        }}
        style={{
          backgroundSize: "200% 100%"
        }}
      />
    </motion.div>
  );
} 