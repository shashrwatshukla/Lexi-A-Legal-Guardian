"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

export default function ActionItems({ actionItems = [], negotiationPoints = [] }) {
  const [expandedItems, setExpandedItems] = useState({});

  const toggleItem = (index) => {
    setExpandedItems(prev => ({ ...prev, [index]: !prev[index] }));
  };

  const getPriorityConfig = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high': 
        return {
          bg: 'from-red-500/20 to-red-600/20',
          border: 'border-red-500/50',
          text: 'text-red-400',
          icon: '🔴',
          glow: 'shadow-red-500/20'
        };
      case 'medium': 
        return {
          bg: 'from-yellow-500/20 to-orange-600/20',
          border: 'border-yellow-500/50',
          text: 'text-yellow-400',
          icon: '🟡',
          glow: 'shadow-yellow-500/20'
        };
      case 'low': 
        return {
          bg: 'from-green-500/20 to-emerald-600/20',
          border: 'border-green-500/50',
          text: 'text-green-400',
          icon: '🟢',
          glow: 'shadow-green-500/20'
        };
      default: 
        return {
          bg: 'from-gray-500/20 to-gray-600/20',
          border: 'border-gray-500/50',
          text: 'text-gray-400',
          icon: '⚪',
          glow: 'shadow-gray-500/20'
        };
    }
  };

  const getActionIcon = (action) => {
    if (!action || typeof action !== 'string') return '📋';
    const actionLower = action.toLowerCase();
    if (actionLower.includes('negotiate')) return '📝';
    if (actionLower.includes('avoid')) return '❌';
    if (actionLower.includes('review')) return '🔍';
    if (actionLower.includes('consult')) return '👨‍⚖️';
    if (actionLower.includes('clarify')) return '💬';
    return '📋';
  };

  // Filter out invalid items
  const validActionItems = actionItems.filter(item => item && item.action);
  const validNegotiationPoints = negotiationPoints.filter(point => point && typeof point === 'string');

  return (
    <div className="space-y-8">
      {/* Action Items Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-3 mb-6">
          <motion.span 
            className="text-2xl"
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            ✅
          </motion.span>
          <h4 className="text-2xl font-bold text-white">Recommended Actions</h4>
        </div>
        
        <div className="grid gap-4">
          {validActionItems.map((item, index) => {
            const config = getPriorityConfig(item.priority);
            
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1, type: "spring" }}
                className="group relative"
              >
                <div className={`absolute inset-0 bg-gradient-to-r ${config.bg} rounded-2xl blur-md group-hover:blur-lg transition-all duration-300 opacity-50`} />
                
                <div className={`relative bg-gray-900/90 backdrop-blur-sm rounded-2xl p-6 border ${config.border} ${config.glow} hover:shadow-xl transition-all duration-300`}>
                  <div className="flex items-start gap-4">
                    <motion.span 
                      className="text-4xl"
                      whileHover={{ scale: 1.2, rotate: 360 }}
                      transition={{ duration: 0.3 }}
                    >
                      {getActionIcon(item.action)}
                    </motion.span>
                    
                    <div className="flex-1 space-y-3">
                      {/* Priority Badge */}
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: index * 0.1 + 0.2, type: "spring" }}
                        className="inline-flex items-center gap-2"
                      >
                        <span className={`px-4 py-1.5 rounded-full text-xs font-bold border ${config.border} ${config.bg} ${config.text} backdrop-blur-sm`}>
                          {config.icon} {item.priority || 'Medium'} Priority
                        </span>
                      </motion.div>

                      {/* Action Title */}
                      <h5 className="text-lg font-bold text-white leading-snug">
                        {item.action || 'Action required'}
                      </h5>
                      
                      {/* Reason */}
                      <p className="text-gray-400 text-sm leading-relaxed">
                        {item.reason || 'See document analysis for details'}
                      </p>

                      {/* Expand Button */}
                      <motion.button
                        whileHover={{ scale: 1.02, x: 5 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => toggleItem(index)}
                        className={`flex items-center gap-2 px-4 py-2 bg-gradient-to-r ${config.bg} ${config.text} rounded-xl text-sm font-semibold border ${config.border} hover:shadow-lg transition-all duration-300`}
                      >
                        <span>{expandedItems[index] ? '📖 Hide' : '💡 Show'} Details</span>
                        <motion.svg 
                          className="w-4 h-4"
                          animate={{ rotate: expandedItems[index] ? 180 : 0 }}
                          transition={{ duration: 0.3 }}
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </motion.svg>
                      </motion.button>

                      {/* Expanded Content */}
                      <AnimatePresence>
                        {expandedItems[index] && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="overflow-hidden"
                          >
                            <div className="mt-4 p-4 bg-black/40 rounded-xl border border-gray-700/50 space-y-3">
                              <div className="flex items-start gap-3">
                                <span className="text-xl">💡</span>
                                <div>
                                  <h6 className="text-sm font-semibold text-purple-400 mb-2">Suggested Approach:</h6>
                                  <p className="text-gray-300 text-sm leading-relaxed">{item.action || 'No details available'}</p>
                                </div>
                              </div>
                              
                              {item.deadline && (
                                <div className="flex items-start gap-3">
                                  <span className="text-xl">⏰</span>
                                  <div>
                                    <h6 className="text-sm font-semibold text-blue-400 mb-1">Recommended Timeline:</h6>
                                    <p className="text-gray-300 text-sm">{item.deadline}</p>
                                  </div>
                                </div>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Negotiation Points Section */}
      {validNegotiationPoints.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="space-y-4"
        >
          <div className="flex items-center gap-3 mb-6">
            <motion.span 
              className="text-2xl"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              💬
            </motion.span>
            <h4 className="text-2xl font-bold text-white">Key Negotiation Points</h4>
          </div>
          
          <div className="grid md:grid-cols-2 gap-4">
            {validNegotiationPoints.map((point, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6 + index * 0.1, type: "spring" }}
                whileHover={{ scale: 1.02, x: 5 }}
                className="group relative"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-cyan-600/20 rounded-xl blur-md group-hover:blur-lg transition-all duration-300" />
                
                <div className="relative flex items-start gap-3 bg-gray-900/90 backdrop-blur-sm rounded-xl p-4 border border-blue-500/30 hover:border-blue-500/50 transition-all duration-300">
                  <motion.span 
                    className="text-2xl"
                    whileHover={{ rotate: [0, -10, 10, 0] }}
                    transition={{ duration: 0.3 }}
                  >
                    💼
                  </motion.span>
                  <p className="text-gray-300 text-sm leading-relaxed flex-1">{point}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}