"use client";

import { motion } from "framer-motion";
import { useState } from "react";

export default function ActionItems({ actionItems = [], negotiationPoints = [] }) {
  const [expandedItems, setExpandedItems] = useState({});

  const toggleItem = (index) => {
    setExpandedItems(prev => ({ ...prev, [index]: !prev[index] }));
  };

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high': return 'bg-red-500/20 text-red-400 border-red-500/50';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
      case 'low': return 'bg-green-500/20 text-green-400 border-green-500/50';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/50';
    }
  };

  const getActionIcon = (action) => {
    if (action.toLowerCase().includes('negotiate')) return '📝';
    if (action.toLowerCase().includes('avoid')) return '❌';
    if (action.toLowerCase().includes('review')) return '🔍';
    if (action.toLowerCase().includes('consult')) return '👨‍⚖️';
    return '📋';
  };

  return (
    <div className="space-y-6">
      {/* Action Items */}
      <div className="space-y-4">
                <h4 className="text-xl font-bold text-white">Recommended Actions</h4>
        {actionItems.map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-gray-900/50 rounded-xl p-4 border border-gray-700"
          >
            <div className="flex items-start gap-3">
              <span className="text-2xl">{getActionIcon(item.action)}</span>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getPriorityColor(item.priority)}`}>
                    {item.priority} Priority
                  </span>
                </div>
                <h5 className="font-semibold text-white mb-1">{item.action}</h5>
                <p className="text-sm text-gray-400">{item.reason}</p>
                
                {/* Action tags */}
                <div className="flex flex-wrap gap-2 mt-3">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full text-xs font-semibold border border-purple-500/50"
                    onClick={() => toggleItem(index)}
                  >
                    See Suggested Approach
                  </motion.button>
                </div>

                {expandedItems[index] && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    className="mt-3 p-3 bg-black/30 rounded-lg text-sm text-gray-300"
                  >
                    <p>💡 Suggested approach: {item.action}</p>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Negotiation Points */}
      {negotiationPoints.length > 0 && (
        <div className="space-y-4">
          <h4 className="text-xl font-bold text-white">Key Negotiation Points</h4>
          <div className="grid gap-3">
            {negotiationPoints.map((point, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className="flex items-center gap-3 bg-blue-900/20 rounded-lg p-3 border border-blue-500/30"
              >
                <span className="text-blue-400">💬</span>
                <span className="text-gray-300">{point}</span>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}