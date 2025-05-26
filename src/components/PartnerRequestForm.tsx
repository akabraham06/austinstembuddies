'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '@/lib/firebase';
import { collection, addDoc, Timestamp } from 'firebase/firestore';

interface PartnerRequestFormProps {
  onSuccess?: () => void;
}

export default function PartnerRequestForm({ onSuccess }: PartnerRequestFormProps) {
  const [formData, setFormData] = useState({
    schoolName: '',
    contactName: '',
    email: '',
    phone: '',
    website: '',
    description: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      // Validate fields
      if (!formData.schoolName || !formData.contactName || !formData.email) {
        throw new Error('Please fill in all required fields');
      }

      // Submit to Firestore
      await addDoc(collection(db, 'partnerRequests'), {
        ...formData,
        createdAt: Timestamp.now(),
        status: 'pending',
      });

      // Show confirmation
      setShowConfirmation(true);

      // Reset form
      setFormData({
        schoolName: '',
        contactName: '',
        email: '',
        phone: '',
        website: '',
        description: '',
      });

      // Trigger success callback
      if (onSuccess) onSuccess();

      // Hide confirmation after 5 seconds
      setTimeout(() => {
        setShowConfirmation(false);
      }, 5000);

    } catch (error) {
      console.error('Error submitting partner request:', error);
      setError(error instanceof Error ? error.message : 'Failed to submit request');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="relative">
      <AnimatePresence>
        {showConfirmation && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-0 left-0 right-0 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6"
          >
            Thank you for your partnership request! We will review it and get back to you soon.
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-white/95 backdrop-blur-md rounded-2xl p-8 md:p-10 xl:p-12 shadow-2xl border border-white/20">
        <h3 className="text-2xl font-semibold text-brand-dark mb-8 font-freckle">Partner Request</h3>
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">
              School Name *
            </label>
            <input
              type="text"
              value={formData.schoolName}
              onChange={(e) => setFormData(prev => ({ ...prev, schoolName: e.target.value }))}
              className="w-full px-4 py-2 rounded-lg border border-border-light focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
              required
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">
                Contact Name *
              </label>
              <input
                type="text"
                value={formData.contactName}
                onChange={(e) => setFormData(prev => ({ ...prev, contactName: e.target.value }))}
                className="w-full px-4 py-2 rounded-lg border border-border-light focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">
                Email *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className="w-full px-4 py-2 rounded-lg border border-border-light focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
                required
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                className="w-full px-4 py-2 rounded-lg border border-border-light focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">
                Website
              </label>
              <input
                type="url"
                value={formData.website}
                onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                className="w-full px-4 py-2 rounded-lg border border-border-light focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
                placeholder="https://"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">
              Partnership Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={4}
              className="w-full px-4 py-2 rounded-lg border border-border-light focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
              placeholder="Please describe how you would like to partner with us..."
            />
          </div>

          <motion.button
            type="submit"
            disabled={submitting}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`w-full px-8 py-3 rounded-lg text-white font-medium transition-colors ${
              submitting
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-brand-primary hover:bg-brand-secondary'
            }`}
          >
            {submitting ? 'Submitting...' : 'Submit Request'}
          </motion.button>
        </form>
      </div>
    </div>
  );
} 