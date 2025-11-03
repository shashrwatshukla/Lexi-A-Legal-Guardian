"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import ShareBanner from './ShareBanner';
import RiskMeter from '../features/RiskMeter';
import DetailedSummary from '../features/DetailedSummary';
import ActionItems from '../features/ActionItems';
import ClauseSeverityCards from '../features/ClauseSeverityCards';
import ObligationsTimeline from '../features/ObligationsTimeline';
import VoiceSummary from '../features/VoiceSummary';

export default function SharedAnalysisView({ sessionData }) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => setIsLoading(false), 500);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-purple-400 text-xl">Loading shared analysis...</div>
      </div>
    );
  }

  const analysis = sessionData.analysisResults;

  return (
    <div className="min-h-screen bg-black text-white pb-12">
      <ShareBanner />

      <div className="pt-24 pb-12 px-6">
        <div className="container mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
              {sessionData.documentName}
            </h1>
            <p className="text-gray-400">
              Shared on {new Date(sessionData.timestamp).toLocaleDateString()}
            </p>
          </motion.div>

          <div className="space-y-8">
            {/* Voice Summary Section - Using the same component as main page */}
            {analysis && (
              <VoiceSummary analysis={analysis} />
            )}

            {/* Risk Meter */}
            {sessionData.riskScore !== undefined && (
              <RiskMeter score={sessionData.riskScore} riskLevel={analysis?.riskLevel} />
            )}

            {/* Detailed Summary */}
            {sessionData.summary && (
              <DetailedSummary analysis={{ summary: sessionData.summary }} />
            )}

            {/* Action Items */}
            {sessionData.actionItems && sessionData.actionItems.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold mb-6 text-purple-400">📋 Action Items</h2>
                <ActionItems items={sessionData.actionItems} readOnly={true} />
              </div>
            )}

            {/* Flagged Clauses */}
            {sessionData.clauses && sessionData.clauses.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold mb-6 text-purple-400">⚠️ Flagged Clauses</h2>
                <ClauseSeverityCards clauses={sessionData.clauses} readOnly={true} />
              </div>
            )}

            {/* Obligations Timeline */}
            {sessionData.obligations && sessionData.obligations.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold mb-6 text-purple-400">📅 Obligations Timeline</h2>
                <ObligationsTimeline obligations={sessionData.obligations} readOnly={true} />
              </div>
            )}

            {/* Chat History */}
            {sessionData.chatHistory && sessionData.chatHistory.length > 0 && (
              <div className="mt-12">
                <h2 className="text-2xl font-bold mb-6 text-purple-400">
                  💬 Conversation History
                </h2>
                <div className="space-y-4">
                  {sessionData.chatHistory.map((msg, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className={`p-4 rounded-lg ${
                        msg.role === 'user'
                          ? 'bg-purple-900/30 ml-12 border border-purple-500/20'
                          : 'bg-gray-800/30 mr-12 border border-gray-700/20'
                      }`}
                    >
                      <p className="text-sm text-gray-400 mb-2 font-semibold">
                        {msg.role === 'user' ? '👤 You' : '🤖 Lexi AI'}
                      </p>
                      <p className="text-white leading-relaxed">{msg.content}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Footer Note */}
            <div className="mt-12 p-6 bg-gradient-to-r from-gray-900/40 to-gray-800/40 backdrop-blur-md border border-gray-700/30 rounded-2xl text-center">
              <div className="flex items-center justify-center gap-3 mb-2">
                <motion.span 
                  className="text-xl"
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  ⚖️
                </motion.span>
                <p className="text-gray-400 text-sm font-medium">
                  Shared Analysis • Read-Only View
                </p>
              </div>
              <p className="text-gray-500 text-xs">
                This analysis is AI-generated and provided for informational purposes only.
                It does not constitute legal advice. Consult with a qualified legal professional for important documents.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}