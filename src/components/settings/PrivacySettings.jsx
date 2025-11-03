'use client';

import { useState } from 'react';
import { exportUserData } from '../../lib/settingsService';
import { auth } from '../../lib/firebase';
import { useLanguage } from '../../context/LanguageContext';

export default function PrivacySettings({ userData, onUpdate }) {
  const { t } = useLanguage();
  const [exporting, setExporting] = useState(false);

  const handleExportData = async () => {
    setExporting(true);
    try {
      await exportUserData(auth.currentUser.uid);
      alert(t('settings.privacy.downloadData.success') || 'Data exported successfully!');
    } catch (error) {
      console.error('Export error:', error);
      alert(t('settings.privacy.downloadData.error') || 'Failed to export data');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">
          {t('settings.privacy.title') || 'Privacy & Security'}
        </h2>
        <p className="text-white/60 text-sm">
          Protect your account and manage your data
        </p>
      </div>

      {/* Active Sessions */}
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6">
        <div className="mb-4">
          <h3 className="text-white font-semibold mb-1">
            {t('settings.privacy.sessions.title') || 'Active Sessions'}
          </h3>
          <p className="text-white/60 text-sm">
            {t('settings.privacy.sessions.description') || 'Manage devices where you\'re currently logged in'}
          </p>
        </div>
        
        {/* Current Session */}
        <div className="p-4 bg-white/5 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-2xl">💻</div>
              <div>
                <p className="text-white font-semibold text-sm">
                  {t('settings.privacy.sessions.currentDevice') || 'Current Device'}
                </p>
                <p className="text-white/60 text-xs">
                  Last active: Now
                </p>
              </div>
            </div>
            <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-semibold">
              Active
            </span>
          </div>
        </div>

        <p className="text-white/40 text-sm mt-4">
          {t('settings.privacy.sessions.noSessions') || 'No other active sessions'}
        </p>
      </div>

      {/* Download Data */}
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="flex-1">
            <h3 className="text-white font-semibold mb-1">
              {t('settings.privacy.downloadData.title') || 'Download Your Data'}
            </h3>
            <p className="text-white/60 text-sm">
              {t('settings.privacy.downloadData.description') || 'Export all your account data as a JSON file'}
            </p>
          </div>
          <button
            onClick={handleExportData}
            disabled={exporting}
            className="px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 rounded-lg transition-colors font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
          >
            {exporting 
              ? 'Exporting...' 
              : (t('settings.privacy.downloadData.button') || 'Export Data')
            }
          </button>
        </div>
      </div>

      {/* Privacy Information */}
      <div className="bg-blue-500/10 backdrop-blur-xl rounded-2xl p-6">
        <div className="flex items-start gap-3">
          <div className="text-2xl">🔒</div>
          <div>
            <h3 className="text-blue-400 font-semibold mb-1">Your Privacy Matters</h3>
            <p className="text-white/60 text-sm leading-relaxed">
              We use industry-standard encryption to protect your data. Your documents are stored securely 
              and are never shared with third parties. Read our{' '}
              <a href="/privacy" className="text-blue-400 hover:underline">Privacy Policy</a> to learn more.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}