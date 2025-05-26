import { Fragment, useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import { db } from '@/lib/firebase';
import { collection, addDoc, doc, getDoc } from 'firebase/firestore';
import SkeletonForm from './SkeletonForm';

interface EmailSignupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function EmailSignupModal({ isOpen, onClose }: EmailSignupModalProps) {
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    eid: '',
    yearInSchool: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [signupsEnabled, setSignupsEnabled] = useState(true);

  useEffect(() => {
    if (isOpen) {
      checkSignupStatus();
    }
  }, [isOpen]);

  async function checkSignupStatus() {
    try {
      const settingsDoc = await getDoc(doc(db, 'settings', 'application'));
      if (settingsDoc.exists()) {
        const settings = settingsDoc.data();
        setSignupsEnabled(settings.emailSignupEnabled);
      }
    } catch (error) {
      console.error('Error checking email signup status:', error);
      setError('Failed to check signup status. Please try again later.');
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/forms/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit form');
      }

      setSuccess(true);
      setTimeout(() => {
        onClose();
        setSuccess(false);
        setFormData({
          email: '',
          firstName: '',
          lastName: '',
          eid: '',
          yearInSchool: ''
        });
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setIsSubmitting(false);
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
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all relative">
                {/* Background Blobs */}
                <div className="absolute inset-0 -z-10 overflow-hidden">
                  <svg viewBox="0 0 500 500" className="absolute w-[140%] h-[140%] -top-[20%] -left-[20%] opacity-10">
                    <defs>
                      <linearGradient id="email-blob-gradient-1" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#9DC88D" />
                        <stop offset="100%" stopColor="#C4E3B5" />
                      </linearGradient>
                    </defs>
                    <motion.path
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      d="M250,50 C350,50 450,150 450,250 C450,350 350,450 250,450 C150,450 50,350 50,250 C50,150 150,50 250,50 Z"
                      fill="url(#email-blob-gradient-1)"
                    />
                  </svg>
                </div>

                <div className="flex justify-between items-start mb-4">
                  <Dialog.Title as="h3" className="text-2xl font-freckle text-brand-dark">
                    Join Our Mailing List
                  </Dialog.Title>
                  <button
                    onClick={onClose}
                    className="text-text-secondary hover:text-brand-primary transition-colors"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                {!signupsEnabled ? (
                  <SkeletonForm />
                ) : (
                  <>
                    {success ? (
                      <div className="text-center py-8">
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="mb-4 text-brand-primary"
                        >
                          <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </motion.div>
                        <p className="text-lg font-medium text-text-primary">Thank you for signing up!</p>
                      </div>
                    ) : (
                      <div className="mt-4">
                        {error && (
                          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                            {error}
                          </div>
                        )}
                        <form onSubmit={handleSubmit} className="space-y-6">
                          <div>
                            <label htmlFor="email" className="block text-sm font-medium text-text-primary mb-1">
                              Email<span className="text-red-500">*</span>
                            </label>
                            <input
                              type="email"
                              id="email"
                              name="email"
                              value={formData.email}
                              onChange={handleChange}
                              required
                              className="w-full px-4 py-2 rounded-lg border border-border-light bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-colors"
                              placeholder="Your email"
                            />
                          </div>

                          <div>
                            <label htmlFor="firstName" className="block text-sm font-medium text-text-primary mb-1">
                              First Name<span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              id="firstName"
                              name="firstName"
                              value={formData.firstName}
                              onChange={handleChange}
                              required
                              className="w-full px-4 py-2 rounded-lg border border-border-light bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-colors"
                              placeholder="Your answer"
                            />
                          </div>

                          <div>
                            <label htmlFor="lastName" className="block text-sm font-medium text-text-primary mb-1">
                              Last Name<span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              id="lastName"
                              name="lastName"
                              value={formData.lastName}
                              onChange={handleChange}
                              required
                              className="w-full px-4 py-2 rounded-lg border border-border-light bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-colors"
                              placeholder="Your answer"
                            />
                          </div>

                          <div>
                            <label htmlFor="eid" className="block text-sm font-medium text-text-primary mb-1">
                              EID<span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              id="eid"
                              name="eid"
                              value={formData.eid}
                              onChange={handleChange}
                              required
                              className="w-full px-4 py-2 rounded-lg border border-border-light bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-colors"
                              placeholder="Your answer"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-text-primary mb-1">
                              Year in school<span className="text-red-500">*</span>
                            </label>
                            <div className="space-y-2">
                              {['Freshman', 'Sophomore', 'Junior', 'Senior'].map((year) => (
                                <label key={year} className="flex items-center space-x-2">
                                  <input
                                    type="radio"
                                    name="yearInSchool"
                                    value={year}
                                    checked={formData.yearInSchool === year}
                                    onChange={handleChange}
                                    required
                                    className="form-radio text-brand-primary focus:ring-brand-primary"
                                  />
                                  <span className="text-text-secondary">{year}</span>
                                </label>
                              ))}
                            </div>
                          </div>

                          <div className="flex items-center justify-end pt-4">
                            <motion.button
                              type="submit"
                              disabled={isSubmitting}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              className={`bg-brand-primary text-white px-8 py-3 rounded-lg text-lg font-medium hover:bg-brand-secondary transition-colors ${
                                isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
                              }`}
                            >
                              {isSubmitting ? 'Submitting...' : 'Submit'}
                            </motion.button>
                          </div>
                        </form>
                      </div>
                    )}
                  </>
                )}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
} 