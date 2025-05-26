'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { db, storage } from '@/lib/firebase';
import { collection, query, orderBy, getDocs, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { ref, deleteObject } from 'firebase/storage';
import Image from 'next/image';
import { TrashIcon } from '@heroicons/react/24/outline';
import { useDropzone } from 'react-dropzone';
import { useAuth } from '@/lib/auth-context';

interface HeroImage {
  id?: string;
  url: string;
  order: number;
}

export default function HeroManager() {
  const [images, setImages] = useState<HeroImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth();

  useEffect(() => {
    fetchImages();
  }, []);

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
      setError('Failed to load images. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  }

  const onDrop = async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    
    const file = acceptedFiles[0];
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size must be less than 5MB');
      return;
    }

    setError(null);
    setUploading(true);

    try {
      // Convert file to base64
      const reader = new FileReader();
      const base64Promise = new Promise((resolve, reject) => {
        reader.onload = () => resolve(reader.result);
        reader.onerror = (error) => reject(error);
      });
      reader.readAsDataURL(file);
      const base64Data = await base64Promise;
      const base64String = (base64Data as string).split(',')[1];

      // Upload through API endpoint
      const response = await fetch('/api/cms/hero-images', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          image: {
            name: file.name,
            data: base64String
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to upload image');
      }

      await fetchImages();
    } catch (error) {
      console.error('Error uploading hero image:', error);
      setError(error instanceof Error ? error.message : 'Failed to upload image. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    maxFiles: 1,
    multiple: false,
    maxSize: 5 * 1024 * 1024 // 5MB
  });

  async function handleDeleteImage(image: HeroImage) {
    if (!image.id || !window.confirm('Are you sure you want to delete this image?')) return;

    setError(null);
    setLoading(true);

    try {
      // Delete through API endpoint
      const response = await fetch('/api/cms/hero-images', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          id: image.id, 
          imageUrl: image.url 
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete image');
      }

      await fetchImages();
    } catch (error) {
      console.error('Error deleting hero image:', error);
      setError(error instanceof Error ? error.message : 'Failed to delete image. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-brand-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-brand-dark">Hero Images</h2>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

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
            <p className="text-xs text-text-secondary mt-2">
              Supported formats: JPEG, PNG, WebP • Max size: 5MB
            </p>
          </div>
        </div>
      </div>

      {uploading && (
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-brand-primary"></div>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {images.map((image) => (
          <motion.div
            key={image.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative group aspect-video bg-gray-100 rounded-lg overflow-hidden"
          >
            <Image
              src={image.url}
              alt="Hero image"
              fill
              className="object-cover"
            />
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => handleDeleteImage(image)}
              className="absolute top-2 right-2 text-white bg-red-500/80 hover:bg-red-600 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <TrashIcon className="h-5 w-5" />
            </motion.button>
          </motion.div>
        ))}
      </div>
    </div>
  );
} 