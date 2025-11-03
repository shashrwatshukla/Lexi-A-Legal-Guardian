'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import ExportOptions from './ExportOptions';

export default function DraftEditor({ initialDraft, documentType, documentTitle, onSave, onReset }) {
  const [editedDraft, setEditedDraft] = useState(initialDraft);
  const [isReviewing, setIsReviewing] = useState(false);
  const [reviewResults, setReviewResults] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showComparison, setShowComparison] = useState(false);

  useEffect(() => {
    setEditedDraft(initialDraft);
  }, [initialDraft]);

  const handleReview = async () => {
    setIsReviewing(true);
    try {
      const response = await fetch('/api/draft-review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          draft: editedDraft,
          documentType
        })
      });

      const data = await response.json();
      setReviewResults(data.review);
    } catch (error) {
      console.error('Review failed:', error);
    } finally {
      setIsReviewing(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(editedDraft);
    } finally {
      setIsSaving(false);
    }
  };

  const handleApplyImprovement = () => {
    if (reviewResults?.improvedDraft) {
      setEditedDraft(reviewResults.improvedDraft);
      setReviewResults(null);
    }
  };

  const getRiskColor = (risk) => {
    switch (risk) {
      case 'low': return 'text-green-400';
      case 'medium': return 'text-yellow-400';
      case 'high': return 'text-red-400';
      default: return 'text-white/60';
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'low': return 'bg-green-500/20 border-green-500/50 text-green-300';
      case 'medium': return 'bg-yellow-500/20 border-yellow-500/50 text-yellow-300';
      case 'high': return 'bg-red-500/20 border-red-500/50 text-red-300';
      default: return 'bg-white/10 border-white/20 text-white/60';
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Main Editor Section */}
      <div className="lg:col-span-2 space-y-6">
        {/* Header with Actions */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-white">Document Editor</h2>
            <p className="text-white/60 text-sm mt-1">
              Review and edit your generated document
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setShowComparison(!showComparison)}
              className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors text-sm"
            >
              {showComparison ? 'Hide Original' : 'Show Original'}
            </button>

            <button
              onClick={handleReview}
              disabled={isReviewing}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 text-sm flex items-center gap-2"
            >
              {isReviewing ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                  </svg>
                  Reviewing...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/>
                  </svg>
                  AI Review
                </>
              )}
            </button>

            <button
              onClick={onReset}
              className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors text-sm"
            >
              Start Over
            </button>
          </div>
        </div>

        {/* Review Results Panel */}
        {reviewResults && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 border border-purple-500/30 rounded-xl p-6 space-y-4"
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xl font-bold text-white mb-2">AI Review Results</h3>
                <p className={`text-lg font-semibold ${getRiskColor(reviewResults.overallRisk)}`}>
                  Overall Risk: {reviewResults.overallRisk?.toUpperCase()}
                </p>
              </div>
              <button
                onClick={() => setReviewResults(null)}
                className="text-white/60 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>

            {/* Issues Found */}
            {reviewResults.issues && reviewResults.issues.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-white font-semibold">Issues Found:</h4>
                {reviewResults.issues.map((issue, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border ${getSeverityColor(issue.severity)}`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-lg">
                        {issue.severity === 'high' ? '🔴' : issue.severity === 'medium' ? '🟡' : '🟢'}
                      </span>
                      <div className="flex-1">
                        <p className="font-medium mb-1">{issue.issue}</p>
                        <p className="text-sm opacity-90">
                          <strong>Suggestion:</strong> {issue.suggestion}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Missing Clauses */}
            {reviewResults.missingClauses && reviewResults.missingClauses.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-white font-semibold">Missing Clauses:</h4>
                <div className="bg-white/10 rounded-lg p-4">
                  <ul className="list-disc list-inside space-y-1 text-white/80">
                    {reviewResults.missingClauses.map((clause, index) => (
                      <li key={index}>{clause}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Compliance Check */}
            {reviewResults.complianceCheck && (
              <div className={`p-4 rounded-lg ${reviewResults.complianceCheck.passed ? 'bg-green-500/20 border border-green-500/50' : 'bg-red-500/20 border border-red-500/50'}`}>
                <p className="text-white font-semibold mb-1">
                  {reviewResults.complianceCheck.passed ? '✅ Compliance Check Passed' : '⚠️ Compliance Issues Found'}
                </p>
                <p className="text-white/90 text-sm">{reviewResults.complianceCheck.details}</p>
              </div>
            )}

            {/* Apply Improvements Button */}
            {reviewResults.improvedDraft && (
              <button
                onClick={handleApplyImprovement}
                className="w-full px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all font-medium flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                Apply AI Improvements to Document
              </button>
            )}
          </motion.div>
        )}

        {/* Editor Layout */}
        <div className={`grid ${showComparison ? 'grid-cols-2' : 'grid-cols-1'} gap-6`}>
          {/* Original Draft (if comparison mode) */}
          {showComparison && (
            <div className="space-y-2">
              <h3 className="text-white font-semibold text-sm">Original Draft</h3>
              <div className="bg-white/5 border border-white/10 rounded-xl p-6 h-[600px] overflow-y-auto">
                <pre className="text-white/80 text-sm whitespace-pre-wrap font-mono leading-relaxed">
                  {initialDraft}
                </pre>
              </div>
            </div>
          )}

          {/* Editable Draft */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <h3 className="text-white font-semibold text-sm">
                {showComparison ? 'Edited Version' : 'Your Document'}
              </h3>
              <span className="text-white/40 text-xs">
                {editedDraft.length.toLocaleString()} characters
              </span>
            </div>
            <textarea
              value={editedDraft}
              onChange={(e) => setEditedDraft(e.target.value)}
              className="w-full h-[600px] px-6 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none font-mono text-sm leading-relaxed"
              placeholder="Your document will appear here..."
            />
          </div>
        </div>

        {/* Action Bar */}
        <div className="flex justify-between items-center pt-4 border-t border-white/10">
          <div className="flex items-center gap-4 text-sm text-white/60">
            <span>Last edited: {new Date().toLocaleTimeString()}</span>
            <span>•</span>
            <span>{editedDraft.split(/\s+/).length} words</span>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 font-medium flex items-center gap-2"
            >
              {isSaving ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                  </svg>
                  Saving...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"/>
                  </svg>
                  Save Document
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Export Options Sidebar */}
      <div className="lg:col-span-1">
        <ExportOptions 
          draft={editedDraft} 
          documentType={documentType}
          documentTitle={documentTitle}
        />
      </div>
    </div>
  );
}