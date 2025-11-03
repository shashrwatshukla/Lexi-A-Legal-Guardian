'use client';

import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { updateUsername } from '../../lib/userService';
import { auth } from '../../lib/firebase';
import { useLanguage } from '../../context/LanguageContext';

export default function UsernameWarningModal({ isOpen, onClose, currentUsername, onUpdate }) {
  const { t } = useLanguage();
  const [newUsername, setNewUsername] = useState(currentUsername || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // ✅ KEEP UPDATE HANDLER - No changes
  const handleUpdate = async () => {
    if (!newUsername || newUsername === currentUsername) {
      setError('Please enter a different username');
      return;
    }

    // Validate username format
    if (!/^[a-z0-9_]+$/.test(newUsername)) {
      setError('Username can only contain lowercase letters, numbers, and underscores');
      return;
    }

    if (newUsername.length < 3) {
      setError('Username must be at least 3 characters');
      return;
    }

    setSaving(true);
    setError('');

    try {
      await updateUsername(auth.currentUser.uid, newUsername);
      alert((t('dashboard.profile.usernameWarning') || 'Username can only be changed once') + '. Updated successfully!');
      onClose();
      if (onUpdate) onUpdate();
    } catch (err) {
      setError(err.message || 'Failed to update username');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100]"
          />

          {/* Modal */}
          <div className="fixed inset-0 flex items-center justify-center z-[101] p-4">
            <div
              onClick={(e) => e.stopPropagation()}
              className="bg-black/95 backdrop-blur-2xl rounded-2xl p-6 max-w-md w-full"
            >
              {/* Warning Header */}
              <div className="text-center mb-4">
                <div className="text-5xl mb-3">⚠️</div>
                <h2 className="text-2xl font-bold text-yellow-400 mb-2">
                  {t('common.buttons.edit') || 'Edit'} {t('dashboard.profile.username') || 'Username'}
                </h2>
                <p className="text-white/80 text-sm leading-relaxed">
                  {t('dashboard.profile.usernameWarning') || 'You can only change your username once'}. Are you sure?
                </p>
              </div>

              {/* Current Username */}
              <div className="mb-4 p-3 bg-white/5 rounded-lg">
                <p className="text-white/60 text-xs mb-1">Current Username:</p>
                <p className="text-white font-semibold">@{currentUsername}</p>
              </div>

              {/* New Username Input */}
              <div className="mb-4">
                <label className="block text-white/80 text-sm font-semibold mb-2">
                  New Username
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/60">@</span>
                  <input
                    type="text"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value.toLowerCase().replace(/\s/g, ''))}
                    className="w-full pl-8 pr-4 py-3 bg-white/10 backdrop-blur-xl rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-yellow-500/50 transition-all"
                    placeholder="newusername"
                  />
                </div>
                <p className="text-white/40 text-xs mt-2">
                  • Only lowercase letters, numbers, and underscores<br />
                  • Minimum 3 characters<br />
                  • This change is permanent
                </p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-4 p-3 bg-red-500/20 rounded-lg text-red-400 text-sm">
                  {error}
                </div>
              )}

              {/* Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  disabled={saving}
                  className="flex-1 px-4 py-3 bg-white/10 rounded-lg hover:bg-white/20 text-white font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {t('common.buttons.cancel') || 'Cancel'}
                </button>
                <button
                  onClick={handleUpdate}
                  disabled={saving}
                  className="flex-1 px-4 py-3 bg-yellow-500/30 hover:bg-yellow-500/40 text-yellow-400 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? 'Saving...' : (t('common.buttons.confirm') || 'Confirm Change')}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}