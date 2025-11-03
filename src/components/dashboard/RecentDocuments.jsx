'use client';

import { useState, useEffect } from 'react';
import { getRecentDocuments, getAllDocuments, getRecentDrafts, getAllDrafts } from '../../lib/dashboardService';
import { auth } from '../../lib/firebase';
import { useLanguage } from '../../context/LanguageContext';
import DocumentCard from './DocumentCard';

export default function RecentDocuments({ onUpdate }) {
  const { t } = useLanguage();
  const [allAnalyses, setAllAnalyses] = useState([]);
  const [allDrafts, setAllDrafts] = useState([]);
  const [showAllAnalyses, setShowAllAnalyses] = useState(false);
  const [showAllDrafts, setShowAllDrafts] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterRisk, setFilterRisk] = useState('all');

  // ✅ LOAD ALL DOCUMENTS (NO LIMIT)
  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    setLoading(true);
    try {
      const user = auth.currentUser;
      if (user) {
        console.log('📥 Loading ALL documents for user:', user.uid);
        
        // ✅ FETCH ALL DOCUMENTS (NO LIMIT)
        const [analyses, drafts] = await Promise.all([
          getAllDocuments(user.uid),
          getAllDrafts(user.uid)
        ]);
        
        console.log(`📊 Fetched ${analyses.length} analyses + ${drafts.length} drafts`);
        
        // Sort by date (most recent first)
        analyses.sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate));
        drafts.sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate));
        
        setAllAnalyses(analyses);
        setAllDrafts(drafts);
        
        console.log('✅ All documents loaded');
      }
    } catch (error) {
      console.error('❌ Error loading documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    await loadDocuments();
    if (onUpdate) onUpdate();
  };

  // ✅ APPLY FILTERS
  const filterDocuments = (docs) => {
    return docs.filter(doc => {
      const matchesSearch = doc.fileName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRisk = filterRisk === 'all' || doc.riskLevel === filterRisk;
      return matchesSearch && matchesRisk;
    });
  };

  // ✅ GET FILTERED & SLICED DOCUMENTS
  const filteredAnalyses = filterDocuments(allAnalyses);
  const filteredDrafts = filterDocuments(allDrafts);

  // ✅ SHOW FIRST 5 OR ALL
  const displayedAnalyses = showAllAnalyses ? filteredAnalyses : filteredAnalyses.slice(0, 5);
  const displayedDrafts = showAllDrafts ? filteredDrafts : filteredDrafts.slice(0, 5);

  const hasMoreAnalyses = filteredAnalyses.length > 5;
  const hasMoreDrafts = filteredDrafts.length > 5;

  const shouldShowAnalyses = (filterType === 'all' || filterType === 'analysis') && filteredAnalyses.length > 0;
  const shouldShowDrafts = (filterType === 'all' || filterType === 'draft') && filteredDrafts.length > 0;

  return (
    <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-4 sm:p-6 mb-8">
      
      {/* ✅ HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-white">
          {t('dashboard.documents.title') || 'All Documents'}
        </h2>
        <div className="text-white/60 text-sm">
          {allAnalyses.length + allDrafts.length} Total Documents
        </div>
      </div>

      {/* ✅ FILTERS */}
      {(allAnalyses.length > 0 || allDrafts.length > 0) && (
        <div className="flex flex-col gap-3 mb-4 sm:mb-6">
          
          {/* Search */}
          <div className="w-full">
            <div className="relative">
              <svg 
                className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40 pointer-events-none" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
                />
              </svg>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={t('common.buttons.search') || 'Search documents...'}
                className="w-full pl-10 pr-4 py-2.5 bg-white/10 backdrop-blur-xl rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-sm sm:text-base"
              />
            </div>
          </div>

          {/* Filter Row */}
          <div className="flex flex-col sm:flex-row gap-3">
            
            {/* Type Filter */}
            <div className="w-full sm:w-auto sm:flex-1">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full px-4 py-2.5 bg-white/10 backdrop-blur-xl rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all appearance-none cursor-pointer text-sm sm:text-base"
                style={{ colorScheme: 'dark' }}
              >
                <option value="all" className="bg-gray-900">📋 All Types</option>
                <option value="analysis" className="bg-gray-900">📄 Analyses Only</option>
                <option value="draft" className="bg-gray-900">✍️ Drafts Only</option>
              </select>
            </div>

            {/* Risk Filter */}
            {(filterType === 'all' || filterType === 'analysis') && (
              <div className="w-full sm:w-auto sm:flex-1">
                <select
                  value={filterRisk}
                  onChange={(e) => setFilterRisk(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white/10 backdrop-blur-xl rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all appearance-none cursor-pointer text-sm sm:text-base"
                  style={{ colorScheme: 'dark' }}
                >
                  <option value="all" className="bg-gray-900">
                    {t('common.buttons.filter') || 'All Risk Levels'}
                  </option>
                  <option value="high" className="bg-gray-900">
                    🔴 {t('dashboard.documents.riskLevel.high') || 'High Risk'}
                  </option>
                  <option value="medium" className="bg-gray-900">
                    🟡 {t('dashboard.documents.riskLevel.medium') || 'Medium Risk'}
                  </option>
                  <option value="low" className="bg-gray-900">
                    🟢 {t('dashboard.documents.riskLevel.low') || 'Low Risk'}
                  </option>
                </select>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ✅ LOADING STATE */}
      {loading ? (
        <div className="flex items-center justify-center py-8 sm:py-12">
          <div className="flex flex-col items-center gap-3">
            <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-blue-400"></div>
            <p className="text-white/60 text-sm">Loading documents...</p>
          </div>
        </div>
      ) : (allAnalyses.length === 0 && allDrafts.length === 0) ? (
        // ✅ EMPTY STATE (NO DOCUMENTS AT ALL)
        <div className="text-center py-8 sm:py-12 px-4">
          <div className="text-5xl sm:text-6xl mb-4">📄</div>
          <p className="text-white/60 text-base sm:text-lg mb-2">
            {t('dashboard.documents.noDocuments') || 'No documents yet'}
          </p>
          <p className="text-white/40 text-xs sm:text-sm">
            {t('dashboard.documents.uploadFirst') || 'Upload or draft your first document to get started'}
          </p>
        </div>
      ) : (filteredAnalyses.length === 0 && filteredDrafts.length === 0) ? (
        // ✅ EMPTY STATE (NO MATCHES)
        <div className="text-center py-8 sm:py-12 px-4">
          <div className="text-5xl sm:text-6xl mb-4">🔍</div>
          <p className="text-white/60 text-base sm:text-lg mb-2">
            No documents match your filters
          </p>
          <p className="text-white/40 text-xs sm:text-sm">
            Try adjusting your search or filters
          </p>
        </div>
      ) : (
        // ✅ DOCUMENTS LIST
        <div className="space-y-6 sm:space-y-8">
          
          {/* ===== ANALYSES SECTION ===== */}
          {shouldShowAnalyses && (
            <div>
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <h3 className="text-white font-semibold text-sm sm:text-base">
                    📄 Analyzed Documents
                  </h3>
                </div>
                <span className="text-white/60 text-xs">
                  {displayedAnalyses.length} of {filteredAnalyses.length}
                </span>
              </div>

              {/* Analyses Cards */}
              <div className="space-y-3 sm:space-y-4">
                {displayedAnalyses.map((doc, index) => (
                  <DocumentCard
                    key={doc.id}
                    document={doc}
                    index={index}
                    onDelete={handleDelete}
                  />
                ))}
              </div>

              {/* ✅ LOAD MORE BUTTON FOR ANALYSES */}
              {hasMoreAnalyses && !showAllAnalyses && (
                <div className="text-center mt-4">
                  <button
                    onClick={() => setShowAllAnalyses(true)}
                    className="px-6 py-2.5 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 text-blue-400 font-semibold rounded-lg transition-all duration-200 flex items-center gap-2 mx-auto"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                    Load More ({filteredAnalyses.length - 5} more)
                  </button>
                </div>
              )}

              {/* ✅ SHOW LESS BUTTON FOR ANALYSES */}
              {showAllAnalyses && hasMoreAnalyses && (
                <div className="text-center mt-4">
                  <button
                    onClick={() => setShowAllAnalyses(false)}
                    className="text-white/60 hover:text-white text-sm font-semibold transition-colors"
                  >
                    Show Less ↑
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ===== DRAFTS SECTION ===== */}
          {shouldShowDrafts && (
            <div>
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  <h3 className="text-white font-semibold text-sm sm:text-base">
                    ✍️ Drafted Documents
                  </h3>
                </div>
                <span className="text-white/60 text-xs">
                  {displayedDrafts.length} of {filteredDrafts.length}
                </span>
              </div>

              {/* Drafts Cards */}
              <div className="space-y-3 sm:space-y-4">
                {displayedDrafts.map((doc, index) => (
                  <DocumentCard
                    key={doc.id}
                    document={doc}
                    index={index}
                    onDelete={handleDelete}
                  />
                ))}
              </div>

              {/* ✅ LOAD MORE BUTTON FOR DRAFTS */}
              {hasMoreDrafts && !showAllDrafts && (
                <div className="text-center mt-4">
                  <button
                    onClick={() => setShowAllDrafts(true)}
                    className="px-6 py-2.5 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 text-purple-400 font-semibold rounded-lg transition-all duration-200 flex items-center gap-2 mx-auto"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                    Load More ({filteredDrafts.length - 5} more)
                  </button>
                </div>
              )}

              {/* ✅ SHOW LESS BUTTON FOR DRAFTS */}
              {showAllDrafts && hasMoreDrafts && (
                <div className="text-center mt-4">
                  <button
                    onClick={() => setShowAllDrafts(false)}
                    className="text-white/60 hover:text-white text-sm font-semibold transition-colors"
                  >
                    Show Less ↑
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}