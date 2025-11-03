"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function ComparativeCharts({ industryComparison, metadata }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const getComparisonValue = (comparison) => {
    if (!comparison) return 50;
    const lower = comparison.toLowerCase();
    if (lower.includes('shorter') || lower.includes('below') || lower.includes('less')) return 35;
    if (lower.includes('average') || lower.includes('standard') || lower.includes('at')) return 50;
    if (lower.includes('longer') || lower.includes('above') || lower.includes('more')) return 75;
    return 50;
  };

  const getComparisonColor = (comparison) => {
    if (!comparison) return 'from-blue-500 to-cyan-500';
    const lower = comparison.toLowerCase();
    if (lower.includes('favorable') || lower.includes('better')) return 'from-green-500 to-emerald-500';
    if (lower.includes('balanced') || lower.includes('average')) return 'from-blue-500 to-cyan-500';
    if (lower.includes('unfavorable') || lower.includes('worse')) return 'from-red-500 to-orange-500';
    return 'from-purple-500 to-pink-500';
  };

  const metrics = [
    {
      label: 'Contract Length',
      value: getComparisonValue(industryComparison?.contractLength),
      comparison: industryComparison?.contractLength || 'Average length',
      yourValue: metadata?.pageCount || 5,
      industryAvg: 8,
      unit: 'pages',
      icon: '📄'
    },
    {
      label: 'Complexity Score',
      value: getComparisonValue(industryComparison?.complexity),
      comparison: industryComparison?.complexity || 'Standard complexity',
      yourValue: 65,
      industryAvg: 70,
      unit: 'points',
      icon: '🧩'
    },
    {
      label: 'Fairness Rating',
      value: getComparisonValue(industryComparison?.fairness),
      comparison: industryComparison?.fairness || 'Balanced terms',
      yourValue: 75,
      industryAvg: 60,
      unit: '%',
      icon: '⚖️'
    },
    {
      label: 'Risk Level',
      value: 100 - getComparisonValue(industryComparison?.riskLevel),
      comparison: industryComparison?.riskLevel || 'Moderate risk',
      yourValue: 45,
      industryAvg: 50,
      unit: 'score',
      icon: '🎯'
    }
  ];

  return (
    <div className="space-y-6">
      {metrics.map((metric, index) => (
        <motion.div
          key={metric.label}
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: isVisible ? 1 : 0, x: 0 }}
          transition={{ delay: index * 0.15, type: "spring" }}
          className="space-y-3"
        >
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <motion.span 
                className="text-2xl"
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, delay: index * 0.5 }}
              >
                {metric.icon}
              </motion.span>
              <div>
                <h5 className="text-white font-bold">{metric.label}</h5>
                <p className="text-xs text-gray-500">{metric.comparison}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-400">You: <span className="font-bold text-white">{metric.yourValue}{metric.unit}</span></p>
              <p className="text-xs text-gray-500">Industry: {metric.industryAvg}{metric.unit}</p>
            </div>
          </div>
          
          {/* Comparison Bar */}
          <div className="relative">
            <div className="relative h-10 bg-gray-800/50 rounded-full overflow-hidden border border-gray-700/50">
              {/* Industry average marker */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.15 + 0.5 }}
                className="absolute top-0 bottom-0 w-1 bg-gray-500 z-10"
                style={{ left: '50%' }}
              >
                <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs text-gray-400 whitespace-nowrap">
                  Industry Avg
                </div>
              </motion.div>
              
              {/* Your value bar */}
              <motion.div
                className={`absolute top-0 bottom-0 left-0 bg-gradient-to-r ${getComparisonColor(metric.comparison)} rounded-full shadow-lg`}
                initial={{ width: 0 }}
                animate={{ width: isVisible ? `${metric.value}%` : 0 }}
                transition={{ 
                  delay: index * 0.15 + 0.3,
                  duration: 1,
                  ease: [0.4, 0, 0.2, 1]
                }}
              >
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.15 + 1 }}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white drop-shadow-lg">
                      {metric.value > 50 ? '↑' : metric.value < 50 ? '↓' : '→'}
                    </span>
                  </div>
                </motion.div>
              </motion.div>

              {/* Animated glow effect */}
              <motion.div
                className={`absolute top-0 bottom-0 left-0 bg-gradient-to-r ${getComparisonColor(metric.comparison)} opacity-30 blur-md`}
                initial={{ width: 0 }}
                animate={{ width: isVisible ? `${metric.value}%` : 0 }}
                transition={{ 
                  delay: index * 0.15 + 0.3,
                  duration: 1,
                  ease: [0.4, 0, 0.2, 1]
                }}
              />
            </div>
            
            {/* Scale markers */}
            <div className="flex justify-between mt-2 px-1">
              <span className="text-xs text-gray-600">Below</span>
              <span className="text-xs text-gray-600">Average</span>
              <span className="text-xs text-gray-600">Above</span>
            </div>
          </div>

          {/* Performance indicator */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.15 + 1.2 }}
            className="flex items-center gap-2"
          >
            {metric.value > 60 ? (
              <span className="text-xs text-green-400 flex items-center gap-1">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Above industry standard
              </span>
            ) : metric.value < 40 ? (
              <span className="text-xs text-yellow-400 flex items-center gap-1">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                Below industry standard
              </span>
            ) : (
              <span className="text-xs text-blue-400 flex items-center gap-1">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                </svg>
                At industry standard
              </span>
            )}
          </motion.div>
        </motion.div>
      ))}

      {/* Summary Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="mt-6 p-4 bg-gradient-to-r from-purple-900/30 to-blue-900/30 rounded-xl border border-purple-500/30"
      >
        <div className="flex items-start gap-3">
          <motion.span 
            className="text-2xl"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            📊
          </motion.span>
          <div>
            <h6 className="text-sm font-bold text-purple-400 mb-1">Industry Insight</h6>
            <p className="text-xs text-gray-400 leading-relaxed">
              Your contract performs {metrics.filter(m => m.value > 55).length} out of {metrics.length} metrics above industry average.
              {metrics.filter(m => m.value < 45).length > 0 && ` Consider reviewing ${metrics.filter(m => m.value < 45).length} area(s) that fall below standard.`}
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}