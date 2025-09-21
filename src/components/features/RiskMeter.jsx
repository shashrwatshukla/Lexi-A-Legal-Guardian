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

  const getColor = () => {
    if (animatedScore < 33) return "#10b981"; 
    if (animatedScore < 66) return "#f59e0b"; 
    return "#ef4444"; 
  };

  const rotation = (animatedScore / 100) * 180 - 90;

  return (
    <div className="relative w-64 h-32 mx-auto">
      {/* Gauge background */}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 200 100">
        <path
          d="M 20 80 A 60 60 0 0 1 180 80"
          fill="none"
          stroke="#374151"
          strokeWidth="20"
          strokeLinecap="round"
        />
        <motion.path
          d="M 20 80 A 60 60 0 0 1 180 80"
          fill="none"
          stroke={getColor()}
          strokeWidth="20"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: animatedScore / 100 }}
          transition={{ duration: 2, ease: "easeInOut" }}
        />
      </svg>

      {/* Needle */}
      <motion.div
        className="absolute left-1/2 bottom-0 w-1 h-16 bg-white origin-bottom"
        initial={{ rotate: -90 }}
        animate={{ rotate: rotation }}
        transition={{ duration: 2, ease: "easeInOut", type: "spring", bounce: 0.4 }}
        style={{ transformOrigin: "center bottom" }}
      />

      {/* Center dot */}
      <div className="absolute left-1/2 bottom-0 w-4 h-4 bg-white rounded-full transform -translate-x-1/2 translate-y-1/2" />

      {/* Score display */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        <div className="text-center mt-8">
          <motion.div
            className="text-4xl font-bold"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 1.5, type: "spring" }}
            style={{ color: getColor() }}
          >
            {Math.round(animatedScore)}
          </motion.div>
          <div className="text-sm text-gray-400">{riskLevel} Risk</div>
        </div>
      </motion.div>
    </div>
  );
}