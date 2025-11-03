"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

export default function DocumentHeatmap({ clauses = [], totalPages = 10 }) {
  const [hoveredClause, setHoveredClause] = useState(null);
  const [view, setView] = useState('heatmap');
  const [selectedSeverity, setSelectedSeverity] = useState('all');

  const getClausePosition = (clause) => {
    const pageMatch = clause.location?.match(/page (\d+)/i);
    const page = pageMatch ? parseInt(pageMatch[1]) : Math.floor(Math.random() * totalPages) + 1;
    return Math.min((page / totalPages) * 100, 95);
  };

  const getSeverityConfig = (severity) => {
    switch (severity) {
      case 'critical': 
        return {
          color: 'bg-red-500',
          borderColor: 'border-red-500',
          textColor: 'text-red-400',
          bgGradient: 'from-red-900/30 to-red-800/20',
          glow: 'shadow-red-500/50',
          label: 'Critical Risk',
          icon: '🚨',
          description: 'Immediate attention required'
        };
      case 'warning': 
        return {
          color: 'bg-yellow-500',
          borderColor: 'border-yellow-500',
          textColor: 'text-yellow-400',
          bgGradient: 'from-yellow-900/30 to-yellow-800/20',
          glow: 'shadow-yellow-500/50',
          label: 'Warning',
          icon: '⚠️',
          description: 'Review recommended'
        };
      case 'safe': 
        return {
          color: 'bg-green-500',
          borderColor: 'border-green-500',
          textColor: 'text-green-400',
          bgGradient: 'from-green-900/30 to-green-800/20',
          glow: 'shadow-green-500/50',
          label: 'Safe',
          icon: '✅',
          description: 'No issues detected'
        };
      default: 
        return {
          color: 'bg-gray-500',
          borderColor: 'border-gray-500',
          textColor: 'text-gray-400',
          bgGradient: 'from-gray-900/30 to-gray-800/20',
          glow: 'shadow-gray-500/50',
          label: 'Standard',
          icon: '📋',
          description: 'Standard clause'
        };
    }
  };

  const clausesBySeverity = {
    critical: clauses.filter(c => c.severity === 'critical'),
    warning: clauses.filter(c => c.severity === 'warning'),
    safe: clauses.filter(c => c.severity === 'safe')
  };

  const filteredClauses = selectedSeverity === 'all' 
    ? clauses 
    : clauses.filter(c => c.severity === selectedSeverity);

  // Calculate risk score
  const riskScore = clauses.length > 0 
    ? Math.round(
        (clausesBySeverity.critical.length * 100 + 
         clausesBySeverity.warning.length * 50) / clauses.length
      )
    : 0;

  return (
    <div className="space-y-6">
      {/* Enhanced Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <motion.div
              className="relative"
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <span className="text-4xl">🗺️</span>
              <motion.div
                className="absolute inset-0 bg-purple-500/20 rounded-full blur-xl"
                animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0.8, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </motion.div>
            <div>
              <h4 className="text-2xl font-bold text-white">Interactive Document Risk Map</h4>
              <p className="text-sm text-gray-400">Navigate through your contract's risk landscape</p>
            </div>
          </div>

          {/* View Toggle */}
          <div className="flex items-center gap-2 bg-gray-800/50 rounded-xl p-1 border border-gray-700/50">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setView('heatmap')}
              className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 ${
                view === 'heatmap' 
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              🗺️ Map View
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setView('list')}
              className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 ${
                view === 'list' 
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              📋 List View
            </motion.button>
          </div>
        </div>

        {/* Overall Risk Score Banner */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`bg-gradient-to-r ${
            riskScore > 70 ? 'from-red-900/40 to-orange-900/40 border-red-500/50' :
            riskScore > 40 ? 'from-yellow-900/40 to-orange-900/40 border-yellow-500/50' :
            'from-green-900/40 to-emerald-900/40 border-green-500/50'
          } rounded-2xl p-5 border backdrop-blur-sm`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="text-5xl">
                {riskScore > 70 ? '🔴' : riskScore > 40 ? '🟡' : '🟢'}
              </div>
              <div>
                <h5 className="text-lg font-bold text-white mb-1">Overall Document Risk Score</h5>
                <p className="text-sm text-gray-300">
                  {riskScore > 70 ? 'High risk detected - Legal review strongly recommended' :
                   riskScore > 40 ? 'Moderate risk - Careful review suggested' :
                   'Low risk - Document appears favorable'}
                </p>
              </div>
            </div>
            <div className="text-right">
              <motion.div 
                className="text-5xl font-black text-white"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                {riskScore}
              </motion.div>
              <p className="text-xs text-gray-400 mt-1">out of 100</p>
            </div>
          </div>
        </motion.div>

        {/* Filter Buttons */}
        <div className="flex flex-wrap gap-2">
          {[
            { key: 'all', label: 'All Clauses', icon: '📊', count: clauses.length },
            { key: 'critical', label: 'Critical', icon: '🚨', count: clausesBySeverity.critical.length },
            { key: 'warning', label: 'Warnings', icon: '⚠️', count: clausesBySeverity.warning.length },
            { key: 'safe', label: 'Safe', icon: '✅', count: clausesBySeverity.safe.length }
          ].map((filter) => (
            <motion.button
              key={filter.key}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedSeverity(filter.key)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 ${
                selectedSeverity === filter.key
                  ? 'bg-purple-600 text-white shadow-lg border-2 border-purple-400'
                  : 'bg-gray-800/50 text-gray-400 border border-gray-700/50 hover:border-purple-500/50'
              }`}
            >
              <span className="mr-2">{filter.icon}</span>
              {filter.label}
              <span className="ml-2 bg-white/20 px-2 py-0.5 rounded-full text-xs">
                {filter.count}
              </span>
            </motion.button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {view === 'heatmap' ? (
          <motion.div
            key="heatmap"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
           {/* Enhanced Document Visualization - Better Bar Chart */}
<div className="relative">
  {/* Main document visualization */}
  <div className="bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 rounded-2xl p-6 border-2 border-purple-500/30 shadow-2xl">
    
    {/* Header with document info */}
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-purple-600/20 rounded-xl flex items-center justify-center">
          <span className="text-3xl">📊</span>
        </div>
        <div>
          <h5 className="text-lg font-bold text-white">Document Structure Analysis</h5>
          <p className="text-xs text-gray-400">Visual breakdown of your contract</p>
        </div>
      </div>
      <div className="text-right">
        <p className="text-2xl font-black text-white">{totalPages}</p>
        <p className="text-xs text-gray-400">Total Pages</p>
      </div>
    </div>

  
  
    {/* Category breakdown bars */}
    <div className="grid grid-cols-3 gap-3 mb-4">
      {[
        { 
          severity: 'critical', 
          label: 'Critical Issues',
          count: clausesBySeverity.critical.length,
          icon: '🚨',
          color: 'bg-red-500'
        },
        { 
          severity: 'warning', 
          label: 'Warnings',
          count: clausesBySeverity.warning.length,
          icon: '⚠️',
          color: 'bg-yellow-500'
        },
        { 
          severity: 'safe', 
          label: 'Safe Clauses',
          count: clausesBySeverity.safe.length,
          icon: '✅',
          color: 'bg-green-500'
        }
      ].map((item, index) => (
        <motion.div
          key={item.severity}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 + index * 0.1 }}
          className="bg-gray-800/50 rounded-xl p-3 border border-gray-700/50 hover:border-purple-500/50 transition-all"
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">{item.icon}</span>
            <span className="text-xs font-bold text-gray-300">{item.label}</span>
          </div>
          
          <div className="flex items-end gap-2 mb-2">
            <span className="text-3xl font-black text-white">{item.count}</span>
            <span className="text-xs text-gray-500 mb-1">clauses</span>
          </div>

          {/* Progress bar */}
          <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${clauses.length > 0 ? (item.count / clauses.length) * 100 : 0}%` }}
              transition={{ delay: 1 + index * 0.1, duration: 0.8 }}
              className={`h-full ${item.color}`}
            />
          </div>
          
          <p className="text-xs text-gray-500 mt-1">
            {clauses.length > 0 ? Math.round((item.count / clauses.length) * 100) : 0}% of total
          </p>
        </motion.div>
      ))}
    </div>

    {/* Risk Heat Zones - Shows where risks are concentrated */}
<div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl p-4 border border-purple-500/20">
  <div className="flex items-center gap-2 mb-4">
    <span className="text-2xl">🔥</span>
    <h6 className="text-sm font-bold text-white">Risk Heat Zones</h6>
    <span className="ml-auto text-xs text-gray-500">Where to focus your attention</span>
  </div>

  <div className="grid grid-cols-3 gap-3">
    {[
      { 
        zone: 'Beginning',
        pages: `1-${Math.floor(totalPages/3)}`,
        icon: '📖'
      },
      { 
        zone: 'Middle',
        pages: `${Math.floor(totalPages/3)+1}-${Math.floor(totalPages*2/3)}`,
        icon: '📄'
      },
      { 
        zone: 'End',
        pages: `${Math.floor(totalPages*2/3)+1}-${totalPages}`,
        icon: '📑'
      }
    ].map((section, idx) => {
      
      // Calculate clauses in this section
      const sectionClauses = clauses.filter(c => {
        const match = c.location?.match(/page (\d+)/i);
        if (!match) return false;
        const page = parseInt(match[1]);
        
        if (idx === 0) return page <= Math.floor(totalPages/3);
        if (idx === 1) return page > Math.floor(totalPages/3) && page <= Math.floor(totalPages*2/3);
        return page > Math.floor(totalPages*2/3);
      });

      const criticalCount = sectionClauses.filter(c => c.severity === 'critical').length;
      const warningCount = sectionClauses.filter(c => c.severity === 'warning').length;
      const safeCount = sectionClauses.filter(c => c.severity === 'safe').length;

      // Determine heat level
      const heatLevel = criticalCount > 0 ? 'high' : warningCount > 1 ? 'medium' : 'low';
      const heatConfig = {
        high: { bg: 'from-red-900/40 to-orange-900/40', border: 'border-red-500/50', text: 'text-red-400', icon: '🔴' },
        medium: { bg: 'from-yellow-900/40 to-orange-900/40', border: 'border-yellow-500/50', text: 'text-yellow-400', icon: '🟡' },
        low: { bg: 'from-green-900/40 to-emerald-900/40', border: 'border-green-500/50', text: 'text-green-400', icon: '🟢' }
      }[heatLevel];

      return (
        <motion.div
          key={idx}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.2 + idx * 0.1 }}
          whileHover={{ scale: 1.05 }}
          className={`bg-gradient-to-br ${heatConfig.bg} rounded-xl p-4 border-2 ${heatConfig.border} cursor-pointer`}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{section.icon}</span>
              <div>
                <p className="text-sm font-bold text-white">{section.zone}</p>
                <p className="text-xs text-gray-400">Pages {section.pages}</p>
              </div>
            </div>
            <span className="text-3xl">{heatConfig.icon}</span>
          </div>

          {/* Stats */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400">Total Clauses:</span>
              <span className="text-lg font-bold text-white">{sectionClauses.length}</span>
            </div>

            {/* Mini breakdown */}
            <div className="grid grid-cols-3 gap-1 text-center">
              <div className="bg-red-500/20 rounded p-1">
                <p className="text-xs font-bold text-red-400">{criticalCount}</p>
                <p className="text-[8px] text-gray-500">Critical</p>
              </div>
              <div className="bg-yellow-500/20 rounded p-1">
                <p className="text-xs font-bold text-yellow-400">{warningCount}</p>
                <p className="text-[8px] text-gray-500">Warning</p>
              </div>
              <div className="bg-green-500/20 rounded p-1">
                <p className="text-xs font-bold text-green-400">{safeCount}</p>
                <p className="text-[8px] text-gray-500">Safe</p>
              </div>
            </div>

            {/* Status message */}
            <div className={`mt-2 p-2 bg-black/30 rounded text-center`}>
              <p className={`text-xs font-semibold ${heatConfig.text}`}>
                {heatLevel === 'high' ? '⚠️ High Priority Review' : 
                 heatLevel === 'medium' ? '👀 Review Recommended' : 
                 '✓ Looks Good'}
              </p>
            </div>
          </div>
        </motion.div>
      );
    })}
  </div>

  {/* Overall summary */}
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ delay: 1.5 }}
    className="mt-4 p-3 bg-purple-900/20 rounded-lg border border-purple-500/30"
  >
    <div className="flex items-center gap-2 text-xs text-gray-300">
      <span className="text-lg">💡</span>
      <p>
        <span className="font-bold text-white">Focus Area:</span> {' '}
        {clausesBySeverity.critical.length > 0 
          ? 'Review critical clauses first, especially in highlighted zones'
          : 'No critical issues detected. Review warnings in each section'}
      </p>
    </div>
  </motion.div>
