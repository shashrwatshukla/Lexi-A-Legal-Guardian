'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

const EXAMPLE_PROMPTS = [
  "Draft a non-disclosure agreement for a software development project between TechCorp and ClientCo, with mutual confidentiality obligations lasting 3 years",
  "Create an employment contract for a Senior Software Engineer position at $150k/year with standard benefits and a 6-month non-compete clause in California",
  "Generate a freelance services agreement for web design work, payment on milestone completion, including IP transfer to client upon final payment",
  "Draft a data processing addendum that is GDPR-compliant and limits liability to annual contract value",
  "Create a supplier agreement for manufacturing services with quarterly payment terms and quality assurance provisions"
];

export default function PlainLanguageInput({ documentType, onSubmit, isGenerating }) {
  const [prompt, setPrompt] = useState('');
  const [jurisdiction, setJurisdiction] = useState('US Federal');
  const [includePlaybook, setIncludePlaybook] = useState(true);
  const [additionalRequirements, setAdditionalRequirements] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    onSubmit({
      prompt,
      jurisdiction,
      includePlaybook,
      additionalRequirements: additionalRequirements.trim()
    });
  };

  const handleExampleClick = (example) => {
    setPrompt(example);
  };

  const wordCount = prompt.trim().split(/\s+/).length;
  const isValidLength = wordCount >= 10 && wordCount <= 500;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Describe Your Document</h2>
        <p className="text-white/60">
          Explain what you need in plain English. Be specific about parties, terms, and key provisions.
        </p>
      </div>

      {/* Main Text Area */}
      <div className="space-y-2">
        <label className="block text-white font-medium">
          Document Description
          <span className="text-red-400 ml-1">*</span>
        </label>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Example: Draft a non-disclosure agreement between ABC Corp and XYZ Inc for a 2-year software development project. The agreement should be mutual, cover technical specifications and business strategies, and include a 5-year confidentiality period..."
          rows={8}
          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
          disabled={isGenerating}
        />
        <div className="flex justify-between items-center text-sm">
          <span className={`${isValidLength ? 'text-green-400' : 'text-white/40'}`}>
            {wordCount} words {!isValidLength && '(minimum 10, maximum 500)'}
          </span>
          <span className="text-white/40">
            {prompt.length} / 2500 characters
          </span>
        </div>
      </div>

      {/* Configuration Options */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="block text-white font-medium text-sm">
            Jurisdiction
          </label>
          <select
            value={jurisdiction}
            onChange={(e) => setJurisdiction(e.target.value)}
            className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            disabled={isGenerating}
          >
            <option value="US Federal" className="bg-slate-900">US Federal Law</option>
            <option value="California" className="bg-slate-900">California</option>
            <option value="New York" className="bg-slate-900">New York</option>
            <option value="Delaware" className="bg-slate-900">Delaware</option>
            <option value="Texas" className="bg-slate-900">Texas</option>
            <option value="UK" className="bg-slate-900">United Kingdom</option>
            <option value="EU" className="bg-slate-900">European Union</option>
            <option value="International" className="bg-slate-900">International</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="block text-white font-medium text-sm">
            Playbook Enforcement
          </label>
          <div className="flex items-center h-10 px-4 bg-white/10 border border-white/20 rounded-lg">
            <input
              type="checkbox"
              id="playbook"
              checked={includePlaybook}
              onChange={(e) => setIncludePlaybook(e.target.checked)}
              className="mr-3 w-4 h-4 accent-purple-600"
              disabled={isGenerating}
            />
            <label htmlFor="playbook" className="text-white/90 text-sm cursor-pointer">
              Apply active playbook rules
            </label>
          </div>
        </div>
      </div>

      {/* Additional Requirements */}
      <div className="space-y-2">
        <label className="block text-white font-medium text-sm">
          Additional Requirements <span className="text-white/40 font-normal">(Optional)</span>
        </label>
        <textarea
          value={additionalRequirements}
          onChange={(e) => setAdditionalRequirements(e.target.value)}
          placeholder="Any specific clauses, exclusions, or special terms you want included..."
          rows={3}
          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
          disabled={isGenerating}
        />
      </div>

      {/* Example Prompts */}
      <div className="space-y-3">
        <p className="text-white/60 text-sm font-medium">Example Prompts:</p>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {EXAMPLE_PROMPTS.map((example, index) => (
            <motion.button
              key={index}
              type="button"
              onClick={() => handleExampleClick(example)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full text-left px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white/80 text-sm transition-colors"
              disabled={isGenerating}
            >
              <span className="text-purple-400 mr-2">💡</span>
              {example}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-between items-center pt-4">
        <div className="text-white/60 text-sm">
          <span className="inline-flex items-center gap-2">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/>
            </svg>
            AI will generate a complete draft in ~30 seconds
          </span>
        </div>

        <button
          type="submit"
          disabled={isGenerating || !isValidLength || !prompt.trim()}
          className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center gap-2"
        >
          {isGenerating ? (
            <>
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
              </svg>
              Drafting Document...
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/>
              </svg>
              Generate Document
            </>
          )}
        </button>
      </div>

      {/* Disclaimer */}
      <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
        <p className="text-yellow-200 text-xs leading-relaxed">
          <strong>⚠️ Important:</strong> AI-generated documents require professional legal review. 
          This tool provides initial drafts only and should not replace consultation with a licensed attorney 
          for matters involving significant legal or financial consequences.
        </p>
      </div>
    </form>
  );
}