"use client";

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export default function AnalyzerPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/60 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => router.push('/intro')}>
            <img src="/logo.png" alt="Lexi" className="w-10 h-10" />
            <span className="text-2xl font-black">Lexi</span>
          </div>
          <button
            onClick={() => router.push('/intro')}
            className="px-6 py-2 bg-white/10 rounded-full hover:bg-white/20 transition-all"
          >
            Back to Home
          </button>
        </div>
      </nav>

      {/* Content */}
      <div className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-6xl font-bold mb-6"
          >
            Contract Analyzer
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-white/70 mb-12"
          >
            Upload any legal document and receive instant AI-powered analysis.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white/5 rounded-3xl p-20 border border-white/10"
          >
            <p className="text-white/50 text-lg">Page under construction</p>
            <p className="text-white/30 mt-4">Coming soon...</p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}