"use client";

import { useRouter } from 'next/navigation';

export default function SecurityPage() {
  const router = useRouter();

  const securityFeatures = [
    {
      icon: '🔒',
      title: 'End-to-End Encryption',
      description: 'All documents are encrypted using AES-256 encryption during upload, processing, and storage.'
    },
    {
      icon: '🗑️',
      title: 'Auto-Delete',
      description: 'Documents are automatically deleted from our servers immediately after analysis is complete.'
    },
    {
      icon: '🔐',
      title: 'Secure Authentication',
      description: 'Multi-factor authentication and secure password hashing protect your account.'
    },
    {
      icon: '🛡️',
      title: 'Data Privacy',
      description: 'We never share, sell, or use your documents for AI training without explicit consent.'
    },
    {
      icon: '📊',
      title: 'Regular Audits',
      description: 'Third-party security audits and penetration testing ensure continuous protection.'
    },
    {
      icon: '🌐',
      title: 'HTTPS Only',
      description: 'All communications are encrypted in transit using TLS 1.3 protocol.'
    }
  ];

  return (
    <div className="min-h-screen bg-black relative overflow-x-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 right-1/3 w-96 h-96 bg-green-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
      </div>

      
      
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
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
          Security & Compliance
        </h1>
        <p className="text-white/70 text-base sm:text-lg mb-8 sm:mb-12">
          Your data security is our top priority
        </p>

        {/* Security Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-12">
          {securityFeatures.map((feature, index) => (
            <div 
              key={index}
              className="backdrop-blur-sm bg-white/5 p-4 sm:p-6 rounded-2xl border border-white/10 hover:border-green-500/30 transition-all"
            >
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-lg sm:text-xl font-bold text-white mb-2">{feature.title}</h3>
              <p className="text-white/70 text-sm sm:text-base">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* Compliance Section */}
        <div className="backdrop-blur-sm bg-white/5 p-6 sm:p-8 rounded-2xl border border-white/10 mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6">Compliance Standards</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div className="flex items-start gap-4">
              <span className="text-2xl sm:text-3xl">✓</span>
              <div>
                <h3 className="text-white font-semibold mb-1 text-base sm:text-lg">GDPR Compliant</h3>
                <p className="text-white/70 text-sm sm:text-base">Full compliance with EU data protection regulations</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <span className="text-2xl sm:text-3xl">✓</span>
              <div>
                <h3 className="text-white font-semibold mb-1 text-base sm:text-lg">SOC 2 Type II</h3>
                <p className="text-white/70 text-sm sm:text-base">Certified data security and availability</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <span className="text-2xl sm:text-3xl">✓</span>
              <div>
                <h3 className="text-white font-semibold mb-1 text-base sm:text-lg">ISO 27001</h3>
                <p className="text-white/70 text-sm sm:text-base">Information security management standards</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <span className="text-2xl sm:text-3xl">✓</span>
              <div>
                <h3 className="text-white font-semibold mb-1 text-base sm:text-lg">CCPA Compliant</h3>
                <p className="text-white/70 text-sm sm:text-base">California Consumer Privacy Act adherence</p>
              </div>
            </div>
          </div>
        </div>

        {/* Security Practices */}
        <div className="backdrop-blur-sm bg-white/5 p-6 sm:p-8 rounded-2xl border border-white/10">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6">Our Security Practices</h2>
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-green-400">✓</span>
              </div>
              <div>
                <h3 className="text-white font-semibold mb-1 text-base sm:text-lg">24/7 Monitoring</h3>
                <p className="text-white/70 text-sm sm:text-base">Real-time threat detection and response systems</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-green-400">✓</span>
              </div>
              <div>
                <h3 className="text-white font-semibold mb-1 text-base sm:text-lg">Regular Updates</h3>
                <p className="text-white/70 text-sm sm:text-base">Continuous security patches and system updates</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-green-400">✓</span>
              </div>
              <div>
                <h3 className="text-white font-semibold mb-1 text-base sm:text-lg">Incident Response</h3>
                <p className="text-white/70 text-sm sm:text-base">Dedicated team for rapid security incident handling</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-green-400">✓</span>
              </div>
              <div>
                <h3 className="text-white font-semibold mb-1 text-base sm:text-lg">Employee Training</h3>
                <p className="text-white/70 text-sm sm:text-base">Regular security awareness and best practices training</p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact */}
        <div className="mt-8 backdrop-blur-sm bg-gradient-to-r from-green-500/10 to-blue-500/10 p-4 sm:p-6 rounded-2xl border border-green-500/20">
          <h3 className="text-white font-semibold mb-2 text-base sm:text-lg">Report a Security Issue</h3>
          <p className="text-white/70 text-sm sm:text-base">
            If you discover a security vulnerability, please report it to: <a href="mailto:security@lexi.ai" className="text-green-400 hover:text-green-300">security@lexi.ai</a>
          </p>
        </div>
      </div>
    </div>
  );
}