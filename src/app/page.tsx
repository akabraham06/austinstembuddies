'use client';

import { motion } from 'framer-motion';
import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/dist/ScrollTrigger';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import AnimatedBlobs from '@/components/AnimatedBlobs';
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Officers from '@/components/Officers';
import DonateModal from '@/components/DonateModal';
import PartnerModal from '@/components/PartnerModal';
import EmailSignupModal from '@/components/EmailSignupModal';
import Events from '@/components/Events';
import HeroSlideshow from '@/components/HeroSlideshow';
import PartnersGrid from '@/components/PartnersGrid';
import PointSubmissionModal from '@/components/PointSubmissionModal';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { ApplicationSettings } from '@/lib/firebase-types';
import CheckPoints from '@/components/CheckPoints';
import MemberApplicationForm from '@/components/MemberApplicationForm';
import MembershipBox from '@/components/MembershipBox';
import DonationRing from '@/components/DonationRing';

const navigation = [
  { name: 'Home', href: '#home' },
  { name: 'About', href: '#mission' },
  { name: 'Members', href: '#members' },
  { name: 'Partners', href: '#partners' },
  { name: 'Events', href: '#events' },
  { name: 'Support', href: '#support' },
  { name: 'Socials', href: '#socials' },
];

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [isDonateModalOpen, setIsDonateModalOpen] = useState(false);
  const [isPartnerModalOpen, setIsPartnerModalOpen] = useState(false);
  const [isEmailSignupModalOpen, setIsEmailSignupModalOpen] = useState(false);
  const [isPointSubmissionModalOpen, setIsPointSubmissionModalOpen] = useState(false);
  const [isPointsModalOpen, setIsPointsModalOpen] = useState(false);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const partnersRef = useRef(null);

  useEffect(() => {
    // Register ScrollTrigger plugin
    gsap.registerPlugin(ScrollTrigger);

    checkApplicationSettings();
    // Hero section animations
    const heroTimeline = gsap.timeline();
    heroTimeline
      .from('.hero-title', {
        y: 100,
        opacity: 0,
        duration: 1,
        ease: 'power3.out'
      })
      .from('.hero-text', {
        y: 50,
        opacity: 0,
        duration: 0.8,
        ease: 'power3.out'
      }, '-=0.6')
      .from('.hero-button', {
        scale: 0.8,
        opacity: 0,
        duration: 0.5,
        ease: 'back.out(1.7)'
      }, '-=0.4');

    // Members section animation
    const membersTimeline = gsap.timeline({
      scrollTrigger: {
        trigger: '#members',
        start: 'top center+=100',
        end: 'bottom center',
        toggleActions: 'play none none reverse'
      }
    });

    membersTimeline
      .from('.members-background', {
        scale: 0.9,
        opacity: 0,
        duration: 1,
        ease: 'power2.out'
      })
      .from('.members-content', {
        y: 30,
        opacity: 0,
        duration: 0.8,
        stagger: 0.2,
        ease: 'power2.out'
      }, '-=0.4');

    // Partners section animation
    gsap.from('.partner-grid-item', {
      scale: 0.8,
      opacity: 0,
      duration: 0.8,
      stagger: {
        amount: 0.5,
        ease: 'power2.out'
      },
      ease: 'elastic.out(1, 0.8)',
      scrollTrigger: {
        trigger: '.partner-grid',
        start: 'top bottom-=100',
        toggleActions: 'play none none reverse'
      }
    });
  }, []);

  async function checkApplicationSettings() {
    try {
      const settingsDoc = await getDoc(doc(db, 'settings', 'application'));
      if (settingsDoc.exists()) {
        const settings = settingsDoc.data() as ApplicationSettings;
        setLoading(false);
      }
    } catch (error) {
      console.error('Error checking application settings:', error);
    }
  }

  const scrollToTeam = () => {
    const teamSection = document.getElementById('members');
    teamSection?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      <Navigation />
      
      {/* Hero Section */}
      <section id="home" className="relative min-h-[80vh] flex items-center justify-center bg-white pt-24 overflow-hidden px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 -z-10">
          <AnimatedBlobs />
        </div>
        <div className="container-narrow relative z-10 w-full">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            {/* Text Content */}
            <div className="flex-1 w-full max-w-[600px]">
              <div className="relative w-full">
                <h1 className="font-freckle text-5xl sm:text-6xl md:text-7xl lg:text-8xl text-brand-dark mb-4 text-center lg:text-left">
                  Austin STEM Buddies
                </h1>
                <p className="text-lg md:text-xl text-text-secondary mb-6 max-w-[90%] mx-auto lg:mx-0 text-center lg:text-left">
                  Inspiring the next generation of scientists, engineers, and innovators through hands-on STEM education
                </p>
                <div className="flex justify-center lg:justify-start">
                  <button
                    onClick={scrollToTeam}
                    className="bg-brand-primary text-white px-8 py-3 rounded-lg text-lg font-medium hover:bg-brand-secondary transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95"
                  >
                    Get Involved
                  </button>
                </div>
              </div>
            </div>

            {/* Image Content */}
            <div className="flex-1 w-full flex items-center justify-center max-w-[800px]">
              <div className="w-full aspect-[4/3] relative">
                <HeroSlideshow />
              </div>
            </div>
          </div>
        </div>
        
        {/* Background Blobs */}
        <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
          <svg viewBox="0 0 800 800" className="absolute w-[140%] h-[140%] -top-[20%] -left-[20%] opacity-20">
            <defs>
              <linearGradient id="blob-gradient-1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#9DC88D" />
                <stop offset="100%" stopColor="#4A7C59" />
              </linearGradient>
            </defs>
            <path
              d="M400,100 C550,100 700,250 700,400 C700,550 550,700 400,700 C250,700 100,550 100,400 C100,250 250,100 400,100 Z"
              fill="url(#blob-gradient-1)"
            />
          </svg>
          <svg viewBox="0 0 800 800" className="absolute w-[120%] h-[120%] -bottom-[10%] -right-[10%] opacity-15">
            <defs>
              <linearGradient id="blob-gradient-2" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#C4E3B5" />
                <stop offset="100%" stopColor="#9DC88D" />
              </linearGradient>
            </defs>
            <path
              d="M400,150 C500,150 600,300 600,450 C600,600 450,700 300,700 C150,700 50,600 50,450 C50,300 300,150 400,150 Z"
              fill="url(#blob-gradient-2)"
            />
          </svg>
        </div>
      </section>

      {/* Mission Section */}
      <section id="mission" className="relative py-24 bg-background-light overflow-hidden">
        {/* Wavy Blob Animation */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          {/* Main Wavy Blob */}
          <motion.svg
            viewBox="0 0 1000 1000"
            className="absolute w-[120%] h-[120%] -top-[10%] -left-[10%] opacity-40"
          >
            <defs>
              <linearGradient id="about-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#9DC88D" stopOpacity="0.9" />
                <stop offset="50%" stopColor="#4A7C59" stopOpacity="0.85" />
                <stop offset="100%" stopColor="#C4E3B5" stopOpacity="0.9" />
              </linearGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="5" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
            <motion.path
              d="M 500 200 
                 C 650 200 750 300 750 400 
                 C 750 500 650 600 500 600 
                 C 350 600 250 500 250 400 
                 C 250 300 350 200 500 200 Z"
              fill="url(#about-gradient)"
              filter="url(#glow)"
              initial={{ scale: 0.8 }}
              animate={{
                scale: [0.8, 1, 0.8],
                d: [
                  "M 500 200 C 650 200 750 300 750 400 C 750 500 650 600 500 600 C 350 600 250 500 250 400 C 250 300 350 200 500 200 Z",
                  "M 500 250 C 700 250 800 350 800 450 C 800 550 700 650 500 650 C 300 650 200 550 200 450 C 200 350 300 250 500 250 Z",
                  "M 500 200 C 650 200 750 300 750 400 C 750 500 650 600 500 600 C 350 600 250 500 250 400 C 250 300 350 200 500 200 Z"
                ]
              }}
              transition={{
                duration: 20,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          </motion.svg>

          {/* Decorative Circles */}
          <motion.div
            className="absolute top-1/4 right-1/4 w-64 h-64 rounded-full bg-gradient-to-br from-brand-primary/30 to-transparent"
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 180, 0],
              opacity: [0.5, 0.7, 0.5]
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div
            className="absolute bottom-1/4 left-1/4 w-48 h-48 rounded-full bg-gradient-to-tr from-brand-secondary/30 to-transparent"
            animate={{
              scale: [1, 1.3, 1],
              rotate: [0, -180, 0],
              opacity: [0.4, 0.6, 0.4]
            }}
            transition={{
              duration: 12,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1
            }}
          />

          {/* Floating Lines */}
          <svg className="absolute inset-0 w-full h-full opacity-20">
            <motion.path
              d="M0,400 C200,300 400,500 600,400 S800,300 1000,400"
              stroke="url(#about-gradient)"
              strokeWidth="2"
              fill="none"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: [0, 1, 0] }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            <motion.path
              d="M0,600 C200,500 400,700 600,600 S800,500 1000,600"
              stroke="url(#about-gradient)"
              strokeWidth="2"
              fill="none"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: [0, 1, 0] }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 2
              }}
            />
          </svg>
        </div>

        <div className="container-wide relative z-10">
          <div className="text-center mb-16">
            <h2 className="font-freckle text-6xl md:text-7xl lg:text-8xl text-brand-dark mb-6">
              Our Mission
            </h2>
            <p className="text-xl md:text-2xl text-text-secondary max-w-3xl mx-auto">
              At Austin STEM Buddies, we are dedicated to inspiring the next generation of scientists, engineers, and innovators through hands-on STEM education.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Goals */}
            <div className="bg-white/80 backdrop-blur-md rounded-2xl p-8 shadow-lg">
              <h3 className="text-3xl font-semibold text-brand-dark mb-4">Our Goals</h3>
              <ul className="list-disc list-inside space-y-2 text-lg text-text-secondary">
                <li>Provide engaging STEM activities to elementary students.</li>
                <li>Foster a love for science and technology.</li>
                <li>Encourage critical thinking and problem-solving skills.</li>
              </ul>
            </div>

            {/* Impact */}
            <div className="bg-white/80 backdrop-blur-md rounded-2xl p-8 shadow-lg">
              <h3 className="text-3xl font-semibold text-brand-dark mb-4">Our Impact</h3>
              <p className="text-lg text-text-secondary">
                Since our inception, we have reached over 1,000 students across multiple schools, providing them with the tools and knowledge to explore the wonders of STEM.
              </p>
            </div>
          </div>

          {/* Call to Action */}
          <div className="text-center mt-12">
            <button
              className="bg-brand-primary text-white px-8 py-4 rounded-lg text-xl font-medium hover:bg-brand-secondary transition-colors shadow-lg hover:shadow-xl"
              onClick={() => scrollToTeam()}
            >
              Get Involved
            </button>
          </div>
        </div>
      </section>

      {/* Members Section */}
      <section id="members" className="relative py-12 sm:py-16 md:py-24 overflow-hidden bg-gradient-to-b from-white to-background-light">
        {/* Animated Background */}
        <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
          <svg viewBox="0 0 900 900" className="absolute w-full h-full opacity-20">
            <defs>
              <linearGradient id="members-blob-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#9DC88D" />
                <stop offset="100%" stopColor="#4A7C59" />
              </linearGradient>
            </defs>
            <motion.path
              initial={{ scale: 0.95, rotate: 0 }}
              animate={{ scale: [0.95, 1.05, 0.95], rotate: [0, 8, -8, 0] }}
              transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
              d="M450,120 Q700,120 780,400 Q860,680 450,780 Q40,680 120,400 Q200,120 450,120 Z"
              fill="url(#members-blob-gradient)"
            />
          </svg>
        </div>

        <div className="container-wide relative z-10">
          {/* Section Header */}
          <div className="text-center mb-8 sm:mb-12 md:mb-16">
            <h2 className="font-freckle text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-brand-dark mb-4 members-title">
              Our Amazing Team
            </h2>
            <p className="text-lg sm:text-xl text-text-secondary max-w-2xl mx-auto">
              Join our passionate community of STEM advocates making a difference in education
            </p>
          </div>

          {/* Members Grid */}
          <div className="grid grid-cols-1 gap-6 sm:gap-8 max-w-full overflow-hidden">
            {/* Officer Slideshow */}
            <div className="bg-green-200/80 backdrop-blur-md rounded-2xl p-4 sm:p-6 md:p-8 w-full">
              <Officers />
            </div>

            {/* Current Members Section */}
            <div className="bg-green-200/80 backdrop-blur-md rounded-2xl p-4 sm:p-6 md:p-8 w-full">
              <MembershipBox
                onPointsClick={() => setIsPointsModalOpen(true)}
                onSubmitClick={() => setIsPointSubmissionModalOpen(true)}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Partners Section */}
      <section ref={partnersRef} className="relative py-16 bg-background-light overflow-hidden">
        {/* Animated Blob Background */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <motion.svg
            viewBox="0 0 1000 1000"
            className="absolute w-[140%] h-[140%] -top-[20%] -left-[20%]"
          >
            <defs>
              <linearGradient id="partners-blob-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#E2EFD9" stopOpacity="0.8" />
                <stop offset="50%" stopColor="#C4E3B5" stopOpacity="0.7" />
                <stop offset="100%" stopColor="#9DC88D" stopOpacity="0.8" />
              </linearGradient>
            </defs>
            <motion.path
              d="M500,200 
                C650,200 750,350 750,500 
                C750,650 650,800 500,800 
                C350,800 250,650 250,500 
                C250,350 350,200 500,200 Z"
              fill="url(#partners-blob-gradient)"
              animate={{
                d: [
                  "M500,200 C650,200 750,350 750,500 C750,650 650,800 500,800 C350,800 250,650 250,500 C250,350 350,200 500,200 Z",
                  "M500,250 C700,250 800,400 800,500 C800,600 700,750 500,750 C300,750 200,600 200,500 C200,400 300,250 500,250 Z",
                  "M500,200 C650,200 750,350 750,500 C750,650 650,800 500,800 C350,800 250,650 250,500 C250,350 350,200 500,200 Z"
                ],
                scale: [1, 1.1, 1],
                rotate: [0, 10, 0]
              }}
              transition={{
                duration: 20,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          </motion.svg>

          {/* Additional decorative elements */}
          <motion.div
            className="absolute top-1/4 right-1/4 w-64 h-64 rounded-full bg-brand-primary/10"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3]
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div
            className="absolute bottom-1/3 left-1/3 w-48 h-48 rounded-full bg-brand-secondary/10"
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.2, 0.4, 0.2]
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1
            }}
          />
        </div>

        <div className="container-narrow relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <motion.h2
              className="font-freckle text-6xl md:text-7xl text-brand-dark mb-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              Our Partner Schools
            </motion.h2>
            <motion.p
              className="text-xl text-text-secondary"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              Join our growing network of schools committed to STEM education
            </motion.p>
          </div>
          
          <div className="partner-grid max-w-4xl mx-auto">
            <PartnersGrid />
          </div>

          <div className="text-center mt-12">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsPartnerModalOpen(true)}
              className="bg-brand-primary text-white px-8 py-4 rounded-lg text-xl font-medium hover:bg-brand-secondary transition-colors shadow-lg hover:shadow-xl"
            >
              Become a Partner
            </motion.button>
          </div>
        </div>
      </section>

      {/* Events Section */}
      <section id="events" className="relative py-16 bg-brand-secondary overflow-hidden">
        {/* Decorative SVGs */}
        <div className="absolute inset-0 pointer-events-none">
          <motion.svg
            className="absolute top-0 left-0 w-64 h-64 text-brand-primary/10"
            viewBox="0 0 200 200"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1 }}
          >
            <motion.path
              d="M 50,100 C 50,50 150,50 150,100 C 150,150 50,150 50,100"
              fill="currentColor"
              animate={{
                d: [
                  "M 50,100 C 50,50 150,50 150,100 C 150,150 50,150 50,100",
                  "M 50,100 C 50,150 150,150 150,100 C 150,50 50,50 50,100",
                  "M 50,100 C 50,50 150,50 150,100 C 150,150 50,150 50,100"
                ]
              }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            />
          </motion.svg>
          
          <motion.svg
            className="absolute bottom-0 right-0 w-96 h-96 text-brand-primary/10"
            viewBox="0 0 200 200"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
          >
            <motion.circle
              cx="100"
              cy="100"
              r="50"
              fill="currentColor"
              animate={{
                r: [50, 60, 50],
                opacity: [0.1, 0.2, 0.1]
              }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            />
          </motion.svg>
        </div>

        <div className="container-narrow relative z-10">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-freckle text-5xl md:text-6xl text-white mb-4">
              Upcoming Events
            </h2>
            <p className="text-lg text-brand-light/90 max-w-2xl mx-auto">
              Join us for exciting STEM activities and make a difference in your community
            </p>
          </motion.div>
          
          <div className="max-w-4xl mx-auto">
            <Events />
          </div>
        </div>
      </section>

      {/* Support Section */}
      <section id="support" className="relative pt-24 bg-transparent overflow-visible px-4 sm:px-6 lg:px-8">
        <div className="container-narrow relative w-full">
          <div className="flex flex-col items-center justify-center text-center max-w-3xl mx-auto">
            {/* Support Content */}
            <div className="relative">
              <motion.h2
                className="font-freckle text-6xl md:text-7xl text-brand-dark mb-4"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                Support Our Mission
              </motion.h2>
              <motion.p
                className="text-xl text-text-secondary mb-6 max-w-2xl mx-auto"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
              >
                Your donation helps us bring exciting STEM experiments to more elementary school students
              </motion.p>
              <div className="relative overflow-visible h-[150px]">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsDonateModalOpen(true)}
                  className="bg-brand-accent text-text-primary px-12 py-6 rounded-2xl text-2xl font-medium hover:bg-brand-accent/90 transition-colors shadow-lg hover:shadow-xl relative"
                  style={{ zIndex: 45 }}
                >
                  Donate Now
                </motion.button>
                
                {/* Three.js Ring Animation */}
                <DonationRing />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Socials Section */}
      <section id="socials" className="relative py-16 overflow-hidden">
        <div className="container-narrow relative z-10">
          <motion.h2
            className="font-freckle text-5xl md:text-6xl text-brand-dark text-center mb-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            Follow Our Journey
          </motion.h2>
          <div className="text-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setIsEmailSignupModalOpen(true);
                // Add highlight effect to social icons
                const socialIcons = document.querySelectorAll('.social-icon');
                socialIcons.forEach(icon => {
                  icon.classList.add('social-highlight');
                  setTimeout(() => {
                    icon.classList.remove('social-highlight');
                  }, 2000);
                });
              }}
              className="bg-brand-accent text-text-primary px-6 py-3 rounded-lg text-lg font-medium hover:bg-brand-accent/90 transition-colors"
            >
              Join Our Mailing List
            </motion.button>
          </div>
        </div>
      </section>

      <Footer />
      
      {/* Modals */}
      <DonateModal 
        isOpen={isDonateModalOpen}
        onClose={() => setIsDonateModalOpen(false)}
      />
      
      <PartnerModal 
        isOpen={isPartnerModalOpen}
        onClose={() => setIsPartnerModalOpen(false)}
      />
      
      <EmailSignupModal 
        isOpen={isEmailSignupModalOpen}
        onClose={() => setIsEmailSignupModalOpen(false)}
      />

      <PointSubmissionModal
        isOpen={isPointSubmissionModalOpen}
        onClose={() => setIsPointSubmissionModalOpen(false)}
      />
    </>
  );
}
