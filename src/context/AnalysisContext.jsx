"use client";

import { createContext, useContext, useState, useCallback } from 'react';

const AnalysisContext = createContext();

export function AnalysisProvider({ children }) {
  const [currentAnalysis, setCurrentAnalysis] = useState(null);
  const [analysisHistory, setAnalysisHistory] = useState([]);

  // Store analysis data
  const saveAnalysis = useCallback((analysisData) => {
    setCurrentAnalysis(analysisData);
    setAnalysisHistory(prev => [...prev, {
      ...analysisData,
      savedAt: new Date().toISOString()
    }]);
  }, []);

  // Clear current analysis
  const clearAnalysis = useCallback(() => {
    setCurrentAnalysis(null);
  }, []);

  // Get current analysis for sharing
  const getCurrentAnalysisData = useCallback(() => {
    return currentAnalysis;
  }, [currentAnalysis]);

  const value = {
    currentAnalysis,
    analysisHistory,
    saveAnalysis,
    clearAnalysis,
    getCurrentAnalysisData
  };

  return (
    <AnalysisContext.Provider value={value}>
      {children}
    </AnalysisContext.Provider>
  );
}

export function useAnalysis() {
  const context = useContext(AnalysisContext);
  if (!context) {
    throw new Error('useAnalysis must be used within AnalysisProvider');
  }
  return context;
}