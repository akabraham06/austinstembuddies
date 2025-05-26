'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, getDocs, doc, updateDoc, deleteDoc, addDoc, onSnapshot, Timestamp } from 'firebase/firestore';
import { motion } from 'framer-motion';
import { CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface PartnerRequest {
  id: string;
  schoolName: string;
  district: string;
  address: string;
  contactName: string;
  position: string;
  email: string;
  phone?: string;
  website?: string;
  gradeLevel: string;
  studentCount: number;
  schedule: 'during-school' | 'after-school' | 'flexible' | '';
  notes: string;
  createdAt: Timestamp;
  status: 'pending' | 'approved' | 'rejected';
}

export default function PartnerRequestsTable() {
  const [requests, setRequests] = useState<PartnerRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    // Set up real-time listener
    const q = query(
      collection(db, 'partnerRequests'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const requestsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as PartnerRequest[];
      setRequests(requestsData);
      setLoading(false);
    }, (error) => {
      console.error('Error listening to partner requests:', error);
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  async function handleAccept(request: PartnerRequest) {
    if (window.confirm('Are you sure you want to accept this partner?')) {
      setActionLoading(request.id);
      try {
        const response = await fetch(`/api/partner-request/${request.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ action: 'accept' }),
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || 'Failed to accept partner request');
        }
      } catch (error) {
        console.error('Error accepting partner:', error);
        alert('Failed to accept partner request. Please try again.');
      } finally {
        setActionLoading(null);
      }
    }
  }

  async function handleReject(requestId: string) {
    if (window.confirm('Are you sure you want to reject this request?')) {
      setActionLoading(requestId);
      try {
        const response = await fetch(`/api/partner-request/${requestId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ action: 'reject' }),
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || 'Failed to reject partner request');
        }
      } catch (error) {
        console.error('Error rejecting request:', error);
        alert('Failed to reject partner request. Please try again.');
      } finally {
        setActionLoading(null);
      }
    }
  }

  async function handleDelete(requestId: string) {
    if (window.confirm('Are you sure you want to delete this request?')) {
      setActionLoading(requestId);
      try {
        console.log('[PartnerRequestsTable] Deleting request:', requestId);
        const response = await fetch(`/api/partner-request/${requestId}`, {
          method: 'DELETE',
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || 'Failed to delete partner request');
        }

        // Remove the request from the local state
        setRequests(prev => prev.filter(r => r.id !== requestId));
        console.log('[PartnerRequestsTable] Request deleted successfully');
      } catch (error) {
        console.error('[PartnerRequestsTable] Error deleting request:', error);
        alert('Failed to delete partner request. Please try again.');
      } finally {
        setActionLoading(null);
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
      <h2 className="text-xl font-semibold text-brand-dark mb-6">Partner Requests</h2>

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">School</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">District</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Position</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grade Level</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Students</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Schedule</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notes</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {requests.map((request) => (
              <motion.tr
                key={request.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="hover:bg-gray-50"
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-900">
                      {request.schoolName}
                    </span>
                    <span className="text-xs text-gray-500">
                      {request.address}
                    </span>
                    {request.website && (
                      <a
                        href={request.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-brand-primary hover:text-brand-secondary mt-1"
                      >
                        Visit Website
                      </a>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {request.district}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex flex-col">
                    <span className="text-sm text-gray-900">{request.contactName}</span>
                    {request.phone && (
                      <span className="text-xs text-gray-500">{request.phone}</span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {request.position}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {request.email}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {request.gradeLevel}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {request.studentCount}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {request.schedule ? request.schedule.replace('-', ' ').replace(/^\w/, c => c.toUpperCase()) : ''}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500 max-w-xs">
                  <div className="truncate">
                    {request.notes || '-'}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    request.status === 'pending'
                      ? 'bg-yellow-100 text-yellow-800'
                      : request.status === 'approved'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                  {request.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleAccept(request)}
                        disabled={actionLoading === request.id}
                        className={`text-green-600 hover:text-green-900 ${
                          actionLoading === request.id ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                      >
                        {actionLoading === request.id ? (
                          <div className="animate-spin h-5 w-5 border-2 border-green-600 rounded-full border-t-transparent" />
                        ) : (
                          <CheckIcon className="h-5 w-5" />
                        )}
                      </button>
                      <button
                        onClick={() => handleReject(request.id)}
                        disabled={actionLoading === request.id}
                        className={`text-red-600 hover:text-red-900 ${
                          actionLoading === request.id ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                      >
                        {actionLoading === request.id ? (
                          <div className="animate-spin h-5 w-5 border-2 border-red-600 rounded-full border-t-transparent" />
                        ) : (
                          <XMarkIcon className="h-5 w-5" />
                        )}
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => handleDelete(request.id)}
                    disabled={actionLoading === request.id}
                    className={`text-gray-600 hover:text-gray-900 ${
                      actionLoading === request.id ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {actionLoading === request.id ? (
                      <div className="animate-spin h-5 w-5 border-2 border-gray-600 rounded-full border-t-transparent" />
                    ) : (
                      'Delete'
                    )}
                  </button>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
} 