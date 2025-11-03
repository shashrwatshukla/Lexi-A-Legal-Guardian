"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

export default function RiskRadarChart({ riskCategories }) {
  const [isVisible, setIsVisible] = useState(false);
  const [hoveredCategory, setHoveredCategory] = useState(null);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const categories = [
    { key: 'financial', label: 'Financial', value: riskCategories?.financial || 50, icon: '💰' },
    { key: 'legal', label: 'Legal', value: riskCategories?.legal || 50, icon: '⚖️' },
    { key: 'operational', label: 'Operational', value: riskCategories?.operational || 50, icon: '⚙️' },
    { key: 'reputational', label: 'Reputational', value: riskCategories?.reputational || 50, icon: '🌟' },
    { key: 'compliance', label: 'Compliance', value: riskCategories?.compliance || 50, icon: '📋' }
  ];

  const centerX = 150;
  const centerY = 150;
  const radius = 100;
  const angleStep = (2 * Math.PI) / categories.length;

  const points = categories.map((cat, index) => {
    const angle = index * angleStep - Math.PI / 2;
    const value = cat.value / 100;
    return {
      x: centerX + radius * value * Math.cos(angle),
      y: centerY + radius * value * Math.sin(angle),
      category: cat
    };
  });

  const pathData = points.map((point, index) => 
    `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`
  ).join(' ') + ' Z';

  const getValueColor = (value) => {
    if (value < 33) return { fill: '#10b981', stroke: '#34d399', glow: '#10b981' };
    if (value < 66) return { fill: '#f59e0b', stroke: '#fbbf24', glow: '#f59e0b' };
    return { fill: '#ef4444', stroke: '#f87171', glow: '#ef4444' };
  };

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      {/* Chart container */}
      <div className="relative aspect-square w-full overflow-visible">
        <svg 
          width="100%" 
          height="100%" 
          viewBox="-50 -50 400 400" 
          className="drop-shadow-2xl"
          style={{ overflow: 'visible' }}
        >
          <defs>
            {/* Gradient for radar fill */}
            <radialGradient id="radarGradient" cx="50%" cy="50%">
              <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#3b82f6" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.3" />
            </radialGradient>

            {/* Glow filter */}
            <filter id="radarGlow">
              <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>

            {/* Grid pattern */}
            <pattern id="gridPattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
              <circle cx="1" cy="1" r="0.5" fill="#4b5563" opacity="0.3" />
            </pattern>
          </defs>

          {/* Background pattern */}
          <rect x="-50" y="-50" width="400" height="400" fill="url(#gridPattern)" opacity="0.1" />

          {/* Grid circles with animation */}
          {[20, 40, 60, 80, 100].map((percent, index) => (
            <motion.g key={percent}>
              <motion.circle
                cx={centerX}
                cy={centerY}
                r={(radius * percent) / 100}
                fill="none"
                stroke="#374151"
                strokeWidth="1"
                opacity="0.4"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 0.4 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
              />
              {/* Percentage labels */}
              <motion.text
                x={centerX}
                y={centerY - (radius * percent) / 100}
                fill="#6b7280"
                fontSize="8"
                textAnchor="middle"
                dy="-5"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.1 + 0.3 }}
              >
                {percent}%
              </motion.text>
            </motion.g>
          ))}

          {/* Axis lines */}
          {categories.map((_, index) => {
            const angle = index * angleStep - Math.PI / 2;
            const x2 = centerX + radius * Math.cos(angle);
            const y2 = centerY + radius * Math.sin(angle);
            
            return (
              <motion.line
                key={index}
                x1={centerX}
                y1={centerY}
                x2={x2}
                y2={y2}
                stroke="#374151"
                strokeWidth="1"
                opacity="0.3"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ delay: 0.5 + index * 0.05, duration: 0.5 }}
              />
            );
          })}

          {/* Radar shape */}
          <motion.path
            d={pathData}
            fill="url(#radarGradient)"
            fillOpacity="0.4"
            stroke="url(#radarGradient)"
            strokeWidth="3"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: isVisible ? 1 : 0, opacity: 1 }}
            transition={{ duration: 1, delay: 0.8, ease: "easeOut" }}
            style={{ transformOrigin: `${centerX}px ${centerY}px` }}
            filter="url(#radarGlow)"
          />

          {/* Data points */}
          {points.map((point, index) => {
            const colors = getValueColor(point.category.value);
            
            return (
              <motion.g key={index}>
                {/* Glow effect */}
                <motion.circle
                  cx={point.x}
                  cy={point.y}
                  r="8"
                  fill={colors.glow}
                  opacity="0.3"
                  initial={{ scale: 0 }}
                  animate={{ 
                    scale: isVisible ? [1, 1.5, 1] : 0,
                    opacity: [0.3, 0.6, 0.3]
                  }}
                  transition={{ 
                    delay: 1 + index * 0.1,
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
                
                {/* Main point */}
                <motion.circle
                  cx={point.x}
                  cy={point.y}
                  r="5"
                  fill={colors.fill}
                  stroke={colors.stroke}
                  strokeWidth="2"
                  initial={{ scale: 0 }}
                  animate={{ scale: isVisible ? 1 : 0 }}
                  transition={{ 
                    delay: 1 + index * 0.1,
                    type: "spring",
                    stiffness: 200
                  }}
                  whileHover={{ scale: 1.5 }}
                  onMouseEnter={() => setHoveredCategory(index)}
                  onMouseLeave={() => setHoveredCategory(null)}
                  className="cursor-pointer"
                  filter="url(#radarGlow)"
                />
              </motion.g>
            );
          })}

          {/* Category labels */}
          {categories.map((cat, index) => {
            const angle = index * angleStep - Math.PI / 2;
            const labelRadius = radius + 40;
            const x = centerX + labelRadius * Math.cos(angle);
            const y = centerY + labelRadius * Math.sin(angle);
            const colors = getValueColor(cat.value);
            
            return (
              <motion.g
                key={cat.key}
                initial={{ opacity: 0 }}
                animate={{ opacity: isVisible ? 1 : 0 }}
                transition={{ delay: 1.2 + index * 0.1 }}
                onMouseEnter={() => setHoveredCategory(index)}
                onMouseLeave={() => setHoveredCategory(null)}
                className="cursor-pointer"
              >
                {/* Background for label */}
                <rect
                  x={x - 40}
                  y={y - 24}
                  width="80"
                  height="48"
                  rx="8"
                  fill={hoveredCategory === index ? colors.fill : '#1f2937'}
                  fillOpacity={hoveredCategory === index ? 0.3 : 0.8}
                  stroke={hoveredCategory === index ? colors.stroke : '#374151'}
                  strokeWidth="1"
                />
                
                {/* Icon */}
                <text
                  x={x}
                  y={y - 5}
                  textAnchor="middle"
                  fontSize="16"
                >
                  {cat.icon}
                </text>
                
                {/* Label */}
                <text
                  x={x}
                  y={y + 8}
                  textAnchor="middle"
                  className="fill-gray-300 text-xs font-semibold"
                >
                  {cat.label}
                </text>
                
                {/* Value */}
                <text
                  x={x}
                  y={y + 18}
                  textAnchor="middle"
                  className="text-xs font-bold"
                  fill={colors.fill}
                >
                  {cat.value}%
                </text>
              </motion.g>
            );
          })}
        </svg>

        {/* Hover tooltip - OVERLAYS on top, no extra space */}
        <AnimatePresence>
          {hoveredCategory !== null && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2 }}
              className="fixed z-[9999] pointer-events-none"
              style={{
  // Financial (0) - Top center
  ...(hoveredCategory === 0 && {
    top: '10%',
    left: '50%',
    transform: 'translate(-50%, -110%)'
  }),
  // Legal (1) - Right side
  ...(hoveredCategory === 1 && {
    top: '25%',
    left: '50%',
    transform: 'translate(50%, -50%)'
  }),
  // Operational (2) - Right side lower
  ...(hoveredCategory === 2 && {
    top: '60%',
    left: '50%',
    transform: 'translate(50%, -50%)'
  }),
  // Reputational (3) - Left side lower
  ...(hoveredCategory === 3 && {
    top: '60%',
    left: '50%',
    transform: 'translate(-150%, -50%)'
  }),
  // Compliance (4) - Left side upper
  ...(hoveredCategory === 4 && {
    top: '25%',
    left: '50%',
    transform: 'translate(-150%, -50%)'
  })
}}
            >
              <motion.div 
                className="bg-gray-900/98 backdrop-blur-xl border-2 rounded-2xl p-5 shadow-2xl w-64"
                style={{ borderColor: getValueColor(categories[hoveredCategory].value).stroke }}
                initial={{ y: 10 }}
                animate={{ y: 0 }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <motion.span 
                    className="text-3xl"
                    animate={{ scale: [1, 1.15, 1] }}
                    transition={{ duration: 0.5, repeat: Infinity }}
                  >
                    {categories[hoveredCategory].icon}
                  </motion.span>
                  <h6 className="text-lg font-bold text-white">{categories[hoveredCategory].label}</h6>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Risk Score:</span>
                    <span className="text-2xl font-bold" style={{ 
                      color: getValueColor(categories[hoveredCategory].value).fill 
                    }}>
                      {categories[hoveredCategory].value}%
                    </span>
                  </div>
                  
                  <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ backgroundColor: getValueColor(categories[hoveredCategory].value).fill }}
                      initial={{ width: 0 }}
                      animate={{ width: `${categories[hoveredCategory].value}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                  
                  <p className="text-xs text-gray-300 leading-relaxed">
                    {categories[hoveredCategory].value < 33 && "Low risk - Terms appear favorable in this category."}
                    {categories[hoveredCategory].value >= 33 && categories[hoveredCategory].value < 66 && "Moderate risk - Review terms carefully in this area."}
                    {categories[hoveredCategory].value >= 66 && "High risk - Significant concerns identified in this category."}
                  </p>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Legend and Statistics - NO EXTRA MARGIN */}
      {/* Legend and Statistics */}
<div className="mt-4 space-y-4">
        {/* Statistics cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {categories.map((cat, index) => {
            const colors = getValueColor(cat.value);
            
            return (
              <motion.div
                key={cat.key}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.5 + index * 0.1 }}
                whileHover={{ scale: 1.05, y: -5 }}
                onMouseEnter={() => setHoveredCategory(index)}
                onMouseLeave={() => setHoveredCategory(null)}
                className={`relative group cursor-pointer`}
              >
                <div 
                  className="absolute inset-0 rounded-xl blur-lg transition-all duration-300"
                  style={{ 
                    backgroundColor: colors.glow,                    opacity: hoveredCategory === index ? 0.3 : 0.1
                  }}
                />
                
                <div className={`relative bg-gray-900/80 backdrop-blur-sm rounded-xl p-4 border transition-all duration-300 ${
                  hoveredCategory === index ? 'border-current shadow-xl' : 'border-gray-700/50'
                }`}
                style={{ borderColor: hoveredCategory === index ? colors.stroke : undefined }}
                >
                  <div className="text-center">
                    <motion.span 
                      className="text-3xl block mb-2"
                      animate={hoveredCategory === index ? { 
                        scale: [1, 1.2, 1],
                        rotate: [0, 10, -10, 0]
                      } : {}}
                      transition={{ duration: 0.5 }}
                    >
                      {cat.icon}
                    </motion.span>
                    
                    <p className="text-xs text-gray-400 mb-1">{cat.label}</p>
                    
                    <div className="flex items-center justify-center gap-1">
                      <motion.span 
                        className="text-2xl font-black"
                        style={{ color: colors.fill }}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 1.6 + index * 0.1, type: "spring" }}
                      >
                        {cat.value}
                      </motion.span>
                      <span className="text-xs text-gray-500">%</span>
                    </div>

                    {/* Risk indicator bar */}
                    <div className="mt-2 w-full h-1 bg-gray-700 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ backgroundColor: colors.fill }}
                        initial={{ width: 0 }}
                        animate={{ width: `${cat.value}%` }}
                        transition={{ delay: 1.7 + index * 0.1, duration: 0.5 }}
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Overall assessment */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2 }}
          className="bg-gradient-to-r from-purple-900/30 via-blue-900/30 to-cyan-900/30 backdrop-blur-sm rounded-2xl p-6 border border-purple-500/30"
        >
          <div className="flex items-start gap-4">
            <motion.span 
              className="text-4xl"
              animate={{ 
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0]
              }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              📊
            </motion.span>
            
            <div className="flex-1">
              <h5 className="text-lg font-bold text-white mb-2">Overall Risk Assessment</h5>
              <p className="text-sm text-gray-300 leading-relaxed">
                {(() => {
                  const avgRisk = categories.reduce((sum, cat) => sum + cat.value, 0) / categories.length;
                  const highRiskCategories = categories.filter(cat => cat.value > 66);
                  
                  if (avgRisk < 33) {
                    return "Your contract shows low risk across all major categories. This is a favorable position.";
                  } else if (avgRisk < 66) {
                    return `Moderate risk detected. ${highRiskCategories.length > 0 ? `Pay special attention to ${highRiskCategories.map(c => c.label).join(', ')}.` : 'Review key terms carefully.'}`;
                  } else {
                    return `High risk identified in multiple areas${highRiskCategories.length > 0 ? ` including ${highRiskCategories.map(c => c.label).join(', ')}` : ''}. Professional legal review strongly recommended.`;
                  }
                })()}
              </p>
              
              {/* Average risk bar */}
              <div className="mt-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-400">Average Risk Level</span>
                  <span className="text-xs font-bold text-purple-400">
                    {Math.round(categories.reduce((sum, cat) => sum + cat.value, 0) / categories.length)}%
                  </span>
                </div>
                <div className="h-2 bg-gray-700/50 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-500"
                    initial={{ width: 0 }}
                    animate={{ 
                      width: `${categories.reduce((sum, cat) => sum + cat.value, 0) / categories.length}%` 
                    }}
                    transition={{ delay: 2.2, duration: 1 }}
                  />
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}