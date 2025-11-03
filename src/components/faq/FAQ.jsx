"use client";

import { useState } from 'react';
import './FAQ.css';

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const faqItems = [
    {
      question: "What types of documents can Lexi analyze?",
      answer: "Lexi can analyze various legal documents including employment contracts, NDAs, service agreements, lease agreements, partnership agreements, and more. Our AI is trained on a wide range of legal document types to provide comprehensive analysis."
    },
    {
      question: "How secure is my document data?",
      answer: "We take security seriously. All documents are encrypted end-to-end during upload and analysis. Your documents are automatically deleted from our servers immediately after analysis is complete. We never store or share your sensitive information."
    },
    {
      question: "How long does the analysis take?",
      answer: "Most document analyses are completed within 30-60 seconds. The exact time depends on document length and complexity. You'll see real-time progress updates during the analysis process."
    },
    {
      question: "Is Lexi a replacement for a lawyer?",
      answer: "No, Lexi is a powerful AI tool that helps you understand contracts better, but it doesn't replace professional legal advice. We recommend consulting with a qualified attorney for legal decisions, especially for complex or high-stakes agreements."
    },
    {
      question: "What makes Lexi different from other contract review tools?",
      answer: "Lexi uses advanced AI to provide plain-language explanations, identifies hidden risks, offers negotiation suggestions, and presents results in an intuitive visual format. Plus, our analysis is comprehensive, fast, and completely free to use."
    },
    {
      question: "Can I export or save my analysis results?",
      answer: "Yes! You can export your analysis results as a PDF report or share them via email. The chatbot also allows you to ask follow-up questions about your document at any time during your session."
    },
    {
      question: "What is the Document Drafter feature?",
      answer: "The Document Drafter helps you create legal documents from scratch using AI. Simply describe what you need in plain language, and our AI will generate a professional draft tailored to your requirements."
    },
    {
      question: "Do you offer a mobile app?",
      answer: "Currently, Lexi is a web-based platform optimized for all devices. You can access it from any browser on your phone, tablet, or computer without needing to download an app."
    }
  ];

  const filteredFAQs = faqItems.filter(item =>
    item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="faq-section">
      <div className="faq-container">
        <div className="faq-header">
          <h2 className="faq-title">
            Frequently Asked Questions
          </h2>
          <p className="faq-subtitle">
            Everything you need to know about Lexi
          </p>
        </div>

        <div className="faq-search">
          <div className="search-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/>
              <path d="m21 21-4.35-4.35"/>
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search questions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          {searchQuery && (
            <button 
              className="clear-search"
              onClick={() => setSearchQuery('')}
              aria-label="Clear search"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          )}
        </div>

        {searchQuery && (
          <div className="search-results-count">
            {filteredFAQs.length} result{filteredFAQs.length !== 1 ? 's' : ''} found
          </div>
        )}

        <div className="faq-list">
          {filteredFAQs.map((item, index) => {
            const isOpen = openIndex === index;
            return (
              <div 
                key={index} 
                className={`faq-item ${isOpen ? 'faq-item-open' : ''}`}
              >
                <button
                  className="faq-question"
                  onClick={() => toggleFAQ(index)}
                  aria-expanded={isOpen}
                >
                  <span className="question-text">{item.question}</span>
                  <div className={`faq-icon ${isOpen ? 'faq-icon-open' : ''}`}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                      <path 
                        d="M6 9L12 15L18 9" 
                        stroke="currentColor" 
                        strokeWidth="2.5" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                </button>
                
                <div className={`faq-answer ${isOpen ? 'faq-answer-open' : ''}`}>
                  <div className="answer-content">
                    <div className="answer-divider" />
                    <p>{item.answer}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredFAQs.length === 0 && (
          <div className="no-results">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="11" cy="11" r="8"/>
              <path d="m21 21-4.35-4.35"/>
              <line x1="9" y1="9" x2="15" y2="15"/>
              <line x1="15" y1="9" x2="9" y2="15"/>
            </svg>
            <p>No questions match your search</p>
            <button onClick={() => setSearchQuery('')} className="reset-search">
              View all questions
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default FAQ;