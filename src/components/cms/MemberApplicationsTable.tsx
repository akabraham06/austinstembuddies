'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, getDocs, doc, updateDoc, deleteDoc, addDoc } from 'firebase/firestore';
import { motion } from 'framer-motion';
import { CheckIcon, XMarkIcon, ArchiveBoxIcon, DocumentIcon } from '@heroicons/react/24/outline';
import { MemberApplication } from '@/lib/firebase-types';
import { acceptMemberApplication, archiveMemberApplication, deleteMemberApplication } from '@/lib/member-applications';
import ResumeViewer from '@/components/ResumeViewer';

export default function MemberApplicationsTable() {
  const [applications, setApplications] = useState<MemberApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApplication, setSelectedApplication] = useState<string | null>(null);
  const [filter, setFilter] = useState<'pending' | 'accepted' | 'archived'>('pending');

  useEffect(() => {
    fetchApplications();
  }, []);

  async function fetchApplications() {
    try {
      const q = query(
        collection(db, 'member-applications'),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      const applicationsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt.toDate(),
        updatedAt: doc.data().updatedAt.toDate()
      })) as MemberApplication[];
      setApplications(applicationsData);
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleAccept(application: MemberApplication) {
    if (!application.id) return;
    
    if (window.confirm('Are you sure you want to accept this member?')) {
      try {
        await acceptMemberApplication(application.id);
        await fetchApplications();
      } catch (error) {
        console.error('Error accepting member:', error);
        alert('Failed to accept member. Please try again.');
      }
    }
  }

  async function handleArchive(application: MemberApplication) {
    if (!application.id) return;
    
    if (window.confirm('Are you sure you want to archive this application?')) {
      try {
        await archiveMemberApplication(application.id);
        await fetchApplications();
      } catch (error) {
        console.error('Error archiving application:', error);
        alert('Failed to archive application. Please try again.');
      }
    }
  }

  async function handleDelete(application: MemberApplication) {
    if (!application.id) return;
    
    if (window.confirm('Are you sure you want to delete this application? This cannot be undone.')) {
      try {
        await deleteMemberApplication(application.id);
        await fetchApplications();
      } catch (error) {
        console.error('Error deleting application:', error);
        alert('Failed to delete application. Please try again.');
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
    <div className="w-full px-4 sm:px-6 lg:px-8 space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-xl font-semibold text-brand-dark">Member Applications</h2>
        <div className="flex gap-2 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0">
          {(['pending', 'accepted', 'archived'] as const).map((status) => (
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
                  <th scope="col" className="hidden sm:table-cell px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th scope="col" className="hidden sm:table-cell px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                  <th scope="col" className="hidden sm:table-cell px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Major</th>
                  <th scope="col" className="hidden sm:table-cell px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grade</th>
                  <th scope="col" className="hidden sm:table-cell px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">GPA</th>
                  <th scope="col" className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th scope="col" className="px-3 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {applications.map((application) => (
                  <>
                    <motion.tr
                      key={application.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="hover:bg-gray-50"
                    >
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                        {application.firstName} {application.lastName}
                      </td>
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap">{application.eid}</td>
                      <td className="hidden sm:table-cell px-3 sm:px-6 py-4 whitespace-nowrap">{application.email}</td>
                      <td className="hidden sm:table-cell px-3 sm:px-6 py-4 whitespace-nowrap">{application.phone}</td>
                      <td className="hidden sm:table-cell px-3 sm:px-6 py-4 whitespace-nowrap">{application.major}</td>
                      <td className="hidden sm:table-cell px-3 sm:px-6 py-4 whitespace-nowrap">{application.grade}</td>
                      <td className="hidden sm:table-cell px-3 sm:px-6 py-4 whitespace-nowrap">{application.gpa}</td>
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          application.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : application.status === 'accepted'
                            ? 'bg-green-100 text-green-800'
                            : application.status === 'archived'
                            ? 'bg-gray-100 text-gray-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                        {application.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleAccept(application)}
                              className="text-green-600 hover:text-green-900"
                              title="Accept"
                            >
                              <CheckIcon className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => handleArchive(application)}
                              className="text-gray-600 hover:text-gray-900"
                              title="Archive"
                            >
                              <ArchiveBoxIcon className="h-5 w-5" />
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => setSelectedApplication(application.id || null)}
                          className="text-blue-600 hover:text-blue-900"
                          title="View Resume"
                        >
                          <DocumentIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(application)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete"
                        >
                          <XMarkIcon className="h-5 w-5" />
                        </button>
                      </td>
                    </motion.tr>
                    {selectedApplication === application.id && (
                      <tr>
                        <td colSpan={9} className="px-3 sm:px-6 py-4">
                          <ResumeViewer applicationId={application.id!} />
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
} 