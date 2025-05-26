'use client';

import { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '@/lib/firebase';
import { collection, addDoc, Timestamp, query, where, getDocs } from 'firebase/firestore';

interface PointSubmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const EVENT_TYPES = ['meeting', 'volunteer', 'tabling', 'social', 'fundraising', 'bonus'] as const;
type EventType = typeof EVENT_TYPES[number];

export default function PointSubmissionModal({ isOpen, onClose }: PointSubmissionModalProps) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    eid: '',
    eventType: EVENT_TYPES[0] as EventType,
    description: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      // Validate fields
      if (!formData.firstName || !formData.lastName || !formData.eid || !formData.description) {
        throw new Error('Please fill in all required fields');
      }

      console.log('Submitting point request with data:', formData);

      // Check if member exists in members table
      const membersRef = collection(db, 'members');
      const q = query(
        membersRef,
        where('firstName', '==', formData.firstName.trim()),
        where('lastName', '==', formData.lastName.trim()),
        where('eid', '==', formData.eid.trim())
      );
      
      const memberSnapshot = await getDocs(q);
      console.log('Member lookup result:', memberSnapshot.empty ? 'not found' : 'found');
      
      if (memberSnapshot.empty) {
        throw new Error('Member not found. Please check your information and try again.');
      }

      const memberDoc = memberSnapshot.docs[0];
      const memberId = memberDoc.id;
      console.log('Found member with ID:', memberId);

      // Calculate points based on event type
      const pointValues: Record<EventType, number> = {
        meeting: 1,
        volunteer: 1,
        tabling: 1,
        social: 1,
        fundraising: 1,
        bonus: 1,
      };

      const points = pointValues[formData.eventType];
      
      const submissionData = {
        memberId,
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        eid: formData.eid.trim(),
        eventType: formData.eventType,
        description: formData.description.trim(),
        points,
        status: 'pending' as const,
        createdAt: Timestamp.now(),
      };

      console.log('Creating point submission with data:', submissionData);

      // Submit to pointSubmissions collection
      const submissionRef = await addDoc(collection(db, 'pointSubmissions'), submissionData);
      console.log('Created point submission with ID:', submissionRef.id);

      // Show success message
      setSuccess(true);

      // Reset form after 2 seconds
      setTimeout(() => {
        setFormData({
          firstName: '',
          lastName: '',
          eid: '',
          eventType: EVENT_TYPES[0] as EventType,
          description: '',
        });
        setSuccess(false);
        onClose();
      }, 2000);

    } catch (error) {
      console.error('Error submitting points:', error);
      setError(error instanceof Error ? error.message : 'Failed to submit points');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <Dialog
          as={motion.div}
          static
          open={isOpen}
          onClose={onClose}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
        >
          <Dialog.Overlay className="fixed inset-0" />
          <Dialog.Panel
            as={motion.div}
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden relative z-10"
          >
            <div className="p-6 md:p-8">
              <Dialog.Title className="text-2xl font-semibold text-brand-dark mb-6">
                Submit Points
              </Dialog.Title>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                  {error}
                </div>
              )}

              {success ? (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
                  Points submitted successfully!
                </div>
              ) : (
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
                      UT EID
                    </label>
                    <input
                      type="text"
                      value={formData.eid}
                      onChange={(e) => setFormData(prev => ({ ...prev, eid: e.target.value }))}
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
                      onChange={(e) => setFormData(prev => ({ ...prev, eventType: e.target.value as EventType }))}
                      className="w-full px-4 py-2 rounded-lg border border-border-light focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
                      required
                    >
                      {EVENT_TYPES.map(type => (
                        <option key={type} value={type}>
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </option>
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

                  <div className="flex justify-end space-x-4">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-6 py-2 rounded-lg text-text-secondary hover:text-text-primary transition-colors"
                    >
                      Cancel
                    </button>
                    <motion.button
                      type="submit"
                      disabled={submitting}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`px-6 py-2 rounded-lg text-white font-medium transition-colors ${
                        submitting
                          ? 'bg-gray-400 cursor-not-allowed'
                          : 'bg-brand-primary hover:bg-brand-secondary'
                      }`}
                    >
                      {submitting ? 'Submitting...' : 'Submit Points'}
                    </motion.button>
                  </div>
                </form>
              )}
            </div>
          </Dialog.Panel>
        </Dialog>
      )}
    </AnimatePresence>
  );
} 