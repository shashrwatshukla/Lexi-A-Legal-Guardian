"use client";

import { useRouter } from 'next/navigation';

export default function AboutPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-black relative overflow-x-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
      </div>

      
      
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
        <button 
          onClick={() => router.push('/intro')}
          className="mb-6 sm:mb-8 flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors text-sm sm:text-base"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          Back to Home
        </button>

        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 sm:mb-6">
          About Lexi
        </h1>
        
        <div className="text-white/70 space-y-4 sm:space-y-6 text-base sm:text-lg leading-relaxed">
          <p className="backdrop-blur-sm bg-white/5 p-4 sm:p-6 rounded-2xl border border-white/10">
            <strong className="text-white text-lg sm:text-xl block mb-2">Our Mission</strong>
            Lexi is an AI-powered legal document analysis platform designed to help individuals and businesses understand complex contracts with ease. We believe that everyone deserves access to clear, understandable legal information.
          </p>

          <p className="backdrop-blur-sm bg-white/5 p-4 sm:p-6 rounded-2xl border border-white/10">
            <strong className="text-white text-lg sm:text-xl block mb-2">What We Do</strong>
            Our advanced AI technology analyzes legal documents in seconds, identifying potential risks, obligations, and key terms. We transform complex legal jargon into plain language that anyone can understand.
          </p>

          <div className="backdrop-blur-sm bg-white/5 p-4 sm:p-6 rounded-2xl border border-white/10">
            <strong className="text-white text-lg sm:text-xl block mb-4">Our Features</strong>
            <ul className="space-y-3 ml-4 sm:ml-6">
              <li className="flex items-start gap-3">
                <span className="text-purple-400 mt-1">✓</span>
                <span>AI-powered contract analysis in under 60 seconds</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-purple-400 mt-1">✓</span>
                <span>Risk assessment and hidden clause detection</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-purple-400 mt-1">✓</span>
                <span>Document drafting with intelligent templates</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-purple-400 mt-1">✓</span>
                <span>Interactive AI chatbot for legal questions</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-purple-400 mt-1">✓</span>
                <span>Multi-language support and voice summaries</span>
              </li>
            </ul>
          </div>

          <p className="backdrop-blur-sm bg-white/5 p-4 sm:p-6 rounded-2xl border border-white/10">
            <strong className="text-white text-lg sm:text-xl block mb-2">Our Vision</strong>
            We envision a world where legal documents are no longer intimidating barriers, but clear, accessible resources that empower informed decision-making for everyone.
          </p>

          <div className="backdrop-blur-sm bg-gradient-to-r from-purple-500/10 to-blue-500/10 p-4 sm:p-6 rounded-2xl border border-purple-500/20 mt-6 sm:mt-8">
            <p className="text-white text-center text-base sm:text-lg">
              <strong className="block mb-2">Join thousands of users</strong>
              who trust Lexi to protect their legal interests
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}