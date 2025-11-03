"use client";

import { useState } from "react";

export default function AnalysisNav({ activeSection, onSectionChange, onExport, exportProgress }) {
  const [isExportHovered, setIsExportHovered] = useState(false);

  const sections = [
    { id: 'overview', label: 'Overview' },
    { id: 'risks', label: 'Risks' },
    { id: 'clauses', label: 'Clauses' },
    { id: 'actions', label: 'Actions' },
    { id: 'timeline', label: 'Timeline' }
  ];

  return (
    <>
      <div className="navbar-wrapper">
        <nav className="navbar-pill">
          {/* Gemini Logo - Left Side */}
          <div className="logo-container">
            <svg className="gemini-logo" width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="16" cy="8" r="3" fill="url(#blue-gradient)"/>
              <circle cx="16" cy="24" r="3" fill="url(#purple-gradient)"/>
              <circle cx="8" cy="16" r="3" fill="url(#pink-gradient)"/>
              <circle cx="24" cy="16" r="3" fill="url(#cyan-gradient)"/>
              <path d="M16 11 L16 21" stroke="url(#grad1)" strokeWidth="2" strokeLinecap="round"/>
              <path d="M11 16 L21 16" stroke="url(#grad2)" strokeWidth="2" strokeLinecap="round"/>
              <defs>
                <linearGradient id="blue-gradient" x1="0" y1="0" x2="32" y2="32">
                  <stop offset="0%" stopColor="#4285F4"/>
                  <stop offset="100%" stopColor="#5B9FFF"/>
                </linearGradient>
                <linearGradient id="purple-gradient" x1="0" y1="0" x2="32" y2="32">
                  <stop offset="0%" stopColor="#A855F7"/>
                  <stop offset="100%" stopColor="#C084FC"/>
                </linearGradient>
                <linearGradient id="pink-gradient" x1="0" y1="0" x2="32" y2="32">
                  <stop offset="0%" stopColor="#EC4899"/>
                  <stop offset="100%" stopColor="#F472B6"/>
                </linearGradient>
                <linearGradient id="cyan-gradient" x1="0" y1="0" x2="32" y2="32">
                  <stop offset="0%" stopColor="#06B6D4"/>
                  <stop offset="100%" stopColor="#22D3EE"/>
                </linearGradient>
                <linearGradient id="grad1" x1="16" y1="11" x2="16" y2="21">
                  <stop offset="0%" stopColor="#4285F4"/>
                  <stop offset="100%" stopColor="#A855F7"/>
                </linearGradient>
                <linearGradient id="grad2" x1="11" y1="16" x2="21" y2="16">
                  <stop offset="0%" stopColor="#EC4899"/>
                  <stop offset="100%" stopColor="#06B6D4"/>
                </linearGradient>
              </defs>
            </svg>
          </div>

          {/* Center Navigation Links */}
          <ul className="nav-links-list">
            {sections.map((section) => (
              <li key={section.id}>
                <button
                  onClick={() => onSectionChange(section.id)}
                  className={`nav-link-item ${activeSection === section.id ? 'active-link' : ''}`}
                >
                  <span className="text-mask">
                    <span className="text-stack">
                      <span className="text-copy">{section.label}</span>
                      <span className="text-copy">{section.label}</span>
                    </span>
                  </span>
                  {activeSection === section.id && <span className="active-underline"></span>}
                </button>
              </li>
            ))}
          </ul>

          {/* Export Button - Right Side */}
          <button 
            onClick={onExport}
            className="export-btn"
            disabled={exportProgress?.isExporting}
            onMouseEnter={() => setIsExportHovered(true)}
            onMouseLeave={() => setIsExportHovered(false)}
          >
            <span className="btn-text">
              {exportProgress?.isExporting 
                ? `${exportProgress.message} (${exportProgress.progress}/${exportProgress.total})` 
                : 'Export Report'}
            </span>
            {isExportHovered && !exportProgress?.isExporting && (
              <span className="export-emoji">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="3" y="3" width="14" height="14" rx="3" stroke="#FFFFFF" strokeWidth="2.5" fill="rgba(255, 255, 255, 0.2)"/>
                  <path d="M13 11 L19 5 M19 5 L19 10 M19 5 L14 5" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </span>
            )}
          </button>
        </nav>
      </div>

      <style jsx>{`
        /* ============================================
           PERFORMANCE OPTIMIZATIONS APPLIED:
           ✅ Removed padding change on hover (prevents layout shift)
           ✅ Added will-change hints for GPU acceleration
           ✅ Reduced scale from 1.08 to 1.05
           ✅ Faster transitions (0.3s → 0.25s)
           ✅ Added contain: layout for isolation
           ============================================ */

        /* Wrapper to center everything */
        .navbar-wrapper {
          display: flex;
          justify-content: center;
          align-items: center;
          width: 100%;
          padding: 0 20px;
          margin-bottom: 32px;
        }

        /* Main White Pill Container */
        .navbar-pill {
          display: flex;
          flex-direction: row;
          justify-content: space-between;
          align-items: center;
          background-color: #ffffff;
          padding: 16px 32px;
          border-radius: 9999px;
          max-width: 900px;
          width: auto;
          gap: 40px;
          
          /* Glassmorphism Inset Effect */
          box-shadow: 
            inset 0 1px 0 0 rgba(255, 255, 255, 0.9),
            inset 0 -1px 0 0 rgba(0, 0, 0, 0.1),
            0 4px 20px rgba(0, 0, 0, 0.1);
          
          /* ✅ PERFORMANCE: Isolate layout */
          contain: layout style;
        }

        /* Gemini Logo Container */
        .logo-container {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .gemini-logo {
          cursor: pointer;
          transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
          will-change: transform; /* ✅ GPU hint */
        }

        .gemini-logo:hover {
          transform: rotate(360deg);
        }

        /* Navigation Links - Center */
        .nav-links-list {
          display: flex;
          flex-direction: row;
          align-items: center;
          justify-content: center;
          list-style: none;
          margin: 0;
          padding: 0;
          gap: 32px;
          flex: 1;
        }

        .nav-link-item {
          background: none;
          border: none;
          color: #333333;
          font-size: 16px;
          font-weight: 500;
          cursor: pointer;
          padding: 0;
          white-space: nowrap;
          position: relative;
          overflow: visible;
          will-change: auto; /* ✅ Let browser decide */
        }

        /* Text Mask Container - Hides overflow */
        .text-mask {
          display: inline-block;
          overflow: hidden;
          height: 20px;
          position: relative;
        }

        /* Text Stack - Contains 2 copies vertically */
        .text-stack {
          display: flex;
          flex-direction: column;
          transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1); /* ✅ Faster */
          transform: translateY(0);
          will-change: transform; /* ✅ GPU hint */
        }

        /* Each text copy */
        .text-copy {
          display: block;
          height: 20px;
          line-height: 20px;
        }

        /* Hover Animation - Slide text up */
        .nav-link-item:hover .text-stack {
          transform: translateY(-20px);
        }

        /* Active Link Underline */
        .active-link {
          color: #000000;
          font-weight: 600;
        }

        .active-underline {
          position: absolute;
          bottom: -4px;
          left: 0;
          right: 0;
          height: 2px;
          background-color: #000000;
          border-radius: 2px;
        }

        /* ✅ OPTIMIZED Export Button */
        .export-btn {
          background-color: #007BFF;
          color: #ffffff;
          padding: 12px 28px; /* ✅ FIXED: No padding change */
          border-radius: 9999px;
          border: none;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          white-space: nowrap;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: background-color 0.25s ease, transform 0.25s ease; /* ✅ Faster */
          transform: scale(1);
          will-change: transform; /* ✅ GPU hint */
        }

        .export-btn:disabled {
          background-color: #4a5568;
          cursor: not-allowed;
          opacity: 0.7;
        }

        .export-btn:disabled:hover {
          transform: scale(1);
        }

        /* ✅ OPTIMIZED: Only scale, no padding change */
        .export-btn:hover:not(:disabled) {
          background-color: #000000;
          transform: scale(1.05); /* ✅ Reduced from 1.08 */
        }

        .btn-text {
          display: inline-block;
        }

        /* Export Emoji Animation */
        .export-emoji {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          animation: slideInEmoji 0.25s ease-out forwards; /* ✅ Faster */
        }

        .export-emoji svg {
          display: block;
        }

        @keyframes slideInEmoji {
          0% {
            opacity: 0;
            transform: translateX(-10px) scale(0.5);
          }
          100% {
            opacity: 1;
            transform: translateX(0) scale(1);
          }
        }

        /* Remove focus outline */
        .nav-link-item:focus,
        .export-btn:focus {
          outline: none;
        }

        /* ============================================
           RESPONSIVE DESIGN
           ============================================ */
        
        @media (max-width: 1024px) {
          .navbar-pill {
            gap: 24px;
            padding: 14px 28px;
          }

          .nav-links-list {
            gap: 24px;
          }

          .nav-link-item {
            font-size: 15px;
          }

          .text-mask {
            height: 19px;
          }

          .text-copy {
            height: 19px;
            line-height: 19px;
          }

          .nav-link-item:hover .text-stack {
            transform: translateY(-19px);
          }
        }

        @media (max-width: 768px) {
          .navbar-pill {
            gap: 16px;
            padding: 12px 20px;
            max-width: 95%;
          }

          .nav-links-list {
            gap: 16px;
          }

          .nav-link-item {
            font-size: 14px;
          }

          .text-mask {
            height: 18px;
          }

          .text-copy {
            height: 18px;
            line-height: 18px;
          }

          .nav-link-item:hover .text-stack {
            transform: translateY(-18px);
          }

          .export-btn {
            padding: 10px 20px;
            font-size: 14px;
          }

          .gemini-logo {
            width: 28px;
            height: 28px;
          }

          .export-emoji svg {
            width: 16px;
            height: 16px;
          }
        }

        @media (max-width: 640px) {
          .navbar-pill {
            flex-wrap: wrap;
            justify-content: center;
            padding: 12px 16px;
            gap: 12px;
          }

          .nav-links-list {
            gap: 12px;
            order: 2;
            width: 100%;
            justify-content: space-around;
          }

          .logo-container {
            order: 1;
          }

          .export-btn {
            order: 3;
            font-size: 13px;
            padding: 10px 18px;
          }

          .nav-link-item {
            font-size: 13px;
          }

          .text-mask {
            height: 17px;
          }

          .text-copy {
            height: 17px;
            line-height: 17px;
          }

          .nav-link-item:hover .text-stack {
            transform: translateY(-17px);
          }
        }

        /* ============================================
           ACCESSIBILITY
           ============================================ */
        
        @media (prefers-reduced-motion: reduce) {
          .gemini-logo,
          .text-stack,
          .export-btn {
            transition: none;
          }
          
          .export-emoji {
            animation: none;
          }
          
          .nav-link-item:hover .text-stack {
            transform: none;
          }
        }
      `}</style>
    </>
  );
}