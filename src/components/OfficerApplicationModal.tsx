'use client';

import { Fragment, useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import { db } from '@/lib/firebase';
import { collection, addDoc, doc, getDoc } from 'firebase/firestore';

interface OfficerApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  eid: string;
  yearInSchool: string;
  major: string;
  gpa: string;
  position: string;
  experience: string;
  whyJoin: string;
  ideas: string;
}

export default function OfficerApplicationModal({ isOpen, onClose }: OfficerApplicationModalProps) {
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    eid: '',
    yearInSchool: '',
    major: '',
    gpa: '',
    position: '',
    experience: '',
    whyJoin: '',
    ideas: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [applicationsOpen, setApplicationsOpen] = useState(true);

  useEffect(() => {
    checkApplicationStatus();
  }, [isOpen]);

  async function checkApplicationStatus() {
    try {
      const settingsDoc = await getDoc(doc(db, 'settings', 'application'));
      if (settingsDoc.exists()) {
        const settings = settingsDoc.data();
        setApplicationsOpen(settings.membershipApplicationsOpen);
      }
    } catch (error) {
      console.error('Error checking application status:', error);
      setError('Failed to check application status. Please try again later.');
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    if (!applicationsOpen) {
      setError('Member applications are closed.');
      setSubmitting(false);
      return;
    }

    try {
      await addDoc(collection(db, 'officer-applications'), {
        ...formData,
        createdAt: new Date(),
        status: 'pending',
      });

      // Reset form
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        eid: '',
        yearInSchool: '',
        major: '',
        gpa: '',
        position: '',
        experience: '',
        whyJoin: '',
        ideas: '',
      });

      onClose();
    } catch (error) {
      console.error('Error submitting application:', error);
      setError('Failed to submit application. Please try again later.');
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
                {/* Background Blobs */}
                <div className="absolute inset-0 -z-10 overflow-hidden">
                  <svg viewBox="0 0 500 500" className="absolute w-[140%] h-[140%] -top-[20%] -left-[20%] opacity-10">
                    <defs>
                      <linearGradient id="officer-blob-gradient-1" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#9DC88D" />
                        <stop offset="100%" stopColor="#C4E3B5" />
                      </linearGradient>
                    </defs>
                    <motion.path
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      d="M250,50 C350,50 450,150 450,250 C450,350 350,450 250,450 C150,450 50,350 50,250 C50,150 150,50 250,50 Z"
                      fill="url(#officer-blob-gradient-1)"
                    />
                  </svg>
                </div>

                <div className="flex justify-between items-start mb-4">
                  <Dialog.Title as="h3" className="text-2xl font-freckle text-brand-dark">
                    Officer Application
                  </Dialog.Title>
                  <button
                    onClick={onClose}
                    className="text-text-secondary hover:text-brand-primary transition-colors"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                <div className="mt-4">
                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                      {error}
                    </div>
                  )}
                  {!applicationsOpen ? (
                    <div className="text-center py-8">
                      <h3 className="text-xl font-semibold text-brand-dark mb-4">Applications Closed</h3>
                      <p className="text-text-secondary">
                        Member applications are closed. Please check back later.
                      </p>
                    </div>
                  ) : (
                    <>
                      <p className="text-text-secondary mb-6">
                        Join our leadership team and help make a difference in STEM education. Please fill out the form below to apply.
                      </p>

                      <form onSubmit={handleSubmit} className="max-h-[60vh] overflow-y-auto pr-4 space-y-6 custom-scrollbar">
                        <div className="grid md:grid-cols-2 gap-6">
                          {/* Personal Information */}
                          <div className="space-y-4">
                            <h4 className="font-medium text-brand-dark">Personal Information</h4>
                            <div>
                              <label htmlFor="firstName" className="block text-sm font-medium text-text-primary mb-1">
                                First Name*
                              </label>
                              <input
                                type="text"
                                id="firstName"
                                value={formData.firstName}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-2 rounded-lg border border-border-light bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-colors"
                              />
                            </div>
                            <div>
                              <label htmlFor="lastName" className="block text-sm font-medium text-text-primary mb-1">
                                Last Name*
                              </label>
                              <input
                                type="text"
                                id="lastName"
                                value={formData.lastName}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-2 rounded-lg border border-border-light bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-colors"
                              />
                            </div>
                            <div>
                              <label htmlFor="email" className="block text-sm font-medium text-text-primary mb-1">
                                Email*
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

                          {/* Academic Information */}
                          <div className="space-y-4">
                            <h4 className="font-medium text-brand-dark">Academic Information</h4>
                            <div>
                              <label htmlFor="eid" className="block text-sm font-medium text-text-primary mb-1">
                                EID*
                              </label>
                              <input
                                type="text"
                                id="eid"
                                value={formData.eid}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-2 rounded-lg border border-border-light bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-colors"
                              />
                            </div>
                            <div>
                              <label htmlFor="yearInSchool" className="block text-sm font-medium text-text-primary mb-1">
                                Year in School*
                              </label>
                              <select
                                id="yearInSchool"
                                value={formData.yearInSchool}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-2 rounded-lg border border-border-light bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-colors"
                              >
                                <option value="">Select year</option>
                                <option value="Freshman">Freshman</option>
                                <option value="Sophomore">Sophomore</option>
                                <option value="Junior">Junior</option>
                                <option value="Senior">Senior</option>
                              </select>
                            </div>
                            <div>
                              <label htmlFor="major" className="block text-sm font-medium text-text-primary mb-1">
                                Major*
                              </label>
                              <input
                                type="text"
                                id="major"
                                value={formData.major}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-2 rounded-lg border border-border-light bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-colors"
                              />
                            </div>
                            <div>
                              <label htmlFor="gpa" className="block text-sm font-medium text-text-primary mb-1">
                                GPA*
                              </label>
                              <input
                                type="text"
                                id="gpa"
                                value={formData.gpa}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-2 rounded-lg border border-border-light bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-colors"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Application Questions */}
                        <div className="space-y-4">
                          <h4 className="font-medium text-brand-dark">Application Questions</h4>
                          <div>
                            <label htmlFor="position" className="block text-sm font-medium text-text-primary mb-1">
                              Desired Position*
                            </label>
                            <select
                              id="position"
                              value={formData.position}
                              onChange={handleChange}
                              required
                              className="w-full px-4 py-2 rounded-lg border border-border-light bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-colors"
                            >
                              <option value="">Select position</option>
                              <option value="President">President</option>
                              <option value="Vice President">Vice President</option>
                              <option value="Secretary">Secretary</option>
                              <option value="Treasurer">Treasurer</option>
                              <option value="Outreach Coordinator">Outreach Coordinator</option>
                              <option value="Social Media Manager">Social Media Manager</option>
                              <option value="Event Coordinator">Event Coordinator</option>
                            </select>
                          </div>
                          <div>
                            <label htmlFor="experience" className="block text-sm font-medium text-text-primary mb-1">
                              Relevant Experience*
                            </label>
                            <textarea
                              id="experience"
                              value={formData.experience}
                              onChange={handleChange}
                              required
                              rows={4}
                              className="w-full px-4 py-2 rounded-lg border border-border-light bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-colors"
                              placeholder="Tell us about your experience in leadership, STEM education, or related activities..."
                            />
                          </div>
                          <div>
                            <label htmlFor="whyJoin" className="block text-sm font-medium text-text-primary mb-1">
                              Why do you want to join our leadership team?*
                            </label>
                            <textarea
                              id="whyJoin"
                              value={formData.whyJoin}
                              onChange={handleChange}
                              required
                              rows={4}
                              className="w-full px-4 py-2 rounded-lg border border-border-light bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-colors"
                              placeholder="Share your motivation and goals..."
                            />
                          </div>
                          <div>
                            <label htmlFor="ideas" className="block text-sm font-medium text-text-primary mb-1">
                              What ideas do you have for improving our organization?*
                            </label>
                            <textarea
                              id="ideas"
                              value={formData.ideas}
                              onChange={handleChange}
                              required
                              rows={4}
                              className="w-full px-4 py-2 rounded-lg border border-border-light bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-colors"
                              placeholder="Share your vision and ideas..."
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
                    </>
                  )}
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
} 