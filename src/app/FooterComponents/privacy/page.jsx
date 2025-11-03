"use client";

import { useRouter } from 'next/navigation';

export default function PrivacyPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-black relative overflow-x-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
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
          Privacy Policy
        </h1>
        <p className="text-white/60 mb-8 text-sm sm:text-base">Last updated: {new Date().toLocaleDateString()}</p>

        <div className="space-y-6 sm:space-y-8">
          <section className="backdrop-blur-sm bg-white/5 p-4 sm:p-6 rounded-2xl border border-white/10">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-4">Information We Collect</h2>
            <div className="text-white/70 space-y-3 text-sm sm:text-base">
              <p><strong className="text-white">Account Information:</strong> Email address, name, and password (encrypted)</p>
              <p><strong className="text-white">Document Data:</strong> Files you upload are processed and immediately deleted after analysis</p>
              <p><strong className="text-white">Usage Data:</strong> How you interact with our platform (anonymized)</p>
            </div>
          </section>

          <section className="backdrop-blur-sm bg-white/5 p-4 sm:p-6 rounded-2xl border border-white/10">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-4">How We Use Your Information</h2>
            <ul className="text-white/70 space-y-2 text-sm sm:text-base ml-4 sm:ml-6">
              <li className="flex items-start gap-2">
                <span className="text-purple-400 mt-1">•</span>
                <span>To provide and improve our AI analysis services</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-400 mt-1">•</span>
                <span>To communicate with you about your account</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-400 mt-1">•</span>
                <span>To detect and prevent fraud or abuse</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-400 mt-1">•</span>
                <span>To comply with legal obligations</span>
              </li>
            </ul>
          </section>

          <section className="backdrop-blur-sm bg-white/5 p-4 sm:p-6 rounded-2xl border border-white/10">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-4">Data Security</h2>
            <div className="text-white/70 space-y-3 text-sm sm:text-base">
              <p>We employ industry-standard security measures:</p>
              <ul className="ml-4 sm:ml-6 space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-1">✓</span>
                  <span>End-to-end encryption for all documents</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-1">✓</span>
                  <span>Automatic document deletion after analysis</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-1">✓</span>
                  <span>Secure data centers with 24/7 monitoring</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-1">✓</span>
                  <span>Regular security audits and updates</span>
                </li>
              </ul>
            </div>
          </section>

          <section className="backdrop-blur-sm bg-white/5 p-4 sm:p-6 rounded-2xl border border-white/10">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-4">Your Rights</h2>
            <div className="text-white/70 space-y-2 text-sm sm:text-base">
              <p>You have the right to:</p>
              <ul className="ml-4 sm:ml-6 space-y-2 mt-3">
                <li className="flex items-start gap-2">
                  <span className="text-purple-400">→</span>
                  <span>Access your personal data</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-400">→</span>
                  <span>Request data deletion</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-400">→</span>
                  <span>Opt-out of marketing communications</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-400">→</span>
                  <span>Export your data</span>
                </li>
              </ul>
            </div>
          </section>

          <section className="backdrop-blur-sm bg-white/5 p-4 sm:p-6 rounded-2xl border border-white/10">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-4">Cookies & Tracking</h2>
            <p className="text-white/70 text-sm sm:text-base">
              We use essential cookies to maintain your session and preferences. We do not use third-party tracking cookies. You can manage cookie preferences in your browser settings.
            </p>
          </section>

          <section className="backdrop-blur-sm bg-white/5 p-4 sm:p-6 rounded-2xl border border-white/10">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-4">Contact Us</h2>
            <p className="text-white/70 text-sm sm:text-base">
              For privacy-related questions, contact us at: <a href="mailto:privacy@lexi.ai" className="text-purple-400 hover:text-purple-300">privacy@lexi.ai</a>
            </p>
          </section>

          <div className="backdrop-blur-sm bg-gradient-to-r from-purple-500/10 to-blue-500/10 p-4 sm:p-6 rounded-2xl border border-purple-500/20">
            <p className="text-white/70 text-xs sm:text-sm">
              This privacy policy may be updated periodically. We'll notify you of significant changes via email or through the platform.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}