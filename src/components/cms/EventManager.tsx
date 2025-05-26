'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, getDocs, addDoc, deleteDoc, doc, getDoc, updateDoc } from 'firebase/firestore';
import { PlusIcon, TrashIcon, PencilIcon } from '@heroicons/react/24/outline';
import ClosedFormState from '../ClosedFormState';

interface Event {
  id?: string;
  title: string;
  date: string;
  location: string;
  description: string;
  registrationLink?: string;
  maxParticipants?: number;
  currentParticipants?: number;
}

export default function EventManager() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEnabled, setIsEnabled] = useState(true);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [newEvent, setNewEvent] = useState<Event>({
    title: '',
    date: '',
    location: '',
    description: '',
    registrationLink: '',
    maxParticipants: 0,
    currentParticipants: 0
  });

  useEffect(() => {
    checkStatus();
    fetchEvents();
  }, []);

  async function checkStatus() {
    try {
      const settingsDoc = await getDoc(doc(db, 'settings', 'application'));
      if (settingsDoc.exists()) {
        const settings = settingsDoc.data();
        setIsEnabled(settings?.eventManagementEnabled ?? true);
      }
    } catch (error) {
      console.error('Error checking event management status:', error);
    }
  }

  async function fetchEvents() {
    try {
      const q = query(collection(db, 'events'), orderBy('date', 'desc'));
      const querySnapshot = await getDocs(q);
      const eventsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Event[];
      setEvents(eventsData);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleAddEvent(e: React.FormEvent) {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'events'), {
        ...newEvent,
        createdAt: new Date()
      });
      setNewEvent({
        title: '',
        date: '',
        location: '',
        description: '',
        registrationLink: '',
        maxParticipants: 0,
        currentParticipants: 0
      });
      fetchEvents();
    } catch (error) {
      console.error('Error adding event:', error);
    }
  }

  async function handleUpdateEvent(e: React.FormEvent) {
    e.preventDefault();
    if (!isEditing) return;

    try {
      await updateDoc(doc(db, 'events', isEditing), {
        ...newEvent,
        updatedAt: new Date()
      });
      setIsEditing(null);
      setNewEvent({
        title: '',
        date: '',
        location: '',
        description: '',
        registrationLink: '',
        maxParticipants: 0,
        currentParticipants: 0
      });
      fetchEvents();
    } catch (error) {
      console.error('Error updating event:', error);
    }
  }

  async function handleDeleteEvent(eventId: string) {
    if (!eventId || !window.confirm('Are you sure you want to delete this event?')) return;

    try {
      await deleteDoc(doc(db, 'events', eventId));
      fetchEvents();
    } catch (error) {
      console.error('Error deleting event:', error);
    }
  }

  function handleEdit(event: Event) {
    setIsEditing(event.id || null);
    setNewEvent(event);
  }

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-brand-primary"></div>
      </div>
    );
  }

  if (!isEnabled) {
    return (
      <ClosedFormState 
        title="Event Management"
        message="Event management is currently disabled."
      />
    );
  }

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-brand-dark mb-6">
          {isEditing ? 'Edit Event' : 'Add New Event'}
        </h2>
        <form onSubmit={isEditing ? handleUpdateEvent : handleAddEvent} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Event Title"
              value={newEvent.title}
              onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
              className="px-4 py-2 rounded-lg border border-border-light focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
              required
            />
            <input
              type="datetime-local"
              value={newEvent.date}
              onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
              className="px-4 py-2 rounded-lg border border-border-light focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
              required
            />
            <input
              type="text"
              placeholder="Location"
              value={newEvent.location}
              onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
              className="px-4 py-2 rounded-lg border border-border-light focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
              required
            />
            <input
              type="url"
              placeholder="Registration Link (optional)"
              value={newEvent.registrationLink}
              onChange={(e) => setNewEvent({ ...newEvent, registrationLink: e.target.value })}
              className="px-4 py-2 rounded-lg border border-border-light focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
            />
            <input
              type="number"
              placeholder="Max Participants"
              value={newEvent.maxParticipants}
              onChange={(e) => setNewEvent({ ...newEvent, maxParticipants: parseInt(e.target.value) })}
              className="px-4 py-2 rounded-lg border border-border-light focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
              min="0"
            />
            <input
              type="number"
              placeholder="Current Participants"
              value={newEvent.currentParticipants}
              onChange={(e) => setNewEvent({ ...newEvent, currentParticipants: parseInt(e.target.value) })}
              className="px-4 py-2 rounded-lg border border-border-light focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
              min="0"
            />
          </div>
          <textarea
            placeholder="Event Description"
            value={newEvent.description}
            onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
            className="w-full px-4 py-2 rounded-lg border border-border-light focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
            rows={4}
            required
          />
          <div className="flex justify-end gap-4">
            {isEditing && (
              <button
                type="button"
                onClick={() => {
                  setIsEditing(null);
                  setNewEvent({
                    title: '',
                    date: '',
                    location: '',
                    description: '',
                    registrationLink: '',
                    maxParticipants: 0,
                    currentParticipants: 0
                  });
                }}
                className="px-6 py-2 rounded-lg border border-border-light hover:bg-background-accent transition-colors"
              >
                Cancel
              </button>
            )}
            <motion.button
              type="submit"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="bg-brand-primary text-white px-6 py-2 rounded-lg hover:bg-brand-secondary transition-colors"
            >
              {isEditing ? 'Update Event' : 'Add Event'}
            </motion.button>
          </div>
        </form>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {events.map((event) => (
          <motion.div
            key={event.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow-md p-6"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-semibold text-brand-dark">{event.title}</h3>
                <p className="text-text-secondary">
                  {new Date(event.date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
              <div className="flex space-x-2">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleEdit(event)}
                  className="text-brand-primary hover:text-brand-secondary"
                >
                  <PencilIcon className="h-5 w-5" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => event.id && handleDeleteEvent(event.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  <TrashIcon className="h-5 w-5" />
                </motion.button>
              </div>
            </div>
            <p className="text-text-secondary mb-2">{event.location}</p>
            <p className="text-text-primary mb-4">{event.description}</p>
            <div className="flex justify-between items-center text-sm text-text-secondary">
              <span>
                {event.currentParticipants} / {event.maxParticipants} participants
              </span>
              {event.registrationLink && (
                <a
                  href={event.registrationLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brand-primary hover:text-brand-secondary"
                >
                  Registration Link ↗
                </a>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
} 