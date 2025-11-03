'use client';

import { useLanguage } from '../../context/LanguageContext';

export default function SupportSettings() {
  const { t } = useLanguage();

  const supportOptions = [
    {
      icon: '📚',
      title: t('settings.support.helpCenter') || 'Help Center',
      description: 'Browse comprehensive guides, tutorials, and FAQs',
      action: () => window.open('/faq', '_blank'),
      bgColor: 'bg-blue-500/20',
      textColor: 'text-blue-400'
    },
    {
      icon: '💬',
      title: t('settings.support.contactSupport') || 'Contact Support',
      description: t('settings.support.email') || 'Get help from our support team via email',
      action: () => window.location.href = 'mailto:asklexiofficial@gmail.com',
      bgColor: 'bg-green-500/20',
      textColor: 'text-green-400'
    },
    {
      icon: '🐛',
      title: t('settings.support.reportBug') || 'Report a Bug',
      description: 'Help us improve by reporting issues you encounter',
      action: () => window.location.href = 'mailto:asklexiofficial@gmail.com?subject=Bug Report',
      bgColor: 'bg-red-500/20',
      textColor: 'text-red-400'
    },
    {
      icon: '💡',
      title: t('settings.support.featureRequest') || 'Feature Request',
      description: 'Suggest new features and improvements',
      action: () => window.location.href = 'mailto:asklexiofficial@gmail.com?subject=Feature Request',
      bgColor: 'bg-purple-500/20',
      textColor: 'text-purple-400'
    }
  ];

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">
          {t('settings.support.title') || 'Help & Support'}
        </h2>
        <p className="text-white/60 text-sm">
          Get help and share your feedback with us
        </p>
      </div>

      {/* Support Options Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {supportOptions.map((option, index) => (
          <button
            key={index}
            onClick={option.action}
            className={`${option.bgColor} backdrop-blur-xl rounded-2xl p-6 text-left transition-all duration-300 hover:scale-105`}
          >
            <div className="text-4xl mb-3">{option.icon}</div>
            <h3 className={`${option.textColor} font-semibold mb-1 text-lg`}>
              {option.title}
            </h3>
            <p className="text-white/60 text-sm leading-relaxed">
              {option.description}
            </p>
          </button>
        ))}
      </div>

      {/* Quick Contact Card */}
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6">
        <div className="flex items-start gap-4">
          <div className="text-4xl">📧</div>
          <div className="flex-1">
            <h3 className="text-white font-semibold mb-2">Quick Contact</h3>
            <p className="text-white/60 text-sm mb-3 leading-relaxed">
              For urgent issues or general inquiries, reach us directly at:
            </p>
            <a 
              href="mailto:asklexiofficial@gmail.com"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg transition-colors font-semibold text-sm"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              asklexiofficial@gmail.com
            </a>
          </div>
        </div>
      </div>

      {/* Response Time Info */}
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6">
        <div className="flex items-start gap-4">
          <div className="text-4xl">⏱️</div>
          <div className="flex-1">
            <h3 className="text-white font-semibold mb-2">Response Time</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-white/60">Email Support:</span>
                <span className="text-white font-medium">24-48 hours</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/60">Bug Reports:</span>
                <span className="text-white font-medium">1-3 business days</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/60">Feature Requests:</span>
                <span className="text-white font-medium">Reviewed weekly</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Community & Resources */}
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6">
        <h3 className="text-white font-semibold mb-4">Community & Resources</h3>
        
        <div className="space-y-3">
          <a
            href="/FooterComponents/docs"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-3 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">📖</span>
              <span className="text-white font-medium">Documentation</span>
            </div>
            <svg className="w-5 h-5 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </a>

          <a
            href="/FooterComponents/about"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-3 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">📝</span>
              <span className="text-white font-medium">About</span>
            </div>
            <svg className="w-5 h-5 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </a>
        </div>
      </div>

      {/* Feedback Appreciated */}
      <div className="bg-blue-500/10 backdrop-blur-xl rounded-2xl p-6">
        <div className="flex items-start gap-3">
          <div className="text-2xl">💙</div>
          <div>
            <h3 className="text-blue-400 font-semibold mb-1">Your Feedback Matters</h3>
            <p className="text-white/60 text-sm leading-relaxed">
              We continuously improve Lexi based on user feedback. Every suggestion, bug report, 
              and feature request helps us build a better product for everyone.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}