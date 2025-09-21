"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function FinalVerdictBar({ finalVerdict, flaggedClauses = [] }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Calculate segments based on clause severity
  const criticalCount = flaggedClauses.filter(c => c.severity === 'critical').length;
  const warningCount = flaggedClauses.filter(c => c.severity === 'warning').length;
  const safeCount = flaggedClauses.filter(c => c.severity === 'safe').length;
  const total = criticalCount + warningCount + safeCount || 1;

  const segments = [
    { 
      label: 'Critical', 
      count: criticalCount, 
      percentage: (criticalCount / total) * 100,
      color: 'bg-red-500',
      icon: '🔴'
    },
    { 
      label: 'Caution', 
      count: warningCount, 
      percentage: (warningCount / total) * 100,
      color: 'bg-yellow-500',
      icon: '🟠'
    },
    { 
      label: 'Safe', 
      count: safeCount, 
      percentage: (safeCount / total) * 100,
      color: 'bg-green-500',
      icon: '🟢'
    }
  ];

  const getRecommendationColor = (recommendation) => {
    if (recommendation?.includes('Sign as-is')) return 'text-green-400';
    if (recommendation?.includes('Negotiate')) return 'text-yellow-400';
    if (recommendation?.includes('Avoid') || recommendation?.includes('legal counsel')) return 'text-red-400';
    return 'text-gray-400';
  };

  const getRecommendationIcon = (recommendation) => {
    if (recommendation?.includes('Sign as-is')) return '✅';
    if (recommendation?.includes('Negotiate')) return '⚠️';
    if (recommendation?.includes('Avoid')) return '❌';
    if (recommendation?.includes('legal counsel')) return '⚖️';
    return '📋';
  };

  return (
    <div className="space-y-6">
      {/* Verdict Header */}
      <div className="text-center">
        <motion.h3
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl font-bold text-white mb-2"
        >
          Final Verdict
        </motion.h3>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex items-center justify-center gap-3"
        >
          <span className="text-4xl">{getRecommendationIcon(finalVerdict?.recommendation)}</span>
          <span className={`text-xl font-semibold ${getRecommendationColor(finalVerdict?.recommendation)}`}>
            {finalVerdict?.recommendation || 'Review Carefully'}
          </span>
        </motion.div>
        {finalVerdict?.confidence && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-sm text-gray-400 mt-2"
          >
            Confidence: {finalVerdict.confidence}%
          </motion.p>
        )}
      </div>

      {/* Health Bar */}
      <div className="relative h-12 bg-gray-800 rounded-full overflow-hidden">
        <div className="absolute inset-0 flex">
          {segments.map((segment, index) => {
            let delay = 0;
            for (let i = 0; i < index; i++) {
              delay += segments[i].percentage / 100 * 0.5;
            }
            
            return (
              <motion.div
                key={segment.label}
                className={`${segment.color} relative`}
                initial={{ width: 0 }}
                animate={{ width: isVisible ? `${segment.percentage}%` : 0 }}
                transition={{ 
                  delay: delay,
                  duration: segment.percentage / 100 * 0.5,
                  ease: "easeOut"
                }}
              >
                {segment.percentage > 10 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: delay + 0.3 }}
                    className="absolute inset-0 flex items-center justify-center text-white font-semibold text-sm"
                  >
                    {segment.count}
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex justify-center gap-6 text-sm">
        {segments.map((segment, index) => (
          <motion.div
            key={segment.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 + index * 0.1 }}
            className="flex items-center gap-2"
          >
            <span>{segment.icon}</span>
            <span className="text-gray-400">{segment.label} ({segment.count})</span>
          </motion.div>
        ))}
      </div>

      {/* Main Concerns */}
      {finalVerdict?.mainConcerns && finalVerdict.mainConcerns.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="bg-gray-900/50 rounded-xl p-4 border border-gray-700"
        >
          <h4 className="text-sm font-semibold text-gray-400 mb-2">Top Concerns:</h4>
          <ul className="space-y-1">
            {finalVerdict.mainConcerns.map((concern, index) => (
              <li key={index} className="text-gray-300 text-sm flex items-start gap-2">
                <span className="text-red-400 mt-0.5">•</span>
                <span>{concern}</span>
              </li>
            ))}
          </ul>
        </motion.div>
      )}
    </div>
  );
}