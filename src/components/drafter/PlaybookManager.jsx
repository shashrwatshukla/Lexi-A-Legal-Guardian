'use client';

import { useState } from 'react';

const DEFAULT_PLAYBOOKS = [
  {
    id: 'default',
    name: 'Default',
    description: 'Standard legal best practices',
    rules: {
      governingLaw: 'Include governing law clause',
      disputeResolution: 'Include dispute resolution mechanism',
      severability: 'Include severability clause'
    }
  },
  {
    id: 'tech-startup',
    name: 'Tech Startup',
    description: 'Optimized for technology companies',
    rules: {
      governingLaw: 'Delaware or California law preferred',
      ipOwnership: 'Company owns all work product',
      liabilityCap: 'Cap liability at contract value',
      dataProtection: 'Include GDPR/CCPA compliance',
      disputeResolution: 'Arbitration in San Francisco or Delaware'
    }
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'Conservative, enterprise-grade terms',
    rules: {
      governingLaw: 'Mutual agreement on jurisdiction',
      liabilityCap: 'Unlimited liability for IP infringement',
      indemnification: 'Mutual indemnification required',
      insurance: 'Require $2M+ liability insurance',
      auditRights: 'Include audit rights for compliance'
    }
  }
];

export default function PlaybookManager({ activePlaybook, onPlaybookChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const currentPlaybook = DEFAULT_PLAYBOOKS.find(p => p.id === activePlaybook) || DEFAULT_PLAYBOOKS[0];

  return (
    <div className="relative">
      {/* Playbook Selector Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors border border-white/20"
      >
        <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
        </svg>
        <div className="text-left">
          <p className="text-white text-sm font-medium">{currentPlaybook.name}</p>
          <p className="text-white/60 text-xs">Active Playbook</p>
        </div>
        <svg 
          className={`w-4 h-4 text-white/60 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/>
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-80 bg-slate-900 border border-white/20 rounded-xl shadow-2xl z-50 overflow-hidden">
            <div className="p-4 border-b border-white/10">
              <h3 className="text-white font-semibold mb-1">Select Playbook</h3>
              <p className="text-white/60 text-xs">Choose rules to enforce in generated documents</p>
            </div>

            <div className="max-h-96 overflow-y-auto">
              {DEFAULT_PLAYBOOKS.map(playbook => (
                <button
                  key={playbook.id}
                  onClick={() => {
                    onPlaybookChange(playbook.id);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left p-4 hover:bg-white/10 transition-colors border-b border-white/5 ${
                    activePlaybook === playbook.id ? 'bg-purple-600/20' : ''
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="text-white font-medium">{playbook.name}</h4>
                    {activePlaybook === playbook.id && (
                      <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                      </svg>
                    )}
                  </div>
                  <p className="text-white/60 text-sm mb-2">{playbook.description}</p>
                  <div className="flex flex-wrap gap-1">
                    {Object.keys(playbook.rules).slice(0, 3).map(rule => (
                      <span 
                        key={rule}
                        className="text-xs bg-white/10 text-white/70 px-2 py-1 rounded"
                      >
                        {rule}
                      </span>
                    ))}
                    {Object.keys(playbook.rules).length > 3 && (
                      <span className="text-xs text-white/50 px-2 py-1">
                        +{Object.keys(playbook.rules).length - 3} more
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>

            <div className="p-4 border-t border-white/10">
              <button
                onClick={() => {
                  setShowCreateModal(true);
                  setIsOpen(false);
                }}
                className="w-full px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all text-sm font-medium flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/>
                </svg>
                Create Custom Playbook
              </button>
            </div>
          </div>
        </>
      )}

      {/* Create Playbook Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-white/20 rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6 border-b border-white/10 flex justify-between items-center">
              <h3 className="text-xl font-bold text-white">Create Custom Playbook</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-white/60 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>

            <div className="p-6">
              <p className="text-white/60 text-center py-8">
                Custom playbook creation coming soon!<br/>
                This feature will allow you to define your own legal standards and requirements.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}