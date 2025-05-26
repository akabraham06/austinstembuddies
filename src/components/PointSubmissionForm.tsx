'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { db } from '@/lib/firebase';
import { collection, addDoc, query, where, getDocs, Timestamp } from 'firebase/firestore';

const EVENT_TYPES = ['Meeting', 'Volunteer', 'Tabling', 'Social', 'Fundraising', 'Bonus Points'];

interface PointSubmissionFormProps {
  onSuccess?: () => void;
}

export default function PointSubmissionForm({ onSuccess }: PointSubmissionFormProps) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    eid: '',
    eventType: EVENT_TYPES[0],
    description: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [dailySubmissions, setDailySubmissions] = useState(0);

  useEffect(() => {
    checkDailySubmissions();
  }, []);

  async function checkDailySubmissions() {
    if (!formData.eid) return;

    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const q = query(
        collection(db, 'pointSubmissions'),
        where('eid', '==', formData.eid),
        where('createdAt', '>=', today)
      );
      
      const querySnapshot = await getDocs(q);
      setDailySubmissions(querySnapshot.size);
    } catch (error) {
      console.error('Error checking daily submissions:', error);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      // Validate fields
      if (!formData.firstName || !formData.lastName || !formData.eid) {
        throw new Error('Please fill in all required fields');
      }

      // Check daily submission limit
      if (dailySubmissions >= 5) {
        throw new Error('You have reached the daily limit of 5 point submissions');
      }

      // Submit to Firestore
      await addDoc(collection(db, 'pointSubmissions'), {
        ...formData,
        createdAt: Timestamp.now(),
        status: 'pending',
      });

      // Reset form
      setFormData({
        firstName: '',
        lastName: '',
        eid: '',
        eventType: EVENT_TYPES[0],
        description: '',
      });

      // Update daily submissions count
      setDailySubmissions(prev => prev + 1);

      // Trigger success callback
      if (onSuccess) onSuccess();

    } catch (error) {
      console.error('Error submitting points:', error);
      setError(error instanceof Error ? error.message : 'Failed to submit points');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="bg-white/95 backdrop-blur-md rounded-2xl p-6 md:p-8 shadow-2xl border border-white/20">
      <h3 className="text-2xl font-semibold text-brand-dark mb-6 font-freckle">Submit Points</h3>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">
              First Name
            </label>
            <input
              type="text"
              value={formData.firstName}
              onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
              className="w-full px-4 py-2 rounded-lg border border-border-light focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">
              Last Name
            </label>
            <input
              type="text"
              value={formData.lastName}
              onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
              className="w-full px-4 py-2 rounded-lg border border-border-light focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-text-primary mb-1">
            EID
          </label>
          <input
            type="text"
            value={formData.eid}
            onChange={(e) => {
              setFormData(prev => ({ ...prev, eid: e.target.value }));
              checkDailySubmissions();
            }}
            className="w-full px-4 py-2 rounded-lg border border-border-light focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-text-primary mb-1">
            Event Type
          </label>
          <select
            value={formData.eventType}
            onChange={(e) => setFormData(prev => ({ ...prev, eventType: e.target.value }))}
            className="w-full px-4 py-2 rounded-lg border border-border-light focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
            required
          >
            {EVENT_TYPES.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-text-primary mb-1">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            rows={3}
            className="w-full px-4 py-2 rounded-lg border border-border-light focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
            required
            placeholder="Describe what you did to earn these points..."
          />
        </div>

        <div className="flex items-center justify-between">
          <p className="text-sm text-text-secondary">
            Daily Submissions: {dailySubmissions}/5
          </p>
          <motion.button
            type="submit"
            disabled={submitting || dailySubmissions >= 5}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`px-6 py-2 rounded-lg text-white font-medium transition-colors ${
              submitting || dailySubmissions >= 5
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-brand-primary hover:bg-brand-secondary'
            }`}
          >
            {submitting ? 'Submitting...' : 'Submit Points'}
          </motion.button>
        </div>
      </form>
    </div>
  );
} 