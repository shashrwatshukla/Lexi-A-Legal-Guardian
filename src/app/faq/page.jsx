"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import SideNav from '../../components/sidenav/SideNav';
import FAQ from '../../components/faq/FAQ';

export default function FAQPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="faq-page-loading">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="faq-page">
      {/* Background Gradient */}
      <div className="faq-background">
        <div className="gradient-orb gradient-orb-1"></div>
        <div className="gradient-orb gradient-orb-2"></div>
        <div className="gradient-orb gradient-orb-3"></div>
      </div>

      {/* SideNav */}
      <SideNav />

      {/* Top Navigation Bar */}
      <nav className="faq-top-nav">
        <div className="faq-nav-content">
          <button 
            onClick={() => router.push('/home')}
            className="back-button"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            <span>Back to Home</span>
          </button>

          <div className="faq-nav-logo">
            <img src="/logo.png" alt="Lexi" className="logo-icon" />
            <span className="logo-text">Lexi</span>
          </div>

          <div className="faq-nav-spacer"></div>
        </div>
      </nav>

      {/* Main FAQ Content */}
      <main className="faq-main-content">
        <FAQ />
      </main>

      {/* Inline Styles */}
      <style jsx>{`
        /* ===== FAQ PAGE LAYOUT ===== */
        .faq-page {
          min-height: 100vh;
          background: #000000;
          position: relative;
          overflow-x: hidden;
        }

        /* ===== BACKGROUND EFFECTS ===== */
        .faq-background {
          position: fixed;
          inset: 0;
          pointer-events: none;
          z-index: 0;
        }

        .gradient-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(120px);
          opacity: 0.15;
          animation: float-orb 20s infinite ease-in-out;
        }

        .gradient-orb-1 {
          width: 600px;
          height: 600px;
          background: radial-gradient(circle, rgba(139, 92, 246, 0.4) 0%, transparent 70%);
          top: -200px;
          left: -200px;
          animation-delay: 0s;
        }

        .gradient-orb-2 {
          width: 500px;
          height: 500px;
          background: radial-gradient(circle, rgba(168, 85, 247, 0.3) 0%, transparent 70%);
          bottom: -150px;
          right: -150px;
          animation-delay: 5s;
        }

        .gradient-orb-3 {
          width: 400px;
          height: 400px;
          background: radial-gradient(circle, rgba(96, 165, 250, 0.2) 0%, transparent 70%);
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          animation-delay: 10s;
        }

        @keyframes float-orb {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          25% {
            transform: translate(50px, -50px) scale(1.1);
          }
          50% {
            transform: translate(-50px, 50px) scale(0.9);
          }
          75% {
            transform: translate(25px, 25px) scale(1.05);
          }
        }

        /* ===== TOP NAVIGATION ===== */
        .faq-top-nav {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 100;
          background: rgba(0, 0, 0, 0.8);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(139, 92, 246, 0.2);
        }

        .faq-nav-content {
          max-width: 1400px;
          margin: 0 auto;
          padding: 1rem 2rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 2rem;
        }

        .back-button {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.625rem 1.25rem;
          background: rgba(139, 92, 246, 0.1);
          border: 1px solid rgba(139, 92, 246, 0.3);
          border-radius: 0.75rem;
          color: rgb(168, 85, 247);
          font-weight: 600;
          font-size: 0.875rem;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .back-button:hover {
          background: rgba(139, 92, 246, 0.2);
          border-color: rgba(139, 92, 246, 0.5);
          transform: translateX(-2px);
        }

        .faq-nav-logo {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .logo-icon {
          width: 40px;
          height: 40px;
          border-radius: 50%;
        }

        .logo-text {
          font-size: 1.5rem;
          font-weight: 800;
          background: linear-gradient(135deg, rgb(139, 92, 246), rgb(168, 85, 247));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .faq-nav-spacer {
          width: 140px;
        }

        /* ===== MAIN CONTENT ===== */
        .faq-main-content {
          position: relative;
          z-index: 10;
          padding-top: 5rem;
          min-height: 100vh;
        }

        /* ===== LOADING STATE ===== */
        .faq-page-loading {
          min-height: 100vh;
          background: #000000;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .loading-spinner {
          width: 48px;
          height: 48px;
          border: 4px solid rgba(139, 92, 246, 0.2);
          border-top-color: rgb(139, 92, 246);
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        /* ===== RESPONSIVE ===== */
        @media (max-width: 768px) {
          .faq-nav-content {
            padding: 1rem;
          }

          .faq-nav-logo {
            gap: 0.5rem;
          }

          .logo-icon {
            width: 32px;
            height: 32px;
          }

          .logo-text {
            font-size: 1.25rem;
          }

          .back-button {
            padding: 0.5rem 1rem;
            font-size: 0.8125rem;
          }

          .back-button span {
            display: none;
          }

          .faq-nav-spacer {
            width: 60px;
          }

          .faq-main-content {
            padding-top: 4rem;
          }
        }

        @media (max-width: 480px) {
          .faq-nav-content {
            padding: 0.75rem;
          }

          .logo-text {
            font-size: 1.125rem;
          }

          .back-button {
            padding: 0.5rem;
          }

          .faq-nav-spacer {
            width: 40px;
          }
        }
      `}</style>
    </div>
  );
}