"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function DocsPage() {
  const router = useRouter();
  const [activeSection, setActiveSection] = useState('getting-started');

  const sections = [
    { id: 'getting-started', title: 'Getting Started', icon: '🚀' },
    { id: 'uploading', title: 'Uploading Documents', icon: '📄' },
    { id: 'analysis', title: 'Understanding Analysis', icon: '🔍' },
    { id: 'drafter', title: 'Document Drafter', icon: '✍️' },
    { id: 'chatbot', title: 'AI Chatbot', icon: '💬' },
    { id: 'sharing', title: 'Sharing Results', icon: '🔗' },
  ];

  const content = {
    'getting-started': {
      title: 'Getting Started with Lexi',
      content: [
        { heading: 'Welcome to Lexi', text: 'Lexi is your AI-powered legal document assistant. This guide will help you get started quickly.' },
        { heading: 'Create an Account', text: '1. Click "Get Started" on the homepage\n2. Sign up with your email\n3. Verify your email address\n4. You\'re ready to go!' },
        { heading: 'First Analysis', text: 'Upload your first document and let our AI analyze it in seconds. You\'ll receive a comprehensive report with risk assessment, key terms, and actionable insights.' }
      ]
    },
    'uploading': {
      title: 'Uploading Documents',
      content: [
        { heading: 'Supported Formats', text: 'Lexi supports PDF, DOCX, and TXT files up to 10MB.' },
        { heading: 'How to Upload', text: '1. Click the upload area or drag & drop your file\n2. Wait for the upload to complete\n3. Analysis starts automatically' },
        { heading: 'Privacy & Security', text: 'All documents are encrypted end-to-end. Files are deleted immediately after analysis.' }
      ]
    },
    'analysis': {
      title: 'Understanding Your Analysis',
      content: [
        { heading: 'Risk Meter', text: 'Shows overall contract risk from 0-100. Higher scores indicate more potential risks.' },
        { heading: 'Key Clauses', text: 'Critical sections are highlighted with severity indicators (Low, Medium, High, Critical).' },
        { heading: 'Action Items', text: 'Specific recommendations for negotiation or review.' }
      ]
    },
    'drafter': {
      title: 'Document Drafter Guide',
      content: [
        { heading: 'Plain Language Input', text: 'Describe what you need in simple terms. Our AI will generate a professional draft.' },
        { heading: 'Templates', text: 'Choose from pre-built templates for common legal documents.' },
        { heading: 'Clause Library', text: 'Browse and add standard clauses to your document.' }
      ]
    },
    'chatbot': {
      title: 'Using the AI Chatbot',
      content: [
        { heading: 'Ask Questions', text: 'Get instant answers about your analyzed documents.' },
        { heading: 'Context Aware', text: 'The chatbot remembers your entire conversation and document context.' },
        { heading: 'Legal Guidance', text: 'Ask for explanations of legal terms or clause implications.' }
      ]
    },
    'sharing': {
      title: 'Sharing Analysis Results',
      content: [
        { heading: 'Generate Share Link', text: 'Click the Share button in the sidebar to create a read-only link.' },
        { heading: 'Link Expiration', text: 'Share links expire after 7 days for security.' },
        { heading: 'Export PDF', text: 'Download a comprehensive PDF report of your analysis.' }
      ]
    }
  };

  return (
    <div className="min-h-screen bg-black relative overflow-x-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/3 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/3 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
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

        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 sm:mb-6">
          Documentation
        </h1>
        <p className="text-white/70 text-base sm:text-lg mb-8 sm:mb-12">
          Everything you need to know about using Lexi
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="backdrop-blur-sm bg-white/5 p-4 rounded-2xl border border-white/10 sticky top-4">
              <nav className="space-y-2">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full text-left px-4 py-3 rounded-xl transition-all flex items-center gap-3 text-sm sm:text-base ${
                      activeSection === section.id
                        ? 'bg-purple-500/20 text-white border border-purple-500/30'
                        : 'text-white/70 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <span className="text-xl">{section.icon}</span>
                    <span className="font-medium">{section.title}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Content Area */}
          <div className="lg:col-span-3">
            <div className="backdrop-blur-sm bg-white/5 p-6 sm:p-8 rounded-2xl border border-white/10">
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6">
                {content[activeSection].title}
              </h2>
              <div className="space-y-6">
                {content[activeSection].content.map((item, index) => (
                  <div key={index} className="pb-6 border-b border-white/10 last:border-0">
                    <h3 className="text-lg sm:text-xl font-semibold text-white mb-3">
                      {item.heading}
                    </h3>
                    <p className="text-white/70 text-sm sm:text-base whitespace-pre-line leading-relaxed">
                      {item.text}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Tips */}
            <div className="mt-6 backdrop-blur-sm bg-gradient-to-r from-blue-500/10 to-purple-500/10 p-4 sm:p-6 rounded-2xl border border-blue-500/20">
              <h3 className="text-white font-semibold mb-2 text-base sm:text-lg flex items-center gap-2">
                <span>💡</span> Pro Tip
              </h3>
              <p className="text-white/70 text-sm sm:text-base">
                Use keyboard shortcuts: Press '/' to focus search, 'Esc' to close modals, and 'Ctrl+K' to open command palette.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}