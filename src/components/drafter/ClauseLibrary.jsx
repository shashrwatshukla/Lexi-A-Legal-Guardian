'use client';

import { useState } from 'react';

const SAMPLE_CLAUSES = {
  confidentiality: [
    {
      id: 'conf-1',
      title: 'Standard Confidentiality Clause',
      category: 'Confidentiality',
      jurisdiction: 'US Federal',
      text: 'The Receiving Party agrees to hold and maintain the Confidential Information in strictest confidence, using at least the same degree of care that it uses to protect its own confidential information, but in no event less than reasonable care.'
    },
    {
      id: 'conf-2',
      title: 'Mutual NDA Confidentiality',
      category: 'Confidentiality',
      jurisdiction: 'US Federal',
      text: 'Each Party agrees that it shall not use any Confidential Information disclosed to it by the other Party for its own use or for any purpose other than to carry out discussions concerning, and the undertaking of, the Purpose.'
    }
  ],
  liability: [
    {
      id: 'liab-1',
      title: 'Limited Liability Cap',
      category: 'Liability',
      jurisdiction: 'US Federal',
      text: 'In no event shall either party\'s aggregate liability arising out of or related to this Agreement exceed the total amount paid by Client to Provider in the twelve (12) months preceding the event giving rise to liability.'
    },
    {
      id: 'liab-2',
      title: 'Consequential Damages Waiver',
      category: 'Liability',
      jurisdiction: 'US Federal',
      text: 'Neither party shall be liable for any indirect, incidental, special, exemplary, or consequential damages, including but not limited to loss of profits, revenue, data, or use, even if advised of the possibility of such damages.'
    }
  ],
  termination: [
    {
      id: 'term-1',
      title: 'Termination for Convenience',
      category: 'Termination',
      jurisdiction: 'US Federal',
      text: 'Either party may terminate this Agreement for any reason upon thirty (30) days prior written notice to the other party.'
    },
    {
      id: 'term-2',
      title: 'Termination for Cause',
      category: 'Termination',
      jurisdiction: 'US Federal',
      text: 'Either party may terminate this Agreement immediately upon written notice if the other party materially breaches this Agreement and fails to cure such breach within thirty (30) days after receiving written notice thereof.'
    }
  ],
  ip: [
    {
      id: 'ip-1',
      title: 'Work-for-Hire IP Assignment',
      category: 'Intellectual Property',
      jurisdiction: 'US Federal',
      text: 'All work product created by Provider under this Agreement shall be deemed "work made for hire" under U.S. copyright law. To the extent any such work product does not qualify as work made for hire, Provider hereby assigns all right, title, and interest in such work product to Client.'
    },
    {
      id: 'ip-2',
      title: 'Background IP Reservation',
      category: 'Intellectual Property',
      jurisdiction: 'US Federal',
      text: 'Each party retains all right, title, and interest in its Background Intellectual Property. "Background Intellectual Property" means any intellectual property owned by a party prior to the Effective Date or developed independently of this Agreement.'
    }
  ]
};

export default function ClauseLibrary({ documentType, onGenerateDraft, isGenerating }) {
  const [selectedClauses, setSelectedClauses] = useState([]);
  const [activeCategory, setActiveCategory] = useState('confidentiality');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = Object.keys(SAMPLE_CLAUSES);
  const currentClauses = SAMPLE_CLAUSES[activeCategory] || [];

  const filteredClauses = currentClauses.filter(clause =>
    clause.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    clause.text.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleClause = (clauseId) => {
    setSelectedClauses(prev =>
      prev.includes(clauseId)
        ? prev.filter(id => id !== clauseId)
        : [...prev, clauseId]
    );
  };

  const handleGenerateDraft = () => {
    const allClauses = Object.values(SAMPLE_CLAUSES).flat();
    const selected = allClauses.filter(c => selectedClauses.includes(c.id));
    onGenerateDraft({ selectedClauses: selected });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Clause Library</h2>
        <p className="text-white/60">
          Select pre-approved clauses to build your document
        </p>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <svg 
          className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
        </svg>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search clauses..."
          className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {categories.map(category => (
          <button
            key={category}
            onClick={() => setActiveCategory(category)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
              activeCategory === category
                ? 'bg-purple-600 text-white'
                : 'bg-white/10 text-white/70 hover:bg-white/20'
            }`}
          >
            {category.charAt(0).toUpperCase() + category.slice(1)}
          </button>
        ))}
      </div>

      {/* Clauses List */}
      <div className="space-y-3 max-h-[500px] overflow-y-auto">
        {filteredClauses.map(clause => (
          <div
            key={clause.id}
            className={`p-4 rounded-lg border transition-all cursor-pointer ${
              selectedClauses.includes(clause.id)
                ? 'bg-purple-600/20 border-purple-500'
                : 'bg-white/5 border-white/10 hover:bg-white/10'
            }`}
            onClick={() => toggleClause(clause.id)}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-start gap-3 flex-1">
                <input
                  type="checkbox"
                  checked={selectedClauses.includes(clause.id)}
                  onChange={() => toggleClause(clause.id)}
                  className="mt-1 w-5 h-5 accent-purple-600"
                  onClick={(e) => e.stopPropagation()}
                />
                <div className="flex-1">
                  <h4 className="text-white font-medium mb-1">{clause.title}</h4>
                  <div className="flex gap-2 mb-2">
                    <span className="text-xs bg-white/10 text-white/70 px-2 py-1 rounded">
                      {clause.category}
                    </span>
                    <span className="text-xs bg-white/10 text-white/70 px-2 py-1 rounded">
                      {clause.jurisdiction}
                    </span>
                  </div>
                                    <p className="text-white/70 text-sm leading-relaxed">
                    {clause.text}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}

        {filteredClauses.length === 0 && (
          <div className="text-center py-12">
            <svg className="w-16 h-16 text-white/20 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <p className="text-white/60">No clauses found matching your search</p>
          </div>
        )}
      </div>

      {/* Selected Count & Generate */}
      <div className="flex justify-between items-center pt-4 border-t border-white/10">
        <div className="text-white/60 text-sm">
          <span className="text-white font-medium">{selectedClauses.length}</span> clause(s) selected
        </div>

        <button
          onClick={handleGenerateDraft}
          disabled={isGenerating || selectedClauses.length === 0}
          className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center gap-2"
        >
          {isGenerating ? (
            <>
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
              </svg>
              Generating...
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
              </svg>
              Generate from Selected
            </>
          )}
        </button>
      </div>
    </div>
  );
}