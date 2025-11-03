'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../lib/firebase';
import { getUserDocument } from '../../lib/userService';
import { getUserStats } from '../../lib/dashboardService';
import DashboardNav from '../../components/dashboard/DashboardNav';
import WelcomeAnimation from '../../components/dashboard/WelcomeAnimation';
import StatsCards from '../../components/dashboard/StatsCards';
import ProfileSection from '../../components/dashboard/ProfileSection';
import RecentDocuments from '../../components/dashboard/RecentDocuments';
import LegalTip from '../../components/dashboard/LegalTip';

// ===== OPTIMIZED LOADING SKELETON =====
function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-black">
      {/* Nav Skeleton */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-black/95 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/10 rounded-full animate-pulse"></div>
              <div className="w-16 h-6 bg-white/10 rounded animate-pulse"></div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-24 h-8 bg-white/10 rounded-full animate-pulse"></div>
              <div className="w-20 h-8 bg-white/10 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Skeleton */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-28 pb-12">
        {/* Stats Cards Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-32 bg-white/5 backdrop-blur-xl rounded-2xl animate-pulse"
            ></div>
          ))}
        </div>

        {/* Profile Skeleton */}
        <div className="h-64 bg-white/5 backdrop-blur-xl rounded-2xl mb-8 animate-pulse"></div>

        {/* Documents Skeleton */}
        <div className="h-96 bg-white/5 backdrop-blur-xl rounded-2xl mb-8 animate-pulse"></div>

        {/* Tip Skeleton */}
        <div className="h-40 bg-white/5 backdrop-blur-xl rounded-2xl animate-pulse"></div>
      </main>
    </div>
  );
}

// ===== ERROR STATE COMPONENT =====
function DashboardError({ error, onRetry }) {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white/5 backdrop-blur-xl rounded-2xl p-8 text-center">
        <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-white mb-2">Failed to Load Dashboard</h3>
        <p className="text-white/60 text-sm mb-6">{error}</p>
        <button
          onClick={onRetry}
          className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg font-semibold transition-colors"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}

// ===== MAIN DASHBOARD PAGE (OPTIMIZED) =====
export default function DashboardPage() {
  const router = useRouter();
  const [authChecked, setAuthChecked] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [userData, setUserData] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ✅ OPTIMIZATION: Memoize display name to prevent re-renders
  const displayName = useMemo(() => {
    return userData?.displayName || userData?.name || 'User';
  }, [userData]);

  // ✅ OPTIMIZATION: Memoized update function
  const handleDataUpdate = useCallback(async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      console.log('🔄 Refreshing dashboard data...');
      
      // ✅ OPTIMIZATION: Parallel fetch
      const [userDoc, userStats] = await Promise.all([
        getUserDocument(user.uid),
        getUserStats(user.uid)
      ]);
      
      setUserData({ 
        ...userDoc, 
        email: user.email,
        displayName: user.displayName || userDoc?.displayName || 'User'
      });
      setStats(userStats);
      
      console.log('✅ Dashboard data refreshed');
    } catch (error) {
      console.error('❌ Error updating data:', error);
      // Don't show error modal, just log (user can retry manually)
    }
  }, []);

  // ✅ MAIN AUTH + DATA LOADING EFFECT
  useEffect(() => {
    let mounted = true;

    // ✅ OPTIMIZATION: Check welcome animation BEFORE data fetch
    const hasVisited = sessionStorage.getItem('dashboardVisited');
    const shouldShowWelcome = !hasVisited;

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!mounted) return;

      if (user && user.emailVerified) {
        try {
          console.log('🔐 User authenticated:', user.email);
          
          // ✅ OPTIMIZATION: Single parallel fetch (not duplicate)
          const [userDoc, userStats] = await Promise.all([
            getUserDocument(user.uid),
            getUserStats(user.uid)
          ]);
          
          if (!mounted) return; // Check again after async
          
          setUserData({
            ...userDoc,
            email: user.email,
            displayName: user.displayName || userDoc?.displayName || 'User'
          });
          setStats(userStats);

          // ✅ OPTIMIZATION: Set welcome state AFTER data is ready
          if (shouldShowWelcome) {
            setShowWelcome(true);
            sessionStorage.setItem('dashboardVisited', 'true');
          }

          setAuthChecked(true);
          setLoading(false);
          
          console.log('✅ Dashboard loaded successfully');
        } catch (error) {
          console.error('❌ Error loading dashboard data:', error);
          
          if (!mounted) return;
          
          // ✅ NEW: Show error state instead of blank page
          setError(error.message || 'Failed to load dashboard data');
          setLoading(false);
        }
      } else {
        console.log('❌ No authenticated user, redirecting to /auth');
        router.replace('/auth');
      }
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, [router]);

  // ✅ OPTIMIZATION: Retry function for error state
  const handleRetry = useCallback(() => {
    setError(null);
    setLoading(true);
    window.location.reload(); // Force full reload on retry
  }, []);

  // ✅ LOADING STATE
  if (!authChecked || loading) {
    return <DashboardSkeleton />;
  }

  // ✅ ERROR STATE
  if (error) {
    return <DashboardError error={error} onRetry={handleRetry} />;
  }

  return (
    <>
      {/* ✅ OPTIMIZATION: Welcome animation doesn't block page */}
      {showWelcome && (
        <WelcomeAnimation
          userName={displayName}
          onComplete={() => setShowWelcome(false)}
        />
      )}

      <div className="min-h-screen bg-black">
        <DashboardNav userName={displayName} />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-24 sm:pt-28 pb-12">
          {/* ✅ All components memoized to prevent unnecessary re-renders */}
          <StatsCards stats={stats} />
          <ProfileSection userData={userData} onUpdate={handleDataUpdate} />
          <RecentDocuments onUpdate={handleDataUpdate} />
          <LegalTip />
        </main>
      </div>
    </>
  );
}