"use client";

import { motion } from "framer-motion";
import { useState } from "react";

export default function DocumentHeatmap({ clauses = [], totalPages = 10 }) {
  const [hoveredClause, setHoveredClause] = useState(null);

  // Calculate positions for each clause
  const getClausePosition = (clause) => {
    // Extract page number from location if available
    const pageMatch = clause.location?.match(/page (\d+)/i);
    const page = pageMatch ? parseInt(pageMatch[1]) : Math.floor(Math.random() * totalPages) + 1;
    return (page / totalPages) * 100;
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'bg-red-500';
      case 'warning': return 'bg-yellow-500';
      case 'safe': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="relative">
      <h4 className="text-lg font-semibold text-gray-300 mb-4">Document Risk Map</h4>
      
      {/* Document bar */}
      <div className="relative h-20 bg-gray-800 rounded-lg overflow-hidden">
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-gray-700 to-gray-800"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 1 }}
          style={{ transformOrigin: "left" }}
        />

        {/* Clause markers */}
        {clauses.map((clause, index) => {
          const position = getClausePosition(clause);
          
          return (
            <motion.div
              key={clause.id}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 + index * 0.05 }}
              className={`absolute top-1/2 transform -translate-y-1/2 w-3 h-12 ${getSeverityColor(clause.severity)} rounded-full cursor-pointer`}
              style={{ left: `${position}%` }}
              onMouseEnter={() => setHoveredClause(clause)}
              onMouseLeave={() => setHoveredClause(null)}
              whileHover={{ scale: 1.5, zIndex: 10 }}
            />
          );
        })}
      </div>

      {/* Page indicators */}
      <div className="flex justify-between mt-2 text-xs text-gray-500">
        <span>Start</span>
        <span>Page {Math.floor(totalPages / 2)}</span>
        <span>End</span>
      </div>

      {/* Tooltip */}
      {hoveredClause && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 bg-gray-900 border border-gray-700 rounded-lg p-3 z-20 w-64"
        >
          <h5 className="font-semibold text-white text-sm">{hoveredClause.title}</h5>
          <p className="text-xs text-gray-400 mt-1">{hoveredClause.location}</p>
          <p className="text-xs text-gray-300 mt-1">{hoveredClause.description}</p>
        </motion.div>
      )}

      {/* Legend */}
      <div className="flex gap-4 mt-4 text-xs">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-red-500 rounded-full" />
          <span className="text-gray-400">Critical</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-yellow-500 rounded-full" />
          <span className="text-gray-400">Warning</span>
        </div>
        <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-green-500 rounded-full" />
          <span className="text-gray-400">Safe</span>
        </div>
      </div>
    </div>
  );
}