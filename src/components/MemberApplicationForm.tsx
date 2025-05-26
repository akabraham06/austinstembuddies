'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { db } from '@/lib/firebase';
import { collection, addDoc, Timestamp, doc, getDoc } from 'firebase/firestore';
import SkeletonForm from './SkeletonForm';
import { MemberApplication } from '@/lib/firebase-types';
import { storeResumeInChunks } from '@/lib/member-applications';
import { submitMemberApplication } from '@/lib/member-applications';

interface MemberApplicationFormProps {
  onSuccess?: () => void;
}

export default function MemberApplicationForm({ onSuccess }: MemberApplicationFormProps) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    eid: '',
    email: '',
    phone: '',
    grade: '',
    major: '',
    gpa: '',
    whyJoin: '',
    experience: '',
  });
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [isOpen, setIsOpen] = useState(true);

  useEffect(() => {
    checkApplicationStatus();
  }, []);

  async function checkApplicationStatus() {
    try {
      const settingsDoc = await getDoc(doc(db, 'settings', 'application'));
      if (settingsDoc.exists()) {
        const settings = settingsDoc.data();
        setIsOpen(settings.membershipApplicationsOpen);
      }
    } catch (error) {
      console.error('Error checking application status:', error);
      setError('Failed to check application status. Please try again later.');
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      // Validate required fields
      const requiredFields = {
        firstName: 'First Name',
        lastName: 'Last Name',
        eid: 'EID',
        email: 'Email',
        phone: 'Phone',
        grade: 'Year in School',
        major: 'Major',
        gpa: 'GPA',
        whyJoin: 'Why do you want to join'
      };

      const missingFields = Object.entries(requiredFields)
        .filter(([key]) => !formData[key as keyof typeof formData])
        .map(([_, label]) => label);

      if (missingFields.length > 0) {
        throw new Error(`Please fill in the following required fields: ${missingFields.join(', ')}`);
      }

      // Create FormData object
      const submitData = new FormData();
      submitData.append('firstName', formData.firstName);
      submitData.append('lastName', formData.lastName);
      submitData.append('email', formData.email);
      submitData.append('phone', formData.phone);
      submitData.append('eid', formData.eid);
      submitData.append('major', formData.major);
      submitData.append('grade', formData.grade);
      submitData.append('gpa', formData.gpa);
      submitData.append('whyJoin', formData.whyJoin);
      submitData.append('experience', formData.experience);
      
      // Only append resume if one was selected
      if (resumeFile) {
        submitData.append('resume', resumeFile);
      }

      // Submit application and upload resume
      await submitMemberApplication(submitData);

      // Reset form
      setFormData({
        firstName: '',
        lastName: '',
        eid: '',
        email: '',
        phone: '',
        grade: '',
        major: '',
        gpa: '',
        whyJoin: '',
        experience: '',
      });
      setResumeFile(null);
      if (e.target instanceof HTMLFormElement) {
        e.target.reset();
      }

      // Trigger success callback
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Error submitting application:', error);
      setError(error instanceof Error ? error.message : 'Failed to submit application');
    } finally {
      setSubmitting(false);
    }
  }

  if (!isOpen) {
    return <SkeletonForm />;
  }

  return (
    <div className="bg-white/95 backdrop-blur-md rounded-2xl p-8 md:p-10 xl:p-12 shadow-2xl border border-white/20">
      <h3 className="text-2xl font-semibold text-brand-dark mb-8 font-freckle">Member Application</h3>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">
              First Name *
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
              Last Name *
            </label>
            <input
              type="text"
              value={formData.lastName}
              onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
              className="w-full px-4 py-2 rounded-lg border border-border-light focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
              required
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">
              EID *
            </label>
            <input
              type="text"
              value={formData.eid}
              onChange={(e) => setFormData(prev => ({ ...prev, eid: e.target.value }))}
              className="w-full px-4 py-2 rounded-lg border border-border-light focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">
              Email *
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              className="w-full px-4 py-2 rounded-lg border border-border-light focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
              required
            />
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">
              Phone *
            </label>
            <input
              type="text"
              value={formData.phone}
              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              className="w-full px-4 py-2 rounded-lg border border-border-light focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">
              Year in School *
            </label>
            <select
              value={formData.grade}
              onChange={(e) => setFormData(prev => ({ ...prev, grade: e.target.value }))}
              className="w-full px-4 py-2 rounded-lg border border-border-light focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
              required
            >
              <option value="">Select Year</option>
              <option value="Freshman">Freshman</option>
              <option value="Sophomore">Sophomore</option>
              <option value="Junior">Junior</option>
              <option value="Senior">Senior</option>
              <option value="Graduate">Graduate</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">
              Major *
            </label>
            <input
              type="text"
              value={formData.major}
              onChange={(e) => setFormData(prev => ({ ...prev, major: e.target.value }))}
              className="w-full px-4 py-2 rounded-lg border border-border-light focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">
              GPA *
            </label>
            <input
              type="text"
              value={formData.gpa}
              onChange={(e) => setFormData(prev => ({ ...prev, gpa: e.target.value }))}
              className="w-full px-4 py-2 rounded-lg border border-border-light focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-text-primary mb-1">
            Why do you want to join? *
          </label>
          <textarea
            value={formData.whyJoin}
            onChange={(e) => setFormData(prev => ({ ...prev, whyJoin: e.target.value }))}
            rows={3}
            className="w-full px-4 py-2 rounded-lg border border-border-light focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-text-primary mb-1">
            Relevant Experience
          </label>
          <textarea
            value={formData.experience}
            onChange={(e) => setFormData(prev => ({ ...prev, experience: e.target.value }))}
            rows={3}
            className="w-full px-4 py-2 rounded-lg border border-border-light focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-text-primary mb-1">
            Resume (Optional)
          </label>
          <input
            type="file"
            accept=".pdf"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                if (file.type !== 'application/pdf') {
                  setError('Please upload a PDF file');
                  return;
                }
                if (file.size > 2 * 1024 * 1024) {
                  setError('Resume file size must be less than 2MB');
                  return;
                }
                setResumeFile(file);
                setError(null);
              }
            }}
            className="w-full px-4 py-2 rounded-lg border border-border-light focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
          />
          <p className="mt-1 text-sm text-text-secondary">Optional: Upload your resume in PDF format (max 2MB).</p>
        </div>

        <motion.button
          type="submit"
          disabled={submitting}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={`w-full px-8 py-3 rounded-lg text-white font-medium transition-colors ${
            submitting
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-brand-primary hover:bg-brand-secondary'
          }`}
        >
          {submitting ? 'Submitting...' : 'Submit Application'}
        </motion.button>
      </form>
    </div>
  );
} 