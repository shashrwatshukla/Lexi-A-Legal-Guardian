"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function ComparativeCharts({ industryComparison, metadata }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const getComparisonValue = (comparison) => {
    if (comparison.includes('Shorter') || comparison.includes('Below')) return 30;
    if (comparison.includes('Average') || comparison.includes('At')) return 50;
    if (comparison.includes('Longer') || comparison.includes('Above')) return 80;
    return 50;
  };

  const getComparisonColor = (comparison) => {
    if (comparison.includes('favorable')) return 'from-green-500 to-emerald-500';
    if (comparison.includes('Balanced')) return 'from-blue-500 to-cyan-500';
    return 'from-yellow-500 to-orange-500';
  };

  const metrics = [
    {
      label: 'Contract Length',
      value: getComparisonValue(industryComparison?.contractLength || 'Average'),
      comparison: industryComparison?.contractLength || 'Average',
      yourValue: metadata?.pageCount || 5,
      industryAvg: 8
    },
    {
      label: 'Complexity',
      value: getComparisonValue(industryComparison?.complexity || 'At industry standard'),
      comparison: industryComparison?.complexity || 'At industry standard',
      yourValue: 65,
      industryAvg: 70
    },
    {
      label: 'Fairness',
      value: getComparisonValue(industryComparison?.fairness || 'Balanced'),
      comparison: industryComparison?.fairness || 'Balanced',
      yourValue: 75,
      industryAvg: 60
    }
  ];

  return (
    <div className="space-y-6">
      <h4 className="text-xl font-bold text-white mb-4">Industry Comparison</h4>
      
      {metrics.map((metric, index) => (
        <motion.div
          key={metric.label}
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: isVisible ? 1 : 0, x: 0 }}
          transition={{ delay: index * 0.2 }}
          className="space-y-2"
        >
          <div className="flex justify-between text-sm">
            <span className="text-gray-300 font-semibold">{metric.label}</span>
            <span className="text-gray-400">{metric.comparison}</span>
          </div>
          
          <div className="relative h-8 bg-gray-800 rounded-full overflow-hidden">
            {/* Industry average marker */}
            <div 
              className="absolute top-0 bottom-0 w-0.5 bg-gray-600 z-10"
              style={{ left: '50%' }}
            />
            
            {/* Your document bar */}
            <motion.div
              className={`absolute top-0 bottom-0 left-0 bg-gradient-to-r ${getComparisonColor(metric.comparison)} rounded-full`}
              initial={{ width: 0 }}
              animate={{ width: isVisible ? `${metric.value}%` : 0 }}
              transition={{ 
                delay: index * 0.2 + 0.3,
                duration: 1,
                ease: "easeOut"
              }}
            >
              <motion.div
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs font-semibold text-white"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.2 + 1 }}
              >
                Your Doc
              </motion.div>
            </motion.div>
          </div>
          
          <div className="flex justify-between text-xs text-gray-500">
            <span>Below Average</span>
            <span>Industry Standard</span>
            <span>Above Average</span>
          </div>
        </motion.div>
      ))}
    </div>
  );
}