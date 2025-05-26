'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { storage, db } from '@/lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { useDropzone } from 'react-dropzone';

export default function HeroImageUpload() {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    setError(null);
    setUploading(true);
    setSuccess(false);

    try {
      const file = acceptedFiles[0];
      
      // Upload image to Firebase Storage
      const storageRef = ref(storage, `hero/${Date.now()}_${file.name}`);
      const snapshot = await uploadBytes(storageRef, file);
      const imageUrl = await getDownloadURL(snapshot.ref);

      // Add to Firestore
      await addDoc(collection(db, 'heroImages'), {
        imageUrl,
        createdAt: Timestamp.now(),
        active: true
      });

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error('Error uploading hero image:', error);
      setError('Failed to upload image. Please try again.');
    } finally {
      setUploading(false);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    maxFiles: 1,
    multiple: false
  });

  return (
    <div className="space-y-6">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragActive
            ? 'border-brand-primary bg-brand-primary/5'
            : 'border-border-light hover:border-brand-primary/50 hover:bg-background-accent'
        }`}
      >
        <input {...getInputProps()} />
        <div className="space-y-4">
          <div className="w-12 h-12 mx-auto">
            <svg
              className="w-full h-full text-text-secondary"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
          <div>
            <p className="text-lg font-medium text-text-primary">
              {isDragActive ? 'Drop the image here' : 'Drag & drop an image here'}
            </p>
            <p className="text-sm text-text-secondary mt-1">
              or click to select a file
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {success && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg"
        >
          Image uploaded successfully!
        </motion.div>
      )}

      {uploading && (
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-brand-primary"></div>
        </div>
      )}
    </div>
  );
} 