</div>

    {/* Quick stats footer */}
    <div className="grid grid-cols-4 gap-2 mt-4">
      <div className="text-center p-2 bg-gray-800/30 rounded-lg">
        <p className="text-2xl font-black text-white">{clauses.length}</p>
        <p className="text-[10px] text-gray-400">Total Clauses</p>
      </div>
      <div className="text-center p-2 bg-gray-800/30 rounded-lg">
        <p className="text-2xl font-black text-purple-400">{(clauses.length / totalPages).toFixed(1)}</p>
        <p className="text-[10px] text-gray-400">Per Page</p>
      </div>
      <div className="text-center p-2 bg-gray-800/30 rounded-lg">
        <p className="text-2xl font-black text-red-400">{clausesBySeverity.critical.length}</p>
        <p className="text-[10px] text-gray-400">Critical</p>
      </div>
      <div className="text-center p-2 bg-gray-800/30 rounded-lg">
        <p className="text-2xl font-black text-green-400">{clausesBySeverity.safe.length}</p>
        <p className="text-[10px] text-gray-400">Safe</p>
      </div>
    </div>
  </div>
</div>

              {/* Enhanced page indicators */}
              <div className="flex justify-between mt-4 px-2">
                <div className="flex items-center gap-2">
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-3 h-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full shadow-lg"
                  />
                  <span className="text-sm font-semibold text-gray-300">Page 1</span>
                  <span className="text-xs text-gray-500">(Document Start)</span>
                </div>
                
                <div className="text-center">
                  <span className="text-xs font-bold text-purple-400">
                    {filteredClauses.length} clauses mapped
                  </span>                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">(Document End)</span>
                  <span className="text-sm font-semibold text-gray-300">Page {totalPages}</span>
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                    className="w-3 h-3 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full shadow-lg"
                  />
                </div>
              </div>

            {/* Enhanced Tooltip */}
            <AnimatePresence>
              {hoveredClause && (
                <motion.div
                  initial={{ opacity: 0, y: 20, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 20, scale: 0.9 }}
                  transition={{ duration: 0.2 }}
                  className={`bg-gradient-to-br ${getSeverityConfig(hoveredClause.severity).bgGradient} backdrop-blur-xl border-2 ${getSeverityConfig(hoveredClause.severity).borderColor} rounded-2xl p-6 shadow-2xl`}
                >
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-start gap-4">
                      <motion.span 
                        className="text-5xl"
                        animate={{ rotate: [0, 10, -10, 0] }}
                        transition={{ duration: 0.5, repeat: Infinity }}
                      >
                        {getSeverityConfig(hoveredClause.severity).icon}
                      </motion.span>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <span className={`px-3 py-1.5 rounded-full text-xs font-bold ${getSeverityConfig(hoveredClause.severity).color} text-white shadow-lg`}>
                            {getSeverityConfig(hoveredClause.severity).label}
                          </span>
                          <span className="px-3 py-1.5 rounded-full text-xs font-semibold bg-gray-700/50 text-gray-300 border border-gray-600">
                            📍 {hoveredClause.location}
                          </span>
                          <span className="px-3 py-1.5 rounded-full text-xs font-semibold bg-purple-900/50 text-purple-300 border border-purple-600">
                            🔖 {hoveredClause.category || 'General'}
                          </span>
                        </div>
                        <h5 className="text-xl font-bold text-white mb-2">{hoveredClause.title}</h5>
                        <p className="text-sm text-gray-300 leading-relaxed">{hoveredClause.description}</p>
                      </div>
                    </div>

                    {/* Additional Details */}
                    <div className="grid md:grid-cols-2 gap-4 pt-4 border-t border-gray-700/50">
                      <div>
                        <p className="text-xs font-semibold text-gray-400 mb-2">⚠️ Risk Level</p>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
                            <motion.div
                              className={`h-full ${getSeverityConfig(hoveredClause.severity).color}`}
                              initial={{ width: 0 }}
                              animate={{ width: hoveredClause.severity === 'critical' ? '100%' : hoveredClause.severity === 'warning' ? '60%' : '30%' }}
                              transition={{ duration: 0.5 }}
                            />
                          </div>
                          <span className={`text-xs font-bold ${getSeverityConfig(hoveredClause.severity).textColor}`}>
                            {hoveredClause.severity === 'critical' ? 'High' : hoveredClause.severity === 'warning' ? 'Medium' : 'Low'}
                          </span>
                        </div>
                      </div>

                      <div>
                        <p className="text-xs font-semibold text-gray-400 mb-2">💡 Recommendation</p>
                        <p className="text-xs text-gray-300">
                          {hoveredClause.severity === 'critical' 
                            ? 'Seek legal counsel immediately'
                            : hoveredClause.severity === 'warning'
                            ? 'Review and negotiate terms'
                            : 'Terms appear standard and acceptable'}
                        </p>
                      </div>
                    </div>

                    {/* Impact Assessment */}
                    {hoveredClause.impact && (
                      <div className="bg-gray-900/50 rounded-xl p-4 border border-gray-700/30">
                        <p className="text-xs font-semibold text-gray-400 mb-2">📊 Potential Impact</p>
                        <p className="text-sm text-gray-300">{hoveredClause.impact}</p>
                      </div>
                    )}

                    {/* Suggested Actions */}
                    {hoveredClause.suggestions && hoveredClause.suggestions.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-gray-400 mb-2">✅ Suggested Actions</p>
                        <ul className="space-y-1">
                          {hoveredClause.suggestions.map((suggestion, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-xs text-gray-300">
                              <span className="text-green-400 mt-0.5">•</span>
                              {suggestion}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Enhanced Legend with Details */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { severity: 'critical', count: clausesBySeverity.critical.length },
                { severity: 'warning', count: clausesBySeverity.warning.length },
                { severity: 'safe', count: clausesBySeverity.safe.length },
                { severity: 'total', count: clauses.length }
              ].map((item, index) => {
                const config = item.severity === 'total' 
                  ? { 
                      color: 'bg-purple-500', 
                      borderColor: 'border-purple-500',
                      bgGradient: 'from-purple-900/30 to-purple-800/20',
                      label: 'Total Clauses', 
                      icon: '📊',
                      description: 'All identified' 
                    }
                  : getSeverityConfig(item.severity);
                
                return (
                  <motion.div
                    key={item.severity}
                    initial={{ opacity: 0, scale: 0.8, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ delay: 0.8 + index * 0.1 }}
                    whileHover={{ scale: 1.05, y: -5 }}
                    className={`bg-gradient-to-br ${config.bgGradient} rounded-xl p-4 border-2 ${config.borderColor}/30 hover:${config.borderColor}/60 transition-all duration-300 cursor-pointer`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className={`w-6 h-6 ${config.color} rounded-full ${config.glow} shadow-lg flex items-center justify-center`}>
                        <motion.div
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 2, repeat: Infinity, delay: index * 0.3 }}
                        >
                          <span className="text-xs">✓</span>
                        </motion.div>
                      </div>
                      <span className="text-3xl">{config.icon}</span>
                    </div>
                    
                    <div>
                      <p className="text-xs text-gray-400 mb-1">{config.label}</p>
                      <div className="flex items-end gap-2">
                        <motion.p 
                          className="text-3xl font-black text-white"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 1 + index * 0.1, type: "spring" }}
                        >
                          {item.count}
                        </motion.p>
                        <p className="text-xs text-gray-500 mb-1">
                          ({clauses.length > 0 ? Math.round((item.count / clauses.length) * 100) : 0}%)
                        </p>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{config.description}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Enhanced Statistics */}
            <div className="grid md:grid-cols-3 gap-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2 }}
                className="bg-gradient-to-br from-blue-900/40 to-cyan-900/40 rounded-2xl p-5 border-2 border-blue-500/30 hover:border-blue-500/50 transition-all duration-300"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                    <span className="text-3xl">📏</span>
                  </div>
                  <h6 className="text-sm font-bold text-blue-400">Document Analysis</h6>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-400">Total Pages</span>
                    <span className="text-xl font-black text-white">{totalPages}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-400">Clause Density</span>
                    <span className="text-xl font-black text-white">{(clauses.length / totalPages).toFixed(1)}</span>
                  </div>
                  <p className="text-xs text-gray-400 pt-2 border-t border-blue-500/20">
                    Average of {(clauses.length / totalPages).toFixed(1)} clauses per page
                  </p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.3 }}
                className="bg-gradient-to-br from-purple-900/40 to-pink-900/40 rounded-2xl p-5 border-2 border-purple-500/30 hover:border-purple-500/50 transition-all duration-300"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                    <span className="text-3xl">🎯</span>
                  </div>
                  <h6 className="text-sm font-bold text-purple-400">Risk Distribution</h6>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-400">Critical Issues</span>
                    <span className="text-xl font-black text-red-400">{clausesBySeverity.critical.length}</span>
                  </div>
                  <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500"
                      initial={{ width: 0 }}
                      animate={{ width: `${clauses.length > 0 ? (clausesBySeverity.critical.length / clauses.length) * 100 : 0}%` }}
                      transition={{ duration: 1, delay: 1.5 }}
                    />
                  </div>
                  <p className="text-xs text-gray-400 pt-2 border-t border-purple-500/20">
                    {clauses.length > 0 ? ((clausesBySeverity.critical.length / clauses.length) * 100).toFixed(0) : 0}% of document requires immediate attention
                  </p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.4 }}
                className="bg-gradient-to-br from-emerald-900/40 to-teal-900/40 rounded-2xl p-5 border-2 border-emerald-500/30 hover:border-emerald-500/50 transition-all duration-300"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center">
                    <span className="text-3xl">✅</span>
                  </div>
                  <h6 className="text-sm font-bold text-emerald-400">Favorable Terms</h6>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-400">Safe Clauses</span>
                    <span className="text-xl font-black text-green-400">{clausesBySeverity.safe.length}</span>
                  </div>
                  <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-green-500 to-emerald-500"
                      initial={{ width: 0 }}
                      animate={{ width: `${clauses.length > 0 ? (clausesBySeverity.safe.length / clauses.length) * 100 : 0}%` }}
                      transition={{ duration: 1, delay: 1.6 }}
                    />
                  </div>
                  <p className="text-xs text-gray-400 pt-2 border-t border-emerald-500/20">
                    {clauses.length > 0 ? ((clausesBySeverity.safe.length / clauses.length) * 100).toFixed(0) : 0}% of terms are favorable to you
                  </p>
                </div>
              </motion.div>
            </div>

                        {/* Risk Progression Timeline */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.5 }}
              className="bg-gradient-to-r from-gray-900/80 to-gray-800/80 backdrop-blur-xl rounded-2xl p-6 border border-gray-700/50"
            >
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl">📈</span>
                <div>
                  <h6 className="text-lg font-bold text-white">Risk Progression Through Document</h6>
                  <p className="text-xs text-gray-400">How risk levels change from start to finish</p>
                </div>
              </div>

              <div className="relative h-24 bg-gray-800/50 rounded-xl overflow-hidden">
                {/* Gradient background showing risk flow */}
                <div className="absolute inset-0 flex">
                  {clauses.map((clause, idx) => {
                    const config = getSeverityConfig(clause.severity);
                    const width = 100 / clauses.length;
                    
                    return (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, scaleY: 0 }}
                        animate={{ opacity: 0.7, scaleY: 1 }}
                        transition={{ delay: 1.6 + idx * 0.02 }}
                        className={`${config.color} border-r border-gray-900/50`}
                        style={{ width: `${width}%` }}
                        title={clause.title}
                      />
                    );
                  })}
                </div>

                {/* Overlay line showing average risk */}
                <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
                  <motion.path
                    d={`M 0 ${50 - riskScore / 5} L ${100} ${50 - riskScore / 5}`}
                    stroke="white"
                    strokeWidth="2"
                    fill="none"
                    strokeDasharray="5,5"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 2, delay: 1.8 }}
                  />
                </svg>

                {/* Labels */}
                <div className="absolute top-2 left-2 text-xs font-bold text-white bg-black/50 px-2 py-1 rounded">
                  Start
                </div>
                <div className="absolute top-2 right-2 text-xs font-bold text-white bg-black/50 px-2 py-1 rounded">
                  End
                </div>
              </div>

              <div className="flex justify-between mt-3 text-xs text-gray-400">
                <span>Beginning of Contract</span>
                <span className="text-purple-400 font-semibold">← Risk Flow →</span>
                <span>End of Contract</span>
              </div>
            </motion.div>

          </motion.div>
        ) : (
          <motion.div
            key="list"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-3"
          >
            {filteredClauses.length === 0 ? (
              <div className="text-center py-16 bg-gray-900/30 rounded-xl border border-gray-700/50">
                <motion.span 
                  className="text-7xl mb-4 block"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  📭
                </motion.span>
                <p className="text-gray-400 text-lg font-semibold">No clauses match the selected filter</p>
                <p className="text-gray-500 text-sm mt-2">Try selecting a different category</p>
              </div>
            ) : (
              filteredClauses.map((clause, index) => {
                const config = getSeverityConfig(clause.severity);
                
                return (
                  <motion.div
                    key={clause.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ x: 8, scale: 1.01 }}
                    className="group relative"
                  >
                    <div className={`absolute inset-0 bg-gradient-to-r ${config.bgGradient} rounded-xl blur-sm group-hover:blur-md transition-all duration-300`} />
                    
                    <div className={`relative flex items-center gap-4 bg-gray-900/90 rounded-xl p-5 border-2 ${config.borderColor}/30 group-hover:${config.borderColor}/60 transition-all duration-300`}>
                      {/* Risk indicator bar */}
                      <div className={`w-2 h-20 ${config.color} rounded-full ${config.glow} flex-shrink-0 relative`}>
                        <motion.div
                          className={`absolute inset-0 ${config.color} rounded-full`}
                          animate={{ scale: [1, 1.2, 1], opacity: [0.7, 0.3, 0.7] }}
                          transition={{ duration: 2, repeat: Infinity, delay: index * 0.1 }}
                        />
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <span className="text-2xl">{config.icon}</span>
                          <h6 className="font-bold text-white text-base truncate flex-1">{clause.title}</h6>
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${config.color} text-white`}>
                            {config.label}
                          </span>
                        </div>
                        <p className="text-sm text-gray-400 line-clamp-2 mb-2">{clause.description}</p>
                        
                        <div className="flex items-center gap-3 text-xs">
                          <span className="flex items-center gap-1 text-gray-500">
                            <span>📍</span>
                            {clause.location}
                          </span>
                          <span className="flex items-center gap-1 text-gray-500">
                            <span>🔖</span>
                            {clause.category || 'General'}
                          </span>
                          {clause.negotiable && (
                            <span className="flex items-center gap-1 text-green-400 font-semibold">
                              <span>✓</span>
                              Negotiable
                            </span>
                          )}
                        </div>
                      </div>
                      
                      {/* Action button */}
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className={`px-4 py-2 rounded-lg text-xs font-bold ${config.color} text-white flex-shrink-0`}
                      >
                        View Details
                      </motion.button>
                    </div>
                  </motion.div>
                );
              })
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}