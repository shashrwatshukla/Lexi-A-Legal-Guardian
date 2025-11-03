"use client";

import { useRouter } from 'next/navigation';

export default function CompliancePage() {
  const router = useRouter();

  const complianceStandards = [
    {
      icon: '🇪🇺',
      title: 'GDPR',
      status: 'Compliant',
      description: 'General Data Protection Regulation - EU data privacy and security law'
    },
    {
      icon: '🇺🇸',
      title: 'CCPA',
      status: 'Compliant',
      description: 'California Consumer Privacy Act - California data privacy rights'
    },
    {
      icon: '🔒',
      title: 'SOC 2 Type II',
      status: 'Certified',
      description: 'Security, availability, and confidentiality controls audit'
    },
    {
      icon: '🛡️',
      title: 'ISO 27001',
      status: 'Certified',
      description: 'Information security management system standards'
    },
    {
      icon: '⚖️',
      title: 'HIPAA',
      status: 'Coming Soon',
      description: 'Health Insurance Portability and Accountability Act compliance'
    },
    {
      icon: '🌐',
      title: 'Privacy Shield',
      status: 'In Progress',
      description: 'EU-US data transfer framework compliance'
    }
  ];

  const dataHandling = [
    {
      title: 'Data Collection',
      items: [
        'Only essential data is collected',
        'Explicit user consent required',
        'Transparent privacy notices',
        'Minimal data retention periods'
      ]
    },
    {
      title: 'Data Processing',
      items: [
        'Encrypted data transmission',
        'Secure processing environments',
        'Regular security audits',
        'Access controls and logging'
      ]
    },
    {
      title: 'Data Rights',
      items: [
        'Right to access your data',
        'Right to data portability',
        'Right to be forgotten',
        'Right to rectification'
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-black relative overflow-x-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
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
          Compliance & Certifications
        </h1>
        <p className="text-white/70 text-base sm:text-lg mb-8 sm:mb-12">
          Meeting the highest standards in data protection and security
        </p>

        {/* Compliance Standards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-12">
          {complianceStandards.map((standard, index) => (
            <div 
              key={index}
              className="backdrop-blur-sm bg-white/5 p-4 sm:p-6 rounded-2xl border border-white/10 hover:border-blue-500/30 transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="text-3xl sm:text-4xl">{standard.icon}</div>
                <span 
                  className={`px-3 py-1 rounded-full text-xs sm:text-sm font-semibold ${
                    standard.status === 'Compliant' || standard.status === 'Certified'
                      ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                      : standard.status === 'In Progress'
                      ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                      : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                  }`}
                >
                  {standard.status}
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-white mb-2">{standard.title}</h3>
              <p className="text-white/70 text-sm sm:text-base">{standard.description}</p>
            </div>
          ))}
        </div>

        {/* Data Handling Practices */}
        <div className="backdrop-blur-sm bg-white/5 p-6 sm:p-8 rounded-2xl border border-white/10 mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6">Data Handling Practices</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {dataHandling.map((section, index) => (
              <div key={index}>
                <h3 className="text-white font-bold text-lg sm:text-xl mb-4 flex items-center gap-2">
                  <span className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center text-blue-400 text-sm">
                    {index + 1}
                  </span>
                  {section.title}
                </h3>
                <ul className="space-y-3">
                  {section.items.map((item, itemIndex) => (
                    <li key={itemIndex} className="flex items-start gap-2 text-white/70 text-sm sm:text-base">
                      <span className="text-blue-400 mt-1">✓</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Audit Reports */}
        <div className="backdrop-blur-sm bg-white/5 p-6 sm:p-8 rounded-2xl border border-white/10 mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6">Audit Reports & Certifications</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center text-green-400 text-xl">
                  📄
                </div>
                <div>
                  <h3 className="text-white font-semibold text-base sm:text-lg">SOC 2 Type II Report</h3>
                  <p className="text-white/60 text-xs sm:text-sm">Last updated: {new Date().getFullYear()}</p>
                </div>
              </div>
              <button className="px-4 py-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors text-sm sm:text-base font-semibold">
                Request
              </button>
            </div>

            <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center text-green-400 text-xl">
                  📋
                </div>
                <div>
                  <h3 className="text-white font-semibold text-base sm:text-lg">ISO 27001 Certificate</h3>
                  <p className="text-white/60 text-xs sm:text-sm">Valid until: Dec {new Date().getFullYear() + 1}</p>
                </div>
              </div>
              <button className="px-4 py-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors text-sm sm:text-base font-semibold">
                Request
              </button>
            </div>

            <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center text-green-400 text-xl">
                  🔐
                </div>
                <div>
                  <h3 className="text-white font-semibold text-base sm:text-lg">Penetration Test Report</h3>
                  <p className="text-white/60 text-xs sm:text-sm">Conducted: Quarterly</p>
                </div>
              </div>
              <button className="px-4 py-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors text-sm sm:text-base font-semibold">
                Request
              </button>
            </div>
          </div>
        </div>

        {/* Third-Party Processors */}
        <div className="backdrop-blur-sm bg-white/5 p-6 sm:p-8 rounded-2xl border border-white/10 mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">Third-Party Service Providers</h2>
          <p className="text-white/70 mb-6 text-sm sm:text-base">
            We work with trusted, compliant service providers to deliver our services:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-white/5 rounded-xl border border-white/10">
              <h3 className="text-white font-semibold mb-2 text-base sm:text-lg">Cloud Infrastructure</h3>
              <p className="text-white/60 text-sm sm:text-base">AWS (SOC 2, ISO 27001, GDPR compliant)</p>
            </div>
            <div className="p-4 bg-white/5 rounded-xl border border-white/10">
              <h3 className="text-white font-semibold mb-2 text-base sm:text-lg">Authentication</h3>
              <p className="text-white/60 text-sm sm:text-base">Firebase Auth (GDPR, SOC 2 compliant)</p>
            </div>
            <div className="p-4 bg-white/5 rounded-xl border border-white/10">
              <h3 className="text-white font-semibold mb-2 text-base sm:text-lg">AI Processing</h3>
              <p className="text-white/60 text-sm sm:text-base">Google AI (Privacy Shield certified)</p>
            </div>
            <div className="p-4 bg-white/5 rounded-xl border border-white/10">
              <h3 className="text-white font-semibold mb-2 text-base sm:text-lg">Email Services</h3>
              <p className="text-white/60 text-sm sm:text-base">SendGrid (GDPR, CCPA compliant)</p>
            </div>
          </div>
        </div>

        {/* Contact for Compliance */}
        <div className="backdrop-blur-sm bg-gradient-to-r from-blue-500/10 to-purple-500/10 p-4 sm:p-6 rounded-2xl border border-blue-500/20">
          <h3 className="text-white font-semibold mb-2 text-base sm:text-lg flex items-center gap-2">
            <span>📧</span> Compliance Inquiries
          </h3>
          <p className="text-white/70 text-sm sm:text-base">
            For compliance-related questions or to request audit reports, contact our compliance team at:{' '}
            <a href="mailto:asklexiofficial@gmail.com" className="text-blue-400 hover:text-blue-300 font-semibold">
              asklexiofficial@gmail.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}