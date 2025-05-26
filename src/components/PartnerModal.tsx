'use client';

import { Fragment, useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import { db } from '@/lib/firebase';
import { collection, addDoc, doc, getDoc } from 'firebase/firestore';
import SkeletonForm from './SkeletonForm';

interface PartnerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface FormData {
  schoolName: string;
  district: string;
  address: string;
  contactName: string;
  position: string;
  email: string;
  gradeLevel: string;
  studentCount: number;
  schedule: 'during-school' | 'after-school' | 'flexible' | '';
  notes: string;
}

export default function PartnerModal({ isOpen, onClose }: PartnerModalProps) {
  const [formData, setFormData] = useState<FormData>({
    schoolName: '',
    district: '',
    address: '',
    contactName: '',
    position: '',
    email: '',
    gradeLevel: '',
    studentCount: 0,
    schedule: '',
    notes: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [requestsEnabled, setRequestsEnabled] = useState(true);

  useEffect(() => {
    if (isOpen) {
      checkRequestStatus();
    }
  }, [isOpen]);

  async function checkRequestStatus() {
    try {
      const settingsDoc = await getDoc(doc(db, 'settings', 'application'));
      if (settingsDoc.exists()) {
        const settings = settingsDoc.data();
        setRequestsEnabled(settings.partnerRequestsOpen);
      }
    } catch (error) {
      console.error('Error checking partner request status:', error);
      setError('Failed to check request status. Please try again later.');
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: id === 'studentCount' ? parseInt(value) || 0 : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    // Validate student count
    if (formData.studentCount <= 0) {
      setError('Number of students must be greater than 0');
      setSubmitting(false);
      return;
    }

    try {
      console.log('Attempting to submit partner request:', formData);

      const response = await fetch('/api/partner-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit request');
      }

      console.log('Partner request submitted successfully with ID:', data.id);
      
      // Show confirmation
      setShowConfirmation(true);

      // Reset form after 2 seconds and close modal
      setTimeout(() => {
        setFormData({
          schoolName: '',
          district: '',
          address: '',
          contactName: '',
          position: '',
          email: '',
          gradeLevel: '',
          studentCount: 0,
          schedule: '',
          notes: '',
        });
        onClose();
      }, 2000);

    } catch (error) {
      console.error('Error submitting partner request:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setError(`Failed to submit request: ${errorMessage}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all relative">
                {showConfirmation && (
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute top-0 left-0 right-0 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6 z-50"
                  >
                    Thank you for your partnership request! We will review it and get back to you soon.
                  </motion.div>
                )}

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute top-0 left-0 right-0 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 z-50"
                  >
                    {error}
                  </motion.div>
                )}

                {/* Background Blobs */}
                <div className="absolute inset-0 -z-10 overflow-hidden">
                  <svg viewBox="0 0 500 500" className="absolute w-[140%] h-[140%] -top-[20%] -left-[20%] opacity-10">
                    <defs>
                      <linearGradient id="blob-gradient-1" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#9DC88D" />
                        <stop offset="100%" stopColor="#C4E3B5" />
                      </linearGradient>
                    </defs>
                    <motion.path
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      d="M250,50 C350,50 450,150 450,250 C450,350 350,450 250,450 C150,450 50,350 50,250 C50,150 150,50 250,50 Z"
                      fill="url(#blob-gradient-1)"
                    />
                  </svg>
                  <svg viewBox="0 0 500 500" className="absolute w-[120%] h-[120%] -bottom-[10%] -right-[10%] opacity-10">
                    <defs>
                      <linearGradient id="blob-gradient-2" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#C4E3B5" />
                        <stop offset="100%" stopColor="#9DC88D" />
                      </linearGradient>
                    </defs>
                    <motion.path
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
                      d="M250,100 C350,100 400,200 400,300 C400,400 300,450 200,450 C100,450 50,400 50,300 C50,200 150,100 250,100 Z"
                      fill="url(#blob-gradient-2)"
                    />
                  </svg>
                </div>

                <div className="flex justify-between items-start mb-4">
                  <Dialog.Title as="h3" className="text-2xl font-freckle text-brand-dark">
                    Partner Request
                  </Dialog.Title>
                  <button
                    onClick={onClose}
                    className="text-text-secondary hover:text-brand-primary transition-colors"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                {!requestsEnabled ? (
                  <SkeletonForm />
                ) : (
                  <div className="mt-4">
                    <p className="text-text-secondary mb-6">
                      Join us in bringing hands-on STEM education to your students. Please provide the following information to start the partnership process.
                    </p>

                    <form onSubmit={handleSubmit} className="max-h-[60vh] overflow-y-auto pr-4 space-y-6 custom-scrollbar">
                      <div className="grid md:grid-cols-2 gap-6">
                        {/* School Information */}
                        <div className="space-y-4">
                          <h4 className="font-medium text-brand-dark">School Information</h4>
                          <div>
                            <label htmlFor="schoolName" className="block text-sm font-medium text-text-primary mb-1">
                              School Name*
                            </label>
                            <input
                              type="text"
                              id="schoolName"
                              value={formData.schoolName}
                              onChange={handleChange}
                              required
                              className="w-full px-4 py-2 rounded-lg border border-border-light bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-colors"
                            />
                          </div>
                          <div>
                            <label htmlFor="district" className="block text-sm font-medium text-text-primary mb-1">
                              School District*
                            </label>
                            <input
                              type="text"
                              id="district"
                              value={formData.district}
                              onChange={handleChange}
                              required
                              className="w-full px-4 py-2 rounded-lg border border-border-light bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-colors"
                            />
                          </div>
                          <div>
                            <label htmlFor="address" className="block text-sm font-medium text-text-primary mb-1">
                              School Address*
                            </label>
                            <input
                              type="text"
                              id="address"
                              value={formData.address}
                              onChange={handleChange}
                              required
                              className="w-full px-4 py-2 rounded-lg border border-border-light bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-colors"
                            />
                          </div>
                        </div>

                        {/* Contact Information */}
                        <div className="space-y-4">
                          <h4 className="font-medium text-brand-dark">Contact Information</h4>
                          <div>
                            <label htmlFor="contactName" className="block text-sm font-medium text-text-primary mb-1">
                              Contact Name*
                            </label>
                            <input
                              type="text"
                              id="contactName"
                              value={formData.contactName}
                              onChange={handleChange}
                              required
                              className="w-full px-4 py-2 rounded-lg border border-border-light bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-colors"
                            />
                          </div>
                          <div>
                            <label htmlFor="position" className="block text-sm font-medium text-text-primary mb-1">
                              Position/Role*
                            </label>
                            <input
                              type="text"
                              id="position"
                              value={formData.position}
                              onChange={handleChange}
                              required
                              className="w-full px-4 py-2 rounded-lg border border-border-light bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-colors"
                            />
                          </div>
                          <div>
                            <label htmlFor="email" className="block text-sm font-medium text-text-primary mb-1">
                              Email Address*
                            </label>
                            <input
                              type="email"
                              id="email"
                              value={formData.email}
                              onChange={handleChange}
                              required
                              className="w-full px-4 py-2 rounded-lg border border-border-light bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-colors"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Program Details */}
                      <div className="space-y-4">
                        <h4 className="font-medium text-brand-dark">Program Details</h4>
                        <div>
                          <label htmlFor="gradeLevel" className="block text-sm font-medium text-text-primary mb-1">
                            Target Grade Level(s)*
                          </label>
                          <input
                            type="text"
                            id="gradeLevel"
                            value={formData.gradeLevel}
                            onChange={handleChange}
                            required
                            placeholder="e.g., 3rd-5th grade"
                            className="w-full px-4 py-2 rounded-lg border border-border-light bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-colors"
                          />
                        </div>
                        <div>
                          <label htmlFor="studentCount" className="block text-sm font-medium text-text-primary mb-1">
                            Estimated Number of Students*
                          </label>
                          <input
                            type="number"
                            id="studentCount"
                            value={formData.studentCount}
                            onChange={handleChange}
                            required
                            min="1"
                            className="w-full px-4 py-2 rounded-lg border border-border-light bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-colors"
                          />
                        </div>
                        <div>
                          <label htmlFor="schedule" className="block text-sm font-medium text-text-primary mb-1">
                            Preferred Schedule
                          </label>
                          <select
                            id="schedule"
                            value={formData.schedule}
                            onChange={handleChange}
                            className="w-full px-4 py-2 rounded-lg border border-border-light bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-colors"
                          >
                            <option value="">Select a preferred time</option>
                            <option value="during-school">During School Hours</option>
                            <option value="after-school">After School Program</option>
                            <option value="flexible">Flexible</option>
                          </select>
                        </div>
                        <div>
                          <label htmlFor="notes" className="block text-sm font-medium text-text-primary mb-1">
                            Additional Notes or Requirements
                          </label>
                          <textarea
                            id="notes"
                            value={formData.notes}
                            onChange={handleChange}
                            rows={3}
                            className="w-full px-4 py-2 rounded-lg border border-border-light bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-colors"
                            placeholder="Tell us about any specific needs or expectations..."
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-4 sticky bottom-0 bg-white/80 backdrop-blur-sm py-4">
                        <p className="text-sm text-text-secondary">* Required fields</p>
                        <motion.button
                          type="submit"
                          disabled={submitting}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className={`bg-brand-primary text-white px-8 py-3 rounded-lg text-lg font-medium hover:bg-brand-secondary transition-colors ${
                            submitting ? 'opacity-50 cursor-not-allowed' : ''
                          }`}
                        >
                          {submitting ? 'Submitting...' : 'Submit Application'}
                        </motion.button>
                      </div>
                    </form>
                  </div>
                )}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
} 