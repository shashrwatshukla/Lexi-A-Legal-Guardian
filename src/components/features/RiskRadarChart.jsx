"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function RiskRadarChart({ riskCategories }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const categories = [
    { key: 'financial', label: 'Financial', value: riskCategories?.financial || 50 },
    { key: 'legal', label: 'Legal', value: riskCategories?.legal || 50 },
    { key: 'operational', label: 'Operational', value: riskCategories?.operational || 50 },
    { key: 'reputational', label: 'Reputational', value: riskCategories?.reputational || 50 },
    { key: 'compliance', label: 'Compliance', value: riskCategories?.compliance || 50 }
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
      y: centerY + radius * value * Math.sin(angle)
    };
  });

  const pathData = points.map((point, index) => 
    `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`
  ).join(' ') + ' Z';

  return (
    <div className="relative">
      <svg width="300" height="300" className="mx-auto">
        {/* Grid circles */}
        {[20, 40, 60, 80, 100].map((percent) => (
          <circle
            key={percent}
            cx={centerX}
            cy={centerY}
            r={(radius * percent) / 100}
            fill="none"
            stroke="#374151"
            strokeWidth="1"
            opacity="0.3"
          />
        ))}

        {/* Axis lines */}
        {categories.map((_, index) => {
          const angle = index * angleStep - Math.PI / 2;
          const x2 = centerX + radius * Math.cos(angle);
          const y2 = centerY + radius * Math.sin(angle);
          return (
            <line
              key={index}
              x1={centerX}
              y1={centerY}
              x2={x2}
              y2={y2}
              stroke="#374151"
              strokeWidth="1"
              opacity="0.3"
            />
          );
        })}

        {/* Radar shape */}
        <motion.path
          d={pathData}
          fill="url(#radarGradient)"
          fillOpacity="0.3"
          stroke="url(#radarGradient)"
          strokeWidth="2"
          initial={{ scale: 0 }}
          animate={{ scale: isVisible ? 1 : 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          style={{ transformOrigin: `${centerX}px ${centerY}px` }}
        />

        {/* Gradient definition */}
        <defs>
          <linearGradient id="radarGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#3b82f6" />
          </linearGradient>
        </defs>

        {/* Labels */}
        {categories.map((cat, index) => {
          const angle = index * angleStep - Math.PI / 2;
          const labelRadius = radius + 30;
          const x = centerX + labelRadius * Math.cos(angle);
          const y = centerY + labelRadius * Math.sin(angle);
          
          return (
            <motion.g
              key={cat.key}
              initial={{ opacity: 0 }}
              animate={{ opacity: isVisible ? 1 : 0 }}
              transition={{ delay: 0.5 + index * 0.1 }}
            >
              <text
                x={x}
                y={y}
                textAnchor="middle"
                dominantBaseline="middle"
                className="fill-gray-300 text-sm font-semibold"
              >
                {cat.label}
              </text>
              <text
                x={x}
                y={y + 15}
                textAnchor="middle"
                dominantBaseline="middle"
                className="fill-gray-500 text-xs"
              >
                {cat.value}%
              </text>
            </motion.g>
          );
        })}
      </svg>
    </div>
  );
}