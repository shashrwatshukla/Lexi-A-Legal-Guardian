"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

export default function ClauseSeverityCards({ clauses = [] }) {
  const [expandedCards, setExpandedCards] = useState({});

  const toggleCard = (id) => {
    setExpandedCards(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const getIcon = (severity) => {
    switch (severity) {
      case 'critical': return '🚨';
      case 'warning': return '⚠️';
      case 'safe': return '✅';
      default: return '📋';
    }
  };

  const getSeverityStyles = (severity) => {
    switch (severity) {
      case 'critical': 
        return {
          border: 'border-red-500/50',
          bg: 'bg-red-900/20',
          text: 'text-red-400',
          glow: 'hover:shadow-red-500/25'
        };
      case 'warning': 
        return {
          border: 'border-yellow-500/50',
          bg: 'bg-yellow-900/20',
          text: 'text-yellow-400',
          glow: 'hover:shadow-yellow-500/25'
        };
      case 'safe': 
        return {
          border: 'border-green-500/50',
          bg: 'bg-green-900/20',
          text: 'text-green-400',
          glow: 'hover:shadow-green-500/25'
        };
      default: 
        return {
          border: 'border-gray-500/50',
          bg: 'bg-gray-900/20',
          text: 'text-gray-400',
          glow: 'hover:shadow-gray-500/25'
        };
    }
  };

  // Group clauses by severity
  const criticalClauses = clauses.filter(c => c.severity === 'critical');
  const warningClauses = clauses.filter(c => c.severity === 'warning');
  const safeClauses = clauses.filter(c => c.severity === 'safe');

  const renderClauseGroup = (clauseGroup, groupDelay) => {
    return clauseGroup.map((clause, index) => {
      const styles = getSeverityStyles(clause.severity);
      
      return (
        <motion.div
          key={clause.id}
          initial={{ opacity: 0, x: clause.severity === 'critical' ? -50 : 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ 
            delay: groupDelay + (index * 0.1),
            type: "spring",
            stiffness: 100
          }}
          className={`${styles.bg} ${styles.border} border rounded-xl p-6 cursor-pointer transition-all duration-300 ${styles.glow}`}
          onClick={() => toggleCard(clause.id)}
        >
          <div className="flex items-start gap-4">
            <motion.span 
              className="text-3xl"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: groupDelay + (index * 0.1) + 0.2, type: "spring" }}
            >
              {getIcon(clause.severity)}
            </motion.span>
            
            <div className="flex-1">
              <h4 className={`text-lg font-bold ${styles.text} mb-2`}>
                {clause.title}
              </h4>
              <p className="text-gray-400 text-sm mb-2">
                {clause.category} • {clause.location}
              </p>
              <p className="text-gray-300">
                {clause.description}
              </p>

              <AnimatePresence>
                {expandedCards[clause.id] && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="mt-4 pt-4 border-t border-gray-700"
                  >
                    <div className="space-y-3">
                      <div>
                        <h5 className="text-sm font-semibold text-purple-400 mb-1">Full Text:</h5>
                        <p className="text-gray-500 italic text-sm bg-black/30 p-3 rounded">
                          "{clause.fullText}"
                        </p>
                      </div>
                      <div>
                        <h5 className="text-sm font-semibold text-blue-400 mb-1">Recommendation:</h5>
                        <p className="text-gray-300 text-sm">{clause.recommendation}</p>
                      </div>
                      {clause.negotiable && (
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-green-400 text-sm">✓ Negotiable</span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      );
    });
  };

  return (
    <div className="space-y-6">
      {criticalClauses.length > 0 && (
        <div className="space-y-4">
          <h4 className="text-xl font-bold text-red-400">Critical Issues</h4>
          {renderClauseGroup(criticalClauses, 0)}
        </div>
      )}
      
      {warningClauses.length > 0 && (
        <div className="space-y-4">
          <h4 className="text-xl font-bold text-yellow-400">Needs Attention</h4>
          {renderClauseGroup(warningClauses, 0.3)}
        </div>
      )}
      
      {safeClauses.length > 0 && (
        <div className="space-y-4">
          <h4 className="text-xl font-bold text-green-400">Generally Safe</h4>
          {renderClauseGroup(safeClauses, 0.6)}
        </div>
      )}
    </div>
  );
}