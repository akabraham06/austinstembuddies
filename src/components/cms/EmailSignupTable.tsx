'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, getDocs, deleteDoc, doc, onSnapshot } from 'firebase/firestore';
import { EmailSignup } from '@/lib/firebase-types';
import { motion } from 'framer-motion';
import { TrashIcon } from '@heroicons/react/24/outline';

export default function EmailSignupTable() {
  const [signups, setSignups] = useState<EmailSignup[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'email-signups'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const signupsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as EmailSignup[];
      setSignups(signupsData);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching email signups:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  async function handleDeleteSignup(signupId: string) {
    if (window.confirm('Are you sure you want to delete this signup?')) {
      try {
        await deleteDoc(doc(db, 'email-signups', signupId));
      } catch (error) {
        console.error('Error deleting signup:', error);
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
      <h2 className="text-xl font-semibold text-brand-dark mb-6">Email Signups</h2>

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="min-w-full divide-y divide-border-light">
          <thead>
            <tr className="bg-background-accent">
              <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                First Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                Last Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                EID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                Year
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-border-light">
            {signups.map((signup) => (
              <tr key={signup.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary">
                  {new Date(signup.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary">
                  {signup.firstName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary">
                  {signup.lastName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary">
                  {signup.email}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary">
                  {signup.eid}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary">
                  {signup.yearInSchool}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleDeleteSignup(signup.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </motion.button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
} 