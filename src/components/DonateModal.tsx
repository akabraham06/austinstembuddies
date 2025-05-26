import { Fragment, useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import SkeletonForm from './SkeletonForm';

interface DonateModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DonateModal({ isOpen, onClose }: DonateModalProps) {
  const [donationsEnabled, setDonationsEnabled] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      checkDonationStatus();
    }
  }, [isOpen]);

  async function checkDonationStatus() {
    try {
      const settingsDoc = await getDoc(doc(db, 'settings', 'application'));
      if (settingsDoc.exists()) {
        const settings = settingsDoc.data();
        setDonationsEnabled(settings.donationsEnabled);
      }
    } catch (error) {
      console.error('Error checking donation status:', error);
      setError('Failed to check donation status. Please try again later.');
    }
  }

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
                </div>

                <div className="flex justify-between items-start mb-4">
                  <Dialog.Title as="h3" className="text-2xl font-freckle text-brand-dark">
                    Support Our Mission
                  </Dialog.Title>
                  <button
                    onClick={onClose}
                    className="text-text-secondary hover:text-brand-primary transition-colors"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                {!donationsEnabled ? (
                  <SkeletonForm />
                ) : (
                  <div className="mt-4">
                    <p className="text-text-secondary mb-6">
                      Your donation helps us bring exciting STEM experiments to more elementary school students. Choose a donation method below:
                    </p>

                    <div className="space-y-4">
                      {/* Venmo Option */}
                      <motion.a
                        href="https://venmo.com/austinstembuddies"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between p-4 rounded-lg bg-white/80 backdrop-blur-sm border border-border-light hover:border-brand-primary group transition-all duration-200"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="flex items-center space-x-3">
                          <img src="/venmo-icon.svg" alt="Venmo" className="w-8 h-8" />
                          <div>
                            <h4 className="font-medium text-text-primary">Donate with Venmo</h4>
                            <p className="text-sm text-text-secondary">Fast and secure payment</p>
                          </div>
                        </div>
                        <svg className="w-5 h-5 text-brand-primary opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </motion.a>

                      {/* PayPal Option */}
                      <motion.a
                        href="https://paypal.me/austinstembuddies"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between p-4 rounded-lg bg-white/80 backdrop-blur-sm border border-border-light hover:border-brand-primary group transition-all duration-200"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="flex items-center space-x-3">
                          <img src="/paypal-icon.svg" alt="PayPal" className="w-8 h-8" />
                          <div>
                            <h4 className="font-medium text-text-primary">Donate with PayPal</h4>
                            <p className="text-sm text-text-secondary">Secure online payment</p>
                          </div>
                        </div>
                        <svg className="w-5 h-5 text-brand-primary opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </motion.a>

                      {/* Contact for Other Methods */}
                      <div className="mt-6 text-center">
                        <p className="text-sm text-text-secondary">
                          For other donation methods or questions, please{' '}
                          <a
                            href="mailto:contact@austinstembuddies.org"
                            className="text-brand-primary hover:text-brand-secondary transition-colors"
                          >
                            contact us
                          </a>
                        </p>
                      </div>
                    </div>
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