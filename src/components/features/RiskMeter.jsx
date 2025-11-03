"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function RiskMeter({ score = 0, riskLevel = "Medium" }) {
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedScore(score);
    }, 100);
    return () => clearTimeout(timer);
  }, [score]);

  const getColorConfig = () => {
    if (animatedScore < 33) {
      return {
        gradient: "from-green-500 to-emerald-400",
        glow: "shadow-green-500/30",
        text: "text-green-400"
      };
    }
    if (animatedScore < 66) {
      return {
        gradient: "from-yellow-500 to-amber-400",
        glow: "shadow-yellow-500/30",
        text: "text-yellow-400"
      };
    }
    return {
      gradient: "from-red-500 to-rose-400",
      glow: "shadow-red-500/30",
      text: "text-red-400"
    };
  };

  const config = getColorConfig();
  const rotation = (animatedScore / 100) * 180 - 90;

  return (
    <div className="relative w-full max-w-2xl mx-auto py-12 px-8">
      {/* Main Container */}
      <div className="relative">
        
        {/* Zone Indicators - Left Side */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 flex flex-col gap-6">
          {/* Safe Zone - Green */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 2.5, duration: 0.6 }}
            className={`flex items-center gap-3 transition-all duration-300 ${
              animatedScore <= 33 ? 'scale-110' : 'opacity-50'
            }`}
          >
            <div className="relative">
              <div className="w-4 h-4 rounded-full bg-green-500 shadow-lg shadow-green-500/50" />
              {animatedScore <= 33 && (
                <motion.div
                  className="absolute inset-0 w-4 h-4 rounded-full bg-green-500"
                  animate={{ scale: [1, 1.5, 1], opacity: [0.8, 0, 0.8] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              )}
            </div>
            <span className="font-bold text-sm text-green-400 whitespace-nowrap">Safe Zone</span>
          </motion.div>

          {/* Warning Zone - Yellow */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 2.7, duration: 0.6 }}
            className={`flex items-center gap-3 transition-all duration-300 ${
              animatedScore > 33 && animatedScore <= 66 ? 'scale-110' : 'opacity-50'
            }`}
          >
            <div className="relative">
              <div className="w-4 h-4 rounded-full bg-yellow-500 shadow-lg shadow-yellow-500/50" />
              {animatedScore > 33 && animatedScore <= 66 && (
                <motion.div
                  className="absolute inset-0 w-4 h-4 rounded-full bg-yellow-500"
                  animate={{ scale: [1, 1.5, 1], opacity: [0.8, 0, 0.8] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              )}
            </div>
            <span className="font-bold text-sm text-yellow-400 whitespace-nowrap">Warning Zone</span>
          </motion.div>

          {/* Danger Zone - Red */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 2.9, duration: 0.6 }}
            className={`flex items-center gap-3 transition-all duration-300 ${
              animatedScore > 66 ? 'scale-110' : 'opacity-50'
            }`}
          >
            <div className="relative">
              <div className="w-4 h-4 rounded-full bg-red-500 shadow-lg shadow-red-500/50" />
              {animatedScore > 66 && (
                <motion.div
                  className="absolute inset-0 w-4 h-4 rounded-full bg-red-500"
                  animate={{ scale: [1, 1.5, 1], opacity: [0.8, 0, 0.8] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              )}
            </div>
            <span className="font-bold text-sm text-red-400 whitespace-nowrap">Danger Zone</span>
          </motion.div>
        </div>

        {/* Gauge Container */}
        <div className="relative w-full" style={{ paddingLeft: '140px', paddingRight: '40px' }}>
          <div className="relative aspect-[2/1] w-full pt-16 pb-4">
            
            {/* Background Glow Effect - Reduced */}
            <motion.div
              className={`absolute inset-0 bg-gradient-to-t ${config.gradient} opacity-10 blur-2xl rounded-full`}
              animate={{
                opacity: [0.05, 0.15, 0.05],
                scale: [0.95, 1.05, 0.95]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />

            {/* SVG Gauge */}
            <svg 
              className="absolute inset-0 w-full h-full overflow-visible" 
              viewBox="0 0 200 130"
              preserveAspectRatio="xMidYMid meet"
            >
              <defs>
                {/* Multi-color Gradient for Arc */}
                <linearGradient id="arcGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="1" />
                  <stop offset="33%" stopColor="#10b981" stopOpacity="1" />
                  <stop offset="33%" stopColor="#f59e0b" stopOpacity="1" />
                  <stop offset="66%" stopColor="#f59e0b" stopOpacity="1" />
                  <stop offset="66%" stopColor="#ef4444" stopOpacity="1" />
                  <stop offset="100%" stopColor="#ef4444" stopOpacity="1" />
                </linearGradient>

                {/* Subtle Glow Filter */}
                <filter id="glow">
                  <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                  <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>

              {/* Background Arc Track */}
              <path
                d="M 30 100 A 70 70 0 0 1 170 100"
                fill="none"
                stroke="#1e293b"
                strokeWidth="16"
                strokeLinecap="round"
              />

              {/* Colored Progress Arc */}
              <motion.path
                d="M 30 100 A 70 70 0 0 1 170 100"
                fill="none"
                stroke="url(#arcGradient)"
                strokeWidth="16"
                strokeLinecap="round"
                filter="url(#glow)"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: animatedScore / 100 }}
                transition={{ duration: 2.5, ease: "easeOut" }}
              />

              {/* Major Tick Marks */}
              {[0, 25, 50, 75, 100].map((tick) => {
                const angle = ((tick / 100) * 180 - 90) * (Math.PI / 180);
                const x1 = 100 + 62 * Math.cos(angle);
                const y1 = 100 + 62 * Math.sin(angle);
                const x2 = 100 + 70 * Math.cos(angle);
                const y2 = 100 + 70 * Math.sin(angle);
                
                return (
                  <motion.line
                    key={tick}
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke="#64748b"
                    strokeWidth="3"
                    strokeLinecap="round"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 + tick * 0.01 }}
                  />
                );
              })}

              {/* Labels */}
              <motion.text 
                x="30" 
                y="118" 
                fill="#10b981" 
                fontSize="12" 
                fontWeight="700" 
                textAnchor="middle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5 }}
              >
                Low
              </motion.text>

              <motion.text 
                x="100" 
                y="22" 
                fill="#f59e0b" 
                fontSize="14" 
                fontWeight="700" 
                textAnchor="middle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.6 }}
              >
                Medium
              </motion.text>

              <motion.text 
                x="170" 
                y="118" 
                fill="#ef4444" 
                fontSize="12" 
                fontWeight="700" 
                textAnchor="middle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.7 }}
              >
                High
              </motion.text>
            </svg>

            {/* Single White Needle - ONLY ONE LINE */}
            <div className="absolute inset-0 flex items-end justify-center" style={{ paddingBottom: '23%' }}>
              <motion.div
                className="relative origin-bottom"
                style={{ width: '4px', height: '38%' }}
                initial={{ rotate: -90 }}
                animate={{ rotate: rotation }}
                transition={{ 
                  duration: 2.5, 
                  ease: "easeOut",
                  type: "spring",
                  stiffness: 60,
                  damping: 15
                }}
              >
                {/* White Needle */}
                <div className="absolute inset-0 bg-white rounded-full shadow-xl">
                  {/* Needle Tip */}
                  <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-5 h-5 bg-white rounded-full shadow-2xl border-3 border-gray-700" />
                </div>
              </motion.div>
            </div>

            {/* Center Hub */}
            <div className="absolute left-1/2 -translate-x-1/2" style={{ bottom: '23%' }}>
              <motion.div
                className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 shadow-xl border-4 border-gray-800"
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Score Display Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2, duration: 0.8 }}
        className="text-center mt-12"
      >
        {/* Score Number */}
        <div className="relative inline-block mb-6">
          <motion.div
            className={`absolute inset-0 bg-gradient-to-br ${config.gradient} blur-2xl opacity-25`}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.2, 0.35, 0.2]
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          
          <motion.div
            className={`relative text-8xl font-black bg-gradient-to-br ${config.gradient} bg-clip-text text-transparent`}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 2.2, type: "spring", stiffness: 150 }}
          >
            {Math.round(animatedScore)}
          </motion.div>
        </div>

        {/* Risk Level Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 2.5 }}
          className={`inline-block px-8 py-3 rounded-full bg-gradient-to-r ${config.gradient}/20 border-2 ${config.text} font-bold text-lg backdrop-blur-sm shadow-lg`}
          style={{ borderColor: 'currentColor' }}
        >
          {riskLevel} Risk
        </motion.div>

        {/* Risk Description */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.8 }}
          className="mt-6 text-gray-400 text-base max-w-md mx-auto leading-relaxed"
        >
          {animatedScore < 33 && "✓ This contract shows favorable terms with minimal risk factors."}
          {animatedScore >= 33 && animatedScore < 66 && "⚠ Review recommended. Some clauses require attention."}
          {animatedScore >= 66 && "⚠ High risk detected. Professional legal review strongly recommended."}
        </motion.p>
      </motion.div>
    </div>
  );
}