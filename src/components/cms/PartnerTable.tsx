'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrashIcon, CheckIcon, XMarkIcon, PlusIcon } from '@heroicons/react/24/outline';
import { db } from '@/lib/firebase';
import { collection, addDoc, Timestamp } from 'firebase/firestore';

interface PartnerRequest {
  id: string;
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
  status: 'pending' | 'approved' | 'rejected';
  createdAt: number;
}

export default function PartnerTable() {
  const [requests, setRequests] = useState<PartnerRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newPartner, setNewPartner] = useState({
    schoolName: '',
    district: '',
    address: '',
    contactName: '',
    position: '',
    email: '',
    gradeLevel: '',
    studentCount: 0,
    schedule: '' as const,
    notes: '',
  });

  async function fetchRequests() {
    try {
      const response = await fetch('/api/partner-request');
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch partner requests');
      }
      
      setRequests(data);
      setError(null);
    } catch (error) {
      console.error('Error fetching partner requests:', error);
      setError('Failed to load partner requests. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchRequests();
    // Poll for updates every 5 seconds
    const interval = setInterval(fetchRequests, 5000);
    return () => clearInterval(interval);
  }, []);

  async function handleAddPartner(e: React.FormEvent) {
    e.preventDefault();
    try {
      const response = await fetch('/api/partner-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newPartner),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to add partner request');
      }

      setNewPartner({
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
      setShowAddForm(false);
      fetchRequests();
    } catch (error) {
      console.error('Error adding partner request:', error);
      alert(error instanceof Error ? error.message : 'Failed to add partner request. Please try again.');
    }
  }

  async function handleDeleteRequest(requestId: string) {
    if (!window.confirm('Are you sure you want to delete this partner request?')) {
      return;
    }

    setActionLoading(requestId);
    try {
      const response = await fetch(`/api/partner-request/${requestId}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete partner request');
      }
      
      await fetchRequests();
    } catch (error) {
      console.error('Error deleting partner request:', error);
      alert('Failed to delete partner request. Please try again.');
    } finally {
      setActionLoading(null);
    }
  }

  async function handleUpdateStatus(requestId: string, status: 'approved' | 'rejected') {
    const action = status === 'approved' ? 'accept' : 'reject';
    const confirmMessage = `Are you sure you want to ${action} this partner request?`;
    
    if (!window.confirm(confirmMessage)) {
      return;
    }

    setActionLoading(requestId);
    try {
      console.log('Sending request to update status:', {
        requestId,
        action,
        url: `/api/partner-request/${requestId}`
      });

      const response = await fetch(`/api/partner-request/${requestId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action }),
      });

      const data = await response.json();
      console.log('Received response:', {
        ok: response.ok,
        status: response.status,
        data
      });

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update partner request');
      }

      await fetchRequests();
    } catch (error) {
      console.error('Error updating partner request status:', error);
      alert('Failed to update partner request status. Please try again.');
    } finally {
      setActionLoading(null);
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
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-brand-dark">Partner Requests</h2>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-brand-primary text-white px-4 py-2 rounded-lg hover:bg-brand-secondary transition-colors flex items-center gap-2"
        >
          <PlusIcon className="h-5 w-5" />
          <span>Add Partner Request</span>
        </motion.button>
      </div>

      {showAddForm && (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h3 className="text-lg font-medium mb-4">Add New Partner Request</h3>
          <form onSubmit={handleAddPartner} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">School Name</label>
              <input
                type="text"
                value={newPartner.schoolName}
                onChange={(e) => setNewPartner({ ...newPartner, schoolName: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">District</label>
              <input
                type="text"
                value={newPartner.district}
                onChange={(e) => setNewPartner({ ...newPartner, district: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
              <input
                type="text"
                value={newPartner.address}
                onChange={(e) => setNewPartner({ ...newPartner, address: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contact Name</label>
              <input
                type="text"
                value={newPartner.contactName}
                onChange={(e) => setNewPartner({ ...newPartner, contactName: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
              <input
                type="text"
                value={newPartner.position}
                onChange={(e) => setNewPartner({ ...newPartner, position: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={newPartner.email}
                onChange={(e) => setNewPartner({ ...newPartner, email: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Grade Level</label>
              <input
                type="text"
                value={newPartner.gradeLevel}
                onChange={(e) => setNewPartner({ ...newPartner, gradeLevel: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Number of Students</label>
              <input
                type="number"
                value={newPartner.studentCount}
                onChange={(e) => setNewPartner({ ...newPartner, studentCount: Number(e.target.value) })}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
                required
                min="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Schedule</label>
              <select
                value={newPartner.schedule}
                onChange={(e) => setNewPartner({ ...newPartner, schedule: e.target.value as any })}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
                required
              >
                <option value="">Select Schedule</option>
                <option value="during-school">During School</option>
                <option value="after-school">After School</option>
                <option value="flexible">Flexible</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <textarea
                value={newPartner.notes}
                onChange={(e) => setNewPartner({ ...newPartner, notes: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
                rows={3}
              />
            </div>
            <div className="md:col-span-2 flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 text-gray-700 hover:text-gray-900"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-secondary transition-colors"
              >
                Add Partner
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="min-w-full divide-y divide-border-light">
          <thead>
            <tr className="bg-background-accent">
              <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                School
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                District
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                Contact
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                Position
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                Grade Level
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                Students
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                Schedule
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                Notes
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-border-light">
            {requests.map((request) => (
              <tr key={request.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary">
                  {new Date(request.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary">
                  {request.schoolName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary">
                  {request.district}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary">
                  {request.contactName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary">
                  {request.position}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary">
                  {request.email}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary">
                  {request.gradeLevel}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary">
                  {request.studentCount}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary">
                  {request.schedule ? request.schedule.replace('-', ' ').replace(/^\w/, c => c.toUpperCase()) : ''}
                </td>
                <td className="px-6 py-4 text-sm text-text-primary">
                  <div className="max-w-xs overflow-hidden">
                    <p className="line-clamp-2" title={request.notes}>
                      {request.notes || '-'}
                    </p>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      request.status === 'approved'
                        ? 'bg-green-100 text-green-800'
                        : request.status === 'rejected'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary">
                  <div className="flex space-x-2">
                    {request.status === 'pending' && (
                      <>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleUpdateStatus(request.id, 'approved')}
                          disabled={actionLoading === request.id}
                          className={`text-green-500 hover:text-green-700 ${
                            actionLoading === request.id ? 'opacity-50 cursor-not-allowed' : ''
                          }`}
                        >
                          {actionLoading === request.id ? (
                            <div className="animate-spin h-5 w-5 border-2 border-green-500 rounded-full border-t-transparent" />
                          ) : (
                            <CheckIcon className="h-5 w-5" />
                          )}
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleUpdateStatus(request.id, 'rejected')}
                          disabled={actionLoading === request.id}
                          className={`text-red-500 hover:text-red-700 ${
                            actionLoading === request.id ? 'opacity-50 cursor-not-allowed' : ''
                          }`}
                        >
                          {actionLoading === request.id ? (
                            <div className="animate-spin h-5 w-5 border-2 border-red-500 rounded-full border-t-transparent" />
                          ) : (
                            <XMarkIcon className="h-5 w-5" />
                          )}
                        </motion.button>
                      </>
                    )}
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleDeleteRequest(request.id)}
                      disabled={actionLoading === request.id}
                      className={`text-red-500 hover:text-red-700 ${
                        actionLoading === request.id ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      {actionLoading === request.id ? (
                        <div className="animate-spin h-5 w-5 border-2 border-red-500 rounded-full border-t-transparent" />
                      ) : (
                        <TrashIcon className="h-5 w-5" />
                      )}
                    </motion.button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
} 