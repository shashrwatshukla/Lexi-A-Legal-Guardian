'use client';

import { useLanguage } from '../../context/LanguageContext';

export default function AboutSettings() {
  const { t } = useLanguage();


  const teamInfo = [
    {
      icon: '🎯',
      title: 'Our Mission',
      description: 'Empowering everyone to understand legal documents with AI-powered analysis and plain language explanations.'
    },
    {
      icon: '🛡️',
      title: 'Security First',
      description: 'Enterprise-grade encryption and security measures to protect your sensitive legal documents.'
    },
    {
      icon: '🚀',
      title: 'Continuous Innovation',
      description: 'Regular updates and new features based on user feedback and the latest AI technology.'
    }
  ];

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">
          {t('settings.about.title') || 'About Lexi'}
        </h2>
        <p className="text-white/60 text-sm">
          Legal information and application details
        </p>
      </div>

      {/* App Info Card */}
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center">
            <img src="/logo.png" alt="Lexi Logo" className="w-12 h-12 object-contain" />
          </div>
          <div>
            <h3 className="text-white font-bold text-xl">Lexi</h3>
            <p className="text-white/60 text-sm">Your AI Legal Guardian</p>
          </div>
        </div>
        
        <div className="flex items-center justify-between pt-4 border-t border-white/10">
          <div>
            <h4 className="text-white font-semibold mb-1">
              {t('settings.about.version') || 'Version'}
            </h4>
            <p className="text-white/60 text-sm">Latest features and improvements</p>
          </div>
          <span className="px-4 py-2 bg-blue-500/20 text-blue-400 rounded-lg font-bold text-lg">
            v1.0.0
          </span>
        </div>
      </div>


      {/* About Us Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {teamInfo.map((info, index) => (
          <div
            key={index}
            className="bg-white/5 backdrop-blur-xl rounded-2xl p-6"
          >
            <div className="text-4xl mb-3">{info.icon}</div>
            <h4 className="text-white font-semibold mb-2">{info.title}</h4>
            <p className="text-white/60 text-sm leading-relaxed">{info.description}</p>
          </div>
        ))}
      </div>

      {/* Technology Stack */}
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6">
        <h3 className="text-white font-semibold mb-4">Powered By</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { name: 'Next.js', icon: '⚡' },
            { name: 'Firebase', icon: '🔥' },
            { name: 'Google AI', icon: '🤖' },
            { name: 'Tailwind CSS', icon: '🎨' }
          ].map((tech, index) => (
            <div
              key={index}
              className="flex items-center gap-2 p-3 bg-white/5 rounded-lg"
            >
              <span className="text-xl">{tech.icon}</span>
              <span className="text-white text-sm font-medium">{tech.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Release Notes */}
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6">
        <h3 className="text-white font-semibold mb-4">Latest Updates (v1.0.0)</h3>
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <span className="text-green-400 font-bold">✓</span>
            <div>
              <p className="text-white font-medium text-sm">AI-Powered Document Analysis</p>
              <p className="text-white/60 text-xs">Instant risk assessment and clause detection</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-green-400 font-bold">✓</span>
            <div>
              <p className="text-white font-medium text-sm">Document Drafting Assistant</p>
              <p className="text-white/60 text-xs">Create legal documents with AI guidance</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-green-400 font-bold">✓</span>
            <div>
              <p className="text-white font-medium text-sm">Multi-Language Support</p>
              <p className="text-white/60 text-xs">Interface available in multiple languages</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-green-400 font-bold">✓</span>
            <div>
              <p className="text-white font-medium text-sm">Enhanced Security</p>
              <p className="text-white/60 text-xs">End-to-end encryption for your documents</p>
            </div>
          </div>
        </div>
      </div>

      {/* Contact & Social */}
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6">
        <h3 className="text-white font-semibold mb-4">Connect With Us</h3>
        <div className="flex flex-wrap gap-3">
          <a
            href="https://github.com/shashrwatshukla/Lexi-A-Legal-Guardian"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 rounded-lg transition-colors font-medium text-sm"
          >
            <span>💻</span> GitHub
          </a>
        </div>
      </div>

      {/* Credits & Copyright */}
      <div className="text-center py-6">
        <p className="text-white/40 text-sm mb-2">Best From LEXI Team</p>
        <p className="text-white/20 text-xs">
          © {new Date().getFullYear()} Lexi. All rights reserved.
        </p>
      </div>
    </div>
  );
}