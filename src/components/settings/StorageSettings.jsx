'use client';

import { useState, useEffect } from 'react';
import { getStorageUsage, clearCache, deleteAllDocuments } from '../../lib/settingsService';
import { auth } from '../../lib/firebase';
import { useLanguage } from '../../context/LanguageContext';

export default function StorageSettings() {
  const { t } = useLanguage();
  const [storage, setStorage] = useState({ 
    documentCount: 0, 
    sizeInMB: 0,
    analysesCount: 0,
    draftsCount: 0
  });
  const [loading, setLoading] = useState(true);
  const [clearing, setClearing] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadStorageInfo();
  }, []);

  const loadStorageInfo = async () => {
    setLoading(true);
    try {
      const info = await getStorageUsage(auth.currentUser.uid);
      setStorage(info);
      
      console.log('📊 Storage info loaded:', info);
    } catch (error) {
      console.error('Error loading storage:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClearCache = async () => {
    if (!confirm('Clear all cached data? This will not delete your documents.')) return;

    setClearing(true);
    try {
      await clearCache();
      alert(t('settings.storage.cacheCleared') || 'Cache cleared successfully!');
    } catch (error) {
      console.error('Clear cache error:', error);
      alert('Failed to clear cache');
    } finally {
      setClearing(false);
    }
  };

  const handleDeleteAll = async () => {
    if (!confirm(t('settings.storage.confirmDeleteAll') || 'Delete all documents? This cannot be undone!')) return;
    if (!confirm('Are you ABSOLUTELY sure? This will delete ALL analyses AND drafts! This CANNOT be undone!')) return;

    setDeleting(true);
    try {
      await deleteAllDocuments(auth.currentUser.uid);
      alert(t('settings.storage.documentsDeleted') || 'All documents deleted successfully');
      await loadStorageInfo();
    } catch (error) {
      console.error('Delete all error:', error);
      alert('Failed to delete documents');
    } finally {
      setDeleting(false);
    }
  };

  const storagePercentage = Math.min((storage.sizeInMB / 1000) * 100, 100);

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">
          {t('settings.storage.title') || 'Storage Management'}
        </h2>
        <p className="text-white/60 text-sm">
          Manage your storage and documents
        </p>
      </div>

      {/* Storage Usage */}
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6">
        <h3 className="text-white font-semibold mb-4">
          {t('settings.storage.storageUsed') || 'Storage Used'}
        </h3>
        
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          </div>
        ) : (
          <>
            {/* Storage Bar */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white/60 text-sm">
                  {storage.sizeInMB} MB {t('settings.storage.of') || 'of'} 1 GB
                </span>
                <span className="text-white/60 text-sm">{storagePercentage.toFixed(1)}%</span>
              </div>
              <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
                  style={{ width: `${storagePercentage}%` }}
                />
              </div>
            </div>

            {/* ✅ ENHANCED: Document Count Breakdown */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Total Documents */}
              <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/60 text-xs mb-1">Total Documents</p>
                    <p className="text-white font-bold text-2xl">{storage.documentCount}</p>
                  </div>
                  <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
              </div>

              {/* ✅ Analyses Count */}
              <div className="p-4 bg-blue-500/10 rounded-lg border border-blue-500/30">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-300 text-xs mb-1">📄 Analyses</p>
                    <p className="text-white font-bold text-2xl">{storage.analysesCount || 0}</p>
                  </div>
                  <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
              </div>

              {/* ✅ Drafts Count */}
              <div className="p-4 bg-purple-500/10 rounded-lg border border-purple-500/30">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-300 text-xs mb-1">✍️ Drafts</p>
                    <p className="text-white font-bold text-2xl">{storage.draftsCount || 0}</p>
                  </div>
                  <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Clear Cache */}
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="flex-1">
            <h3 className="text-white font-semibold mb-1">
              {t('settings.storage.clearCache') || 'Clear Cache'}
            </h3>
            <p className="text-white/60 text-sm">
              Remove temporary files and cached data to free up space
            </p>
          </div>
          <button
            onClick={handleClearCache}
            disabled={clearing}
            className="px-4 py-2 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 rounded-lg transition-colors font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
          >
            {clearing ? 'Clearing...' : (t('settings.storage.clearCache') || 'Clear Cache')}
          </button>
        </div>
      </div>

      {/* Delete All Documents */}
      <div className="bg-red-500/10 backdrop-blur-xl rounded-2xl p-6 border border-red-500/30">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="flex-1">
            <h3 className="text-red-400 font-semibold mb-1 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              {t('settings.storage.deleteAllDocuments') || 'Delete All Documents'}
            </h3>
            <p className="text-white/60 text-sm">
              Permanently delete <strong>all analyses AND drafts</strong>. This action cannot be undone.
            </p>
          </div>
          <button
            onClick={handleDeleteAll}
            disabled={deleting}
            className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
          >
            {deleting ? 'Deleting...' : (t('settings.storage.deleteAllDocuments') || 'Delete All')}
          </button>
        </div>
      </div>
    </div>
  );
}