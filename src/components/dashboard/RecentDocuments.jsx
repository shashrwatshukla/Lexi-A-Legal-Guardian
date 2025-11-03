'use client';

import { useState, useEffect } from 'react';
import { getRecentDocuments, getAllDocuments } from '../../lib/dashboardService';
import { auth } from '../../lib/firebase';
import { useLanguage } from '../../context/LanguageContext';
import DocumentCard from './DocumentCard';

export default function RecentDocuments({ onUpdate }) {
  const { t } = useLanguage();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRisk, setFilterRisk] = useState('all');

  useEffect(() => {
    loadDocuments();
  }, [showAll]);

  const loadDocuments = async () => {
    setLoading(true);
    try {
      const user = auth.currentUser;
      if (user) {
        const docs = showAll 
          ? await getAllDocuments(user.uid)
          : await getRecentDocuments(user.uid, 5);
        setDocuments(docs);
      }
    } catch (error) {
      console.error('Error loading documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    await loadDocuments();
    if (onUpdate) onUpdate();
  };

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.fileName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRisk = filterRisk === 'all' || doc.riskLevel === filterRisk;
    return matchesSearch && matchesRisk;
  });

  return (
    <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 mb-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h2 className="text-2xl font-bold text-white">
          {t('dashboard.documents.title') || 'Recent Documents'}
        </h2>
        {documents.length > 5 && !showAll && (
          <button
            onClick={() => setShowAll(true)}
            className="text-blue-400 hover:text-blue-300 text-sm font-semibold transition-colors self-start sm:self-auto"
          >
            {t('common.buttons.viewAll') || 'View All'} →
          </button>
        )}
      </div>

      {/* Search & Filter - FIXED ALIGNMENT */}
      {documents.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          
          {/* Search */}
          <div className="flex-1 relative">
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
              className="w-full pl-10 pr-4 py-2.5 bg-white/10 backdrop-blur-xl rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
            />
          </div>

          {/* Filter - FIXED WIDTH */}
          <div className="w-full sm:w-auto sm:min-w-[200px]">
            <select
              value={filterRisk}
              onChange={(e) => setFilterRisk(e.target.value)}
              className="w-full px-4 py-2.5 bg-white/10 backdrop-blur-xl rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all appearance-none cursor-pointer"
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
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-3">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"></div>
            <p className="text-white/60 text-sm">Loading documents...</p>
          </div>
        </div>
      ) : filteredDocuments.length === 0 ? (
        // Empty State
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📄</div>
          <p className="text-white/60 text-lg mb-2">
            {searchTerm || filterRisk !== 'all' 
              ? 'No documents match your filters' 
              : (documents.length === 0
                  ? (t('dashboard.documents.noDocuments') || 'No documents yet')
                  : 'No matching documents'
                )
            }
          </p>
          <p className="text-white/40 text-sm">
            {searchTerm || filterRisk !== 'all'
              ? 'Try adjusting your search or filter'
              : (documents.length === 0
                  ? (t('dashboard.documents.uploadFirst') || 'Upload your first document to get started')
                  : 'Try different filters'
                )
            }
          </p>
        </div>
      ) : (
        // Documents List
        <div className="space-y-4">
          {filteredDocuments.map((doc, index) => (
            <DocumentCard
              key={doc.id}
              document={doc}
              index={index}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Show Less Button */}
      {showAll && documents.length > 5 && (
        <div className="text-center mt-6">
          <button
            onClick={() => setShowAll(false)}
            className="text-white/60 hover:text-white text-sm font-semibold transition-colors"
          >
            Show Less ↑
          </button>
        </div>
      )}
    </div>
  );
}