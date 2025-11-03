"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

export default function ClauseSeverityCards({ clauses = [] }) {
  const [expandedCards, setExpandedCards] = useState({});

  const toggleCard = (id) => {
    setExpandedCards(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const getSeverityConfig = (severity) => {
    switch (severity) {
      case 'critical': 
        return {
          icon: '🚨',
          gradient: 'from-red-600/30 to-red-800/30',
          border: 'border-red-500/50',
          text: 'text-red-400',
          glow: 'shadow-red-500/30',
          badge: 'bg-red-500/20 border-red-500',
          title: 'Critical Risk'
        };
      case 'warning': 
        return {
          icon: '⚠️',
          gradient: 'from-yellow-600/30 to-orange-800/30',
          border: 'border-yellow-500/50',
          text: 'text-yellow-400',
          glow: 'shadow-yellow-500/30',
          badge: 'bg-yellow-500/20 border-yellow-500',
          title: 'Needs Review'
        };
      case 'safe': 
        return {
          icon: '✅',
          gradient: 'from-green-600/30 to-emerald-800/30',
          border: 'border-green-500/50',
          text: 'text-green-400',
          glow: 'shadow-green-500/30',
          badge: 'bg-green-500/20 border-green-500',
          title: 'Generally Safe'
        };
      default: 
        return {
          icon: '📋',
          gradient: 'from-gray-600/30 to-gray-800/30',
          border: 'border-gray-500/50',
          text: 'text-gray-400',
          glow: 'shadow-gray-500/30',
          badge: 'bg-gray-500/20 border-gray-500',
          title: 'Standard'
        };
    }
  };

  const criticalClauses = clauses.filter(c => c.severity === 'critical');
  const warningClauses = clauses.filter(c => c.severity === 'warning');
  const safeClauses = clauses.filter(c => c.severity === 'safe');

  const renderClauseGroup = (clauseGroup, groupTitle, groupDelay) => {
    if (clauseGroup.length === 0) return null;

    return (
      <div className="space-y-4">
        <motion.h4 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: groupDelay }}
          className={`text-2xl font-bold ${getSeverityConfig(clauseGroup[0].severity).text} flex items-center gap-3`}
        >
          <span className="text-3xl">{getSeverityConfig(clauseGroup[0].severity).icon}</span>
          {groupTitle}
        </motion.h4>
        
        <div className="grid gap-4">
          {clauseGroup.map((clause, index) => {
            const config = getSeverityConfig(clause.severity);
            
            return (
              <motion.div
                key={clause.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ 
                  delay: groupDelay + (index * 0.1),
                  type: "spring",
                  stiffness: 100
                }}
                className="group relative"
              >
                <motion.div 
                  className={`absolute inset-0 bg-gradient-to-br ${config.gradient} rounded-2xl blur-xl transition-all duration-500`}
                  whileHover={{ scale: 1.05 }}
                />
                
                <motion.div
                  whileHover={{ scale: 1.01 }}
                  onClick={() => toggleCard(clause.id)}
                  className={`relative cursor-pointer bg-gray-900/90 backdrop-blur-xl border ${config.border} rounded-2xl p-6 ${config.glow} hover:shadow-2xl transition-all duration-300`}
                >
                  <div className="flex items-start gap-4">
                    <motion.span 
                      className="text-4xl"
                      animate={{ 
                        scale: [1, 1.1, 1],
                        rotate: [0, 5, -5, 0]
                      }}
                      transition={{ 
                        duration: 2, 
                        repeat: Infinity,
                        delay: index * 0.2
                      }}
                    >
                      {config.icon}
                    </motion.span>
                    
                    <div className="flex-1 space-y-3">
                      {/* Header */}
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: groupDelay + (index * 0.1) + 0.2 }}
                            className="flex flex-wrap items-center gap-2 mb-3"
                          >
                            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${config.badge}`}>
                              {config.title}
                            </span>
                            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-700/50 text-gray-300 border border-gray-600">
                              {clause.category}
                            </span>
                            {clause.negotiable && (
                              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-500/20 text-green-400 border border-green-500/50">
                                ✓ Negotiable
                              </span>
                            )}
                          </motion.div>
                          
                          <h5 className={`text-xl font-bold ${config.text} mb-2 leading-snug`}>
                            {clause.title}
                          </h5>
                        </div>
                        
                        <motion.div
                          animate={{ rotate: expandedCards[clause.id] ? 180 : 0 }}
                          transition={{ duration: 0.3 }}
                          className="text-gray-400"
                        >
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </motion.div>
                      </div>

                      {/* Location */}
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span>{clause.location}</span>
                      </div>

                      {/* Description */}
                      <p className="text-gray-300 leading-relaxed">
                        {clause.description}
                      </p>

                      {/* Expanded Content */}
                      <AnimatePresence>
                        {expandedCards[clause.id] && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="overflow-hidden space-y-4"
                          >
                            <div className="h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent" />
                            
                            {/* Full Text */}
                            <div className="bg-black/40 rounded-xl p-4 border border-gray-700/50">
                              <div className="flex items-center gap-2 mb-3">
                                <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                <h6 className="text-sm font-bold text-purple-400">Full Clause Text:</h6>
                              </div>
                              <p className="text-gray-400 italic text-sm leading-relaxed">
                                "{clause.fullText}"
                              </p>
                            </div>

                            {/* Recommendation */}
                            <div className="bg-gradient-to-r from-blue-900/30 to-cyan-900/30 rounded-xl p-4 border border-blue-500/30">
                              <div className="flex items-start gap-3">
                                <span className="text-2xl">💡</span>
                                <div className="flex-1">
                                  <h6 className="text-sm font-bold text-blue-400 mb-2">Our Recommendation:</h6>
                                  <p className="text-gray-300 text-sm leading-relaxed">{clause.recommendation}</p>
                                </div>
                              </div>
                            </div>

                            {/* Risk Impact */}
                            {clause.riskLevel && (
                              <div className="flex items-center gap-2 text-sm">
                                <span className="text-gray-400">Risk Impact:</span>
                                <div className="flex-1 bg-gray-800 rounded-full h-2 overflow-hidden">
                                  <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${clause.riskLevel}%` }}
                                    transition={{ duration: 1, delay: 0.3 }}
                                    className={`h-full bg-gradient-to-r ${config.gradient.replace('/30', '')}`}
                                  />
                                </div>
                                <span className={`font-semibold ${config.text}`}>{clause.riskLevel}%</span>
                              </div>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {renderClauseGroup(criticalClauses, 'Critical Issues', 0)}
      {renderClauseGroup(warningClauses, 'Needs Attention', 0.3)}
      {renderClauseGroup(safeClauses, 'Generally Safe', 0.6)}
      
      {clauses.length === 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-12 bg-gray-900/50 rounded-2xl border border-gray-700"
        >
          <span className="text-6xl mb-4 block">📋</span>
          <p className="text-gray-400 text-lg">No flagged clauses found</p>
        </motion.div>
      )}
    </div>
  );
}