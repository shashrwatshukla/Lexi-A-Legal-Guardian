'use client';

const DOCUMENT_TYPES = [
  {
    id: 'nda',
    title: 'Non-Disclosure Agreement',
    description: 'Protect confidential information',
    icon: '🔒',
    category: 'Commercial',
    popularity: 'high'
  },
  {
    id: 'employment',
    title: 'Employment Agreement',
    description: 'Define employment terms',
    icon: '💼',
    category: 'HR',
    popularity: 'high'
  },
  {
    id: 'msa',
    title: 'Master Services Agreement',
    description: 'Framework for ongoing services',
    icon: '📋',
    category: 'Commercial',
    popularity: 'medium'
  },
  {
    id: 'privacyPolicy',
    title: 'Privacy Policy',
    description: 'Data handling disclosure',
    icon: '🔐',
    category: 'Compliance',
    popularity: 'high'
  },
  {
    id: 'salesAgreement',
    title: 'Sales Agreement',
    description: 'Purchase terms for goods',
    icon: '💰',
    category: 'Commercial',
    popularity: 'medium'
  },
  {
    id: 'consulting',
    title: 'Consulting Agreement',
    description: 'Professional services terms',
    icon: '🤝',
    category: 'Commercial',
    popularity: 'medium'
  },
  {
    id: 'lease',
    title: 'Lease Agreement',
    description: 'Property rental terms',
    icon: '🏢',
    category: 'Real Estate',
    popularity: 'medium'
  },
  {
    id: 'termsOfService',
    title: 'Terms of Service',
    description: 'Website/app usage terms',
    icon: '📱',
    category: 'Compliance',
    popularity: 'high'
  }
];

export default function DocumentTypeSelector({ selectedType, onSelectType }) {
  return (
    <div className="bg-white/5 backdrop-blur-md rounded-xl border border-white/10 p-6">
      <h2 className="text-lg font-semibold text-white mb-4">Document Type</h2>
      
      <div className="space-y-2 max-h-[500px] overflow-y-auto">
        {DOCUMENT_TYPES.map(doc => (
          <button
            key={doc.id}
            onClick={() => onSelectType(doc.id)}
            className={`w-full text-left p-4 rounded-lg transition-all ${
              selectedType === doc.id
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg scale-105'
                : 'bg-white/5 text-white/80 hover:bg-white/10'
            }`}
          >
            <div className="flex items-start gap-3">
              <span className="text-2xl">{doc.icon}</span>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold">{doc.title}</h3>
                  {doc.popularity === 'high' && (
                    <span className="text-xs bg-yellow-500/20 text-yellow-300 px-2 py-0.5 rounded-full">
                      Popular
                    </span>
                  )}
                </div>
                <p className="text-sm opacity-80">{doc.description}</p>
                <p className="text-xs opacity-60 mt-1">{doc.category}</p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}