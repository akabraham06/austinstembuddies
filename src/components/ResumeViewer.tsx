'use client';

import { useState, useEffect } from 'react';
import { getResumeData } from '@/lib/member-applications';
import { motion } from 'framer-motion';
import { ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import { useAuth } from '@/lib/auth-context';
import { getAuth, getIdToken } from 'firebase/auth';

interface ResumeViewerProps {
  applicationId: string;
}

export default function ResumeViewer({ applicationId }: ResumeViewerProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [resumeData, setResumeData] = useState<{ url: string; filename: string } | null>(null);

  useEffect(() => {
    async function loadResume() {
      try {
        setLoading(true);
        setError(null);

        // Check if user is authenticated
        if (!user) {
          throw new Error('You must be logged in to view resumes');
        }

        // Get fresh ID token for authenticated requests
        const auth = getAuth();
        const token = await getIdToken(auth.currentUser!, true);
        
        const data = await getResumeData(applicationId, token);
        setResumeData(data);
      } catch (error) {
        console.error('Error loading resume:', error);
        setError(error instanceof Error ? error.message : 'Failed to load resume');
      } finally {
        setLoading(false);
      }
    }

    loadResume();

    // Cleanup function to revoke object URLs
    return () => {
      if (resumeData?.url && !resumeData.url.startsWith('http')) {
        URL.revokeObjectURL(resumeData.url);
      }
    };
  }, [applicationId, user]);

  if (!user) {
    return (
      <div className="p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">
        <p>Please log in to view resumes</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4 bg-white/80 backdrop-blur-sm rounded-lg border border-border-light">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-brand-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">
        <p>Failed to load resume: {error}</p>
      </div>
    );
  }

  if (!resumeData) {
    return (
      <div className="p-4 bg-yellow-50 text-yellow-700 rounded-lg border border-yellow-200">
        <p>No resume available</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Preview */}
      <div className="relative bg-white/80 backdrop-blur-sm rounded-lg border border-border-light overflow-hidden">
        <iframe
          src={`${resumeData.url}#toolbar=0`}
          className="w-full h-[500px]"
          title="Resume Preview"
        />
      </div>

      {/* Download button */}
      <div className="flex justify-end">
        <motion.a
          href={resumeData.url}
          download={resumeData.filename}
          className="inline-flex items-center px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-secondary transition-colors"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <ArrowDownTrayIcon className="w-5 h-5 mr-2" />
          Download Resume
        </motion.a>
      </div>
    </div>
  );
} 