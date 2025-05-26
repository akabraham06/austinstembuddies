'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';

interface HeroImage {
  id: string;
  url: string;
  order: number;
}

export default function HeroSlideshow() {
  const [images, setImages] = useState<HeroImage[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchImages();
  }, []);

  useEffect(() => {
    if (images.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % images.length);
      }, 5000); // Change image every 5 seconds

      return () => clearInterval(interval);
    }
  }, [images.length]);

  async function fetchImages() {
    try {
      const q = query(collection(db, 'heroImages'), orderBy('order'));
      const querySnapshot = await getDocs(q);
      const imagesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as HeroImage[];
      setImages(imagesData);
    } catch (error) {
      console.error('Error fetching hero images:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading || images.length === 0) {
    return (
      <div className="relative lg:-ml-8 xl:-ml-12 lg:-mr-16 xl:-mr-24">
        <div className="absolute inset-0 -m-12 z-0">
          <svg viewBox="0 0 500 500" className="w-[140%] h-[140%] -translate-x-[20%] -translate-y-[20%]">
            <defs>
              <linearGradient id="image-blob-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#9DC88D" stopOpacity="0.4" />
                <stop offset="50%" stopColor="#C4E3B5" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#E2EFD9" stopOpacity="0.4" />
              </linearGradient>
            </defs>
            <motion.path
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1, ease: "easeOut" }}
              d="M250,50 
                C350,50 450,150 450,250
                C450,350 350,450 250,450
                C150,450 50,350 50,250
                C50,150 150,50 250,50
                Z"
              fill="url(#image-blob-gradient)"
            />
          </svg>
        </div>
        <motion.div
          className="relative rounded-2xl overflow-hidden shadow-2xl z-20"
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.3 }}
        >
          <Image
            src="/IMG_8364.jpg"
            alt="STEM Buddies Activity"
            width={900}
            height={675}
            className="w-full h-full object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-tr from-brand-primary/20 to-transparent" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="relative lg:-ml-8 xl:-ml-12 lg:-mr-16 xl:-mr-24">
      <div className="absolute inset-0 -m-12 z-0">
        <svg viewBox="0 0 500 500" className="w-[140%] h-[140%] -translate-x-[20%] -translate-y-[20%]">
          <defs>
            <linearGradient id="image-blob-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#9DC88D" stopOpacity="0.4" />
              <stop offset="50%" stopColor="#C4E3B5" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#E2EFD9" stopOpacity="0.4" />
            </linearGradient>
          </defs>
          <motion.path
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
            d="M250,50 
              C350,50 450,150 450,250
              C450,350 350,450 250,450
              C150,450 50,350 50,250
              C50,150 150,50 250,50
              Z"
            fill="url(#image-blob-gradient)"
          />
        </svg>
      </div>
      <motion.div
        className="relative rounded-2xl overflow-hidden shadow-2xl z-20"
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.3 }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.5 }}
            className="relative w-full max-w-[800px] mx-auto"
            style={{ aspectRatio: '4/3' }}
          >
            <Image
              src={images[currentIndex].url}
              alt="STEM Buddies Activity"
              fill
              className="object-contain"
              priority
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 800px"
            />
            <div className="absolute inset-0 mix-blend-soft-light">
              <svg width="100%" height="100%" className="opacity-30">
                <defs>
                  <pattern id="leaf-pattern" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path
                      d="M20,0 Q30,10 20,20 Q10,10 20,0"
                      fill="#9DC88D"
                      opacity="0.5"
                    />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#leaf-pattern)" />
              </svg>
            </div>
            <div className="absolute inset-0 bg-gradient-to-tr from-brand-primary/20 to-transparent" />
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </div>
  );
} 