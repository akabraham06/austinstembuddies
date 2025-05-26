'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, getDocs, addDoc, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { Member } from '@/lib/firebase-types';
import { motion } from 'framer-motion';
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline';

export default function MemberTable() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [newMember, setNewMember] = useState({
    firstName: '',
    lastName: '',
    eid: '',
    meetingPoints: 0,
    volunteerPoints: 0,
    tablingPoints: 0,
    socialPoints: 0,
    fundraisingPoints: 0,
    bonusPoints: 0,
    totalPoints: 0,
    status: 'active' as const,
  });
  const [editingCell, setEditingCell] = useState<{
    memberId: string;
    field: string;
  } | null>(null);

  const requirements = {
    meeting: 2,
    volunteer: 4,
    tabling: 2,
    social: 3,
    fundraising: 3,
    bonus: 1,
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  async function fetchMembers() {
    try {
      const q = query(collection(db, 'members'), orderBy('lastName'));
      const querySnapshot = await getDocs(q);
      const membersData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Member[];
      setMembers(membersData);
    } catch (error) {
      console.error('Error fetching members:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleAddMember(e: React.FormEvent) {
    e.preventDefault();
    try {
      const memberData = {
        ...newMember,
        lastUpdated: new Date(),
      };
      await addDoc(collection(db, 'members'), memberData);
      setNewMember({
        firstName: '',
        lastName: '',
        eid: '',
        meetingPoints: 0,
        volunteerPoints: 0,
        tablingPoints: 0,
        socialPoints: 0,
        fundraisingPoints: 0,
        bonusPoints: 0,
        totalPoints: 0,
        status: 'active' as const,
      });
      fetchMembers();
    } catch (error) {
      console.error('Error adding member:', error);
    }
  }

  async function handleUpdatePoints(memberId: string, field: string, value: number) {
    try {
      const memberRef = doc(db, 'members', memberId);
      const memberToUpdate = members.find(m => m.id === memberId);
      
      if (!memberToUpdate) return;

      // Calculate new total points
      const updatedPoints = {
        ...memberToUpdate,
        [field]: value,
      };
      
      const totalPoints = 
        updatedPoints.meetingPoints +
        updatedPoints.volunteerPoints +
        updatedPoints.tablingPoints +
        updatedPoints.socialPoints +
        updatedPoints.fundraisingPoints +
        updatedPoints.bonusPoints;

      // Update Firestore
      await updateDoc(memberRef, {
        [field]: value,
        totalPoints,
        lastUpdated: new Date(),
      });

      // Update local state
      setMembers(prev =>
        prev.map(member =>
          member.id === memberId
            ? { ...member, [field]: value, totalPoints }
            : member
        )
      );
    } catch (error) {
      console.error('Error updating points:', error);
    }
  }

  async function handleDeleteMember(memberId: string) {
    if (window.confirm('Are you sure you want to delete this member?')) {
      try {
        await deleteDoc(doc(db, 'members', memberId));
        fetchMembers();
      } catch (error) {
        console.error('Error deleting member:', error);
      }
    }
  }

  const EditableCell = ({ member, field, value }: { member: Member; field: string; value: number }) => {
    const isEditing = editingCell?.memberId === member.id && editingCell?.field === field;
    
    return isEditing ? (
      <input
        type="number"
        min="0"
        value={value}
        onChange={(e) => handleUpdatePoints(member.id!, field, Number(e.target.value))}
        onBlur={() => setEditingCell(null)}
        autoFocus
        className="w-20 px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
      />
    ) : (
      <div
        onClick={() => setEditingCell({ memberId: member.id!, field })}
        className="cursor-pointer hover:bg-gray-50 px-2 py-1 rounded"
      >
        {value}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-brand-primary"></div>
      </div>
    );
  }

  return (
    <div className="cms-section">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h2 className="text-xl font-semibold text-brand-dark">Members</h2>
        <form onSubmit={handleAddMember} className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <input
              type="text"
              placeholder="First Name"
              value={newMember.firstName}
              onChange={(e) => setNewMember({ ...newMember, firstName: e.target.value })}
              className="cms-form-input"
              required
            />
            <input
              type="text"
              placeholder="Last Name"
              value={newMember.lastName}
              onChange={(e) => setNewMember({ ...newMember, lastName: e.target.value })}
              className="cms-form-input"
              required
            />
            <input
              type="text"
              placeholder="UT EID"
              value={newMember.eid}
              onChange={(e) => setNewMember({ ...newMember, eid: e.target.value })}
              className="cms-form-input"
              required
            />
          </div>
          <motion.button
            type="submit"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="cms-button-primary w-full sm:w-auto flex items-center justify-center"
          >
            <PlusIcon className="h-5 w-5" />
          </motion.button>
        </form>
      </div>

      <div className="cms-table-container">
        <div className="min-w-full inline-block align-middle">
          <table className="cms-table">
            <thead>
              <tr>
                <th scope="col" className="cms-table-header px-3 sm:px-6 py-3">Name</th>
                <th scope="col" className="cms-table-header px-3 sm:px-6 py-3">EID</th>
                <th scope="col" className="cms-table-header px-3 sm:px-6 py-3">Total</th>
                <th scope="col" className="hidden sm:table-cell cms-table-header px-3 sm:px-6 py-3">Meeting</th>
                <th scope="col" className="hidden sm:table-cell cms-table-header px-3 sm:px-6 py-3">Volunteer</th>
                <th scope="col" className="hidden sm:table-cell cms-table-header px-3 sm:px-6 py-3">Tabling</th>
                <th scope="col" className="hidden sm:table-cell cms-table-header px-3 sm:px-6 py-3">Social</th>
                <th scope="col" className="hidden sm:table-cell cms-table-header px-3 sm:px-6 py-3">Fundraising</th>
                <th scope="col" className="hidden sm:table-cell cms-table-header px-3 sm:px-6 py-3">Bonus</th>
                <th scope="col" className="cms-table-header px-3 sm:px-6 py-3">Status</th>
                <th scope="col" className="cms-table-header px-3 sm:px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {members.map((member) => (
                <tr key={member.id} className="cms-table-row">
                  <td className="cms-table-cell">
                    {member.firstName} {member.lastName}
                  </td>
                  <td className="cms-table-cell">{member.eid}</td>
                  <td className="cms-table-cell font-medium text-brand-primary">
                    {member.totalPoints}
                  </td>
                  <td className="hidden sm:table-cell cms-table-cell">
                    <EditableCell member={member} field="meetingPoints" value={member.meetingPoints} />
                  </td>
                  <td className="hidden sm:table-cell cms-table-cell">
                    <EditableCell member={member} field="volunteerPoints" value={member.volunteerPoints} />
                  </td>
                  <td className="hidden sm:table-cell cms-table-cell">
                    <EditableCell member={member} field="tablingPoints" value={member.tablingPoints} />
                  </td>
                  <td className="hidden sm:table-cell cms-table-cell">
                    <EditableCell member={member} field="socialPoints" value={member.socialPoints} />
                  </td>
                  <td className="hidden sm:table-cell cms-table-cell">
                    <EditableCell member={member} field="fundraisingPoints" value={member.fundraisingPoints} />
                  </td>
                  <td className="hidden sm:table-cell cms-table-cell">
                    <EditableCell member={member} field="bonusPoints" value={member.bonusPoints} />
                  </td>
                  <td className="cms-table-cell">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      member.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {member.status}
                    </span>
                  </td>
                  <td className="cms-table-cell text-right">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleDeleteMember(member.id!)}
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
    </div>
  );
} 