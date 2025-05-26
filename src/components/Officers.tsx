'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, getDocs, doc, getDoc } from 'firebase/firestore';
import { Officer } from '@/lib/firebase-types';
import { motion } from 'framer-motion';
import OfficerSlideshow from './OfficerSlideshow';
import ClosedFormState from './ClosedFormState';
import MembershipBox from './MembershipBox';
import gsap from 'gsap';
import { submitMemberApplication } from '@/lib/member-applications';
import { toast } from 'react-hot-toast';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';
import { UserIcon } from '@heroicons/react/24/outline';

const FloatingCircles = () => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden">
    <motion.div
      className="absolute top-0 right-0 w-64 h-64 bg-brand-primary/5 rounded-full"
      animate={{
        y: [0, 20, 0],
        scale: [1, 1.1, 1],
      }}
      transition={{
        duration: 5,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    />
    <motion.div
      className="absolute bottom-0 left-0 w-48 h-48 bg-brand-secondary/5 rounded-full"
      animate={{
        y: [0, -15, 0],
        scale: [1, 0.9, 1],
      }}
      transition={{
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut",
        delay: 1
      }}
    />
    <motion.div
      className="absolute top-1/2 left-1/4 w-32 h-32 bg-brand-primary/3 rounded-full"
      animate={{
        x: [0, 20, 0],
        y: [0, -10, 0],
      }}
      transition={{
        duration: 7,
        repeat: Infinity,
        ease: "easeInOut",
        delay: 2
      }}
    />
  </div>
);

const BouncyBackground = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    {/* Large circles */}
    <motion.div
      className="absolute -top-20 -right-20 w-96 h-96 rounded-full bg-gradient-to-br from-brand-primary/10 to-brand-secondary/5"
      animate={{
        scale: [1, 1.1, 1],
        rotate: [0, 10, 0],
        y: [0, -20, 0],
      }}
      transition={{
        duration: 8,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    />
    <motion.div
      className="absolute -bottom-32 -left-32 w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-brand-secondary/10 to-brand-primary/5"
      animate={{
        scale: [1, 1.2, 1],
        rotate: [0, -15, 0],
        x: [0, 20, 0],
      }}
      transition={{
        duration: 10,
        repeat: Infinity,
        ease: "easeInOut",
        delay: 1
      }}
    />

    {/* Decorative shapes */}
    <motion.svg
      className="absolute top-1/4 right-1/4"
      width="120"
      height="120"
      viewBox="0 0 120 120"
      animate={{
        y: [0, -30, 0],
        rotate: [0, 180, 0],
        scale: [1, 1.1, 1],
      }}
      transition={{
        duration: 15,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    >
      <path
        d="M60 10 L110 60 L60 110 L10 60 Z"
        fill="none"
        stroke="rgba(157, 200, 141, 0.3)"
        strokeWidth="2"
      />
    </motion.svg>

    <motion.svg
      className="absolute bottom-1/4 left-1/3"
      width="80"
      height="80"
      viewBox="0 0 80 80"
      animate={{
        x: [0, 40, 0],
        y: [0, -20, 0],
        rotate: [0, -90, 0],
      }}
      transition={{
        duration: 12,
        repeat: Infinity,
        ease: "easeInOut",
        delay: 2
      }}
    >
      <circle
        cx="40"
        cy="40"
        r="30"
        fill="none"
        stroke="rgba(196, 227, 181, 0.4)"
        strokeWidth="2"
      />
    </motion.svg>

    {/* Small floating dots */}
    {[...Array(6)].map((_, i) => (
      <motion.div
        key={i}
        className="absolute w-3 h-3 rounded-full bg-brand-primary/20"
        style={{
          top: `${20 + i * 15}%`,
          left: `${10 + i * 15}%`,
        }}
        animate={{
          y: [0, -20, 0],
          x: [0, 10, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 4 + i,
          repeat: Infinity,
          ease: "easeInOut",
          delay: i * 0.5,
        }}
      />
    ))}

    {/* Wavy lines */}
    <svg className="absolute bottom-0 left-0 right-0 w-full h-32" preserveAspectRatio="none">
      <motion.path
        d="M0 50 Q 80 30, 160 50 T 320 50 T 480 50 T 640 50 T 800 50 T 960 50 T 1120 50 T 1280 50 T 1440 50 V100 H0 Z"
        fill="url(#gradient1)"
        animate={{
          d: [
            "M0 50 Q 80 30, 160 50 T 320 50 T 480 50 T 640 50 T 800 50 T 960 50 T 1120 50 T 1280 50 T 1440 50 V100 H0 Z",
            "M0 50 Q 80 70, 160 50 T 320 50 T 480 50 T 640 50 T 800 50 T 960 50 T 1120 50 T 1280 50 T 1440 50 V100 H0 Z",
          ]
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut",
          repeatType: "reverse",
        }}
      >
        <defs>
          <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(157, 200, 141, 0.1)" />
            <stop offset="50%" stopColor="rgba(196, 227, 181, 0.1)" />
            <stop offset="100%" stopColor="rgba(157, 200, 141, 0.1)" />
          </linearGradient>
        </defs>
      </motion.path>
      <motion.path
        d="M0 70 Q 80 50, 160 70 T 320 70 T 480 70 T 640 70 T 800 70 T 960 70 T 1120 70 T 1280 70 T 1440 70 V100 H0 Z"
        fill="url(#gradient2)"
        animate={{
          d: [
            "M0 70 Q 80 50, 160 70 T 320 70 T 480 70 T 640 70 T 800 70 T 960 70 T 1120 70 T 1280 70 T 1440 70 V100 H0 Z",
            "M0 70 Q 80 90, 160 70 T 320 70 T 480 70 T 640 70 T 800 70 T 960 70 T 1120 70 T 1280 70 T 1440 70 V100 H0 Z",
          ]
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
          repeatType: "reverse",
          delay: 0.5,
        }}
      >
        <defs>
          <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(196, 227, 181, 0.15)" />
            <stop offset="50%" stopColor="rgba(157, 200, 141, 0.15)" />
            <stop offset="100%" stopColor="rgba(196, 227, 181, 0.15)" />
          </linearGradient>
        </defs>
      </motion.path>
    </svg>
  </div>
);

export default function Officers() {
  const [officers, setOfficers] = useState<Officer[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [applicationsOpen, setApplicationsOpen] = useState(false);
  const [isPointsModalOpen, setIsPointsModalOpen] = useState(false);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    fetchOfficers();
    checkApplicationStatus();

    // GSAP Animations
    const ctx = gsap.context(() => {
      // Animate the officer slideshow container
      gsap.from(".officer-slideshow-container", {
        y: 100,
        opacity: 0,
        duration: 1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ".officer-slideshow-container",
          start: "top center+=100",
          end: "bottom center",
          toggleActions: "play none none reverse"
        }
      });

      // Animate the application box
      gsap.from(".application-box", {
        y: 100,
        opacity: 0,
        duration: 1,
        delay: 0.3,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ".application-box",
          start: "top center+=100",
          end: "bottom center",
          toggleActions: "play none none reverse"
        }
      });

      // Animate the membership box
      gsap.from(".membership-box", {
        y: 50,
        opacity: 0,
        duration: 1,
        delay: 0.6,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ".membership-box",
          start: "top center+=100",
          end: "bottom center",
          toggleActions: "play none none reverse"
        }
      });

      // Create a continuous floating animation for the cards
      gsap.to([".officer-slideshow-container", ".application-box"], {
        y: "20px",
        duration: 2,
        ease: "power1.inOut",
        yoyo: true,
        repeat: -1,
        stagger: {
          each: 0.5,
          from: "start"
        }
      });
    });

    return () => ctx.revert();
  }, []);

  async function checkApplicationStatus() {
    try {
      const settingsDoc = await getDoc(doc(db, 'settings', 'application'));
      if (settingsDoc.exists()) {
        const settings = settingsDoc.data();
        setApplicationsOpen(settings.membershipApplicationsOpen);
      }
    } catch (error) {
      console.error('Error checking application status:', error);
    }
  }

  async function fetchOfficers() {
    try {
      const q = query(collection(db, 'officers'), orderBy('order'));
      const querySnapshot = await getDocs(q);
      const officersData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Officer[];
      setOfficers(officersData);
    } catch (error) {
      console.error('Error fetching officers:', error);
    } finally {
      setLoading(false);
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const form = e.currentTarget;
      const formData = new FormData(form);
      
      // Validate required fields
      const requiredFields = ['firstName', 'lastName', 'email', 'phone', 'eid', 'major', 'grade', 'gpa', 'whyJoin'];
      const missingFields = requiredFields.filter(field => !formData.get(field));
      
      if (missingFields.length > 0) {
        throw new Error(`Please fill in all required fields: ${missingFields.join(', ')}`);
      }

      // Validate email format
      const email = formData.get('email') as string;
      if (!email.includes('@') || !email.includes('.')) {
        throw new Error('Please enter a valid email address');
      }

      // Validate GPA
      const gpa = parseFloat(formData.get('gpa') as string);
      if (isNaN(gpa) || gpa < 0 || gpa > 4) {
        throw new Error('Please enter a valid GPA between 0 and 4');
      }

      // Validate resume if provided
      const resumeFile = formData.get('resume') as File;
      if (resumeFile && resumeFile.name) {
        if (!resumeFile.type.includes('pdf')) {
          throw new Error('Please upload a PDF file');
        }
      }

      // Submit the application
      await submitMemberApplication(formData);
      
      // Reset form on success
      form.reset();
      
      toast.success('Application submitted successfully! We will review it shortly.');
    } catch (error) {
      console.error('Error submitting application:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to submit application. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const prevSlide = () => {
    setCurrentSlide((currentSlide - 1 + officers.length) % officers.length);
  };

  const nextSlide = () => {
    setCurrentSlide((currentSlide + 1) % officers.length);
  };

  if (loading) {
    return (
      <div className="w-full min-h-[700px] bg-background-accent/50 rounded-2xl animate-pulse">
        <div className="w-full h-full flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <section className="relative w-full min-h-[700px] py-16 overflow-hidden bg-gradient-to-b from-white to-background-light">
      {/* Bouncy Background */}
      <BouncyBackground />

      {/* Content */}
      <div className="relative z-20 mx-auto max-w-[1800px]">
        <div className="text-center mb-8">
          <h3 className="text-2xl sm:text-3xl font-semibold text-brand-dark mb-2">Meet Our Officers</h3>
          <p className="text-text-secondary">The dedicated team leading Austin STEM Buddies</p>
        </div>

        {/* Two Column Layout Container */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Officers Slideshow Column */}
          <div className="w-full lg:w-1/2">
            <div className="relative h-auto lg:h-[600px] z-40">
              {/* Navigation Buttons */}
              <div className="absolute top-1/2 -translate-y-1/2 left-0 z-50 hidden sm:block">
                <button
                  onClick={prevSlide}
                  className="p-2 rounded-full bg-white/80 backdrop-blur-sm shadow-lg hover:bg-white transition-colors"
                >
                  <ChevronLeftIcon className="w-6 h-6 text-brand-dark" />
                </button>
              </div>
              <div className="absolute top-1/2 -translate-y-1/2 right-0 z-50 hidden sm:block">
                <button
                  onClick={nextSlide}
                  className="p-2 rounded-full bg-white/80 backdrop-blur-sm shadow-lg hover:bg-white transition-colors"
                >
                  <ChevronRightIcon className="w-6 h-6 text-brand-dark" />
                </button>
              </div>

              {/* Officers Grid/Carousel */}
              <div className="overflow-hidden h-full z-40">
                <motion.div
                  className="flex h-full"
                  animate={{ x: `-${currentSlide * 100}%` }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                >
                  {officers.map((officer, index) => (
                    <div
                      key={officer.id}
                      className="w-full flex-shrink-0 px-4 sm:px-6 h-full"
                      style={{ scrollSnapAlign: 'start' }}
                    >
                      <div className="bg-white rounded-xl border border-gray-200 [max-width:600px]:border-0 [max-width:600px]:shadow-none sm:border-none sm:bg-white/90 sm:backdrop-blur-md sm:shadow-md overflow-hidden h-full z-40">
                        {/* Mobile Layout */}
                        <div className="flex sm:hidden">
                          <div className="relative h-48 w-48 flex-shrink-0">
                            {officer.image ? (
                              <Image
                                src={officer.image}
                                alt={officer.name}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
                                <UserIcon className="h-12 w-12 text-gray-400" />
                              </div>
                            )}
                          </div>
                          <div className="p-6">
                            <h4 className="text-xl font-semibold text-brand-dark mb-1">{officer.name}</h4>
                            <p className="text-brand-primary font-medium mb-4">{officer.position}</p>
                            <p className="text-text-secondary text-sm line-clamp-4">{officer.bio}</p>
                          </div>
                        </div>

                        {/* Desktop Layout */}
                        <div className="hidden sm:flex flex-col items-center justify-start h-full pt-8 pb-16 px-8">
                          {/* Profile Image Container */}
                          <div className="relative w-64 h-64 rounded-full overflow-hidden border-4 border-brand-primary/10 mb-8">
                            {officer.image ? (
                              <Image
                                src={officer.image}
                                alt={officer.name}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
                                <UserIcon className="h-20 w-20 text-gray-400" />
                              </div>
                            )}
                          </div>
                          
                          {/* Officer Info */}
                          <div className="text-center max-w-lg">
                            <h4 className="text-2xl font-semibold text-brand-dark mb-2">{officer.name}</h4>
                            <p className="text-brand-primary font-medium text-lg mb-6">{officer.position}</p>
                            <p className="text-text-secondary text-base leading-relaxed">{officer.bio}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </motion.div>
              </div>

              {/* Navigation Dots - Now visible on all screen sizes */}
              <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-50">
                {officers.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={`w-2.5 h-2.5 rounded-full transition-colors ${
                      index === currentSlide 
                        ? 'bg-brand-primary w-8' 
                        : 'bg-gray-300 hover:bg-gray-400'
                    }`}
                  />
                ))}
              </div>

              {/* Mobile Swipe Indicators */}
              <div className="mt-4 flex justify-center items-center gap-2 text-sm text-text-secondary sm:hidden">
                <ChevronLeftIcon className="w-4 h-4" />
                <span>Swipe to view more</span>
                <ChevronRightIcon className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* Application Form Column */}
          <div className="w-full lg:w-1/2">
            <div className="application-box h-[600px] relative">
              <div className="bg-white rounded-xl border border-gray-200 [max-width:600px]:border-0 [max-width:600px]:shadow-none sm:bg-white/90 sm:backdrop-blur-md sm:border-brand-primary/10 h-full relative overflow-hidden sm:hover:bg-white/95 transition-all duration-300 sm:shadow-xl">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                  className="relative z-10 h-full flex flex-col p-10"
              >
                  <h2 className="text-5xl font-freckle text-brand-dark mb-8">Join Our Team</h2>
                
                {applicationsOpen ? (
                    <div className="space-y-6 flex-1 relative h-full">
                      <p className="text-xl text-text-secondary leading-relaxed">
                      We're excited that you're interested in joining our team! Please fill out the application form below.
                    </p>
                      <form onSubmit={handleSubmit} className="h-[calc(100%-180px)] relative">
                        <div className="space-y-5 h-full overflow-y-auto custom-scrollbar pb-32">
                          {/* Personal Information */}
                          <div className="space-y-4">
                            <h4 className="font-medium text-brand-dark">Personal Information</h4>
                            <div className="grid grid-cols-2 gap-5">
                              <div>
                                <label htmlFor="firstName" className="block text-base font-medium text-text-primary mb-2">
                                  First Name*
                                </label>
                                <input
                                  type="text"
                                  id="firstName"
                                  name="firstName"
                                  className="w-full px-4 py-3 rounded-lg border border-border-light focus:outline-none focus:ring-2 focus:ring-brand-primary/20 bg-white text-lg"
                                  required
                                />
                              </div>
                        <div>
                                <label htmlFor="lastName" className="block text-base font-medium text-text-primary mb-2">
                                  Last Name*
                          </label>
                          <input
                            type="text"
                                  id="lastName"
                                  name="lastName"
                                  className="w-full px-4 py-3 rounded-lg border border-border-light focus:outline-none focus:ring-2 focus:ring-brand-primary/20 bg-white text-lg"
                            required
                          />
                              </div>
                        </div>

                            <div className="grid grid-cols-2 gap-5">
                        <div>
                                <label htmlFor="email" className="block text-base font-medium text-text-primary mb-2">
                                  Email Address*
                          </label>
                          <input
                            type="email"
                            id="email"
                            name="email"
                                  className="w-full px-4 py-3 rounded-lg border border-border-light focus:outline-none focus:ring-2 focus:ring-brand-primary/20 bg-white text-lg"
                                  required
                                />
                              </div>
                              <div>
                                <label htmlFor="phone" className="block text-base font-medium text-text-primary mb-2">
                                  Phone Number*
                                </label>
                                <input
                                  type="tel"
                                  id="phone"
                                  name="phone"
                                  className="w-full px-4 py-3 rounded-lg border border-border-light focus:outline-none focus:ring-2 focus:ring-brand-primary/20 bg-white text-lg"
                                  required
                                />
                              </div>
                            </div>
                          </div>

                          {/* Academic Information */}
                          <div className="space-y-4">
                            <h4 className="font-medium text-brand-dark">Academic Information</h4>
                            <div className="grid grid-cols-2 gap-5">
                              <div>
                                <label htmlFor="eid" className="block text-base font-medium text-text-primary mb-2">
                                  EID*
                                </label>
                                <input
                                  type="text"
                                  id="eid"
                                  name="eid"
                                  className="w-full px-4 py-3 rounded-lg border border-border-light focus:outline-none focus:ring-2 focus:ring-brand-primary/20 bg-white text-lg"
                                  required
                                />
                              </div>
                              <div>
                                <label htmlFor="major" className="block text-base font-medium text-text-primary mb-2">
                                  Major*
                                </label>
                                <input
                                  type="text"
                                  id="major"
                                  name="major"
                                  className="w-full px-4 py-3 rounded-lg border border-border-light focus:outline-none focus:ring-2 focus:ring-brand-primary/20 bg-white text-lg"
                            required
                          />
                        </div>
                      </div>

                            <div className="grid grid-cols-2 gap-5">
                              <div>
                                <label htmlFor="grade" className="block text-base font-medium text-text-primary mb-2">
                                  Classification*
                                </label>
                                <select
                                  id="grade"
                                  name="grade"
                                  className="w-full px-4 py-3 rounded-lg border border-border-light focus:outline-none focus:ring-2 focus:ring-brand-primary/20 bg-white text-lg"
                                  required
                                >
                                  <option value="">Select Classification</option>
                                  <option value="Freshman">Freshman</option>
                                  <option value="Sophomore">Sophomore</option>
                                  <option value="Junior">Junior</option>
                                  <option value="Senior">Senior</option>
                                  <option value="Graduate">Graduate</option>
                                </select>
                              </div>
                      <div>
                                <label htmlFor="gpa" className="block text-base font-medium text-text-primary mb-2">
                                  GPA*
                        </label>
                        <input
                                  type="number"
                                  id="gpa"
                                  name="gpa"
                                  step="0.01"
                                  min="0"
                                  max="4"
                                  className="w-full px-4 py-3 rounded-lg border border-border-light focus:outline-none focus:ring-2 focus:ring-brand-primary/20 bg-white text-lg"
                                  required
                                />
                              </div>
                            </div>
                          </div>

                          {/* Additional Information */}
                          <div className="space-y-4">
                            <h4 className="font-medium text-brand-dark">Additional Information</h4>
                            <div>
                              <label htmlFor="whyJoin" className="block text-base font-medium text-text-primary mb-2">
                                Why do you want to join ASB?*
                              </label>
                              <textarea
                                id="whyJoin"
                                name="whyJoin"
                                rows={3}
                                className="w-full px-4 py-3 rounded-lg border border-border-light focus:outline-none focus:ring-2 focus:ring-brand-primary/20 bg-white text-lg resize-none"
                          required
                        />
                      </div>

                      <div>
                              <label htmlFor="experience" className="block text-base font-medium text-text-primary mb-2">
                                Previous STEM/Teaching Experience
                        </label>
                        <textarea
                          id="experience"
                          name="experience"
                          rows={3}
                                className="w-full px-4 py-3 rounded-lg border border-border-light focus:outline-none focus:ring-2 focus:ring-brand-primary/20 bg-white text-lg resize-none"
                        />
                      </div>

                      <div>
                              <label htmlFor="resume" className="block text-base font-medium text-text-primary mb-2">
                                Resume (Optional)
                        </label>
                              <input
                                type="file"
                                id="resume"
                                name="resume"
                                accept=".pdf"
                                className="w-full px-4 py-3 rounded-lg border border-border-light focus:outline-none focus:ring-2 focus:ring-brand-primary/20 bg-white text-lg"
                              />
                              <p className="mt-1 text-sm text-text-secondary">Optional: Upload your resume in PDF format (max 2MB).</p>
                            </div>
                          </div>
                      </div>

                        {/* Fixed Submit Button - Now inside the form */}
                        <div className="absolute bottom-0 left-0 right-0 p-6 bg-white/95 backdrop-blur-sm border-t border-border-light">
                      <motion.button
                        type="submit"
                            disabled={submitting}
                            whileHover={{ scale: submitting ? 1 : 1.02 }}
                            whileTap={{ scale: submitting ? 1 : 0.98 }}
                            className={`w-full bg-brand-primary text-white px-8 py-4 rounded-lg text-xl font-medium transition-all ${
                              submitting ? 'opacity-50 cursor-not-allowed' : 'hover:bg-brand-secondary'
                            }`}
                          >
                            {submitting ? (
                              <div className="flex items-center justify-center space-x-2">
                                <div className="w-5 h-5 border-t-2 border-white rounded-full animate-spin" />
                                <span>Submitting...</span>
                              </div>
                            ) : (
                              'Submit Application'
                            )}
                      </motion.button>
                        </div>
                    </form>
                  </div>
                ) : (
                  <ClosedFormState 
                    title="Applications Closed"
                      message="Member applications are closed. Please check back later for new opportunities to join our team."
                  />
                )}
              </motion.div>
            </div>
          </div>
        </div>
        </div>
      </div>
    </section>
  );
} 