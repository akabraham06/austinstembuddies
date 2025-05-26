'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc, updateDoc, onSnapshot } from 'firebase/firestore';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/auth-context';

interface ApplicationSettings {
  membershipApplicationsOpen: boolean;
  partnerRequestsOpen: boolean;
  emailSignupEnabled: boolean;
  donationsEnabled: boolean;
}

const DEFAULT_SETTINGS: ApplicationSettings = {
  membershipApplicationsOpen: true,
  partnerRequestsOpen: true,
  emailSignupEnabled: true,
  donationsEnabled: true,
};

export default function ApplicationSettings() {
  const [settings, setSettings] = useState<ApplicationSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const settingsRef = doc(db, 'settings', 'application');
    
    // First, check if the document exists and create it if it doesn't
    getDoc(settingsRef).then(async (doc) => {
      if (!doc.exists()) {
        try {
          await setDoc(settingsRef, DEFAULT_SETTINGS);
        } catch (error) {
          console.error('Error creating default settings:', error);
          setError('Failed to create default settings.');
        }
      }
    });

    // Set up real-time listener
    const unsubscribe = onSnapshot(settingsRef, 
      (doc) => {
        if (doc.exists()) {
          setSettings(doc.data() as ApplicationSettings);
        } else {
          setSettings(DEFAULT_SETTINGS);
        }
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching settings:', error);
        setError('Failed to load settings. Please try again.');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  async function handleToggleSetting(key: keyof ApplicationSettings) {
    if (!user) {
      setError('You must be logged in to change settings.');
      return;
    }

    setSaving(true);
    setError(null);
    
    try {
      const newSettings = { ...settings, [key]: !settings[key] };
      const settingsRef = doc(db, 'settings', 'application');
      await updateDoc(settingsRef, { [key]: !settings[key] });
      // Note: We don't need to setSettings here as it will be updated by the onSnapshot listener
    } catch (error) {
      console.error('Error updating settings:', error);
      setError('Failed to update settings. Please try again.');
      // Revert the optimistic update
      setSettings(settings);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-brand-primary"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-8">
        <p className="text-text-secondary">Please log in to manage application settings.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h2 className="text-xl font-semibold text-brand-dark mb-6">Application Settings</h2>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg shadow p-6">
        <div className="space-y-6">
          {/* Membership Applications */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-text-primary">Membership Applications</h3>
              <p className="text-sm text-text-secondary">Allow new members to join ASB</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleToggleSetting('membershipApplicationsOpen')}
              disabled={saving}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2 ${
                settings.membershipApplicationsOpen ? 'bg-brand-primary' : 'bg-gray-200'
              } ${saving ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  settings.membershipApplicationsOpen ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </motion.button>
          </div>

          {/* Partner Requests */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-text-primary">Partner Requests</h3>
              <p className="text-sm text-text-secondary">Allow schools to submit partnership requests</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleToggleSetting('partnerRequestsOpen')}
              disabled={saving}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2 ${
                settings.partnerRequestsOpen ? 'bg-brand-primary' : 'bg-gray-200'
              } ${saving ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  settings.partnerRequestsOpen ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </motion.button>
          </div>

          {/* Email Signup */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-text-primary">Email Signup</h3>
              <p className="text-sm text-text-secondary">Allow visitors to join the mailing list</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleToggleSetting('emailSignupEnabled')}
              disabled={saving}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2 ${
                settings.emailSignupEnabled ? 'bg-brand-primary' : 'bg-gray-200'
              } ${saving ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  settings.emailSignupEnabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </motion.button>
          </div>

          {/* Donations */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-text-primary">Donations</h3>
              <p className="text-sm text-text-secondary">Enable donation functionality</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleToggleSetting('donationsEnabled')}
              disabled={saving}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2 ${
                settings.donationsEnabled ? 'bg-brand-primary' : 'bg-gray-200'
              } ${saving ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  settings.donationsEnabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
} 