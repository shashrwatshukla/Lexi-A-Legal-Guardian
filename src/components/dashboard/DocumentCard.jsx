'use client';

import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { deleteDocument } from '../../lib/dashboardService';
import { deleteDraft, getDraftById } from '../../lib/draftService';
import { createShareableSession } from '../../lib/shareSession';
import { useLanguage } from '../../context/LanguageContext';

export default function DocumentCard({ document: doc, index, onDelete }) {
  const { t } = useLanguage();
  const router = useRouter();
  const [showMenu, setShowMenu] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const menuRef = useRef(null);
  const buttonRef = useRef(null);

  // ✅ DETECT DOCUMENT TYPE
  const isDraft = doc.type === 'draft';
  const isAnalysis = doc.type === 'analysis';

  console.log('🔍 DocumentCard render:', {
    id: doc.id,
    type: doc.type,
    isDraft,
    isAnalysis,
    fileName: doc.fileName
  });

  // Calculate menu position when opened
  useEffect(() => {
    if (showMenu && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setMenuPosition({
        top: rect.bottom + 8,
        left: rect.right - 224,
      });
    }
  }, [showMenu]);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        menuRef.current && 
        !menuRef.current.contains(event.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target)
      ) {
        setShowMenu(false);
      }
    }

    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
      
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        document.removeEventListener('touchstart', handleClickOutside);
      };
    }
  }, [showMenu]);

  // Close menu on ESC key
  useEffect(() => {
    function handleEscape(event) {
      if (event.key === 'Escape') {
        setShowMenu(false);
      }
    }

    if (showMenu) {
      document.addEventListener('keydown', handleEscape);
      
      return () => {
        document.removeEventListener('keydown', handleEscape);
      };
    }
  }, [showMenu]);

  const getRiskColor = (level) => {
    switch (level?.toLowerCase()) {
      case 'high': return 'text-red-400';
      case 'medium': return 'text-yellow-400';
      case 'low': return 'text-green-400';
      default: return 'text-white/60';
    }
  };

  const getRiskIcon = (level) => {
    switch (level?.toLowerCase()) {
      case 'high': return '⚠️';
      case 'medium': return '⚠️';
      case 'low': return '✅';
      default: return '📄';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'analyzed': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'drafted': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'pending': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'archived': return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      default: return 'bg-white/10 text-white/60 border-white/20';
    }
  };

  // ✅ VIEW REPORT HANDLER - Different logic for each type
  const handleViewReport = async () => {
    setShowMenu(false);
    setLoading(true);

    try {
      console.log(`🔍 Opening document:`, {
        id: doc.id,
        type: doc.type,
        isDraft,
        isAnalysis,
        fileName: doc.fileName
      });

      if (isDraft) {
        // ✅ FOR DRAFTS: Redirect to drafter in VIEW MODE
        console.log('✅ Confirmed: This is a DRAFT, redirecting to /drafter?view=' + doc.id);
        router.push(`/drafter?view=${doc.id}`);
        
      } else if (isAnalysis) {
        // ✅ FOR ANALYSES: Create shareable session (existing code)
        console.log('✅ Confirmed: This is an ANALYSIS, creating shareable session');
        
        const { doc: firestoreDoc, getDoc } = await import('firebase/firestore');
        const { db } = await import('../../lib/firebase');
        
        const docRef = firestoreDoc(db, 'analyses', doc.id);
        const docSnap = await getDoc(docRef);
        
        if (!docSnap.exists()) {
          throw new Error('Analysis document not found');
        }

        const fullData = docSnap.data();

        const analysisData = {
          documentName: doc.fileName,
          analysisResults: fullData.analysisResults || fullData.analysis || {},
          riskScore: doc.riskScore || 0,
          summary: doc.summary || '',
          voiceSummaryUrl: fullData.voiceSummaryUrl || null,
          chatHistory: fullData.chatHistory || [],
          actionItems: fullData.actionItems || [],
          obligations: fullData.obligations || [],
          clauses: fullData.clauses || [],
          risks: fullData.risks || [],
          positives: fullData.positives || [],
          userId: fullData.userId || 'anonymous',
          userEmail: fullData.userEmail || null,
        };

        const shareUrl = await createShareableSession(analysisData);
        const sessionId = shareUrl.split('/share/')[1];
        router.push(`/share/${sessionId}`);
      } else {
        throw new Error('Unknown document type: ' + doc.type);
      }
      
    } catch (error) {
      console.error('❌ Error opening report:', error);
      alert('Failed to open report. Please try again.\n\nError: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // ✅ DELETE HANDLER - Different logic for each type
  const handleDelete = async () => {
    setShowMenu(false);
    
    console.log('🗑️ Delete button clicked for document:', {
      id: doc.id,
      type: doc.type,
      isDraft,
      isAnalysis
    });
    
    const confirmMessage = isDraft 
      ? 'Are you sure you want to delete this draft? This action cannot be undone.'
      : (t('dashboard.documents.deleteConfirm') || 'Are you sure you want to delete this document? This action cannot be undone.');
    
    if (!window.confirm(confirmMessage)) {
      return;
    }

    setDeleting(true);
    
    try {
      if (isDraft) {
        // ✅ Delete from drafts collection
        console.log('🗑️ Deleting DRAFT from Firestore:', doc.id);
        await deleteDraft(doc.id);
        console.log('✅ Draft deleted successfully:', doc.id);
      } else if (isAnalysis) {
        // ✅ Delete from analyses collection
        console.log('🗑️ Deleting ANALYSIS from Firestore:', doc.id);
        await deleteDocument(doc.id);
        console.log('✅ Analysis deleted successfully:', doc.id);
      }
      
      const successMessage = isDraft 
        ? 'Draft deleted successfully!'
        : (t('dashboard.documents.deleteSuccess') || 'Document deleted successfully!');
      
      alert(successMessage);
      
      if (typeof onDelete === 'function') {
        onDelete(doc.id);
      } else {
        window.location.reload();
      }
      
    } catch (error) {
      console.error('❌ Delete error:', error);
      const errorMessage = isDraft
        ? 'Failed to delete draft. Please try again.'
        : (t('dashboard.documents.deleteFailed') || 'Failed to delete document. Please try again.');
      alert(`${errorMessage}\n\nError: ${error.message}`);
    } finally {
      setDeleting(false);
    }
  };

  // ✅ DOWNLOAD HANDLER - Different logic for each type
  const handleDownload = async () => {
    setShowMenu(false);
    
    try {
      if (isDraft) {
        // ✅ FOR DRAFTS: Download PDF from base64
        console.log('📥 Downloading DRAFT PDF:', doc.id);
        
        const draftData = await getDraftById(doc.id);
        
        if (draftData.pdfBase64) {
          // Convert base64 to blob
          const byteCharacters = atob(draftData.pdfBase64);
          const byteNumbers = new Array(byteCharacters.length);
          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
          }
          const byteArray = new Uint8Array(byteNumbers);
          const blob = new Blob([byteArray], { type: 'application/pdf' });
          const url = URL.createObjectURL(blob);
          
          const link = document.createElement('a');
          link.href = url;
          link.download = `${doc.fileName.replace(/[^a-z0-9]/gi, '_')}.pdf`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
          
          console.log('✅ Draft PDF download complete');
        } else {
          throw new Error('PDF not found for this draft');
        }
        
      } else if (isAnalysis) {
        // ✅ FOR ANALYSES: Download JSON (existing code)
        console.log('📥 Downloading ANALYSIS JSON:', doc.id);
        
        const { doc: firestoreDoc, getDoc } = await import('firebase/firestore');
        const { db } = await import('../../lib/firebase');
        
        const docRef = firestoreDoc(db, 'analyses', doc.id);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data();
          
          const analysisData = {
            fileName: doc.fileName,
            analyzedAt: doc.uploadDate,
            riskScore: doc.riskScore,
            riskLevel: doc.riskLevel,
            summary: doc.summary,
            fullAnalysis: data.fullAnalysis || data.analysis || data,
            exportedAt: new Date().toISOString()
          };
          
          const dataStr = JSON.stringify(analysisData, null, 2);
          const blob = new Blob([dataStr], { type: 'application/json' });
          const url = URL.createObjectURL(blob);
          
          const link = document.createElement('a');
          link.href = url;
          link.download = `${doc.fileName.replace(/\.[^/.]+$/, '')}_analysis.json`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
          
          console.log('✅ Analysis JSON download complete');
        }
      }
    } catch (error) {
      console.error('❌ Download error:', error);
      alert('Failed to download. Please try again.\n\nError: ' + error.message);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown date';
    try {
      const date = new Date(dateString);
      const formattedDate = date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
      const formattedTime = date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
      return `${formattedDate} at ${formattedTime}`;
    } catch (error) {
      return 'Invalid date';
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.05 }}
        className="relative bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl p-4 transition-all duration-300"
      >
        <div className="flex items-start justify-between gap-4">
          {/* Left: Document Info */}
          <div className="flex-1 min-w-0">
            
            {/* ✅ HEADER with Type Badge */}
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="text-2xl">{isDraft ? '✍️' : '📄'}</span>
              <h3 className="text-white font-semibold truncate flex-1 min-w-0">{doc.fileName}</h3>
              
              {/* ✅ TYPE BADGE - Always visible with professional styling */}
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide ${
                isDraft 
                  ? 'bg-gradient-to-r from-purple-500/30 to-pink-500/30 text-purple-300 border border-purple-400/40 shadow-sm' 
                  : 'bg-gradient-to-r from-blue-500/30 to-cyan-500/30 text-blue-300 border border-blue-400/40 shadow-sm'
              }`}>
                {isDraft ? '✍️ Draft' : '📄 Analysis'}
              </span>
            </div>

            {/* ✅ METADATA ROW - Different for each type */}
            <div className="flex flex-wrap items-center gap-2 mb-2">
              
              {/* For ANALYSES: Show risk level */}
              {isAnalysis && (
                <>
                  <span className={`flex items-center gap-1 ${getRiskColor(doc.riskLevel)}`}>
                    {getRiskIcon(doc.riskLevel)} {t(`dashboard.documents.riskLevel.${doc.riskLevel}`) || doc.riskLevel}
                  </span>
                  <span className="text-white/40">•</span>
                </>
              )}
              
              {/* For DRAFTS: Show jurisdiction */}
              {isDraft && doc.jurisdiction && (
                <>
                  <span className="flex items-center gap-1 text-purple-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {doc.jurisdiction}
                  </span>
                  <span className="text-white/40">•</span>
                </>
              )}
              
              {/* Status badge */}
              <span className={`px-2 py-1 rounded-full text-xs border font-medium ${
                isDraft 
                  ? 'bg-purple-500/20 text-purple-400 border-purple-500/30'
                  : 'bg-green-500/20 text-green-400 border-green-500/30'
              }`}>
                {isDraft ? '✍️ Drafted' : '🟢 Analyzed'}
              </span>
            </div>

            {/* Upload/Created date */}
            <p className="text-white/40 text-sm flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {isDraft ? 'Created' : 'Uploaded'} on {formatDate(doc.uploadDate)}
            </p>
          </div>

          {/* Right: Three-Dot Menu Button */}
          <div className="relative">
            <button
              ref={buttonRef}
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(!showMenu);
              }}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              disabled={deleting || loading}
            >
              <svg className="w-5 h-5 text-white/60" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
              </svg>
            </button>
          </div>
        </div>
      </motion.div>

      {/* ✅ PORTAL - Menu rendered at document.body level */}
      {typeof window !== 'undefined' && showMenu && createPortal(
        <AnimatePresence>
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-[9998]"
              onClick={() => setShowMenu(false)}
            />
            
            {/* Menu */}
            <motion.div
              ref={menuRef}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              style={{
                position: 'fixed',
                top: `${menuPosition.top}px`,
                left: `${menuPosition.left}px`,
              }}
              className="w-56 bg-gray-900 backdrop-blur-xl border border-white/20 rounded-xl shadow-2xl overflow-hidden z-[9999]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* View Report */}
              <button
                onClick={handleViewReport}
                disabled={loading}
                className="w-full px-4 py-3 text-left text-white hover:bg-white/10 transition-colors flex items-center gap-3 disabled:opacity-50 group"
              >
                <svg className="w-5 h-5 text-blue-400 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <span className="font-medium">
                  {loading ? 'Loading...' : (t('dashboard.documents.actions.viewReport') || 'View Report')}
                </span>
              </button>

              {/* Download */}
              <button
                onClick={handleDownload}
                className="w-full px-4 py-3 text-left text-white hover:bg-white/10 transition-colors flex items-center gap-3 group"
              >
                <svg className="w-5 h-5 text-green-400 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                <span className="font-medium">
                  {isDraft ? 'Download PDF' : (t('dashboard.documents.actions.download') || 'Download')}
                </span>
              </button>

              {/* Delete */}
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="w-full px-4 py-3 text-left text-red-400 hover:bg-red-500/20 transition-colors flex items-center gap-3 disabled:opacity-50 group"
              >
                <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                <span className="font-medium">
                  {deleting ? 'Deleting...' : (t('dashboard.documents.actions.delete') || 'Delete')}
                </span>
              </button>
            </motion.div>
          </>
        </AnimatePresence>,
        document.body
      )}
    </>
  );
}