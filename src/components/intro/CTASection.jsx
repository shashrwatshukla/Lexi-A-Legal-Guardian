"use client";

import { useRef, useEffect } from 'react';
import { motion, useInView } from 'framer-motion';
import Link from 'next/link';

export default function CTASection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  // ✅ Preload auth page when CTA becomes visible
  useEffect(() => {
    if (isInView) {
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = '/auth';
      document.head.appendChild(link);
    }
  }, [isInView]);

  return (
    <section ref={ref} className="py-10 px-6">
      <div className="max-w-5xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          {/* Heading - EXTRA PADDING TO PREVENT CUTOFF */}
          <h2 
            className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-10 py-4 overflow-visible"
            style={{ 
              fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
              letterSpacing: '-0.04em',
              overflow: 'visible',
              wordWrap: 'break-word'
            }}
          >
            Ready to protect your{' '}
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              interests?
            </span>
          </h2>

          {/* Description */}
          <p 
            className="text-xl md:text-2xl text-white/80 mb-14 max-w-3xl mx-auto leading-relaxed"
            style={{ 
              fontFamily: 'Inter, system-ui, -apple-system, sans-serif'
            }}
          >
            Get instant AI-powered analysis for your legal documents.
            Start analyzing contracts in seconds.
          </p>

          {/* CTA Button - WITH ANIMATIONS */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="relative inline-block"
          >
            {/* Animated background glow */}
            <motion.div
              className="absolute -inset-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full opacity-0 blur-xl group-hover:opacity-75 transition-opacity duration-500"
              animate={{
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />

            {/* Button - ONLY CHANGED THIS PART */}
            <Link href="/auth" prefetch={true}>
              <motion.button
                whileHover={{ 
                  scale: 1.05,
                  boxShadow: "0 20px 60px rgba(255, 255, 255, 0.3)"
                }}
                whileTap={{ scale: 0.95 }}
                className="relative group px-16 py-6 bg-white text-black font-bold text-2xl rounded-full transition-all duration-300 shadow-2xl overflow-hidden"
                style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}
              >
                {/* Shimmer effect on hover */}
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-30 group-hover:animate-shimmer" />
                
                {/* Button text */}
                <span className="relative z-10">Start for Free</span>

                {/* Ripple effect */}
                <span className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-400 to-purple-400 opacity-0 group-hover:opacity-20 group-hover:animate-pulse" />
              </motion.button>
            </Link>
          </motion.div>
        </motion.div>
      </div>

      {/* Keyframes for shimmer animation */}
      <style jsx>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-100%) rotate(45deg);
          }
          100% {
            transform: translateX(100%) rotate(45deg);
          }
        }

        .group:hover .animate-shimmer {
          animation: shimmer 1.5s ease-in-out infinite;
        }
      `}</style>
    </section>
  );
}