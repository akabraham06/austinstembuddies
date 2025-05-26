import { Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';

interface WebmasterLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function WebmasterLoginModal({ isOpen, onClose }: WebmasterLoginModalProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { signIn } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await signIn(email, password);
      router.push('/cms');
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to sign in');
    } finally {
      setIsLoading(false);
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
                      <linearGradient id="login-blob-gradient-1" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#9DC88D" />
                        <stop offset="100%" stopColor="#C4E3B5" />
                      </linearGradient>
                    </defs>
                    <motion.path
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      d="M250,50 C350,50 450,150 450,250 C450,350 350,450 250,450 C150,450 50,350 50,250 C50,150 150,50 250,50 Z"
                      fill="url(#login-blob-gradient-1)"
                    />
                  </svg>
                </div>

                <div className="flex justify-between items-start mb-4">
                  <Dialog.Title as="h3" className="text-2xl font-freckle text-brand-dark">
                    Webmaster Login
                  </Dialog.Title>
                  <button
                    onClick={onClose}
                    className="text-text-secondary hover:text-brand-primary transition-colors"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                  {error && (
                    <div className="text-red-500 text-sm">{error}</div>
                  )}

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-text-primary mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full px-4 py-2 rounded-lg border border-border-light bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-colors"
                    />
                  </div>

                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-text-primary mb-1">
                      Password
                    </label>
                    <input
                      type="password"
                      id="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="w-full px-4 py-2 rounded-lg border border-border-light bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-colors"
                    />
                  </div>

                  <div className="flex items-center justify-end pt-4">
                    <motion.button
                      type="submit"
                      disabled={isLoading}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`bg-brand-primary text-white px-8 py-3 rounded-lg text-lg font-medium hover:bg-brand-secondary transition-colors ${
                        isLoading ? 'opacity-70 cursor-not-allowed' : ''
                      }`}
                    >
                      {isLoading ? 'Signing in...' : 'Login'}
                    </motion.button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
} 