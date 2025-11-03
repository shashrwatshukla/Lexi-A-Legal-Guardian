'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';

export default function LegalTip() {
  const { t } = useLanguage();
  const [tip, setTip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  // ✅ Curated legal tips from trusted sources
  const legalTips = [
    {
      id: 1,
      title: "Always Read Before You Sign",
      content: "Never sign a legal document without reading it thoroughly. If you don't understand something, consult a lawyer before signing.",
      source: "American Bar Association",
      category: "Contracts",
      icon: "📝",
      color: "from-blue-500 to-cyan-500",
      link: "https://www.americanbar.org/groups/public_education/resources/law_related_education_network/how_courts_work/"
    },
    {
      id: 2,
      title: "Document Everything",
      content: "Keep copies of all important documents, emails, and communications. Digital backups are essential for legal protection.",
      source: "Legal Information Institute",
      category: "Documentation",
      icon: "📂",
      color: "from-purple-500 to-pink-500",
      link: "https://www.law.cornell.edu/"
    },
    {
      id: 3,
      title: "Know Your Rights",
      content: "Understanding your legal rights is the first step to protecting them. Research or consult with a legal professional when in doubt.",
      source: "FindLaw",
      category: "Rights",
      icon: "⚖️",
      color: "from-green-500 to-emerald-500",
      link: "https://www.findlaw.com/"
    },
    {
      id: 4,
      title: "Meet Deadlines",
      content: "Legal deadlines are strict. Missing a filing deadline can result in losing your rights or facing penalties.",
      source: "Nolo",
      category: "Compliance",
      icon: "⏰",
      color: "from-orange-500 to-red-500",
      link: "https://www.nolo.com/"
    },
    {
      id: 5,
      title: "Keep Business and Personal Separate",
      content: "If you run a business, keep personal and business finances separate to maintain legal protection and tax benefits.",
      source: "LegalZoom",
      category: "Business",
      icon: "💼",
      color: "from-yellow-500 to-orange-500",
      link: "https://www.legalzoom.com/knowledge"
    },
    {
      id: 6,
      title: "Review Contracts Annually",
      content: "Regularly review your contracts, agreements, and legal documents to ensure they still serve your needs and comply with current laws.",
      source: "Rocket Lawyer",
      category: "Contracts",
      icon: "🔄",
      color: "from-indigo-500 to-purple-500",
      link: "https://www.rocketlawyer.com/"
    },
    {
      id: 7,
      title: "Protect Your Intellectual Property",
      content: "Register trademarks, copyrights, and patents early. Intellectual property protection is crucial for business success.",
      source: "USPTO",
      category: "IP Rights",
      icon: "©️",
      color: "from-pink-500 to-rose-500",
      link: "https://www.uspto.gov/"
    },
    {
      id: 8,
      title: "Get Everything in Writing",
      content: "Verbal agreements are hard to prove. Always get important agreements in writing with clear terms and signatures.",
      source: "American Bar Association",
      category: "Agreements",
      icon: "✍️",
      color: "from-cyan-500 to-blue-500",
      link: "https://www.americanbar.org/"
    }
  ];

  useEffect(() => {
    // Randomly select a tip on component mount
    const randomIndex = Math.floor(Math.random() * legalTips.length);
    setTip(legalTips[randomIndex]);
    setCurrentIndex(randomIndex);
    setLoading(false);

    // Auto-rotate tips every 10 seconds
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => {
        const newIndex = (prevIndex + 1) % legalTips.length;
        setTip(legalTips[newIndex]);
        return newIndex;
      });
    }, 10000); // Change tip every 10 seconds

    return () => clearInterval(interval);
  }, []);

  const handleNext = () => {
    const newIndex = (currentIndex + 1) % legalTips.length;
    setTip(legalTips[newIndex]);
    setCurrentIndex(newIndex);
  };

  const handlePrevious = () => {
    const newIndex = (currentIndex - 1 + legalTips.length) % legalTips.length;
    setTip(legalTips[newIndex]);
    setCurrentIndex(newIndex);
  };

  if (loading || !tip) {
    return (
      <div className="mt-8">
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-8">
          <div className="animate-pulse">
            <div className="h-6 bg-white/10 rounded w-1/3 mb-4"></div>
            <div className="h-20 bg-white/10 rounded mb-4"></div>
            <div className="h-4 bg-white/10 rounded w-1/4"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">
          💡 {t('dashboard.legalTip.title') || 'Legal Tip of the Day'}
        </h2>
        <div className="flex items-center gap-2">
          <span className="text-white/60 text-sm">
            {currentIndex + 1} / {legalTips.length}
          </span>
        </div>
      </div>

      <div className="relative bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden group">
        {/* Gradient Background */}
        <div className={`absolute inset-0 bg-gradient-to-br ${tip.color} opacity-5 group-hover:opacity-10 transition-opacity duration-300`}></div>

        {/* Content */}
        <div className="relative z-10 p-8">
          {/* Header */}
          <div className="flex items-start gap-4 mb-6">
            <div className="text-5xl transform group-hover:scale-110 transition-transform duration-300">
              {tip.icon}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="inline-block px-3 py-1 bg-white/10 rounded-full text-white/80 text-xs font-medium">
                  {tip.category}
                </span>
              </div>
              <h3 className="text-white font-bold text-xl mb-2">
                {tip.title}
              </h3>
            </div>
          </div>

          {/* Content */}
          <p className="text-white/80 text-base leading-relaxed mb-6">
            {tip.content}
          </p>

          {/* Footer */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-white/60 text-sm">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <span>Source: {tip.source}</span>
            </div>

            <div className="flex items-center gap-2">
              {/* Previous Button */}
              <button
                onClick={handlePrevious}
                className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors duration-200"
                title="Previous tip"
              >
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              {/* Next Button */}
              <button
                onClick={handleNext}
                className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors duration-200"
                title="Next tip"
              >
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>

              {/* Learn More Button */}
              <a
                href={tip.link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg"
              >
                <span>{t('dashboard.legalTip.learnMore') || 'Learn More'}</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/5">
          <div 
            className={`h-full bg-gradient-to-r ${tip.color} transition-all duration-300`}
            style={{ 
              width: `${((currentIndex + 1) / legalTips.length) * 100}%` 
            }}
          ></div>
        </div>
      </div>
    </div>
  );
}