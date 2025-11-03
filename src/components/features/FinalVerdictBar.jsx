"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function FinalVerdictBar({ finalVerdict, flaggedClauses = [] }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

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
      gradient: 'from-red-600 to-red-500',
      icon: '🔴',
      textColor: 'text-red-400'
    },
    { 
      label: 'Caution', 
      count: warningCount, 
      percentage: (warningCount / total) * 100,
      color: 'bg-yellow-500',
      gradient: 'from-yellow-600 to-yellow-500',
      icon: '🟡',
      textColor: 'text-yellow-400'
    },
    { 
      label: 'Safe', 
      count: safeCount, 
      percentage: (safeCount / total) * 100,
      color: 'bg-green-500',
      gradient: 'from-green-600 to-green-500',
      icon: '🟢',
      textColor: 'text-green-400'
    }
  ];

  const getRecommendationConfig = (recommendation) => {
    const recLower = recommendation?.toLowerCase() || '';
    
    if (recLower.includes('sign as-is') || recLower.includes('proceed')) {
      return {
        color: 'text-green-400',
        bg: 'from-green-900/30 to-emerald-900/30',
        border: 'border-green-500/30',
        icon: '✅',
        emoji: '✓'
      };
    }
    if (recLower.includes('negotiate') || recLower.includes('review')) {
      return {
        color: 'text-yellow-400',
        bg: 'from-yellow-900/30 to-orange-900/30',
        border: 'border-yellow-500/30',
        icon: '⚠️',
        emoji: '⚠️'
      };
    }
    if (recLower.includes('avoid') || recLower.includes('reject')) {
      return {
        color: 'text-red-400',
        bg: 'from-red-900/30 to-orange-900/30',
        border: 'border-red-500/30',
        icon: '❌',
        emoji: '✕'
      };
    }
    if (recLower.includes('legal counsel') || recLower.includes('attorney')) {
      return {
        color: 'text-purple-400',
        bg: 'from-purple-900/30 to-indigo-900/30',
        border: 'border-purple-500/30',
        icon: '⚖️',
        emoji: '⚖️'
      };
    }
    
    return {
      color: 'text-blue-400',
      bg: 'from-blue-900/30 to-cyan-900/30',
      border: 'border-blue-500/30',
      icon: '📋',
      emoji: '📋'
    };
  };

  const config = getRecommendationConfig(finalVerdict?.recommendation);

  return (
    <div className="space-y-6">
      {/* Compact Verdict Header */}
      <div className="flex items-center justify-between">
        {/* Left side - Verdict */}
        <div className="flex items-center gap-4">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
            className={`relative p-4 bg-gradient-to-br ${config.bg} rounded-2xl border ${config.border}`}
          >
            <motion.span 
              className="text-3xl block"
              animate={{ 
                scale: [1, 1.1, 1]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {config.emoji}
            </motion.span>
          </motion.div>
          
          <div>
            <h3 className="text-lg font-bold text-gray-400 mb-1">Final Verdict</h3>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="flex items-center gap-2"
            >
              <span className={`text-xl font-bold ${config.color}`}>
                {finalVerdict?.recommendation || 'Review Carefully'}
              </span>
            </motion.div>
          </div>
        </div>

                {/* Right side - Confidence */}
        {finalVerdict?.confidence && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="flex items-center gap-3"
          >
            <div className="text-right">
              <p className="text-xs text-gray-500 mb-1">AI Confidence</p>
              <p className="text-lg font-bold text-white">{finalVerdict.confidence}%</p>
            </div>
            <div className="w-16 h-16 relative">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="32"
                  cy="32"
                  r="28"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                  className="text-gray-700"
                />
                <motion.circle
                  cx="32"
                  cy="32"
                  r="28"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 28}`}
                  initial={{ strokeDashoffset: 2 * Math.PI * 28 }}
                  animate={{ strokeDashoffset: 2 * Math.PI * 28 * (1 - finalVerdict.confidence / 100) }}
                  transition={{ duration: 1, delay: 0.5 }}
                  className={config.color}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs font-bold text-white">{finalVerdict.confidence}</span>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Health Bar */}
      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-gray-400 flex items-center gap-2">
          <span>📊</span>
          Risk Distribution
        </h4>
        
        <div className="relative h-16 bg-gray-800/50 rounded-xl overflow-hidden border border-gray-700/50 shadow-inner">
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="w-full h-full" style={{
              backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 10px, rgba(255,255,255,0.1) 10px, rgba(255,255,255,0.1) 11px)'
            }} />
          </div>

          {/* Segments */}
          <div className="absolute inset-0 flex">
            {segments.map((segment, index) => {
              let delay = 0;
              for (let i = 0; i < index; i++) {
                delay += (segments[i].percentage / 100) * 0.8;
              }
              
              if (segment.percentage === 0) return null;
              
              return (
                <motion.div
                  key={segment.label}
                  className={`relative bg-gradient-to-r ${segment.gradient} border-r border-gray-900/50 last:border-r-0 group cursor-pointer`}
                  initial={{ width: 0 }}
                  animate={{ width: isVisible ? `${segment.percentage}%` : 0 }}
                  transition={{ 
                    delay: delay,
                    duration: (segment.percentage / 100) * 0.8,
                    ease: [0.4, 0, 0.2, 1]
                  }}
                  whileHover={{ filter: 'brightness(1.2)' }}
                >
                  {/* Shimmer effect */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                    animate={{ x: ['-200%', '200%'] }}
                    transition={{ 
                      duration: 2, 
                      repeat: Infinity, 
                      ease: "linear",
                      delay: delay 
                    }}
                  />

                  {/* Count display */}
                  {segment.percentage > 8 && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: delay + 0.3, type: "spring" }}
                      className="absolute inset-0 flex flex-col items-center justify-center text-white font-bold"
                    >
                      <span className="text-xl">{segment.icon}</span>
                      <span className="text-lg">{segment.count}</span>
                    </motion.div>
                  )}

                  {/* Tooltip on hover */}
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50">
                    <div className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-xs whitespace-nowrap shadow-xl">
                      <p className="font-semibold text-white">{segment.label}</p>
                      <p className="text-gray-400">{segment.count} clause{segment.count !== 1 ? 's' : ''} ({segment.percentage.toFixed(0)}%)</p>
                    </div>
                    <div className="w-2 h-2 bg-gray-900 border-b border-r border-gray-700 transform rotate-45 absolute -bottom-1 left-1/2 -translate-x-1/2" />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap justify-center gap-3">
          {segments.map((segment, index) => (
            <motion.div
              key={segment.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 + index * 0.1 }}
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-2 bg-gray-800/50 rounded-lg px-3 py-1.5 border border-gray-700/50 cursor-pointer hover:border-gray-600/50 transition-all duration-300"
            >
              <div className={`w-3 h-3 ${segment.color} rounded-full shadow-lg`} />
              <div className="text-xs">
                <span className="text-gray-300 font-medium">{segment.label}</span>
                <span className={`ml-1.5 font-bold ${segment.textColor}`}>
                  {segment.count}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Main Concerns */}
      {finalVerdict?.mainConcerns && finalVerdict.mainConcerns.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="space-y-3"
        >
          <h4 className="text-sm font-semibold text-gray-400 flex items-center gap-2">
            <motion.span
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              ⚠️
            </motion.span>
            Top Concerns
          </h4>
          
          <div className="grid md:grid-cols-2 gap-3">
            {finalVerdict.mainConcerns.map((concern, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.1 + index * 0.1 }}
                whileHover={{ scale: 1.02, x: 5 }}
                className="group relative"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-red-600/10 to-orange-600/10 rounded-lg blur-sm group-hover:blur-md transition-all duration-300" />
                
                <div className="relative bg-gray-900/70 backdrop-blur-sm rounded-lg p-3 border border-red-500/20 hover:border-red-500/40 transition-all duration-300">
                  <div className="flex items-start gap-2">
                    <motion.span 
                      className="text-lg flex-shrink-0"
                      animate={{ rotate: [0, -10, 10, 0] }}
                      transition={{ duration: 2, repeat: Infinity, delay: index * 0.3 }}
                    >
                      🚩
                    </motion.span>
                    <p className="text-gray-300 text-xs leading-relaxed flex-1">{concern}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Action Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.3 }}
        className={`relative overflow-hidden rounded-xl border ${config.border}`}
      >
        <div className={`absolute inset-0 bg-gradient-to-r ${config.bg}`} />
        
        <div className="relative p-4">
          <div className="flex items-start gap-3">
            <motion.span 
              className="text-2xl"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              💡
            </motion.span>
            <div className="flex-1">
              <h5 className="text-sm font-bold text-white mb-2">Recommended Next Steps</h5>
              <p className="text-gray-300 text-xs leading-relaxed">
                {criticalCount > 0 && 
                  `We've identified ${criticalCount} critical issue${criticalCount !== 1 ? 's' : ''} that require immediate attention. `
                }
                {warningCount > 0 && 
                  `There are ${warningCount} clause${warningCount !== 1 ? 's' : ''} that need careful review. `
                }
                {safeCount > 0 && 
                  `${safeCount} clause${safeCount !== 1 ? 's are' : ' is'} generally favorable. `
                }
                {finalVerdict?.recommendation || 'Consult with legal counsel before proceeding.'}
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}