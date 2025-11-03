"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../lib/firebase';
import { logout } from '../../lib/auth';
import Link from 'next/link';

export default function Navbar({ router }) {
  const [scrolled, setScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser && currentUser.emailVerified) {
        setIsLoggedIn(true);
        setUser({
          name: currentUser.displayName || 'User',
          email: currentUser.email,
          photoURL: currentUser.photoURL
        });
      } else {
        setIsLoggedIn(false);
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      setIsLoggedIn(false);
      setUser(null);
      setActiveDropdown(null);
      router.push('/intro');
    } catch (error) {
      console.error('Logout error:', error);
      alert('Failed to logout. Please try again.');
    }
  };

  const handleDashboard = () => {
    router.push('/dashboard');
    setActiveDropdown(null);
  };

  const handleLogoClick = () => {
    router.push('/intro');
  };

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/5 backdrop-blur-2xl border-b border-white/10 shadow-2xl'
          : 'bg-white/[0.02] backdrop-blur-xl'
      }`}
      style={{
        backdropFilter: scrolled ? 'blur(20px) saturate(180%)' : 'blur(12px) saturate(150%)',
        WebkitBackdropFilter: scrolled ? 'blur(20px) saturate(180%)' : 'blur(12px) saturate(150%)',
        backgroundColor: scrolled ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.02)',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2 sm:py-3">
        <div className="flex items-center justify-between">
          
          <div
            className="flex items-center gap-2 sm:gap-3 cursor-pointer group"
            onClick={handleLogoClick}
          >
            <div className="w-8 h-8 sm:w-10 sm:h-10 relative group-hover:scale-110 transition-transform duration-300">
              <img
                src="/logo.png"
                alt="Lexi Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <span 
              className="text-white text-xl sm:text-2xl font-black group-hover:text-white/80 transition-colors duration-300"
              style={{ 
                fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
                letterSpacing: '-0.02em'
              }}
            >
              Lexi
            </span>
          </div>

          <div className="hidden md:flex items-center gap-6 lg:gap-8">
            
            <div
              className="relative"
              onMouseEnter={() => setActiveDropdown('features')}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              <button className="text-white/70 hover:text-white transition-colors duration-200 font-medium text-sm flex items-center gap-1">
                Features
                <svg
                  className={`w-4 h-4 transition-transform duration-200 ${
                    activeDropdown === 'features' ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              <AnimatePresence>
                {activeDropdown === 'features' && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-full left-0 mt-2 w-64 bg-black/90 backdrop-blur-2xl border border-white/20 rounded-2xl p-2 shadow-2xl"
                    style={{
                      backdropFilter: 'blur(20px) saturate(180%)',
                      WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                      backgroundColor: 'rgba(0, 0, 0, 0.95)',
                    }}
                  >
                    {[
                      { name: 'Contract Analyzer', href: '/home', desc: 'AI-powered document analysis' },
                      { name: 'Document Drafter', href: '/drafter', desc: 'Create legal documents' },
                    
                    ].map((item, idx) => (
                      <div
                        key={idx}
                        onClick={() => {
                          router.push(isLoggedIn ? item.href : '/auth');
                          setActiveDropdown(null);
                        }}
                        className="p-3 rounded-xl hover:bg-white/10 cursor-pointer transition-all duration-200 group"
                      >
                        <div className="font-semibold text-white group-hover:text-blue-400 transition-colors text-sm">
                          {item.name}
                        </div>
                        <div className="text-xs text-white/50 mt-1">{item.desc}</div>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button
              onClick={() => {
                const section = document.getElementById('how-it-works');
                section?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="text-white/70 hover:text-white transition-colors duration-200 font-medium text-sm"
            >
              How It Works
            </button>  
            <button
              onClick={() => router.push('/FooterComponents/about')}
              className="text-white/70 hover:text-white transition-colors duration-200 font-medium text-sm"
            >
              About
            </button>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            {!isLoggedIn ? (
              <>
                <button
                  onClick={() => router.push('/auth')}
                  className="text-white/70 hover:text-white transition-colors duration-200 font-medium text-xs sm:text-sm px-2 sm:px-0"
                >
                  Sign In
                </button>

                <button
                  onClick={() => router.push('/auth')}
                  className="px-3 sm:px-6 py-1.5 sm:py-2.5 bg-white text-black font-bold rounded-full hover:bg-gray-200 transition-all duration-200 hover:scale-[1.02] text-xs sm:text-sm shadow-lg"
                  style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}
                >
                  Start for Free
                </button>
              </>
            ) : (
              <div
                className="relative"
                onMouseEnter={() => setActiveDropdown('profile')}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <button className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 bg-white/10 hover:bg-white/20 rounded-full transition-all duration-200 border border-white/20">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span className="text-white text-xs sm:text-sm font-medium hidden sm:block">
                    {user?.name || 'Profile'}
                  </span>
                  <svg
                    className={`w-3 h-3 sm:w-4 sm:h-4 text-white/70 transition-transform duration-200 ${
                      activeDropdown === 'profile' ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                <AnimatePresence>
                  {activeDropdown === 'profile' && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute top-full right-0 mt-2 w-48 bg-black/90 backdrop-blur-2xl border border-white/20 rounded-2xl p-2 shadow-2xl"
                      style={{
                        backdropFilter: 'blur(20px) saturate(180%)',
                        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                        backgroundColor: 'rgba(0, 0, 0, 0.95)',
                      }}
                    >
                      <div
                        onClick={handleDashboard}
                        className="p-3 rounded-xl hover:bg-white/10 cursor-pointer transition-all duration-200 group flex items-center gap-3"
                      >
                        <svg className="w-5 h-5 text-white/70 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                        </svg>
                        <span className="font-semibold text-white text-sm">Dashboard</span>
                      </div>

                      <div className="border-t border-white/10 my-1" />

                      <div
                        onClick={handleLogout}
                        className="p-3 rounded-xl hover:bg-red-500/20 cursor-pointer transition-all duration-200 group flex items-center gap-3"
                      >
                        <svg className="w-5 h-5 text-white/70 group-hover:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        <span className="font-semibold text-white group-hover:text-red-400 text-sm">Logout</span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.nav>
  );
}