"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

export default function PositiveClausesCarousel({ positiveProvisions = [] }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (positiveProvisions.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % positiveProvisions.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [positiveProvisions.length]);

  if (positiveProvisions.length === 0) {
    return (
      <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-700">
        <p className="text-gray-400 text-center">No positive provisions identified</p>
      </div>
    );
  }

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + positiveProvisions.length) % positiveProvisions.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % positiveProvisions.length);
  };

  return (
    <div className="relative">
      <div className="overflow-hidden rounded-xl bg-gradient-to-br from-green-900/20 to-emerald-900/20 border border-green-500/30 p-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ x: 300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="space-y-3"
          >
            <div className="flex items-start gap-3">
              <span className="text-3xl">✅</span>
              <div className="flex-1">
                <h4 className="text-lg font-semibold text-green-400 mb-2">
                  {positiveProvisions[currentIndex].title}
                </h4>
                <p className="text-gray-300">
                  {positiveProvisions[currentIndex].benefit}
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  📍 {positiveProvisions[currentIndex].location}
                </p>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation */}
      {positiveProvisions.length > 1 && (
        <>
          <button
            onClick={handlePrev}
            className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 rounded-full p-2 transition-colors"
          >
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={handleNext}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 rounded-full p-2 transition-colors"
          >
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* Indicators */}
          <div className="flex justify-center gap-2 mt-4">
            {positiveProvisions.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentIndex ? 'bg-green-400' : 'bg-gray-600'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}