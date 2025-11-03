'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence } from 'framer-motion';
import { deleteAccount } from '../../../lib/settingsService';
import { useLanguage } from '../../../context/LanguageContext';

export default function DeleteAccountModal({ isOpen, onClose }) {
  const { t } = useLanguage();
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // ✅ KEEP DELETE HANDLER - No changes
  const handleDelete = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await deleteAccount(password);
      alert(t('settings.account.deleteAccount.success') || 'Account deleted successfully');
      router.push('/intro');
    } catch (err) {
      setError(err.message || (t('settings.account.deleteAccount.error') || 'Failed to delete account'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            onClick={onClose}
            className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[100]"
          />

          {/* Modal */}
          <div className="fixed inset-0 flex items-center justify-center z-[101] p-4">
            <div
              onClick={(e) => e.stopPropagation()}
              className="bg-black/95 backdrop-blur-2xl rounded-2xl p-6 max-w-md w-full"
            >
              {/* Warning Icon & Title */}
              <div className="text-center mb-4">
                <div className="text-6xl mb-4">⚠️</div>
                <h2 className="text-2xl font-bold text-red-400 mb-2">
                  {t('settings.account.deleteAccount.confirmTitle') || 'Delete Account?'}
                </h2>
                <p className="text-white/80 text-sm">
                  {t('settings.account.deleteAccount.confirmMessage') || 'This action is permanent and cannot be undone. All your data will be deleted.'}
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleDelete} className="space-y-4">
                
                {/* Password Confirmation */}
                <div>
                  <label className="block text-white/80 text-sm font-semibold mb-2">
                    {t('settings.account.deleteAccount.enterPassword') || 'Enter your password to confirm'}
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-3 pr-12 bg-white/10 backdrop-blur-xl rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-red-500/50 transition-all"
                      placeholder="Enter your password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white transition-colors"
                    >
                      {showPassword ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.542 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                {/* What will be deleted */}
                <div className="bg-red-500/10 rounded-lg p-4">
                  <h3 className="text-red-400 font-semibold text-sm mb-2">What will be deleted:</h3>
                  <ul className="space-y-1 text-white/60 text-xs">
                    <li>✓ Your profile and account data</li>
                    <li>✓ All uploaded documents</li>
                    <li>✓ Analysis history and reports</li>
                    <li>✓ Saved preferences and settings</li>
                  </ul>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="p-3 bg-red-500/20 rounded-lg text-red-400 text-sm">
                    {error}
                  </div>
                )}

                {/* Buttons */}
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={loading}
                    className="flex-1 px-4 py-3 bg-white/10 rounded-lg hover:bg-white/20 text-white font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {t('common.buttons.cancel') || 'Cancel'}
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-4 py-3 bg-red-500/30 hover:bg-red-500/40 rounded-lg text-red-400 font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Deleting...' : (t('settings.account.deleteAccount.confirmButton') || 'Delete Forever')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}