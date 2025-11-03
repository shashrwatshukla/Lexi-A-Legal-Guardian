'use client';

import { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { auth } from '../../lib/firebase';
import ChangePasswordModal from './modals/ChangePasswordModal';
import DeleteAccountModal from './modals/DeleteAccountModal';

export default function AccountSettings({ userData, onUpdate }) {
  const { t } = useLanguage();
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  return (
    <>
      {/* Modals */}
      <ChangePasswordModal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        onUpdate={onUpdate}
      />

      <DeleteAccountModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
      />

      <div className="space-y-6">
        
        {/* Header */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">
            {t('settings.account.title') || 'Account Settings'}
          </h2>
          <p className="text-white/60 text-sm">
            Manage your account security and preferences
          </p>
        </div>

        {/* Change Password */}
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="flex-1">
              <h3 className="text-white font-semibold mb-1">
                {t('settings.account.changePassword.title') || 'Change Password'}
              </h3>
              <p className="text-white/60 text-sm">
                Update your password to keep your account secure
              </p>
            </div>
            <button
              onClick={() => setShowPasswordModal(true)}
              className="px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg transition-colors font-semibold text-sm whitespace-nowrap"
            >
              {t('settings.account.changePassword.button') || 'Change Password'}
            </button>
          </div>
        </div>

        {/* Email Verification Status */}
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6">
          <div className="flex items-start gap-4">
            <div className="flex-1">
              <h3 className="text-white font-semibold mb-1">Email Verification</h3>
              <p className="text-white/60 text-sm mb-3">
                Your email: <span className="text-white font-medium">{userData?.email}</span>
              </p>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-semibold">
                  ✓ Verified
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Account Created Date */}
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-white font-semibold mb-1">Account Created</h3>
              <p className="text-white/60 text-sm">
                {userData?.createdAt 
                  ? new Date(userData.createdAt).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })
                  : 'Unknown'}
              </p>
            </div>
            <span className="text-3xl">🎉</span>
          </div>
        </div>

        {/* Delete Account (Danger Zone) */}
        <div className="bg-red-500/10 backdrop-blur-xl rounded-2xl p-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="flex-1">
              <h3 className="text-red-400 font-semibold mb-1">
                {t('settings.account.deleteAccount.title') || 'Delete Account'}
              </h3>
              <p className="text-white/60 text-sm">
                {t('settings.account.deleteAccount.description') || 'Permanently delete your account and all data. This action cannot be undone.'}
              </p>
            </div>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors font-semibold text-sm whitespace-nowrap"
            >
              {t('settings.account.deleteAccount.button') || 'Delete Account'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}