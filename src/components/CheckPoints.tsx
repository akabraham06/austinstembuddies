'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import Link from 'next/link';

interface CheckPoint {
  firstName: string;
  lastName: string;
  eid: string;
  meetingPoints: number;
  volunteerPoints: number;
  tablingPoints: number;
  socialPoints: number;
  fundraisingPoints: number;
  bonusPoints: number;
  totalPoints: number;
  lastEvent?: string;
}

export default function CheckPoints() {
  const [memberData, setMemberData] = useState<CheckPoint | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    eid: ''
  });
  const [verified, setVerified] = useState(false);

  const requirements = {
    meeting: 2,
    volunteer: 4,
    tabling: 2,
    social: 3,
    fundraising: 3,
    bonus: 1,
  };

  async function handleVerification(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Query Firestore for the member
      const q = query(
        collection(db, 'members'),
        where('firstName', '==', formData.firstName.trim()),
        where('lastName', '==', formData.lastName.trim()),
        where('eid', '==', formData.eid.trim())
      );

      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        throw new Error('Member not found. Please check your information and try again.');
      }

      const memberDoc = querySnapshot.docs[0];
      const data = memberDoc.data() as CheckPoint;
      
      setMemberData(data);
      setVerified(true);
    } catch (err) {
      console.error('Error verifying member:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }

  if (!verified) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="max-w-lg w-full px-4">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="flex justify-between items-center p-6 bg-background-accent border-b border-border-light">
              <h2 className="text-2xl font-bold text-brand-dark">
                Check Your Points
              </h2>
              <Link href="/#points">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="text-brand-primary hover:text-brand-secondary transition-colors font-medium flex items-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
                  </svg>
                  Back to Main Page
                </motion.button>
              </Link>
            </div>
            <div className="p-6">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                  {error}
                </div>
              )}

              <form onSubmit={handleVerification} className="space-y-4">
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

                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full px-6 py-2 rounded-lg text-white font-medium transition-colors ${
                    loading
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-brand-primary hover:bg-brand-secondary'
                  }`}
                >
                  {loading ? 'Verifying...' : 'Check My Points'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!memberData) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="flex justify-between items-center p-6 bg-background-accent border-b border-border-light">
          <h2 className="text-2xl font-bold text-brand-dark">
            Points Summary for {memberData.firstName} {memberData.lastName}
          </h2>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setVerified(false);
              setMemberData(null);
              setFormData({ firstName: '', lastName: '', eid: '' });
            }}
            className="text-brand-primary hover:text-brand-secondary transition-colors font-medium flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
            </svg>
            Check Another Member
          </motion.button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border-light">
            <thead className="bg-background-light">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium text-text-primary">Category</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-text-primary">Points Earned</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-text-primary">Required</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-text-primary">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-border-light">
              {[
                { name: 'Meeting', points: memberData.meetingPoints, req: requirements.meeting },
                { name: 'Volunteer', points: memberData.volunteerPoints, req: requirements.volunteer },
                { name: 'Tabling', points: memberData.tablingPoints, req: requirements.tabling },
                { name: 'Social', points: memberData.socialPoints, req: requirements.social },
                { name: 'Fundraising', points: memberData.fundraisingPoints, req: requirements.fundraising },
                { name: 'Bonus', points: memberData.bonusPoints, req: requirements.bonus }
              ].map((category) => (
                <tr key={category.name}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary">
                    {category.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary">
                    {category.points}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary">
                    {category.req}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        category.points >= category.req
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {category.points >= category.req ? 'Complete' : 'In Progress'}
                    </span>
                  </td>
                </tr>
              ))}
              <tr className="bg-background-accent">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-brand-primary">
                  Total Points
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-brand-primary">
                  {memberData.totalPoints}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-brand-primary">
                  {Object.values(requirements).reduce((a, b) => a + b, 0)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      memberData.totalPoints >= Object.values(requirements).reduce((a, b) => a + b, 0)
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {memberData.totalPoints >= Object.values(requirements).reduce((a, b) => a + b, 0)
                      ? 'All Requirements Met'
                      : 'Requirements In Progress'}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="p-6 border-t border-border-light bg-background-accent flex justify-between items-center">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setVerified(false);
              setMemberData(null);
              setFormData({ firstName: '', lastName: '', eid: '' });
            }}
            className="text-brand-primary hover:text-brand-secondary transition-colors font-medium flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
            </svg>
            Check Another Member
          </motion.button>
          <Link href="/#points">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="text-brand-primary hover:text-brand-secondary transition-colors font-medium flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
              </svg>
              Back to Main Page
            </motion.button>
          </Link>
        </div>
      </div>
    </div>
  );
} 