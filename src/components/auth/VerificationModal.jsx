"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function VerificationModal({ 
  isOpen, 
  onClose, 
  type,
  email,
  onResend 
}) {
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setCountdown(60);
      setCanResend(false);
      return;
    }

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen]);

  const handleResend = () => {
    if (canResend) {
      onResend();
      setCountdown(60);
      setCanResend(false);
    }
  };

  if (!isOpen) return null;

  const content = {
    'forgot-password': {
      title: 'Check your email',
      icon: '📧',
      message: 'We sent a password reset link to',
      instruction: 'Click the link in your email to reset your password. The link will expire in 10 minutes.'
    },
    'email-verification': {
      title: 'Verify your email',
      icon: '✉️',
      message: 'We sent a verification link to',
      instruction: 'Click the link in your email to verify your account and complete signup.'
    }
  };

  const current = content[type] || content['email-verification'];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100]"
          />

          <div className="fixed inset-0 flex items-center justify-center z-[101] p-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-gray-400 hover:text-black transition-colors duration-200"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              <div className="text-center mb-6">
                <div className="text-6xl mb-4">{current.icon}</div>
                <h2 className="text-2xl font-bold text-black mb-2">
                  {current.title}
                </h2>
                <p className="text-[15px] text-gray-600 mb-1">
                  {current.message}
                </p>
                <p className="text-[15px] font-semibold text-black">
                  {email}
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <p className="text-sm text-gray-700 leading-relaxed">
                  {current.instruction}
                </p>
              </div>

              {/* Spam Warning */}
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-xs font-semibold text-green-800 mb-2">
                  🛡️ Prevent emails from going to spam:
                </p>
                <div className="text-xs text-green-700 space-y-1">
                  <p>1. Check your spam/junk folder</p>
                  <p>2. Mark our email as "Not Spam"</p>
                  <p>3. Add noreply@yourproject.firebaseapp.com to contacts</p>
                </div>
              </div>

              {/* Resend Timer */}
              <div className="text-center my-4">
                {canResend ? (
                  <button
                    onClick={handleResend}
                    className="text-sm font-semibold text-black hover:underline transition-all duration-200"
                  >
                    Resend email
                  </button>
                ) : (
                  <p className="text-sm text-gray-500">
                    Resend available in{' '}
                    <span className="font-semibold text-black">
                      {Math.floor(countdown / 60)}:{String(countdown % 60).padStart(2, '0')}
                    </span>
                  </p>
                )}
              </div>

              {/* Got It Button */}
              <button
                onClick={onClose}
                className="w-full py-3 bg-black text-white font-semibold rounded-lg hover:bg-gray-800 transition-all duration-200"
              >
                Got it
              </button>

              <p className="text-center text-xs text-gray-500 mt-4">
                Didn't receive an email? Check your spam folder
              </p>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}