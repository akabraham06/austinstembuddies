import { motion } from 'framer-motion';

export default function SkeletonForm() {
  return (
    <div className="bg-white/95 backdrop-blur-md rounded-2xl p-8 md:p-10 xl:p-12 shadow-2xl border border-white/20">
      <div className="text-center">
        <div className="text-xl font-medium text-brand-dark mb-2">Sorry, this form is locked</div>
        <div className="text-text-secondary">Please check back later when it becomes available.</div>
      </div>
    </div>
  );
} 