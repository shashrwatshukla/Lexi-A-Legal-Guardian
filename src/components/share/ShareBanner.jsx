"use client";

import { motion } from 'framer-motion';
import { IoInformationCircle } from 'react-icons/io5';
import { useRouter } from 'next/navigation';

export default function ShareBanner() {
  const router = useRouter();

  return (
    <motion.div
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-purple-900/95 to-indigo-900/95 backdrop-blur-md border-b border-purple-500/30"
    >
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <IoInformationCircle className="text-3xl text-purple-300 flex-shrink-0" />
            <div>
              <h3 className="text-lg font-bold text-white">
                Viewing a Shared Conversation
              </h3>
              <p className="text-sm text-purple-200">
                This is a read-only snapshot of a legal document analysis. You cannot send new messages or continue this conversation.
              </p>
            </div>
          </div>
          
          <button
            onClick={() => router.push('/')}
            className="px-6 py-2 bg-white text-purple-900 rounded-lg font-semibold hover:bg-purple-100 transition-all"
          >
            Start Your Own Analysis
          </button>
        </div>
      </div>
    </motion.div>
  );
}