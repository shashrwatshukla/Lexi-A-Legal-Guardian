'use client';

import { AnimatePresence } from 'framer-motion';

export default function ConfirmationModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'warning', // 'warning', 'danger', 'info', 'success'
  loading = false
}) {

  const getTypeStyles = () => {
    switch (type) {
      case 'danger':
        return {
          icon: '⚠️',
          confirmBg: 'bg-red-500/30 hover:bg-red-500/40',
          confirmText: 'text-red-400',
          accentColor: 'text-red-400'
        };
      case 'warning':
        return {
          icon: '⚡',
          confirmBg: 'bg-yellow-500/30 hover:bg-yellow-500/40',
          confirmText: 'text-yellow-400',
          accentColor: 'text-yellow-400'
        };
      case 'success':
        return {
          icon: '✓',
          confirmBg: 'bg-green-500/30 hover:bg-green-500/40',
          confirmText: 'text-green-400',
          accentColor: 'text-green-400'
        };
      case 'info':
      default:
        return {
          icon: 'ℹ️',
          confirmBg: 'bg-blue-500/30 hover:bg-blue-500/40',
          confirmText: 'text-blue-400',
          accentColor: 'text-blue-400'
        };
    }
  };

  const styles = getTypeStyles();

  const handleConfirm = () => {
    if (onConfirm) onConfirm();
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
              {/* Icon & Title */}
              <div className="text-center mb-4">
                <div className="text-5xl mb-3">{styles.icon}</div>
                <h2 className={`text-2xl font-bold mb-2 ${styles.accentColor}`}>
                  {title}
                </h2>
                <p className="text-white/80 text-sm leading-relaxed">
                  {message}
                </p>
              </div>

              {/* Buttons */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={loading}
                  className="flex-1 px-4 py-3 bg-white/10 rounded-lg hover:bg-white/20 text-white font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {cancelText}
                </button>
                <button
                  type="button"
                  onClick={handleConfirm}
                  disabled={loading}
                  className={`flex-1 px-4 py-3 ${styles.confirmBg} rounded-lg ${styles.confirmText} font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {loading ? 'Processing...' : confirmText}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}