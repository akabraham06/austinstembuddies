'use client';

import { useState, useEffect, ReactElement } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, getDocs, doc, updateDoc, deleteDoc, where, getDoc, onSnapshot, Timestamp } from 'firebase/firestore';
import { motion } from 'framer-motion';
import { CheckIcon, XMarkIcon, ArchiveBoxIcon } from '@heroicons/react/24/outline';

interface PointSubmission {
  id: string;
  memberId: string;
  firstName: string;
  lastName: string;
  eid: string;
  eventType: string;
  description: string;
  points: number;
  createdAt: any;
  status: 'pending' | 'approved' | 'archived';
}

export default function PointSubmissionsTable() {
  const [submissions, setSubmissions] = useState<PointSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | ReactElement | null>(null);
  const [filter, setFilter] = useState<'pending' | 'approved' | 'archived'>('pending');

  useEffect(() => {
    console.log('Setting up point submissions listener with filter:', filter);
    const submissionsRef = collection(db, 'pointSubmissions');
    const q = query(
      submissionsRef,
      where('status', '==', filter),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        console.log('Received point submissions update:', snapshot.size, 'submissions');
        const submissionsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as PointSubmission[];
        console.log('Processed submissions:', submissionsData);
        setSubmissions(submissionsData);
        setLoading(false);
        setError(null);
      },
      (error) => {
        console.error('Error in point submissions listener:', error);
        if (error.message.includes('requires an index')) {
          const indexUrl = error.message.match(/https:\/\/console\.firebase\.google\.com[^\s]*/)?.[0];
          setError(
            <div>
              <p>This feature requires a database index. Please contact the administrator to set up the index.</p>
              {indexUrl && (
                <p className="mt-2">
                  Admin: Click{' '}
                  <a 
                    href={indexUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-brand-primary hover:text-brand-secondary underline"
                  >
                    here
                  </a>
                  {' '}to create the required index.
                </p>
              )}
            </div>
          );
        } else {
          setError('Failed to load submissions. Please refresh the page.');
        }
        setLoading(false);
      }
    );

    return () => {
      console.log('Cleaning up point submissions listener');
      unsubscribe();
    };
  }, [filter]);

  async function handleApprove(submissionId: string) {
    try {
      console.log('Approving submission:', submissionId);
      const submissionRef = doc(db, 'pointSubmissions', submissionId);
      const submissionDoc = await getDoc(submissionRef);
      
      if (!submissionDoc.exists()) {
        throw new Error('Submission not found');
      }

      const submission = submissionDoc.data() as PointSubmission;
      console.log('Found submission:', submission);

      const memberRef = doc(db, 'members', submission.memberId);
      const memberDoc = await getDoc(memberRef);

      if (!memberDoc.exists()) {
        throw new Error('Member not found');
      }

      const member = memberDoc.data();
      console.log('Found member:', member);

      const pointField = `${submission.eventType}Points`;
      console.log('Updating point field:', pointField);

      // Update member points
      await updateDoc(memberRef, {
        [pointField]: (member[pointField] || 0) + submission.points,
        totalPoints: (member.totalPoints || 0) + submission.points,
        lastUpdated: Timestamp.now(),
      });

      // Update submission status
      await updateDoc(submissionRef, {
        status: 'approved'
      });

      console.log('Successfully approved submission');
    } catch (error) {
      console.error('Error approving submission:', error);
      alert('Failed to approve submission. Please try again.');
    }
  }

  async function handleArchive(submissionId: string) {
    try {
      console.log('Archiving submission:', submissionId);
      await updateDoc(doc(db, 'pointSubmissions', submissionId), {
        status: 'archived'
      });
      console.log('Successfully archived submission');
    } catch (error) {
      console.error('Error archiving submission:', error);
      alert('Failed to archive submission. Please try again.');
    }
  }

  async function handleDelete(submissionId: string) {
    if (!window.confirm('Are you sure you want to delete this submission?')) {
      return;
    }

    try {
      console.log('Deleting submission:', submissionId);
      await deleteDoc(doc(db, 'pointSubmissions', submissionId));
      console.log('Successfully deleted submission');
    } catch (error) {
      console.error('Error deleting submission:', error);
      alert('Failed to delete submission. Please try again.');
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-brand-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        {error}
      </div>
    );
  }

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h2 className="text-xl font-semibold text-brand-dark">Point Submissions</h2>
        <div className="flex gap-2 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0">
          {(['pending', 'approved', 'archived'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
                filter === status
                  ? 'bg-brand-primary text-white'
                  : 'bg-white text-text-secondary hover:bg-brand-primary/10'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <div className="min-w-full inline-block align-middle">
          <div className="overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th scope="col" className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">EID</th>
                  <th scope="col" className="hidden sm:table-cell px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Event</th>
                  <th scope="col" className="hidden sm:table-cell px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Points</th>
                  <th scope="col" className="hidden sm:table-cell px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                  <th scope="col" className="hidden sm:table-cell px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th scope="col" className="px-3 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {submissions.map((submission) => (
                  <motion.tr
                    key={submission.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="hover:bg-gray-50"
                  >
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                      {submission.firstName} {submission.lastName}
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap">{submission.eid}</td>
                    <td className="hidden sm:table-cell px-3 sm:px-6 py-4 whitespace-nowrap">
                      {submission.eventType.charAt(0).toUpperCase() + submission.eventType.slice(1)}
                    </td>
                    <td className="hidden sm:table-cell px-3 sm:px-6 py-4 whitespace-nowrap">{submission.points}</td>
                    <td className="hidden sm:table-cell px-3 sm:px-6 py-4">
                      <p className="text-sm text-gray-900 line-clamp-2 hover:line-clamp-none">
                        {submission.description}
                      </p>
                    </td>
                    <td className="hidden sm:table-cell px-3 sm:px-6 py-4 whitespace-nowrap">
                      {submission.createdAt?.toDate ? 
                        new Date(submission.createdAt.toDate()).toLocaleDateString() :
                        new Date(submission.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                      {filter === 'pending' && (
                        <button
                          onClick={() => handleApprove(submission.id)}
                          className="text-green-600 hover:text-green-900"
                        >
                          <CheckIcon className="h-5 w-5" />
                        </button>
                      )}
                      {filter !== 'archived' && (
                        <button
                          onClick={() => handleArchive(submission.id)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <ArchiveBoxIcon className="h-5 w-5" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(submission.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <XMarkIcon className="h-5 w-5" />
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
} 