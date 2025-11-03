'use client';

import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { deleteDocument } from '../../lib/dashboardService';
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

  // ✅ Calculate menu position when opened
  useEffect(() => {
    if (showMenu && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setMenuPosition({
        top: rect.bottom + 8,
        left: rect.right - 224, // 224px = w-56
      });
    }
  }, [showMenu]);

  // ✅ Close menu when clicking outside
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

  // ✅ Close menu on ESC key
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
      case 'pending': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'archived': return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      default: return 'bg-white/10 text-white/60 border-white/20';
    }
  };

  // ✅ VIEW REPORT HANDLER
  const handleViewReport = async () => {
    setShowMenu(false);
    setLoading(true);

    try {
      console.log('📊 Opening report for document:', doc.id);
      
      const { doc: firestoreDoc, getDoc } = await import('firebase/firestore');
      const { db } = await import('../../lib/firebase');
      
      const docRef = firestoreDoc(db, 'analyses', doc.id);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        throw new Error('Document not found');
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
      
    } catch (error) {
      console.error('❌ Error opening report:', error);
      alert('Failed to open report. Please try again.\n\nError: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // ✅ DELETE HANDLER
  const handleDelete = async () => {
    setShowMenu(false);
    
    console.log('🗑️ Delete button clicked for document:', doc.id);
    
    const confirmMessage = t('dashboard.documents.deleteConfirm') || 'Are you sure you want to delete this document? This action cannot be undone.';
    
    if (!window.confirm(confirmMessage)) {
      return;
    }

    setDeleting(true);
    
    try {
      await deleteDocument(doc.id);
      console.log('✅ Document deleted successfully:', doc.id);
      
      const successMessage = t('dashboard.documents.deleteSuccess') || 'Document deleted successfully!';
      alert(successMessage);
      
      if (typeof onDelete === 'function') {
        onDelete(doc.id);
      } else {
        window.location.reload();
      }
      
    } catch (error) {
      console.error('❌ Delete error:', error);
      const errorMessage = t('dashboard.documents.deleteFailed') || 'Failed to delete document. Please try again.';
      alert(`${errorMessage}\n\nError: ${error.message}`);
    } finally {
      setDeleting(false);
    }
  };

  // ✅ DOWNLOAD HANDLER
  const handleDownload = async () => {
    setShowMenu(false);
    
    try {
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
        
        console.log('✅ Download complete');
      }
    } catch (error) {
      console.error('❌ Download error:', error);
      alert('Failed to download analysis. Please try again.');
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
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">📄</span>
              <h3 className="text-white font-semibold truncate">{doc.fileName}</h3>
            </div>

            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className={`flex items-center gap-1 ${getRiskColor(doc.riskLevel)}`}>
                {getRiskIcon(doc.riskLevel)} {t(`dashboard.documents.riskLevel.${doc.riskLevel}`) || doc.riskLevel}
              </span>
              <span className="text-white/40">•</span>
              <span className={`px-2 py-1 rounded-full text-xs border ${getStatusColor(doc.status)}`}>
                🟢 {t(`dashboard.documents.status.${doc.status}`) || doc.status}
              </span>
            </div>

            <p className="text-white/40 text-sm">
              Uploaded on {formatDate(doc.uploadDate)}
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
                  {t('dashboard.documents.actions.download') || 'Download'}
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