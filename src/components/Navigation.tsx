import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Disclosure } from '@headlessui/react';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';

const navigation = [
  { name: 'Home', href: '#home' },
  { name: 'About', href: '#mission' },
  { name: 'Members', href: '#members' },
  { name: 'Partners', href: '#partners' },
  { name: 'Events', href: '#events' },
  { name: 'Support', href: '#support' },
  { name: 'Socials', href: '#socials' },
];

export default function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false);
  const { scrollY } = useScroll();
  
  // Transform values for 3D effect
  const scale = useTransform(scrollY, [0, 100], [1, 0.98]);
  const y = useTransform(scrollY, [0, 100], [0, -10]);
  const opacity = useTransform(scrollY, [0, 100], [1, 0.95]);
  const shadowOpacity = useTransform(scrollY, [0, 100], [0, 0.2]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="fixed w-full z-[9999] flex justify-center pt-4">
      <div className="container-narrow relative z-[9999]">
        <motion.div 
          style={{
            scale,
            y,
            opacity,
            boxShadow: shadowOpacity.get() > 0 
              ? `0 4px 6px -1px rgba(0, 0, 0, ${shadowOpacity.get()}), 
                 0 2px 4px -1px rgba(0, 0, 0, ${shadowOpacity.get() * 0.8})`
              : 'none',
            zIndex: 9999,
            position: 'relative'
          }}
          className={`rounded-2xl overflow-hidden transition-all duration-300 transform-gpu ${
            isScrolled 
              ? 'border-[2.5px] border-brand-primary backdrop-blur-sm bg-background-light/95' 
              : 'border border-brand-primary bg-transparent'
          }`}
        >
          <Disclosure as="nav" className="relative z-[9999]">
            {({ open }) => (
              <>
                <div className="px-4 sm:px-6">
                  <div className="flex h-16 items-center justify-between">
                    <div className="flex items-center">
                      <Link href="#home" className="flex items-center space-x-3">
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="relative w-10 h-10"
                        >
                          <Image
                            src="/logo.png"
                            alt="Austin STEM Buddies"
                            width={40}
                            height={40}
                            className="rounded-full"
                          />
                        </motion.div>
                        <span className="font-freckle text-xl text-brand-primary">Austin STEM Buddies</span>
                      </Link>
                    </div>
                    
                    {/* Desktop navigation */}
                    <div className="hidden md:flex md:items-center md:space-x-8 md:ml-12">
                      {navigation.map((item) => (
                        <Link
                          key={item.name}
                          href={item.href}
                          className="relative py-2 text-sm font-medium text-text-secondary hover:text-brand-primary transition-colors duration-200 after:absolute after:left-0 after:bottom-0 after:h-0.5 after:w-0 after:bg-brand-primary after:transition-all hover:after:w-full"
                        >
                          {item.name}
                        </Link>
                      ))}
                    </div>

                    {/* Mobile menu button */}
                    <div className="flex items-center md:hidden">
                      <Disclosure.Button className="inline-flex items-center justify-center rounded-md p-2 text-text-secondary hover:text-brand-primary hover:bg-background-accent transition-colors">
                        <span className="sr-only">Open main menu</span>
                        {open ? (
                          <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                        ) : (
                          <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                        )}
                      </Disclosure.Button>
                    </div>
                  </div>
                </div>

                {/* Mobile menu panel */}
                <Disclosure.Panel className="md:hidden bg-background-light border-t border-border-light">
                  <div className="px-4 py-4 space-y-2 max-h-[60vh] overflow-y-auto">
                    {navigation.map((item) => (
                      <Disclosure.Button
                        key={item.name}
                        as={Link}
                        href={item.href}
                        className="block w-full px-4 py-2 text-base font-medium text-text-secondary hover:text-brand-primary hover:bg-background-accent rounded-lg transition-colors"
                      >
                        {item.name}
                      </Disclosure.Button>
                    ))}
                  </div>
                </Disclosure.Panel>
              </>
            )}
          </Disclosure>
        </motion.div>
      </div>
    </div>
  );
} 