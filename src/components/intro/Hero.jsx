"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext'; // <-- Import the correct hook

export default function Hero({ router }) {
  const [badgeText, setBadgeText] = useState(0);
  const { user } = useAuth(); // <-- Get the REAL user object from our AuthContext

  const badgeTexts = [
    'Now with AI Chatbot',
    'AI-Powered Contract Analysis'
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setBadgeText((prev) => (prev + 1) % badgeTexts.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [badgeTexts.length]); // Added dependency for safety

  return (
    <section className="min-h-screen flex items-center justify-center px-4 pt-[4.75rem] pb-2 will-change-transform">
      <div className="max-w-6xl mx-auto text-center transform-gpu">
        {/* Animated Badge - Optimized for performance */}
        <div className="inline-block mb-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={badgeText}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
              style={{
                backfaceVisibility: "hidden",
                WebkitBackfaceVisibility: "hidden",
                transform: "translateZ(0)",
                WebkitTransform: "translateZ(0)"
              }}
              className="px-4 py-2 bg-cyan-500/10 rounded-full transform-gpu"
            >
              <span className="text-sm font-semibold text-cyan-400">
                {badgeTexts[badgeText]}
              </span>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Main Title */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ 
            duration: 0.8, 
            delay: 0.2, 
            ease: [0.4, 0, 0.2, 1],
            willChange: "transform, opacity"
          }}
          className="mb-3 transform-gpu overflow-visible py-4"
          style={{ 
            fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
            fontWeight: 700,
            letterSpacing: '-0.04em',
            lineHeight: '1.1',
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            transform: "translateZ(0)",
            WebkitTransform: "translateZ(0)"
          }}
        >
          <motion.div 
            className="text-[clamp(3rem,8vw,6rem)] text-white"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            Build <span className="text-blue-400">better</span>
          </motion.div>
          <motion.div 
            className="text-[clamp(3rem,8vw,6rem)] text-white"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            contracts, <span className="text-cyan-400">faster</span>
          </motion.div>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="text-lg md:text-xl text-white/90 mb-2 font-normal max-w-4xl mx-auto leading-relaxed"
          style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}
        >
          The AI-powered platform transforming how professionals analyze and understand legal documents.
        </motion.p>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1 }}
          className="text-sm md:text-base text-white/70 mb-4 max-w-3xl mx-auto leading-relaxed"
          style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}
        >
          Upload any contract and get instant AI-powered insights. Understand risks, 
          negotiate better terms, and protect your interests before you sign.
        </motion.p>

        {/* CTA Buttons - FIXED WITH RELIABLE AUTH CHECK */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.2 }}
          className="flex flex-col sm:flex-row gap-3 justify-center items-center"
        >
          <button
            onClick={() => {
              // If `user` object exists, they are logged in. Otherwise, they are not.
              router.push(user ? '/home' : '/auth');
            }}
            className="group px-8 py-4 bg-white text-black font-bold rounded-full hover:bg-gray-200 transition-all duration-200 hover:scale-[1.02] text-base shadow-lg hover:shadow-xl"
            style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}
          >
            <span className="flex items-center gap-2">
              Analyze Contract
              <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </span>
          </button>

          <button
            onClick={() => {
              // Same reliable check here.
              router.push(user ? '/drafter' : '/auth');   
            }}
            className="px-8 py-4 bg-transparent border-2 border-white/30 text-white font-bold rounded-full hover:bg-white/10 hover:border-white/50 transition-all duration-200 hover:scale-[1.02] text-base"
            style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}
          >
            Draft Document
          </button>
        </motion.div>
      </div>
    </section>
  );
}