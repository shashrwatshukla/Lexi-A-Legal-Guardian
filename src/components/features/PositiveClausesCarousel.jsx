"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

export default function PositiveClausesCarousel({ positiveProvisions = [] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (positiveProvisions.length > 1 && !isPaused) {
      const interval = setInterval(() => {
        setDirection(1);
        setCurrentIndex((prev) => (prev + 1) % positiveProvisions.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [positiveProvisions.length, isPaused]);

  if (positiveProvisions.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-12 border border-gray-700/50 text-center"
      >
        <motion.span 
          className="text-6xl block mb-4"
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          🔍
        </motion.span>
        <p className="text-gray-400 text-lg">No positive provisions identified</p>
        <p className="text-gray-500 text-sm mt-2">This doesn't necessarily mean the contract is unfavorable</p>
      </motion.div>
    );
  }

  const handlePrev = () => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + positiveProvisions.length) % positiveProvisions.length);
  };

  const handleNext = () => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % positiveProvisions.length);
  };

  const variants = {
    enter: (direction) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
      scale: 0.8,
      rotateY: direction > 0 ? 45 : -45
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
      scale: 1,
      rotateY: 0
    },
    exit: (direction) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0,
      scale: 0.8,
      rotateY: direction < 0 ? 45 : -45
    })
  };

  return (
    <div className="relative" onMouseEnter={() => setIsPaused(true)} onMouseLeave={() => setIsPaused(false)}>
      {/* Main carousel container */}
      <div className="relative overflow-hidden rounded-3xl">
        {/* Background gradient animation */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-green-900/30 via-emerald-900/30 to-teal-900/30"
          animate={{
            backgroundPosition: ['0% 0%', '100% 100%'],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            repeatType: "reverse"
          }}
        />

        {/* Border glow effect */}
        <div className="absolute inset-0 rounded-3xl border-2 border-green-500/30 shadow-2xl shadow-green-500/20" />

        {/* Content */}
        <div className="relative min-h-[300px] p-8 md:p-12">
          <AnimatePresence initial={false} custom={direction} mode="wait">
            <motion.div
              key={currentIndex}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: "spring", stiffness: 300, damping: 30 },
                opacity: { duration: 0.3 },
                scale: { duration: 0.3 },
                rotateY: { duration: 0.5 }
              }}
              className="space-y-6"
            >
              {/* Header */}
              <div className="flex items-start gap-4">
                <motion.div
                  animate={{ 
                    scale: [1, 1.2, 1],
                    rotate: [0, 10, -10, 0]
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="text-5xl"
                >
                  ✅
                </motion.div>
                
                <div className="flex-1">
                  <motion.span
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="inline-block px-4 py-1 bg-green-500/20 border border-green-500/50 rounded-full text-xs font-bold text-green-400 mb-3"
                  >
                    Protective Clause
                  </motion.span>
                  
                  <motion.h4
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-2xl md:text-3xl font-bold text-white mb-4 leading-tight"
                  >
                    {positiveProvisions[currentIndex].title}
                  </motion.h4>
                </div>
              </div>

              {/* Benefit description */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-black/30 backdrop-blur-sm rounded-2xl p-6 border border-green-500/20"
              >
                <div className="flex items-start gap-3 mb-3">
                  <span className="text-2xl">💡</span>
                  <h5 className="text-sm font-bold text-green-400 uppercase tracking-wider">Why This Helps You</h5>
                </div>
                <p className="text-gray-300 text-lg leading-relaxed">
                  {positiveProvisions[currentIndex].benefit}
                </p>
              </motion.div>

              {/* Location */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="flex items-center gap-2 text-sm text-gray-500"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>Found in: {positiveProvisions[currentIndex].location}</span>
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Navigation controls */}
      {positiveProvisions.length > 1 && (
        <>
          {/* Previous/Next buttons */}
          <div className="absolute top-1/2 left-0 right-0 transform -translate-y-1/2 flex justify-between px-4 pointer-events-none">
            <motion.button
              whileHover={{ scale: 1.1, x: -5 }}
              whileTap={{ scale: 0.9 }}
              onClick={handlePrev}
              className="pointer-events-auto w-12 h-12 bg-black/80 hover:bg-black/90 backdrop-blur-xl rounded-full border-2 border-green-500/50 hover:border-green-400 transition-all duration-300 flex items-center justify-center text-white shadow-2xl group"
            >
              <svg className="w-6 h-6 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
              </svg>
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.1, x: 5 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleNext}
              className="pointer-events-auto w-12 h-12 bg-black/80 hover:bg-black/90 backdrop-blur-xl rounded-full border-2 border-green-500/50 hover:border-green-400 transition-all duration-300 flex items-center justify-center text-white shadow-2xl group"
            >
              <svg className="w-6 h-6 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
              </svg>
            </motion.button>
          </div>

          {/* Indicators */}
          <div className="flex justify-center gap-3 mt-6">
            {positiveProvisions.map((_, index) => (
              <motion.button
                key={index}
                onClick={() => {
                  setDirection(index > currentIndex ? 1 : -1);
                  setCurrentIndex(index);
                }}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
                className={`transition-all duration-300 rounded-full ${
                  index === currentIndex
                    ? 'w-12 h-3 bg-gradient-to-r from-green-400 to-emerald-500 shadow-lg shadow-green-500/50'
                    : 'w-3 h-3 bg-gray-600 hover:bg-gray-500'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>

          {/* Counter */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center mt-4"
          >
            <span className="text-sm text-gray-400 font-medium">
              {currentIndex + 1} of {positiveProvisions.length} Protective Clauses
            </span>
          </motion.div>

          {/* Auto-play indicator */}
          {!isPaused && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-center gap-2 mt-3 text-xs text-gray-500"
            >
                            <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="w-3 h-3"
              >
                <svg fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                </svg>
              </motion.div>
              <span>Auto-playing</span>
            </motion.div>
          )}
        </>
      )}
    </div>
  );
}