'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AuthMethodModal({ isOpen, onClose, onSelectMethod, email }) {
  const [selectedMethod, setSelectedMethod] = useState('email');

  if (!isOpen) return null;

  const handleConfirm = () => {
    onSelectMethod(selectedMethod);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[150]"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[151] flex items-center justify-center p-4"
          >
            <div 
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 sm:p-8"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Icon */}
              <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>

              {/* Title */}
              <h2 className="text-2xl font-bold text-center text-black mb-2">
                Choose Verification Method
              </h2>
              
              <p className="text-center text-gray-600 text-sm mb-6">
                To complete your registration for <span className="font-semibold text-black">{email}</span>
              </p>

              {/* Method Options */}
              <div className="space-y-3 mb-6">
                
                {/* ✅ Email Verification (ENABLED) */}
                <button
                  type="button"
                  onClick={() => setSelectedMethod('email')}
                  className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                    selectedMethod === 'email'
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                      selectedMethod === 'email' ? 'border-blue-600' : 'border-gray-300'
                    }`}>
                      {selectedMethod === 'email' && (
                        <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        <h3 className="font-semibold text-black">Email Verification</h3>
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">Recommended</span>
                      </div>
                      <p className="text-sm text-gray-600">
                        We'll send a verification link to your email. Click the link to activate your account.
                      </p>
                    </div>
                  </div>
                </button>

                {/* ❌ 2FA (DISABLED) */}
                <div className="w-full p-4 rounded-xl border-2 border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed">
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full border-2 border-gray-300 flex items-center justify-center flex-shrink-0 mt-0.5">
                      {/* Empty circle */}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        <h3 className="font-semibold text-gray-500">Two-Factor Authentication</h3>
                        <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-medium">Coming Soon</span>
                      </div>
                      <p className="text-sm text-gray-500">
                        Extra security layer with authenticator apps. Available soon!
                      </p>
                    </div>
                  </div>
                </div>

              </div>

              {/* Info Note */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6">
                <p className="text-xs text-blue-800">
                  <strong>💡 Note:</strong> You can enable Two-Factor Authentication later in your account settings for added security.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirm}
                  disabled={selectedMethod !== 'email'}
                  className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Continue
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}