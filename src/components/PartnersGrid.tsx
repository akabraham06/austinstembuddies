'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, getDocs, Timestamp } from 'firebase/firestore';

interface Partner {
  id: string;
  schoolName: string;
  district: string;
  address: string;
  contactName: string;
  email: string;
  gradeLevel: string;
  studentCount: number;
  website?: string;
  addedAt: Timestamp;
}

export default function PartnersGrid() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPartners() {
      try {
        const q = query(collection(db, 'partners'), orderBy('addedAt', 'desc'));
        const querySnapshot = await getDocs(q);
        const partnersData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as Partner[];
        setPartners(partnersData);
      } catch (error) {
        console.error('Error fetching partners:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchPartners();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-background-accent/50 animate-pulse p-6 rounded-lg border border-border-light h-32"
          />
        ))}
      </div>
    );
  }

  if (partners.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-text-secondary">No partner schools yet.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 min-w-[500px] gap-8">
      {partners.map((partner, i) => (
        <motion.div
          key={partner.id}
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.1 }}
          className="bg-background-accent p-6 rounded-lg border border-border-light"
        >
          <div className="text-center mb-4">
            <h3 className="heading-sm mb-1">{partner.schoolName}</h3>
            <p className="text-sm text-text-secondary">{partner.district}</p>
          </div>
          
          <div className="space-y-2 text-sm">
            <p className="text-text-secondary">
              <span className="font-medium">Grade Level:</span> {partner.gradeLevel}
            </p>
            <p className="text-text-secondary">
              <span className="font-medium">Students:</span> {partner.studentCount}
            </p>
            {partner.website && (
              <div className="text-center mt-4">
                <a
                  href={partner.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brand-primary hover:text-brand-secondary transition-colors inline-flex items-center space-x-1"
                >
                  <span>Visit Website</span>
                  <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.22 14.78a.75.75 0 001.06 0l7.22-7.22v5.69a.75.75 0 001.5 0v-7.5a.75.75 0 00-.75-.75h-7.5a.75.75 0 000 1.5h5.69l-7.22 7.22a.75.75 0 000 1.06z" clipRule="evenodd" />
                  </svg>
                </a>
              </div>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );
} 