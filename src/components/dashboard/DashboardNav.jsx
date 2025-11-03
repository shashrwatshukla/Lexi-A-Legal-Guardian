'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { logout } from '../../lib/auth';
import { useLanguage } from '../../context/LanguageContext';

export default function DashboardNav({ userName }) {
  const router = useRouter();
  const { t } = useLanguage();
  const [loggingOut, setLoggingOut] = useState(false);
  const [previousPage, setPreviousPage] = useState('/intro'); // Default fallback

  // ✅ Track where user came from
  useEffect(() => {
    // Get the referrer from session storage (set when navigating to dashboard)
    const referrer = sessionStorage.getItem('dashboardReferrer');
    
    if (referrer) {
      setPreviousPage(referrer);
    } else {
      // If no referrer, check if we have analysis data (means user came from analyzer)
      const hasAnalysisData = localStorage.getItem('currentAnalysis');
      setPreviousPage(hasAnalysisData ? '/' : '/intro');
    }
  }, []);

  // ✅ Handle back navigation
  const handleBackClick = () => {
    // Clear the referrer
    sessionStorage.removeItem('dashboardReferrer');
    
    // Navigate back
    router.push(previousPage);
  };

  const handleLogoClick = () => {
    router.push('/intro');
  };

  const handleSettingsClick = () => {
    router.push('/settings');
  };

  const handleLogout = async () => {
    if (loggingOut) return;
    
    setLoggingOut(true);
    try {
      await logout();
      // Clear all session data
      sessionStorage.clear();
      router.push('/intro');
    } catch (error) {
      console.error('Logout error:', error);
      alert('Failed to logout. Please try again.');
      setLoggingOut(false);
    }
  };

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 bg-black/95 backdrop-blur-xl border-b border-white/10"
      style={{
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)'
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          
          {/* Left: Back Button + Logo + Title */}
          <div className="flex items-center gap-3 sm:gap-4">
            
            {/* ✅ NEW: Back Button */}
            <button
              onClick={handleBackClick}
              className="flex items-center gap-2 px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-lg transition-all duration-200 group"
              title={`Back to ${previousPage === '/intro' ? 'Home' : 'Analyzer'}`}
            >
              <svg 
                className="w-4 h-4 sm:w-5 sm:h-5 text-white/70 group-hover:text-white transition-colors" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M10 19l-7-7m0 0l7-7m-7 7h18" 
                />
              </svg>
              <span className="text-white/70 group-hover:text-white text-xs sm:text-sm font-medium hidden sm:block transition-colors">
                Back
              </span>
            </button>

            {/* Divider */}
            <div className="hidden sm:block h-8 w-px bg-white/20"></div>

            {/* Logo */}
            <div 
              className="flex items-center gap-3 cursor-pointer group" 
              onClick={handleLogoClick}
            >
              <div className="w-8 h-8 sm:w-10 sm:h-10 relative group-hover:scale-110 transition-transform duration-300">
                <img 
                  src="/logo.png" 
                  alt="Lexi Logo" 
                  className="w-full h-full object-contain" 
                />
              </div>
              <span 
                className="text-white text-xl sm:text-2xl font-black group-hover:text-white/80 transition-colors duration-300"
                style={{ 
                  fontFamily: 'Inter, system-ui, sans-serif', 
                  letterSpacing: '-0.02em' 
                }}
              >
                Lexi
              </span>
            </div>

            {/* Dashboard Title */}
            <div className="hidden md:block h-8 w-px bg-white/20"></div>
            <h1 className="text-white text-base sm:text-lg font-semibold hidden md:block">
              Dashboard
            </h1>
          </div>

          {/* Right: User Info + Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Username */}
            <span className="text-white/80 text-sm sm:text-base font-medium hidden md:block">
              {userName}
            </span>
            <span className="text-white/80 text-sm font-medium md:hidden">
              {userName?.split(' ')[0]}
            </span>

            {/* Settings Button */}
            <button
              onClick={handleSettingsClick}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-white/10 hover:bg-white/20 rounded-full transition-all duration-200"
            >
              <svg 
                className="w-4 h-4 sm:w-5 sm:h-5 text-white" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" 
                />
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" 
                />
              </svg>
              <span className="text-white text-xs sm:text-sm font-medium hidden sm:block">
                Settings
              </span>
            </button>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className="px-3 sm:px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 font-semibold rounded-full transition-all duration-200 disabled:opacity-50 text-xs sm:text-sm"
            >
              {loggingOut ? '...' : 'Logout'}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}