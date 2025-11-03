"use client";

import { useState, useEffect } from "react";
import { setDocumentAnalysis } from '../lib/documentContext';
import { useAnalysis } from '../context/AnalysisContext';
import { motion, AnimatePresence } from "framer-motion";
import VoiceSummary from "./features/VoiceSummary";
import DetailedSummary from "./features/DetailedSummary";
import AnalysisNav from "./ui/AnalysisNav";
import RiskMeter from "./features/RiskMeter";
import ClauseSeverityCards from "./features/ClauseSeverityCards";
import ObligationsTimeline from "./features/ObligationsTimeline";
import DocumentHeatmap from "./features/DocumentHeatmap";
import ComparativeCharts from "./features/ComparativeCharts";
import RiskRadarChart from "./features/RiskRadarChart";
import PositiveClausesCarousel from "./features/PositiveClausesCarousel";
import ActionItems from "./features/ActionItems";
import FinalVerdictBar from "./features/FinalVerdictBar";

const fadeInUp = {
  initial: { opacity: 0, y: 60 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -60 },
  transition: { duration: 0.6, ease: [0.6, -0.05, 0.01, 0.99] }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1
    }
  }
};

export default function AnalysisResults({ analysisResult, onExportAnalysis, onAnalyzeAnother, uploadSectionRef }) {
  const [expandedClauses, setExpandedClauses] = useState({});
  const { saveAnalysis } = useAnalysis();
  const [showChatbotHint, setShowChatbotHint] = useState(true);
  const [activeSection, setActiveSection] = useState('overview');
  const [exportProgress, setExportProgress] = useState({
    isExporting: false,
    progress: 0,
    total: 5,
    message: ''
  });

  const analysis = analysisResult;
  
  // ✅ STORE ANALYSIS IN CONTEXT AND SESSIONSTORAGE
  useEffect(() => {
    if (analysis && analysis.metadata) {
      // Store in both context and sessionStorage
      setDocumentAnalysis(analysis, analysis.metadata.fileName);
      console.log('✅ Analysis stored in context and sessionStorage:', analysis);
      
      // SAVE TO ANALYSIS CONTEXT FOR SHARING
      saveAnalysis({
        documentName: analysis.metadata?.fileName || 'Document',
        analysisResults: analysis,
        riskScore: analysis.overallRiskScore,
        summary: analysis.executiveSummary || analysis.summary,
        chatHistory: [],
        actionItems: analysis.actionItems,
        obligations: analysis.obligations,
        clauses: analysis.flaggedClauses,
        risks: analysis.riskCategories,
        positives: analysis.positiveProvisions,
        userId: localStorage.getItem('username') || 'anonymous',
        userEmail: localStorage.getItem('userEmail') || null
      });
      console.log('✅ Analysis saved to AnalysisContext for sharing');
    }
  }, [analysis, saveAnalysis]);

  // ✅ LOCK BODY SCROLL WHEN PDF MODAL IS OPEN
  useEffect(() => {
    if (exportProgress.isExporting) {
      const scrollY = window.scrollY;
      
      // Lock body scroll
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      
      return () => {
        // Restore scroll when modal closes
        document.body.style.overflow = '';
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        window.scrollTo(0, scrollY);
      };
    }
  }, [exportProgress.isExporting]);

  const handleExportPDF = async () => {
    try {
      // Dynamic imports
      const { default: jsPDF } = await import('jspdf');
      const { default: html2canvas } = await import('html2canvas');
      
      const originalSection = activeSection;
      const sectionsToExport = ['overview', 'risks', 'clauses', 'actions', 'timeline'];
      const sectionNames = {
        'overview': 'Overview',
        'risks': 'Risk Analysis',
        'clauses': 'Clauses',
        'actions': 'Actions',
        'timeline': 'Timeline'
      };
      
      // Initialize PDF
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true
      });
      
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      let isFirstPage = true;
      
      // Start export
      setExportProgress({
        isExporting: true,
        progress: 0,
        total: sectionsToExport.length + 1,
        message: 'Creating cover page...'
      });
      
      // Add cover page
      pdf.setFillColor(102, 126, 234);
      pdf.rect(0, 0, pageWidth, pageHeight, 'F');
      
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(32);
      pdf.setFont(undefined, 'bold');
      pdf.text('Contract Analysis Report', pageWidth / 2, 60, { align: 'center' });
      
      pdf.setFontSize(16);
      pdf.setFont(undefined, 'normal');
      pdf.text(analysis.documentType || 'Legal Document', pageWidth / 2, 80, { align: 'center' });
      
      pdf.setFontSize(12);
      pdf.text(analysis.metadata?.fileName || 'Document', pageWidth / 2, 100, { align: 'center' });
      pdf.text(new Date().toLocaleDateString(), pageWidth / 2, 110, { align: 'center' });
      
      // Risk score
      const riskScore = analysis.overallRiskScore || 0;
      pdf.setFontSize(48);
      pdf.setFont(undefined, 'bold');
      
      if (riskScore > 66) pdf.setTextColor(239, 68, 68);
      else if (riskScore > 33) pdf.setTextColor(245, 158, 11);
      else pdf.setTextColor(16, 185, 129);
      
      pdf.text(`${riskScore}`, pageWidth / 2, 140, { align: 'center' });
      
      pdf.setFontSize(14);
      pdf.setTextColor(255, 255, 255);
      pdf.text('Risk Score', pageWidth / 2, 155, { align: 'center' });
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Process each section
      for (let i = 0; i < sectionsToExport.length; i++) {
        const section = sectionsToExport[i];
        
        setExportProgress({
          isExporting: true,
          progress: i + 1,
          total: sectionsToExport.length + 1,
          message: `Capturing ${sectionNames[section]}...`
        });
        
        // Switch to section
        setActiveSection(section);
        
        // Wait 2 seconds for initial render
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Get the content element
        const contentElement = document.querySelector('[data-export-content]');
        
        if (!contentElement) {
          console.warn(`No content found for ${section}`);
          continue;
        }
        
        // Scroll to make visible and trigger animations
        contentElement.scrollIntoView({ behavior: 'instant', block: 'start' });
        window.scrollTo({ top: contentElement.offsetTop - 100, behavior: 'instant' });
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Scroll through content to trigger all lazy loads
        const scrollHeight = contentElement.scrollHeight;
        window.scrollTo({ top: contentElement.offsetTop + scrollHeight / 2, behavior: 'instant' });
        await new Promise(resolve => setTimeout(resolve, 800));
        
        window.scrollTo({ top: contentElement.offsetTop + scrollHeight, behavior: 'instant' });
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Scroll back to top of content
        window.scrollTo({ top: contentElement.offsetTop - 100, behavior: 'instant' });
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        try {
          // Capture with html2canvas
          const canvas = await html2canvas(contentElement, {
            scale: 2,
            useCORS: true,
            allowTaint: true,
            backgroundColor: '#0a0a0a',
            logging: false,
            windowWidth: contentElement.scrollWidth,
            windowHeight: contentElement.scrollHeight,
            scrollX: 0,
            scrollY: -window.scrollY,
            onclone: (clonedDoc) => {
              const clonedElement = clonedDoc.querySelector('[data-export-content]');
              if (clonedElement) {
                // Make everything visible
                const allElements = clonedElement.querySelectorAll('*');
                allElements.forEach(el => {
                  el.style.opacity = '1';
                  el.style.visibility = 'visible';
                  el.style.transform = 'none';
                  el.style.animation = 'none';
                  el.style.transition = 'none';
                  
                  // Remove hidden classes
                  if (el.classList.contains('hidden')) {
                    el.classList.remove('hidden');
                  }
                });
                
                // Force canvas visibility
                const canvases = clonedElement.querySelectorAll('canvas');
                canvases.forEach(canvas => {
                  canvas.style.display = 'block';
                  canvas.style.opacity = '1';
                });
              }
            }
          });
          
          if (canvas.width === 0 || canvas.height === 0) {
            console.warn(`Empty canvas for ${section}`);
            continue;
          }
          
          const imgData = canvas.toDataURL('image/jpeg', 0.95);
          const imgWidth = pageWidth - 20;
          const imgHeight = (canvas.height * imgWidth) / canvas.width;
          
          // Add new page
          if (!isFirstPage) {
            pdf.addPage();
          }
          isFirstPage = false;
          
          // Add section title
          pdf.setFillColor(74, 85, 104);
          pdf.rect(0, 0, pageWidth, 20, 'F');
          
          pdf.setTextColor(255, 255, 255);
          pdf.setFontSize(16);
          pdf.setFont(undefined, 'bold');
          
          const sectionTitles = {
            'overview': '📊 OVERVIEW',
            'risks': '⚠️ RISK ANALYSIS',
            'clauses': '📋 CLAUSE BREAKDOWN',
            'actions': '🎯 ACTION ITEMS',
            'timeline': '📅 TIMELINE'
          };
          
          pdf.text(sectionTitles[section] || section.toUpperCase(), 10, 13);
          
          // Add image (with multi-page support)
          let yPosition = 25;
          let remainingHeight = imgHeight;
          let sourceY = 0;
          
          while (remainingHeight > 0) {
            const availableHeight = pageHeight - yPosition - 10;
            const heightToAdd = Math.min(remainingHeight, availableHeight);
            
            if (heightToAdd > 0) {
              // Create a temporary canvas for this segment
              const segmentCanvas = document.createElement('canvas');
              segmentCanvas.width = canvas.width;
              segmentCanvas.height = (heightToAdd * canvas.width) / imgWidth;
              
              const ctx = segmentCanvas.getContext('2d');
              ctx.drawImage(
                canvas,
                0, (sourceY * canvas.width) / imgWidth,
                canvas.width, segmentCanvas.height,
                0, 0,
                canvas.width, segmentCanvas.height
              );
              
              const segmentData = segmentCanvas.toDataURL('image/jpeg', 0.95);
              pdf.addImage(segmentData, 'JPEG', 10, yPosition, imgWidth, heightToAdd);
              
              remainingHeight -= heightToAdd;
              sourceY += heightToAdd;
              
              if (remainingHeight > 0) {
                pdf.addPage();
                
                // Add section title on continuation pages
                pdf.setFillColor(74, 85, 104);
                pdf.rect(0, 0, pageWidth, 15, 'F');
                pdf.setTextColor(255, 255, 255);
                pdf.setFontSize(12);
                pdf.text(sectionTitles[section] + ' (continued)', 10, 10);
                
                yPosition = 20;
              }
            } else {
              break;
            }
          }
          
          console.log(`✅ Added ${section} to PDF`);
          
        } catch (error) {
          console.error(`Error capturing ${section}:`, error);
        }
        
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      // Add disclaimer page
      pdf.addPage();
      pdf.setFillColor(26, 26, 26);
      pdf.rect(0, 0, pageWidth, pageHeight, 'F');
      
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(20);
      pdf.setFont(undefined, 'bold');
      pdf.text('⚖️ Legal Disclaimer', pageWidth / 2, 60, { align: 'center' });
      
      pdf.setFontSize(12);
      pdf.setFont(undefined, 'normal');
      pdf.setTextColor(153, 153, 153);
      
      const disclaimerText = [
        'This analysis is AI-powered and provided for informational purposes only.',
        'It does not constitute legal advice and should not be relied upon as such.',
        '',
        'Always consult with a qualified legal professional before making decisions',
        'based on contract analysis or taking any legal action.',
        '',
        '🤖 Generated by Lexi AI Contract Analyzer',
        new Date().toLocaleString()
      ];
      
      let yPos = 90;
      disclaimerText.forEach(line => {
        pdf.text(line, pageWidth / 2, yPos, { align: 'center', maxWidth: pageWidth - 40 });
        yPos += 10;
      });
      
      // Save PDF
      setExportProgress({
        isExporting: true,
        progress: sectionsToExport.length + 1,
        total: sectionsToExport.length + 1,
        message: 'Saving PDF...'
      });
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // ✅ FIXED: Use analysisResult instead of analysis
      const fileName = `Analysis_${analysisResult.metadata?.fileName?.replace(/\.[^/.]+$/, '') || 'Report'}_${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);
      
      console.log('✅ PDF saved successfully!');
      
      // Cleanup
      setActiveSection(originalSection);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      
      setExportProgress({
        isExporting: false,
        progress: 0,
        total: 5,
        message: ''
      });
      
    } catch (error) {
      console.error('PDF Export Error:', error);
      alert(`Failed to export PDF: ${error.message}\n\nPlease try refreshing the page.`);
      
      setExportProgress({
        isExporting: false,
        progress: 0,
        total: 5,
        message: ''
      });
    }
  };
  
  if (!analysis) return null;

  const criticalCount = analysis.flaggedClauses?.filter(c => c.severity === 'critical').length || 0;
  const warningCount = analysis.flaggedClauses?.filter(c => c.severity === 'warning').length || 0;
  const positiveCount = analysis.positiveProvisions?.length || 0;
  const actionCount = analysis.actionItems?.length || 0;

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.7 }}
      className="relative w-full min-h-screen px-4 sm:px-6 lg:px-8 py-16 lg:py-24 overflow-x-hidden bg-black"
      data-results-section
    >
      {/* PDF GENERATION OVERLAY */}
      <AnimatePresence>
        {exportProgress.isExporting && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center"
            style={{ 
              background: 'rgba(0, 0, 0, 0.85)',
              backdropFilter: 'blur(10px)'
            }}
          >
            <div className="relative">
              {/* Animated background circles */}
              <motion.div
                className="absolute inset-0 rounded-full"
                style={{
                  background: 'radial-gradient(circle, rgba(102, 126, 234, 0.3) 0%, transparent 70%)',
                  width: '300px',
                  height: '300px',
                  left: '50%',
                  top: '50%',
                  transform: 'translate(-50%, -50%)'
                }}
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.3, 0.6, 0.3]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
              
              {/* Main content */}
              <div className="relative bg-gray-900/90 backdrop-blur-xl rounded-3xl p-12 border-2 border-purple-500/30 shadow-2xl min-w-[400px]">
                {/* Icon */}
                <motion.div
                  className="text-center mb-6"
                  animate={{
                    rotate: [0, 360],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                >
                  <span className="text-6xl">📄</span>
                </motion.div>
                
                {/* Title */}
                <h3 className="text-2xl font-bold text-white text-center mb-2">
                  Generating PDF Report
                </h3>
                
                {/* Status message */}
                <p className="text-gray-300 text-center mb-6 text-sm">
                  {exportProgress.message}
                </p>
                
                {/* Progress bar */}
                <div className="w-full bg-gray-700 rounded-full h-3 mb-4 overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 rounded-full"
                    initial={{ width: '0%' }}
                    animate={{ 
                      width: `${(exportProgress.progress / exportProgress.total) * 100}%`
                    }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
                
                {/* Progress text */}
                <p className="text-center text-gray-400 text-sm">
                  {exportProgress.progress} of {exportProgress.total} sections completed
                </p>
                
                {/* Estimated time */}
                <p className="text-center text-gray-500 text-xs mt-4">
                  Please wait... This may take 20-30 seconds
                </p>
                
                {/* Loading dots */}
                <div className="flex justify-center gap-2 mt-6">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      className="w-3 h-3 bg-purple-500 rounded-full"
                      animate={{
                        scale: [1, 1.5, 1],
                        opacity: [0.5, 1, 0.5]
                      }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        delay: i * 0.2
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SMOOTH TOP BLEND */}
      <div 
        className="absolute inset-x-0 top-0 h-32 pointer-events-none"
        style={{
          background: 'linear-gradient(to bottom, black 0%, rgba(0,0,0,0.85) 20%, rgba(0,0,0,0.6) 40%, rgba(0,0,0,0.3) 65%, transparent 100%)',
          zIndex: 1
        }}
      />

      {/* Corner blends */}
      <div 
        className="absolute top-0 left-0 w-[30%] h-[20%] pointer-events-none"
        style={{
          background: 'radial-gradient(at top left, black 0%, rgba(0,0,0,0.6) 40%, transparent 80%)',
          zIndex: 2
        }}
      />

      <div 
        className="absolute top-0 right-0 w-[30%] h-[20%] pointer-events-none"
        style={{
          background: 'radial-gradient(at top right, black 0%, rgba(0,0,0,0.6) 40%, transparent 80%)',
          zIndex: 2
        }}
      />

      <div 
        className="absolute inset-x-0 bottom-0 h-32 pointer-events-none"
        style={{
          background: 'linear-gradient(to top, black 0%, rgba(0,0,0,0.85) 20%, rgba(0,0,0,0.6) 40%, rgba(0,0,0,0.3) 65%, transparent 100%)',
          zIndex: 1
        }}
      />

      <div 
        className="absolute bottom-0 left-0 w-[30%] h-[20%] pointer-events-none"
        style={{
          background: 'radial-gradient(at bottom left, black 0%, rgba(0,0,0,0.6) 40%, transparent 80%)',
          zIndex: 2
        }}
      />

      <div 
        className="absolute bottom-0 right-0 w-[30%] h-[20%] pointer-events-none"
        style={{
          background: 'radial-gradient(at bottom right, black 0%, rgba(0,0,0,0.6) 40%, transparent 80%)',
          zIndex: 2
        }}
      />

      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-0 right-1/4 w-96 h-96 bg-pink-600/20 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl"
          animate={{
            x: [-100, 100, -100],
            y: [-50, 50, -50],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">

        {/* Hero Header */}
        <motion.div
          variants={fadeInUp}
          initial="initial"
          animate="animate"
          className="text-center mb-8 relative"
        >
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-purple-600/10 via-pink-600/10 to-blue-600/10 blur-3xl"
            animate={{
              scale: [1, 1.1, 1],
              rotate: [0, 5, 0],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="inline-block mb-4"
          >
            <span className="text-5xl">📊</span>
          </motion.div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 bg-clip-text text-transparent mb-6 pb-2" 
    style={{ lineHeight: '1.3' }}>
  Analysis Complete
</h2>
          <motion.div 
            className="flex flex-wrap items-center justify-center gap-4 text-base text-gray-400 mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <span className="flex items-center gap-2 px-4 py-2 bg-gray-800/50 rounded-full backdrop-blur-sm">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              {analysis.documentType}
            </span>
          </motion.div>
        </motion.div>
        
        {/* AI Voice Summary */}
        <VoiceSummary analysis={analysis} />

        {/* Detailed Summary */}
        <DetailedSummary analysis={analysis} />

        {/* Section Heading */}
        <motion.div
          variants={fadeInUp}
          className="text-center mt-16 mb-12"
        >
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent mb-4 tracking-tight pb-2" 
              style={{ fontFamily: "'Inter', 'SF Pro Display', system-ui, -apple-system, sans-serif", lineHeight: '1.3' }}>
            In-Depth Analysis Dashboard
          </h2>
          <p className="text-gray-300 text-base md:text-lg font-medium">
            Detailed risk assessment, clause breakdown, and actionable insights
          </p>
        </motion.div>

        {/* Navigation Bar */}
        <AnalysisNav 
          activeSection={activeSection}
          onSectionChange={setActiveSection}
          onExport={handleExportPDF}
          exportProgress={exportProgress}
        />

        {/* Dashboard Content */}
        <div data-export-content className="export-wrapper">

        {/* AI Chatbot Hint */}
        <AnimatePresence>
          {showChatbotHint && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
              className="mb-8 relative"
            >
              <div className="bg-gradient-to-r from-purple-900/40 via-indigo-900/40 to-blue-900/40 border border-purple-500/30 rounded-2xl p-6 backdrop-blur-md shadow-2xl">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4 flex-1">
                    <motion.div
                      animate={{
                        rotate: [0, 10, -10, 10, 0],
                        scale: [1, 1.1, 1],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                      className="text-3xl"
                    >
                      💬
                    </motion.div>
                    <div className="flex-1">
                      <h4 className="text-base font-semibold text-white mb-1">Ask AI About This Analysis</h4>
                      <p className="text-gray-300 text-sm">
                        Click the chat button below or in the bottom-right corner for detailed explanations
                      </p>
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setShowChatbotHint(false)}
                    className="text-gray-400 hover:text-white transition-colors p-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <motion.div 
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="space-y-8"
        >
          {/* OVERVIEW Section */}
          {activeSection === 'overview' && (
            <>
              <motion.div variants={fadeInUp}>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-white">Risk Assessment</h3>
                  <motion.span 
                    className="text-2xl"
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  >
                    🎯
                  </motion.span>
                </div>
                <RiskMeter score={analysis.overallRiskScore} riskLevel={analysis.riskLevel} />
                <motion.div 
                  className="mt-6 p-4 bg-black/20 rounded-xl"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <p className="text-gray-300 text-sm leading-relaxed">
                    {analysis.riskLevel === 'High' && '⚠️ This contract requires immediate attention and legal review.'}
                    {analysis.riskLevel === 'Medium' && '📋 Review carefully and consider negotiating key terms.'}
                    {analysis.riskLevel === 'Low' && '✅ This contract appears generally favorable.'}
                  </p>
                </motion.div>
              </motion.div>

              <motion.div variants={fadeInUp}>
                <FinalVerdictBar finalVerdict={analysis.finalVerdict} flaggedClauses={analysis.flaggedClauses} />
              </motion.div>
            </>
          )}

          {/* RISKS Section */}
          {activeSection === 'risks' && (
            <>
              <motion.div variants={fadeInUp}>
                <div className="flex items-center gap-3 mb-6">
                  <motion.span 
                    className="text-2xl"
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                  >
                    📡
                  </motion.span>
                  <h3 className="text-xl font-bold text-white">Risk Distribution Analysis</h3>
                </div>
                <RiskRadarChart riskCategories={analysis.riskCategories} />
              </motion.div>

              <motion.div variants={fadeInUp}>
                <div className="flex items-center gap-3 mb-6">
                  <motion.span 
                    className="text-2xl"
                    animate={{ scale: [1, 1.3, 1] }}
                    transition={{ duration: 3, repeat: Infinity }}
                  >
                    🗺️
                  </motion.span>
                  <h3 className="text-xl font-bold text-white">Document Risk Heatmap</h3>
                </div>
                <DocumentHeatmap 
                  clauses={analysis.flaggedClauses} 
                  totalPages={analysis.metadata?.pageCount || 10} 
                />
              </motion.div>

              <motion.div variants={fadeInUp}>
                <div className="flex items-center gap-3 mb-6">
                  <motion.span 
                    className="text-2xl"
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    📊
                  </motion.span>
                  <h3 className="text-xl font-bold text-white">Industry Benchmark</h3>
                </div>
                <ComparativeCharts 
                  industryComparison={analysis.industryComparison} 
                  metadata={analysis.metadata} 
                />
              </motion.div>
            </>
          )}

          {/* CLAUSES Section */}
          {activeSection === 'clauses' && (
            <>
              <motion.div variants={fadeInUp}>
                <div className="flex items-center gap-3 mb-6">
                  <motion.span 
                    className="text-3xl"
                    animate={{ 
                      rotate: [0, 10, -10, 0],
                      scale: [1, 1.2, 1]
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    ⚡
                  </motion.span>
                  <h3 className="text-2xl font-bold text-white">Flagged Clauses</h3>
                </div>
                <ClauseSeverityCards clauses={analysis.flaggedClauses} />
              </motion.div>

              <motion.div variants={fadeInUp}>
                <div className="flex items-center gap-3 mb-6">
                  <motion.span 
                    className="text-3xl"
                    animate={{ 
                      rotate: [0, -10, 10, 0],
                      scale: [1, 1.15, 1]
                    }}
                    transition={{ duration: 3, repeat: Infinity }}
                  >
                    🛡️
                  </motion.span>
                  <h3 className="text-2xl font-bold text-white">Protective Provisions</h3>
                </div>
                <PositiveClausesCarousel positiveProvisions={analysis.positiveProvisions} />
              </motion.div>
            </>
          )}

          {/* ACTIONS Section */}
          {activeSection === 'actions' && (
            <>
              <motion.div variants={fadeInUp}>
                <div className="flex items-center gap-3 mb-6">
                  <motion.span 
                    className="text-2xl"
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                  >
                    🎯
                  </motion.span>
                  <h3 className="text-xl font-bold text-white">Recommended Actions</h3>
                </div>
                <ActionItems 
                  actionItems={analysis.actionItems} 
                  negotiationPoints={analysis.negotiationPoints} 
                />
              </motion.div>

              {analysis.missingClauses && analysis.missingClauses.length > 0 && (
                <motion.div variants={fadeInUp}>
                  <div className="flex items-center gap-3 mb-6">
                    <motion.span 
                      className="text-3xl"
                      animate={{ 
                        scale: [1, 1.3, 1],
                        rotate: [0, 10, -10, 0]
                      }}
                      transition={{ duration: 1, repeat: Infinity }}
                    >
                      ⚠️
                    </motion.span>
                    <h3 className="text-xl font-bold text-white">Missing Critical Clauses</h3>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    {analysis.missingClauses.map((missing, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ scale: 1.02, x: 5 }}
                        className="bg-red-900/20 backdrop-blur-sm rounded-xl p-5 border border-red-500/20 hover:border-red-500/40 transition-all duration-300"
                      >
                        <div className="flex items-start gap-3 mb-3">
                          <span className="text-xl">🚫</span>
                          <h4 className="font-semibold text-red-400 flex-1 text-sm">{missing.clause}</h4>
                        </div>
                        <p className="text-gray-400 text-xs mb-3 pl-8">{missing.importance}</p>
                        <div className="bg-red-500/10 rounded-lg p-3 pl-8">
                          <p className="text-gray-300 text-xs flex items-start gap-2">
                            <span className="text-yellow-400 mt-0.5">💡</span>
                            <span>{missing.suggestion}</span>
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </>
          )}

          {/* TIMELINE Section */}
          {activeSection === 'timeline' && (
            <motion.div variants={fadeInUp}>
              <div className="flex items-center gap-3 mb-6">
                <motion.span 
                  className="text-2xl"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  📅
                </motion.span>
                <h3 className="text-xl font-bold text-white">Timeline & Obligations</h3>
              </div>
              <ObligationsTimeline 
                obligations={analysis.obligations} 
                keyDates={analysis.keyDates} 
              />
            </motion.div>
          )}

          {/* Legal Disclaimer */}
          <motion.div
            variants={fadeInUp}
            className="relative"
          >
            <div className="bg-gradient-to-r from-gray-900/40 to-gray-800/40 backdrop-blur-md border border-gray-700/30 rounded-2xl p-6 text-center">
              <div className="flex items-center justify-center gap-3 mb-2">
                <motion.span 
                  className="text-xl"
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  ⚖️
                </motion.span>
                <p className="text-gray-400 text-sm font-medium">
                  AI-Powered Analysis • Professional Review Recommended
                </p>
              </div>
              <p className="text-gray-500 text-xs">
                This analysis is provided for informational purposes only and does not constitute legal advice.
                Always consult with a qualified legal professional for important documents.
              </p>
            </div>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            variants={fadeInUp}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8"
          >
            <motion.button
              whileHover={{ 
                scale: 1.05,
                boxShadow: "0 20px 60px rgba(139, 92, 246, 0.4)"
              }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                document.body.classList.add("show-chatbot");
                setShowChatbotHint(false);
              }}
              className="group relative w-full sm:w-auto px-8 py-4 bg-gray-900/60 backdrop-blur-xl border-2 border-purple-500/50 rounded-2xl font-bold text-white shadow-2xl overflow-hidden hover:border-purple-400 transition-all duration-300"
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-pink-600/20"
                initial={{ scale: 0, opacity: 0 }}
                whileHover={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3 }}
              />
              <span className="relative flex items-center justify-center gap-3">
                <motion.svg 
                  className="w-5 h-5" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </motion.svg>
                Ask AI Questions
              </span>
            </motion.button>

            <motion.button
              whileHover={{ 
                scale: 1.05,
                boxShadow: "0 20px 60px rgba(75, 85, 99, 0.4)"
              }}
              whileTap={{ scale: 0.98 }}
              onClick={onAnalyzeAnother}
              className="group relative w-full sm:w-auto px-8 py-4 bg-gray-900/60 backdrop-blur-xl border-2 border-gray-600/50 rounded-2xl font-bold text-gray-300 shadow-2xl overflow-hidden hover:text-white hover:border-gray-500 transition-all duration-300"
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-gray-700/20 to-gray-600/20"
                initial={{ y: '100%' }}
                whileHover={{ y: '0%' }}
                transition={{ duration: 0.3 }}
              />
              <span className="relative flex items-center justify-center gap-3">
                <motion.svg 
                  className="w-5 h-5" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                  whileHover={{ rotate: 180 }}
                  transition={{ duration: 0.3 }}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </motion.svg>
                Analyze Another Document
              </span>
            </motion.button>
          </motion.div>
        </motion.div>
        </div>
      </div>

      {/* Global Styles */}
      <style jsx global>{`
        .export-wrapper {
          position: relative;
        }
        
        @media print {
          .export-wrapper * {
            visibility: visible !important;
            opacity: 1 !important;
          }
        }
        
        @keyframes shimmer {
          0% { background-position: -1000px 0; }
          100% { background-position: 1000px 0; }
        }
        
        @keyframes gradient-shift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 20px rgba(168, 85, 247, 0.3); }
          50% { box-shadow: 0 0 40px rgba(168, 85, 247, 0.6); }
        }
        
        .shimmer-effect {
          background: linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.1) 50%, transparent 100%);
          background-size: 1000px 100%;
          animation: shimmer 3s infinite;
        }

        body::-webkit-scrollbar { display: none; }
        body { -ms-overflow-style: none; scrollbar-width: none; }

        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }

        html { scroll-behavior: smooth; }
      `}</style>
    </motion.section>
  );
}