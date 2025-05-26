'use client';

import CheckPoints from '@/components/CheckPoints';
import { motion } from 'framer-motion';

export default function PointsPage() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gray-50 pt-24"
    >
      <CheckPoints />
    </motion.div>
  );
} 