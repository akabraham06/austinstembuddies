'use client';

import { useState, useEffect } from 'react';
import { Officer } from '@/lib/firebase-types';
import { motion } from 'framer-motion';
import { PlusIcon, TrashIcon, PencilIcon, XMarkIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';
import { useAuthFetch } from '@/lib/use-auth-fetch';
import { useAuth } from '@/lib/auth-context';

export default function OfficerManager() {
  const [officers, setOfficers] = useState<Officer[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingOfficer, setEditingOfficer] = useState<Officer | null>(null);
  const [newImage, setNewImage] = useState<File | null>(null);
  const authFetch = useAuthFetch();
  const { token } = useAuth();

  useEffect(() => {
    if (token) {
      console.log('Token available, fetching officers...');
      fetchOfficers();
    } else {
      console.log('No auth token available');
      setError('Please sign in to manage officers');
      setLoading(false);
    }
  }, [token]);

  async function fetchOfficers() {
    try {
      console.log('Fetching officers...');
      const data = await authFetch('/api/cms/officers');
      console.log('Officers data:', data);
      setOfficers(data);
    } catch (error) {
      console.error('Error fetching officers:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch officers');
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveOfficer(e: React.FormEvent) {
    e.preventDefault();
    if (!editingOfficer) return;

    setSaving(true);
    setError(null);

    try {
      // Validate required fields
      if (!editingOfficer.name || !editingOfficer.position || !editingOfficer.bio) {
        throw new Error('Name, position, and bio are required fields');
      }

      let imageData = null;
      if (newImage) {
        try {
          const reader = new FileReader();
          imageData = await new Promise((resolve, reject) => {
            reader.onloadend = () => {
              if (reader.result) {
                resolve({
                  name: newImage.name,
                  data: (reader.result as string).split(',')[1]
                });
              } else {
                reject(new Error('Failed to read image file'));
              }
            };
            reader.onerror = () => reject(new Error('Failed to read image file'));
            reader.readAsDataURL(newImage);
          });
        } catch (error) {
          console.error('Error reading image file:', error);
          throw new Error('Failed to process image file. Please try again.');
        }
      }

      const officerData = {
        ...editingOfficer,
        image: imageData,
        oldImageUrl: editingOfficer.image
      };

      const endpoint = editingOfficer.id ? `/api/cms/officers/${editingOfficer.id}` : '/api/cms/officers';
      const responseData = await authFetch(endpoint, {
        method: editingOfficer.id ? 'PUT' : 'POST',
        body: JSON.stringify(officerData)
      });

      if (responseData.image) {
        officerData.image = responseData.image;
      }

      setEditingOfficer(null);
      setNewImage(null);
      await fetchOfficers();
    } catch (error) {
      console.error('Error saving officer:', error);
      setError(error instanceof Error ? error.message : 'Failed to save officer');
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteOfficer(officerId: string, imageUrl: string) {
    if (!officerId) return;

    if (window.confirm('Are you sure you want to delete this officer?')) {
      try {
        const responseData = await authFetch('/api/cms/officers', {
          method: 'DELETE',
          body: JSON.stringify({ id: officerId, imageUrl }),
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        if (!responseData.success) {
          throw new Error(responseData.error || 'Failed to delete officer');
        }

        await fetchOfficers();
      } catch (error) {
        console.error('Error deleting officer:', error);
        alert(error instanceof Error ? error.message : 'Failed to delete officer. Please try again.');
      }
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
    <div>
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}
      
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-brand-dark">Officers</h2>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            setError(null);
            setEditingOfficer({ name: '', position: '', image: '', bio: '', order: officers.length });
          }}
          className="bg-brand-primary text-white px-4 py-2 rounded-lg hover:bg-brand-secondary transition-colors"
        >
          <PlusIcon className="h-5 w-5" />
        </motion.button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {officers.map((officer) => (
          <motion.div
            key={officer.id}
            className="bg-white rounded-lg shadow-md overflow-hidden"
            whileHover={{ scale: 1.02 }}
          >
            <div className="relative h-48 w-full">
              {officer.image ? (
                <Image
                  src={officer.image}
                  alt={officer.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="absolute inset-0 bg-background-accent flex items-center justify-center">
                  <span className="text-text-secondary">No image</span>
                </div>
              )}
            </div>
            <div className="p-4">
              <h3 className="text-lg font-semibold text-brand-dark">{officer.name}</h3>
              <p className="text-text-secondary">{officer.position}</p>
              <p className="mt-2 text-sm text-text-primary line-clamp-3">{officer.bio}</p>
              <div className="mt-4 flex justify-end space-x-2">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setEditingOfficer(officer)}
                  className="text-brand-primary hover:text-brand-secondary"
                >
                  <PencilIcon className="h-5 w-5" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleDeleteOfficer(officer.id!, officer.image)}
                  className="text-red-500 hover:text-red-700"
                >
                  <TrashIcon className="h-5 w-5" />
                </motion.button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {editingOfficer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-brand-dark">
                {editingOfficer.id ? 'Edit Officer' : 'Add Officer'}
              </h3>
              <button
                onClick={() => {
                  setEditingOfficer(null);
                  setError(null);
                }}
                className="text-text-secondary hover:text-text-primary"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleSaveOfficer} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">
                  Name
                </label>
                <input
                  type="text"
                  value={editingOfficer.name}
                  onChange={(e) => setEditingOfficer({ ...editingOfficer, name: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-border-light focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">
                  Position
                </label>
                <input
                  type="text"
                  value={editingOfficer.position}
                  onChange={(e) => setEditingOfficer({ ...editingOfficer, position: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-border-light focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">
                  Bio
                </label>
                <textarea
                  value={editingOfficer.bio}
                  onChange={(e) => setEditingOfficer({ ...editingOfficer, bio: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-border-light focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary"
                  rows={4}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">
                  Image
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setNewImage(e.target.files?.[0] || null)}
                  className="w-full px-4 py-2 rounded-lg border border-border-light focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    setEditingOfficer(null);
                    setError(null);
                  }}
                  className="px-4 py-2 text-text-secondary hover:text-text-primary"
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className={`bg-brand-primary text-white px-4 py-2 rounded-lg hover:bg-brand-secondary transition-colors ${
                    saving ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {saving ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
} 