"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CookiesPage() {
  const router = useRouter();
  const [cookiePreferences, setCookiePreferences] = useState({
    essential: true,
    functional: true,
    analytics: false,
    marketing: false
  });

  const cookieTypes = [
    {
      id: 'essential',
      title: 'Essential Cookies',
      icon: '🔧',
      required: true,
      description: 'Required for the website to function properly. These cannot be disabled.',
      examples: [
        'Authentication tokens',
        'Session management',
        'Security features',
        'Load balancing'
      ]
    },
    {
      id: 'functional',
      title: 'Functional Cookies',
      icon: '⚙️',
      required: false,
      description: 'Remember your preferences and settings for a better experience.',
      examples: [
        'Language preferences',
        'Theme settings',
        'Form auto-fill data',
        'Saved filters'
      ]
    },
    {
      id: 'analytics',
      title: 'Analytics Cookies',
      icon: '📊',
      required: false,
      description: 'Help us understand how you use our service to improve it.',
      examples: [
        'Page view tracking',
        'Feature usage statistics',
        'Performance metrics',
        'Error logging'
      ]
    },
    {
      id: 'marketing',
      title: 'Marketing Cookies',
      icon: '📢',
      required: false,
      description: 'Used to show you relevant content and advertisements.',
      examples: [
        'Ad personalization',
        'Campaign tracking',
        'Social media integration',
        'Conversion tracking'
      ]
    }
  ];

  const handleToggle = (id) => {
    if (id === 'essential') return; // Can't disable essential cookies
    setCookiePreferences({
      ...cookiePreferences,
      [id]: !cookiePreferences[id]
    });
  };

  const handleSavePreferences = () => {
    // TODO: Save preferences to localStorage/backend
    alert('✅ Cookie preferences saved successfully!');
  };

  return (
    <div className="min-h-screen bg-black relative overflow-x-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
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
          Cookie Policy
        </h1>
        <p className="text-white/70 text-base sm:text-lg mb-8 sm:mb-12">
          Understand how we use cookies to improve your experience
        </p>

        {/* What Are Cookies */}
        <div className="backdrop-blur-sm bg-white/5 p-6 sm:p-8 rounded-2xl border border-white/10 mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4 flex items-center gap-3">
            <span className="text-3xl">🍪</span> What Are Cookies?
          </h2>
          <p className="text-white/70 text-sm sm:text-base leading-relaxed mb-4">
            Cookies are small text files stored on your device when you visit websites. They help us provide you with a better, faster, and safer experience.
          </p>
          <p className="text-white/70 text-sm sm:text-base leading-relaxed">
            We use cookies to remember your preferences, keep you logged in, and understand how you use our service. You have full control over which cookies to accept.
          </p>
        </div>

        {/* Cookie Types with Toggles */}
        <div className="space-y-4 mb-8">
          {cookieTypes.map((type) => (
            <div 
              key={type.id}
              className="backdrop-blur-sm bg-white/5 p-4 sm:p-6 rounded-2xl border border-white/10"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-3 flex-1">
                  <span className="text-2xl sm:text-3xl">{type.icon}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg sm:text-xl font-bold text-white">{type.title}</h3>
                      {type.required && (
                        <span className="px-2 py-1 bg-red-500/20 text-red-400 border border-red-500/30 rounded text-xs font-semibold">
                          Required
                        </span>
                      )}
                    </div>
                    <p className="text-white/70 text-sm sm:text-base mb-3">{type.description}</p>
                    <div className="text-white/60 text-xs sm:text-sm">
                      <p className="font-semibold mb-2">Examples:</p>
                      <ul className="ml-4 space-y-1">
                        {type.examples.map((example, index) => (
                          <li key={index} className="flex items-center gap-2">
                            <span className="text-purple-400">•</span>
                            <span>{example}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Toggle Switch */}
                <button
                  onClick={() => handleToggle(type.id)}
                  disabled={type.required}
                  className={`relative w-14 h-8 rounded-full transition-colors flex-shrink-0 ${
                    cookiePreferences[type.id]
                      ? 'bg-green-500'
                      : 'bg-white/20'
                  } ${type.required ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  <span
                    className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform ${
                      cookiePreferences[type.id] ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Save Preferences Button */}
        <div className="flex justify-center mb-8">
          <button
            onClick={handleSavePreferences}
            className="px-8 py-4 bg-gradient-to-r from-purple-500 to-blue-500 text-white font-bold rounded-xl hover:from-purple-600 hover:to-blue-600 transition-all transform hover:scale-105 text-sm sm:text-base shadow-lg shadow-purple-500/50"
          >
            Save Cookie Preferences
          </button>
        </div>

        {/* Third-Party Cookies */}
        <div className="backdrop-blur-sm bg-white/5 p-6 sm:p-8 rounded-2xl border border-white/10 mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">Third-Party Cookies</h2>
          <p className="text-white/70 text-sm sm:text-base mb-4">
            We may use third-party services that set their own cookies:
          </p>
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-white/5 rounded-lg">
              <span className="text-xl">🔍</span>
              <div>
                <h3 className="text-white font-semibold text-base">Google Analytics</h3>
                <p className="text-white/60 text-sm">Helps us understand website usage and improve our service</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-white/5 rounded-lg">
              <span className="text-xl">🔐</span>
              <div>
                <h3 className="text-white font-semibold text-base">Firebase</h3>
                <p className="text-white/60 text-sm">Manages authentication and user sessions securely</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-white/5 rounded-lg">
              <span className="text-xl">💬</span>
              <div>
                <h3 className="text-white font-semibold text-base">Intercom</h3>
                <p className="text-white/60 text-sm">Powers our support chat and customer communication</p>
              </div>
            </div>
          </div>
        </div>

        {/* Managing Cookies */}
        <div className="backdrop-blur-sm bg-white/5 p-6 sm:p-8 rounded-2xl border border-white/10 mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">Managing Cookies in Your Browser</h2>
          <p className="text-white/70 text-sm sm:text-base mb-4">
            You can also control cookies through your browser settings:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <a 
              href="https://support.google.com/chrome/answer/95647" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors border border-white/10"
            >
              <span className="text-2xl">🌐</span>
              <div>
                <h3 className="text-white font-semibold text-base">Chrome</h3>
                <p className="text-white/60 text-sm">Manage cookies →</p>
              </div>
            </a>
            <a 
              href="https://support.mozilla.org/en-US/kb/cookies-information-websites-store-on-your-computer" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors border border-white/10"
            >
              <span className="text-2xl">🦊</span>
              <div>
                <h3 className="text-white font-semibold text-base">Firefox</h3>
                <p className="text-white/60 text-sm">Manage cookies →</p>
              </div>
            </a>
            <a 
              href="https://support.apple.com/guide/safari/manage-cookies-sfri11471/mac" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors border border-white/10"
            >
              <span className="text-2xl">🧭</span>
              <div>
                <h3 className="text-white font-semibold text-base">Safari</h3>
                <p className="text-white/60 text-sm">Manage cookies →</p>
              </div>
            </a>
            <a 
              href="https://support.microsoft.com/en-us/microsoft-edge/delete-cookies-in-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors border border-white/10"
            >
              <span className="text-2xl">🌊</span>
              <div>
                <h3 className="text-white font-semibold text-base">Edge</h3>
                <p className="text-white/60 text-sm">Manage cookies →</p>
              </div>
            </a>
          </div>
        </div>

        {/* Contact */}
        <div className="backdrop-blur-sm bg-gradient-to-r from-orange-500/10 to-purple-500/10 p-4 sm:p-6 rounded-2xl border border-orange-500/20">
          <h3 className="text-white font-semibold mb-2 text-base sm:text-lg flex items-center gap-2">
            <span>📧</span> Questions About Cookies?
          </h3>
          <p className="text-white/70 text-sm sm:text-base">
            If you have questions about our use of cookies, please contact:{' '}
            <a href="mailto:asklexiofficial@gmail.com" className="text-orange-400 hover:text-orange-300 font-semibold">
              asklexiofficial@gmail.com
            </a>
          </p>
        </div>

        {/* Last Updated */}
        <div className="text-center mt-8 text-white/50 text-xs sm:text-sm">
          Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
        </div>
      </div>
    </div>
  );
}