'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { Event } from '@/lib/firebase-types';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { CalendarIcon } from '@heroicons/react/24/outline';

const GOOGLE_CALENDAR_URL = 'https://calendar.google.com/calendar/u/2/r?cid=YXVzdGluc3RlbWJ1ZGRpZXNAZ21haWwuY29t&pli=1';

export default function Events() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
  }, []);

  async function fetchEvents() {
    try {
      const q = query(collection(db, 'events'), orderBy('date', 'desc'));
      const querySnapshot = await getDocs(q);
      const eventsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Event[];
      setEvents(eventsData);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="grid md:grid-cols-3 gap-8">
        {[1, 2, 3].map((i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.2 }}
            className="bg-background-light rounded-lg border border-border-light overflow-hidden"
          >
            <div className="aspect-video bg-background-accent animate-pulse"></div>
            <div className="p-6">
              <div className="h-6 bg-background-accent rounded w-3/4 mb-3 animate-pulse"></div>
              <div className="h-4 bg-background-accent rounded w-1/2 animate-pulse"></div>
            </div>
          </motion.div>
        ))}
      </div>
    );
  }

  return (
    <div>
      <div className="grid md:grid-cols-3 gap-8">
        {events.map((event, i) => (
          <motion.div
            key={event.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.2 }}
            className="bg-background-light rounded-lg border border-border-light overflow-hidden"
          >
            <div className="aspect-video relative">
              {event.image ? (
                <Image
                  src={event.image}
                  alt={event.title}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="absolute inset-0 bg-background-accent flex items-center justify-center">
                  <span className="text-text-secondary">No image</span>
                </div>
              )}
            </div>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-brand-dark mb-2">{event.title}</h3>
              <p className="text-text-secondary text-sm mb-4">
                {new Date(event.date).toLocaleDateString()}
              </p>
              <p className="text-text-primary line-clamp-3">{event.description}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="text-center mt-12">
        <motion.a
          href={GOOGLE_CALENDAR_URL}
          target="_blank"
          rel="noopener noreferrer"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="inline-flex items-center gap-2 bg-brand-accent text-text-primary px-8 py-3 rounded-lg text-lg font-medium hover:bg-brand-accent/90 transition-colors"
        >
          <CalendarIcon className="h-5 w-5" />
          <span>Add Our Events on Google Calendar!</span>
        </motion.a>
      </div>
    </div>
  );
} 