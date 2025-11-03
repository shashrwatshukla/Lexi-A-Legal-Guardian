"use client";

import { useRouter } from 'next/navigation';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { HiHome } from 'react-icons/hi';
import { FaUser, FaPencilAlt, FaShareAlt } from 'react-icons/fa';
import { IoLogOut, IoHelpCircle } from 'react-icons/io5';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../lib/firebase';
import { useAnalysis } from '../../context/AnalysisContext';
import { createShareableSession } from '../../lib/shareSession';
import NavItem from './NavItem';
import './SideNav.css';

export default function SideNav() {
  const router = useRouter();
  const { getCurrentAnalysisData } = useAnalysis();
  const [shareLoading, setShareLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  // ✅ Memoize callbacks to prevent re-creation
  const handleProfile = useCallback(() => {
    if (!currentUser) {
      alert('🔐 Login Required\n\nPlease login to access your dashboard.');
      router.push('/auth');
      return;
    }

    if (!currentUser.emailVerified) {
      alert('📧 Email Verification Required\n\nPlease verify your email to access the dashboard.\n\nCheck your inbox for the verification link.');
      return;
    }

    router.push('/dashboard');
  }, [currentUser, router]);

  const handleShare = useCallback(async () => {
    try {
      setShareLoading(true);

      const analysisData = getCurrentAnalysisData();
      
      if (!analysisData) {
        alert('⚠️ No Analysis to Share\n\nPlease analyze a document first before sharing.');
        return;
      }

      const shareUrl = await createShareableSession(analysisData);
      await navigator.clipboard.writeText(shareUrl);
      
      alert(`✅ Shareable Link Created!\n\nLink copied to clipboard:\n\n${shareUrl}`);

    } catch (error) {
      console.error('🔴 Share failed:', error);
      alert(`❌ Failed to Create Shareable Link\n\nError: ${error.message}`);
    } finally {
      setShareLoading(false);
    }
  }, [getCurrentAnalysisData]);

  const handleLogout = useCallback(async () => {
    const confirmed = confirm('🚪 Logout\n\nAre you sure you want to logout?');
    if (confirmed) {
      try {
        await auth.signOut();
        localStorage.removeItem('isAuthenticated');
        localStorage.removeItem('username');
        sessionStorage.removeItem('dashboardVisited');
        router.push('/auth');
      } catch (error) {
        console.error('❌ Logout error:', error);
        alert('❌ Failed to logout. Please try again.');
      }
    }
  }, [router]);

  // ✅ Memoize navItems array
  const navItems = useMemo(() => [
    {
      icon: HiHome,
      label: 'Home',
      onClick: () => router.push('/intro'),
      loading: false
    },
    {
      icon: FaUser,
      label: 'Dashboard',
      onClick: handleProfile,
      loading: false
    },
    {
      icon: FaPencilAlt,
      label: 'Drafter',
      onClick: () => router.push('/drafter'),
      loading: false
    },
    {
      icon: FaShareAlt,
      label: 'Share',
      onClick: handleShare,
      loading: shareLoading
    },
    {
      icon: IoLogOut,
      label: 'Logout',
      onClick: handleLogout,
      loading: false
    },
    {
      icon: IoHelpCircle,
      label: 'FAQ',
      onClick: () => router.push('/faq'),
      loading: false
    }
  ], [shareLoading, handleProfile, handleShare, handleLogout, router]);

  return (
    <div className="sidenav-container">
      <div className="sidenav-items">
        {navItems.map((item, index) => (
          <NavItem
            key={item.label} // ✅ Stable key
            icon={item.icon}
            label={item.label}
            onClick={item.onClick}
            isLoading={item.loading}
          />
        ))}
      </div>
    </div>
  );
}