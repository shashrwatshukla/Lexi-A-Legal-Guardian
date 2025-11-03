'use client';

import { useState, useEffect } from 'react';
import { getStorageUsage, clearCache, deleteAllDocuments } from '../../lib/settingsService';
import { auth } from '../../lib/firebase';
import { useLanguage } from '../../context/LanguageContext';

export default function StorageSettings() {
  const { t } = useLanguage();
  const [storage, setStorage] = useState({ documentCount: 0, sizeInMB: 0 });
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
    if (!confirm('Are you ABSOLUTELY sure? This CANNOT be undone!')) return;

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
                  className="h-full bg-blue-500 transition-all duration-500"
                  style={{ width: `${storagePercentage}%` }}
                />
              </div>
            </div>

            {/* Document Count */}
            <div className="p-4 bg-white/5 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-white/60 text-sm">
                  {t('settings.storage.documentsStored') || 'Documents Stored'}
                </span>
                <span className="text-white font-bold text-2xl">{storage.documentCount}</span>
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
      <div className="bg-red-500/10 backdrop-blur-xl rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="flex-1">
            <h3 className="text-red-400 font-semibold mb-1">
              {t('settings.storage.deleteAllDocuments') || 'Delete All Documents'}
            </h3>
            <p className="text-white/60 text-sm">
              Permanently delete all your uploaded documents. This action cannot be undone.
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