'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../lib/firebase';
import { getUserDocument } from '../../lib/userService';
import { getUserPreferences } from '../../lib/settingsService';
import { useLanguage } from '../../context/LanguageContext';
import SettingsSidebar from '../../components/settings/SettingsSidebar';
import AccountSettings from '../../components/settings/AccountSettings';
import PrivacySettings from '../../components/settings/PrivacySettings';
import LanguageSettings from '../../components/settings/LanguageSettings';
import StorageSettings from '../../components/settings/StorageSettings';
import SupportSettings from '../../components/settings/SupportSettings';
import AboutSettings from '../../components/settings/AboutSettings';

// ===== LOADING SKELETON =====
function SettingsSkeleton() {
  return (
    <div className="min-h-screen bg-black">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/95 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center gap-4">
            <div className="w-20 h-6 bg-white/10 rounded animate-pulse"></div>
            <div className="w-32 h-8 bg-white/10 rounded animate-pulse"></div>
          </div>
        </div>
      </nav>

      <div className="flex max-w-7xl mx-auto px-4 sm:px-6 pt-24 pb-12 gap-8">
        <div className="w-64 h-96 bg-white/5 backdrop-blur-xl rounded-2xl animate-pulse hidden lg:block"></div>
        <div className="flex-1 space-y-6">
          <div className="h-12 bg-white/5 backdrop-blur-xl rounded-2xl animate-pulse"></div>
          <div className="h-64 bg-white/5 backdrop-blur-xl rounded-2xl animate-pulse"></div>
          <div className="h-48 bg-white/5 backdrop-blur-xl rounded-2xl animate-pulse"></div>
        </div>
      </div>
    </div>
  );
}

// ===== ERROR STATE =====
function SettingsError({ error, onRetry }) {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white/5 backdrop-blur-xl rounded-2xl p-8 text-center">
        <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-white mb-2">Failed to Load Settings</h3>
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

// ===== MAIN SETTINGS PAGE (OPTIMIZED) =====
export default function SettingsPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [authChecked, setAuthChecked] = useState(false);
  const [activeSection, setActiveSection] = useState('account');
  const [userData, setUserData] = useState(null);
  const [preferences, setPreferences] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ✅ OPTIMIZATION: Memoized load function to prevent re-creation
  const loadUserData = useCallback(async (user) => {
    try {
      console.log('📊 Loading user data...');
      
      // ✅ OPTIMIZATION: Parallel fetch (already good!)
      const [userDoc, prefs] = await Promise.all([
        getUserDocument(user.uid),
        getUserPreferences(user.uid)
      ]);
      
      console.log('📄 User document:', userDoc);
      console.log('⚙️ User preferences:', prefs);
      
      setUserData({
        ...userDoc,
        email: user.email
      });
      setPreferences(prefs);
      
      return true;
    } catch (error) {
      console.error('❌ Error loading settings:', error);
      setError(error.message || 'Failed to load settings data');
      return false;
    }
  }, []);

  // ✅ MAIN AUTH EFFECT
  useEffect(() => {
    let mounted = true;

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!mounted) return;

      if (user && user.emailVerified) {
        const success = await loadUserData(user);
        
        if (!mounted) return;
        
        // ✅ FIX: Handle failure case
        if (success) {
          setAuthChecked(true);
          setLoading(false);
        } else {
          // Error state already set in loadUserData
          setLoading(false);
        }
      } else {
        console.log('❌ No verified user, redirecting to /auth');
        router.replace('/auth');
      }
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, [router, loadUserData]);

  // ✅ OPTIMIZATION: Memoized update function
  const handleUpdate = useCallback(async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;
      
      console.log('🔄 Refreshing settings data...');
      await loadUserData(user);
      console.log('✅ Settings data refreshed');
    } catch (error) {
      console.error('❌ Error updating data:', error);
    }
  }, [loadUserData]);

  // ✅ OPTIMIZATION: Retry function
  const handleRetry = useCallback(() => {
    setError(null);
    setLoading(true);
    const user = auth.currentUser;
    if (user) {
      loadUserData(user).then((success) => {
        if (success) {
          setAuthChecked(true);
          setLoading(false);
        }
      });
    }
  }, [loadUserData]);

  // ✅ OPTIMIZATION: Memoized section rendering (prevents re-renders)
  const activeComponent = useMemo(() => {
    console.log('🎨 Rendering section:', activeSection);
    
    switch (activeSection) {
      case 'account':
        return <AccountSettings userData={userData} onUpdate={handleUpdate} />;
      case 'privacy':
        return <PrivacySettings userData={userData} onUpdate={handleUpdate} />;
      case 'language':
        return <LanguageSettings preferences={preferences} onUpdate={handleUpdate} />;
      case 'storage':
        return <StorageSettings />;
      case 'support':
        return <SupportSettings />;
      case 'about':
        return <AboutSettings />;
      default:
        return <AccountSettings userData={userData} onUpdate={handleUpdate} />;
    }
  }, [activeSection, userData, preferences, handleUpdate]);

  // ✅ LOADING STATE
  if (!authChecked || loading) {
    return <SettingsSkeleton />;
  }

  // ✅ ERROR STATE
  if (error) {
    return <SettingsError error={error} onRetry={handleRetry} />;
  }

  return (
    <div className="min-h-screen bg-black">
      
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/95 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/dashboard')}
              className="flex items-center gap-2 text-white/70 hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="text-sm font-medium">
                {t('settings.backToDashboard')}
              </span>
            </button>
            <h1 className="text-xl sm:text-2xl font-bold text-white">
              {t('settings.title')}
            </h1>
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="flex max-w-7xl mx-auto px-4 sm:px-6 pt-24 pb-12 gap-8">
        {/* ✅ OPTIMIZATION: Sidebar doesn't re-render when section changes */}
        <SettingsSidebar 
          activeSection={activeSection} 
          onSectionChange={setActiveSection} 
        />
        
        {/* ✅ OPTIMIZATION: Only active section renders */}
        <div className="flex-1">
          {activeComponent}
        </div>
      </div>
    </div>
  );
}