'use client';

import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { changePassword } from '../../../lib/settingsService';
import { useLanguage } from '../../../context/LanguageContext';

export default function ChangePasswordModal({ isOpen, onClose, onUpdate }) {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // ✅ Password strength validation
  const [passwordStrength, setPasswordStrength] = useState({
    hasMinLength: false,
    hasUpperCase: false,
    hasLowerCase: false,
    hasNumber: false,
    hasSpecialChar: false
  });

  // ✅ Update password strength on input
  const handleNewPasswordChange = (value) => {
    setFormData({ ...formData, newPassword: value });
    setPasswordStrength({
      hasMinLength: value.length >= 8,
      hasUpperCase: /[A-Z]/.test(value),
      hasLowerCase: /[a-z]/.test(value),
      hasNumber: /[0-9]/.test(value),
      hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(value)
    });
  };

  const isPasswordValid = () => {
    return Object.values(passwordStrength).every(Boolean);
  };

  // ✅ KEEP SUBMIT HANDLER - No changes
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (formData.newPassword !== formData.confirmPassword) {
      setError(t('settings.account.changePassword.passwordMismatch') || 'Passwords do not match');
      return;
    }

    if (!isPasswordValid()) {
      setError('Password does not meet security requirements');
      return;
    }

    setLoading(true);

    try {
      await changePassword(formData.currentPassword, formData.newPassword);
      setSuccess(true);
      setTimeout(() => {
        onClose();
        setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setSuccess(false);
      }, 2000);
    } catch (err) {
      setError(err.message || (t('settings.account.changePassword.error') || 'Failed to change password'));
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
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100]"
          />

          {/* Modal */}
          <div className="fixed inset-0 flex items-center justify-center z-[101] p-4">
            <div
              onClick={(e) => e.stopPropagation()}
              className="bg-black/95 backdrop-blur-2xl rounded-2xl p-6 max-w-md w-full"
            >
              {/* Header */}
              <h2 className="text-2xl font-bold text-white mb-4">
                {t('settings.account.changePassword.title') || 'Change Password'}
              </h2>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                
                {/* Current Password */}
                <div>
                  <label className="block text-white/80 text-sm font-semibold mb-2">
                    {t('settings.account.changePassword.currentPassword') || 'Current Password'}
                  </label>
                  <div className="relative">
                    <input
                      type={showCurrentPassword ? "text" : "password"}
                      required
                      value={formData.currentPassword}
                      onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                      className="w-full px-4 py-3 pr-12 bg-white/10 backdrop-blur-xl rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                      placeholder="Enter current password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white transition-colors"
                    >
                      {showCurrentPassword ? (
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

                {/* New Password */}
                <div>
                  <label className="block text-white/80 text-sm font-semibold mb-2">
                    {t('settings.account.changePassword.newPassword') || 'New Password'}
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      required
                      value={formData.newPassword}
                      onChange={(e) => handleNewPasswordChange(e.target.value)}
                      className="w-full px-4 py-3 pr-12 bg-white/10 backdrop-blur-xl rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                      placeholder="Enter new password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white transition-colors"
                    >
                      {showNewPassword ? (
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

                  {/* Password Requirements */}
                  {formData.newPassword && (
                    <div className="mt-2 space-y-1">
                      <div className={`text-xs ${passwordStrength.hasMinLength ? 'text-green-400' : 'text-white/60'}`}>
                        {passwordStrength.hasMinLength ? '✓' : '○'} At least 8 characters
                      </div>
                      <div className={`text-xs ${passwordStrength.hasUpperCase ? 'text-green-400' : 'text-white/60'}`}>
                        {passwordStrength.hasUpperCase ? '✓' : '○'} One uppercase letter
                      </div>
                      <div className={`text-xs ${passwordStrength.hasLowerCase ? 'text-green-400' : 'text-white/60'}`}>
                        {passwordStrength.hasLowerCase ? '✓' : '○'} One lowercase letter
                      </div>
                      <div className={`text-xs ${passwordStrength.hasNumber ? 'text-green-400' : 'text-white/60'}`}>
                        {passwordStrength.hasNumber ? '✓' : '○'} One number
                      </div>
                      <div className={`text-xs ${passwordStrength.hasSpecialChar ? 'text-green-400' : 'text-white/60'}`}>
                        {passwordStrength.hasSpecialChar ? '✓' : '○'} One special character (!@#$%^&*)
                      </div>
                    </div>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-white/80 text-sm font-semibold mb-2">
                    {t('settings.account.changePassword.confirmPassword') || 'Confirm New Password'}
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      required
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      className="w-full px-4 py-3 pr-12 bg-white/10 backdrop-blur-xl rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                      placeholder="Re-enter new password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white transition-colors"
                    >
                      {showConfirmPassword ? (
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
                  {formData.confirmPassword && formData.newPassword !== formData.confirmPassword && (
                    <p className="text-red-400 text-xs mt-1">Passwords do not match</p>
                  )}
                </div>

                {/* Error Message */}
                {error && (
                  <div className="p-3 bg-red-500/20 rounded-lg text-red-400 text-sm">
                    {error}
                  </div>
                )}

                {/* Success Message */}
                {success && (
                  <div className="p-3 bg-green-500/20 rounded-lg text-green-400 text-sm">
                    {t('settings.account.changePassword.success') || 'Password changed successfully!'}
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
                    disabled={loading || !isPasswordValid()}
                    className="flex-1 px-4 py-3 bg-blue-500/30 hover:bg-blue-500/40 rounded-lg text-blue-400 font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Updating...' : (t('settings.account.changePassword.button') || 'Change Password')}
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