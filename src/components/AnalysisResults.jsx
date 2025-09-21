"use client";

import { useState, useEffect } from "react";
import { setDocumentAnalysis } from '../lib/documentContext';
import { motion, AnimatePresence } from "framer-motion";
import RiskMeter from "./features/RiskMeter";
import ClauseSeverityCards from "./features/ClauseSeverityCards";
import ObligationsTimeline from "./features/ObligationsTimeline";
import DocumentHeatmap from "./features/DocumentHeatmap";
import ComparativeCharts from "./features/ComparativeCharts";
import RiskRadarChart from "./features/RiskRadarChart";
import PositiveClausesCarousel from "./features/PositiveClausesCarousel";
import ActionItems from "./features/ActionItems";
import FinalVerdictBar from "./features/FinalVerdictBar";

// Animation variants for enhanced effects
const fadeInUp = {
  initial: { opacity: 0, y: 60 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: "easeOut" }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

const scaleIn = {
  initial: { scale: 0.8, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
  transition: { duration: 0.5, ease: "easeOut" }
};

export default function AnalysisResults({ analysisResult, onExportAnalysis, onAnalyzeAnother, uploadSectionRef }) {
  const [expandedClauses, setExpandedClauses] = useState({});
  const [showChatbotHint, setShowChatbotHint] = useState(true);

  // The analysisResult is already the analysis object
  const analysis = analysisResult;
  
  // Store the analysis in context when component mounts
  useEffect(() => {
    if (analysis && analysis.metadata) {
      setDocumentAnalysis(analysis, analysis.metadata.fileName);
      console.log('Analysis stored in context:', analysis);
    }
  }, [analysis]);
  
  if (!analysis) return null;

  const toggleClause = (clauseId) => {
    setExpandedClauses(prev => ({
      ...prev,
      [clauseId]: !prev[clauseId]
    }));
  };

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="relative w-full min-h-screen px-6 py-20"
      data-results-section
    >
      {/* Animated background gradient */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/30 rounded-full blur-3xl"
          animate={{
            x: [0, 100, 0],
            y: [0, -50, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-500/30 rounded-full blur-3xl"
          animate={{
            x: [0, -100, 0],
            y: [0, 50, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Export Button at the top */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="flex justify-end mb-8"
        >
          <motion.button
            whileHover={{ 
              scale: 1.05,
              boxShadow: "0 0 30px rgba(168, 85, 247, 0.5)"
            }}
            whileTap={{ scale: 0.95 }}
            onClick={onExportAnalysis}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg font-semibold text-white shadow-lg hover:shadow-purple-500/25 transition-all duration-300 flex items-center gap-2 relative overflow-hidden group"
          >
            <span className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
            <svg className="w-5 h-5 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className="relative z-10">Export Analysis</span>
          </motion.button>
        </motion.div>

        {/* Results Header */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 relative"
        >
          {/* Animated background blur */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-pink-600/20 blur-3xl"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent mb-4 relative z-10">
            Contract Analysis Complete
          </h2>
          <motion.p 
            className="text-xl text-gray-400 relative z-10"
            animate={{
              opacity: [0.7, 1, 0.7],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            {analysis.documentType} analyzed • {analysis.metadata?.wordCount || 'Unknown'} words • {analysis.metadata?.estimatedReadTime || 'Unknown'}
          </motion.p>
        </motion.div>

        {/* Chatbot Integration Hint */}
        {showChatbotHint && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-purple-900/20 border border-purple-500/30 rounded-2xl p-4 mb-8 flex items-center justify-between backdrop-blur-sm shimmer-effect relative overflow-hidden"
          >
            <div className="flex items-center gap-3">
              <motion.span 
                className="text-2xl"
                animate={{
                  rotate: [0, 20, -20, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                💬
              </motion.span>
              <p className="text-gray-300">
                Have questions about this analysis? Click the chat button in the bottom right or use "Ask AI Questions" below!
              </p>
            </div>
            <button
              onClick={() => setShowChatbotHint(false)}
              className="text-gray-400 hover:text-white transition-colors"
            >
              ✕
            </button>
          </motion.div>
        )}

        {/* Risk Meter and Summary Grid */}
        <motion.div 
          className="grid md:grid-cols-2 gap-8 mb-12"
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
          {/* Risk Meter */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            whileHover={{ scale: 1.02, boxShadow: "0 20px 40px rgba(139, 92, 246, 0.3)" }}
            className="bg-black/30 backdrop-blur-md border border-gray-800 rounded-2xl p-8 relative overflow-hidden group hover-card"
          >
            {/* Animated gradient border */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 opacity-0 group-hover:opacity-20 transition-opacity duration-500"
              animate={{
                rotate: [0, 360],
              }}
              transition={{
                duration: 20,
                repeat: Infinity,
                ease: "linear"
              }}
            />
            <h3 className="text-2xl font-bold text-white mb-6 text-center relative z-10">Overall Risk Assessment</h3>
            <div className="relative z-10">
              <RiskMeter score={analysis.overallRiskScore} riskLevel={analysis.riskLevel} />
            </div>
          </motion.div>

          {/* Summary */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            whileHover={{ scale: 1.02, boxShadow: "0 20px 40px rgba(139, 92, 246, 0.3)" }}
            className="bg-black/30 backdrop-blur-md border border-gray-800 rounded-2xl p-8 relative overflow-hidden group hover-card"
          >
            <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
              <motion.span 
                className="text-3xl"
                animate={{
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                📋
              </motion.span>
              Summary
            </h3>
            <p className="text-gray-300 leading-relaxed">
              {analysis.summary}
            </p>
            <div className="mt-4 space-y-2 text-sm">
              <motion.p 
                className="text-gray-400"
                whileHover={{ x: 5, color: "#fff" }}
                transition={{ duration: 0.2 }}
              >
                <span className="font-semibold">Parties:</span> {analysis.parties?.join(' & ') || 'Not specified'}
              </motion.p>
              <motion.p 
                className="text-gray-400"
                whileHover={{ x: 5, color: "#fff" }}
                transition={{ duration: 0.2 }}
              >
                <span className="font-semibold">Effective Date:</span> {analysis.effectiveDate || 'Not specified'}
              </motion.p>
              <motion.p 
                className="text-gray-400"
                whileHover={{ x: 5, color: "#fff" }}
                transition={{ duration: 0.2 }}
              >
                <span className="font-semibold">Expiration:</span> {analysis.expirationDate || 'Not specified'}
              </motion.p>
            </div>
          </motion.div>
        </motion.div>

        {/* Final Verdict Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          whileHover={{ scale: 1.01 }}
          className="bg-black/30 backdrop-blur-md border border-gray-800 rounded-2xl p-8 mb-12 hover-card"
        >
          <FinalVerdictBar finalVerdict={analysis.finalVerdict} flaggedClauses={analysis.flaggedClauses} />
        </motion.div>

        {/* Risk Categories Radar Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          whileHover={{ scale: 1.01 }}
          className="bg-black/30 backdrop-blur-md border border-gray-800 rounded-2xl p-8 mb-12 hover-card"
        >
          <h3 className="text-2xl font-bold text-white mb-6 text-center">Risk Analysis by Category</h3>
          <RiskRadarChart riskCategories={analysis.riskCategories} />
        </motion.div>

        {/* Document Heatmap */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          whileHover={{ scale: 1.01 }}
          className="bg-black/30 backdrop-blur-md border border-gray-800 rounded-2xl p-8 mb-12 hover-card"
        >
          <DocumentHeatmap 
            clauses={analysis.flaggedClauses} 
            totalPages={analysis.metadata?.pageCount || 10} 
          />
        </motion.div>

        {/* Clause Severity Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mb-12"
        >
          <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
            <motion.span 
              className="text-3xl"
              animate={{
                scale: [1, 1.2, 1],
                rotate: [0, 10, -10, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              ⚡
            </motion.span>
            Flagged Clauses
          </h3>
          <ClauseSeverityCards clauses={analysis.flaggedClauses} />
        </motion.div>

        {/* Two Column Layout */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Timeline of Obligations */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8 }}
            whileHover={{ scale: 1.02 }}
            className="bg-black/30 backdrop-blur-md border border-gray-800 rounded-2xl p-8 hover-card"
          >
                        <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <motion.span 
                className="text-3xl"
                animate={{
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                📅
              </motion.span>
              Timeline & Obligations
            </h3>
            <ObligationsTimeline 
              obligations={analysis.obligations} 
              keyDates={analysis.keyDates} 
            />
          </motion.div>

          {/* Industry Comparison */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.9 }}
            whileHover={{ scale: 1.02 }}
            className="bg-black/30 backdrop-blur-md border border-gray-800 rounded-2xl p-8 hover-card"
          >
            <ComparativeCharts 
              industryComparison={analysis.industryComparison} 
              metadata={analysis.metadata} 
            />
          </motion.div>
        </div>

        {/* Positive Provisions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
          className="mb-12"
        >
          <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
            <motion.span 
              className="text-3xl"
              animate={{
                scale: [1, 1.2, 1],
                rotate: [0, -10, 10, 0],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              🛡️
            </motion.span>
            Positive Provisions
          </h3>
          <PositiveClausesCarousel positiveProvisions={analysis.positiveProvisions} />
        </motion.div>

        {/* Action Items and Recommendations */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1 }}
          whileHover={{ scale: 1.01 }}
          className="bg-black/30 backdrop-blur-md border border-gray-800 rounded-2xl p-8 mb-12 hover-card"
        >
          <ActionItems 
            actionItems={analysis.actionItems} 
            negotiationPoints={analysis.negotiationPoints} 
          />
        </motion.div>

        {/* Missing Clauses Alert */}
        {analysis.missingClauses && analysis.missingClauses.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}
            className="bg-red-900/20 border border-red-500/30 rounded-2xl p-8 mb-12 relative overflow-hidden"
          >
            {/* Animated warning pulse */}
            <motion.div
              className="absolute inset-0 bg-red-500/10"
              animate={{
                opacity: [0, 0.5, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3 relative z-10">
              <motion.span 
                className="text-3xl"
                animate={{
                  scale: [1, 1.3, 1],
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                ⚠️
              </motion.span>
              Missing Important Clauses
            </h3>
            <div className="space-y-4 relative z-10">
              {analysis.missingClauses.map((missing, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.2 + index * 0.1 }}
                  whileHover={{ x: 10, scale: 1.02 }}
                  className="bg-black/30 rounded-lg p-4 border border-red-500/20 hover:border-red-500/40 transition-all duration-300"
                >
                  <h4 className="font-semibold text-red-400 mb-1">{missing.clause}</h4>
                  <p className="text-gray-400 text-sm mb-2">{missing.importance}</p>
                  <p className="text-gray-300 text-sm">💡 {missing.suggestion}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Disclaimer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.3 }}
          className="text-center text-gray-500 text-sm mb-8"
        >
          {"This is an AI-powered analysis tool. Always consult with a legal professional for important documents."}
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1.4, duration: 0.6 }}
          className="flex flex-col md:flex-row gap-4 justify-center items-center"
          variants={staggerContainer}
        >
          <motion.button
            whileHover={{ 
              scale: 1.05,
              boxShadow: "0 0 30px rgba(168, 85, 247, 0.5)"
            }}
            whileTap={{ scale: 0.95 }}
            onClick={onExportAnalysis}
            className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full font-semibold text-white shadow-lg hover:shadow-purple-500/25 transition-all duration-300 flex items-center gap-2 relative overflow-hidden group"
          >
            <span className="absolute inset-0 bg-white/20 translate-x-full group-hover:translate-x-0 transition-transform duration-500" />
            <svg className="w-5 h-5 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className="relative z-10">Download Full Report</span>
          </motion.button>

          <motion.button
            whileHover={{ 
              scale: 1.05,
              boxShadow: "0 0 30px rgba(168, 85, 247, 0.5)"
            }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              // Trigger chatbot opening
              document.body.classList.add("show-chatbot");
              setShowChatbotHint(false);
            }}
            className="px-8 py-4 bg-black/50 backdrop-blur-sm border border-purple-500/50 rounded-full font-semibold text-white shadow-lg hover:shadow-purple-500/25 transition-all duration-300 flex items-center gap-2 relative overflow-hidden group"
          >
            <span className="absolute inset-0 bg-purple-500/10 scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
            <svg className="w-5 h-5 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <span className="relative z-10">Ask AI Questions</span>
          </motion.button>

          <motion.button
            whileHover={{ 
              scale: 1.05,
              boxShadow: "0 0 30px rgba(107, 114, 128, 0.5)"
            }}
            whileTap={{ scale: 0.95 }}
            onClick={onAnalyzeAnother}
            className="px-8 py-4 bg-black/50 backdrop-blur-sm border border-gray-600/50 rounded-full font-semibold text-gray-300 shadow-lg hover:text-white hover:border-gray-500 transition-all duration-300 flex items-center gap-2 relative overflow-hidden group"
          >
            <span className="absolute inset-0 bg-gray-600/10 scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-right" />
            <svg className="w-5 h-5 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            <span className="relative z-10">Analyze Another</span>
          </motion.button>
        </motion.div>
      </div>

      {/* Add CSS for animations */}
      <style jsx>{`
        @keyframes shimmer {
          0% {
            background-position: -1000px 0;
          }
          100% {
            background-position: 1000px 0;
          }
        }
        
        .shimmer-effect {
          background: linear-gradient(
            90deg,
            transparent 0%,
            rgba(255, 255, 255, 0.05) 50%,
            transparent 100%
          );
          background-size: 1000px 100%;
          animation: shimmer 3s infinite;
        }
        
        .hover-card {
          position: relative;
          transition: all 0.3s ease;
        }
        
        .hover-card::before {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: inherit;
          padding: 1px;
          background: linear-gradient(45deg, #8b5cf6, #ec4899, #8b5cf6);
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          opacity: 0;
          transition: opacity 0.5s;
        }
        
        .hover-card:hover::before {
          opacity: 0.5;
        }
      `}</style>
    </motion.section>
  );
}