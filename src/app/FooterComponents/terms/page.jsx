"use client";

import { useRouter } from 'next/navigation';

export default function TermsPage() {
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

        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
          Terms of Service
        </h1>
        <p className="text-white/60 mb-8 text-sm sm:text-base">Last updated: {new Date().toLocaleDateString()}</p>

        <div className="space-y-6 sm:space-y-8">
          <section className="backdrop-blur-sm bg-white/5 p-4 sm:p-6 rounded-2xl border border-white/10">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-4">Acceptance of Terms</h2>
            <p className="text-white/70 text-sm sm:text-base leading-relaxed">
              By accessing and using Lexi, you accept and agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.
            </p>
          </section>

          <section className="backdrop-blur-sm bg-white/5 p-4 sm:p-6 rounded-2xl border border-white/10">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-4">Use of Service</h2>
            <div className="text-white/70 space-y-3 text-sm sm:text-base">
              <p><strong className="text-white">Permitted Use:</strong> Lexi is intended for legal document analysis and drafting assistance.</p>
              <p><strong className="text-white">Prohibited Activities:</strong></p>
              <ul className="ml-4 sm:ml-6 space-y-2 mt-2">
                <li className="flex items-start gap-2">
                  <span className="text-red-400 mt-1">✗</span>
                  <span>Using the service for illegal purposes</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-400 mt-1">✗</span>
                  <span>Attempting to hack or compromise our systems</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-400 mt-1">✗</span>
                  <span>Sharing your account with others</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-400 mt-1">✗</span>
                  <span>Scraping or automated data collection</span>
                </li>
              </ul>
            </div>
          </section>

          <section className="backdrop-blur-sm bg-white/5 p-4 sm:p-6 rounded-2xl border border-white/10">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-4">Not Legal Advice</h2>
            <div className="backdrop-blur-sm bg-yellow-500/10 border border-yellow-500/30 p-4 rounded-xl">
              <p className="text-white/90 text-sm sm:text-base leading-relaxed">
                <strong className="text-yellow-400">⚠️ Important:</strong> Lexi provides AI-powered analysis and suggestions but does NOT constitute legal advice. Always consult with a qualified attorney for legal decisions.
              </p>
            </div>
          </section>

          <section className="backdrop-blur-sm bg-white/5 p-4 sm:p-6 rounded-2xl border border-white/10">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-4">User Accounts</h2>
            <div className="text-white/70 space-y-3 text-sm sm:text-base">
              <p>You are responsible for:</p>
              <ul className="ml-4 sm:ml-6 space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-purple-400">•</span>
                  <span>Maintaining the confidentiality of your account credentials</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-400">•</span>
                  <span>All activities that occur under your account</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-400">•</span>
                  <span>Notifying us immediately of any unauthorized access</span>
                </li>
              </ul>
            </div>
          </section>

          <section className="backdrop-blur-sm bg-white/5 p-4 sm:p-6 rounded-2xl border border-white/10">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-4">Intellectual Property</h2>
            <p className="text-white/70 text-sm sm:text-base leading-relaxed">
              All content, features, and functionality of Lexi are owned by us and protected by intellectual property laws. You retain ownership of documents you upload, and we claim no rights to them.
            </p>
          </section>

          <section className="backdrop-blur-sm bg-white/5 p-4 sm:p-6 rounded-2xl border border-white/10">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-4">Limitation of Liability</h2>
            <p className="text-white/70 text-sm sm:text-base leading-relaxed">
              Lexi is provided "as is" without warranties. We are not liable for any damages arising from use of our service, including but not limited to loss of data, business interruption, or legal consequences.
            </p>
          </section>

          <section className="backdrop-blur-sm bg-white/5 p-4 sm:p-6 rounded-2xl border border-white/10">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-4">Termination</h2>
            <p className="text-white/70 text-sm sm:text-base leading-relaxed">
              We reserve the right to suspend or terminate your account for violation of these terms. You may terminate your account at any time by contacting support.
            </p>
          </section>

          <section className="backdrop-blur-sm bg-white/5 p-4 sm:p-6 rounded-2xl border border-white/10">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-4">Changes to Terms</h2>
            <p className="text-white/70 text-sm sm:text-base leading-relaxed">
              We may update these terms periodically. Continued use of the service after changes constitutes acceptance of the new terms.
            </p>
          </section>

          <section className="backdrop-blur-sm bg-white/5 p-4 sm:p-6 rounded-2xl border border-white/10">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-4">Contact</h2>
            <p className="text-white/70 text-sm sm:text-base">
              Questions about these terms? Contact us at: <a href="mailto:asklexiofficial@gmail.com" className="text-purple-400 hover:text-purple-300">legal@lexi.ai</a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}