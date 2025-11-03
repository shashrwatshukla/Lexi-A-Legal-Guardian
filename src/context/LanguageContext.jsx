'use client';

import { createContext, useState, useEffect, useContext } from 'react';
import { auth } from '../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth'; // ✅ ADDED
import { getUserPreferences, updateUserPreferences } from '../lib/settingsService';

const LanguageContext = createContext();

// ✅ Cache for loaded translations
const TRANSLATIONS_CACHE = {};

// ✅ Supported languages (add more as you create translation files)
const SUPPORTED_LANGUAGES = ['en', 'es'];

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState('en');
  const [translations, setTranslations] = useState({});
  const [loading, setLoading] = useState(true);

  // ✅ Load translations with fallback to English
  const loadTranslations = async (lang) => {
    try {
      // Validate and sanitize language code
      const validLang = lang && typeof lang === 'string' ? lang.toLowerCase() : 'en';
      
      // Check if already cached
      if (TRANSLATIONS_CACHE[validLang]) {
        console.log(`✅ Loaded from cache: ${validLang}`);
        setTranslations(TRANSLATIONS_CACHE[validLang]);
        return TRANSLATIONS_CACHE[validLang];
      }

      console.log(`⏳ Loading translations: ${validLang}`);

      try {
        // Attempt to load translation files
        const [common, dashboard, settings] = await Promise.all([
          import(`../locales/${validLang}/common.json`).catch(() => null),
          import(`../locales/${validLang}/dashboard.json`).catch(() => null),
          import(`../locales/${validLang}/settings.json`).catch(() => null)
        ]);

        // Check if all files loaded successfully
        if (common && dashboard && settings) {
          const loadedTranslations = {
            common: common.default || {},
            dashboard: dashboard.default || {},
            settings: settings.default || {}
          };

          // Cache the translations
          TRANSLATIONS_CACHE[validLang] = loadedTranslations;
          setTranslations(loadedTranslations);

          console.log(`✅ Translations loaded: ${validLang}`);
          return loadedTranslations;
        } else {
          throw new Error(`Missing translation files for ${validLang}`);
        }
      } catch (fileError) {
        // Translation files don't exist, fallback to English
        console.warn(`⚠️ Translation files not found for "${validLang}"`);
        
        if (validLang !== 'en') {
          console.log('🔄 Falling back to English...');
          return await loadTranslations('en');
        } else {
          // English files are missing - critical error
          console.error('❌ English translation files are missing!');
          return {
            common: {},
            dashboard: {},
            settings: {}
          };
        }
      }
    } catch (error) {
      console.error('❌ Error loading translations:', error);
      return {
        common: {},
        dashboard: {},
        settings: {}
      };
    }
  };

  // ✅ MODIFIED: Initialize language on mount with auth listener
  useEffect(() => {
    let mounted = true;
    
    const initializeLanguage = async (user) => {
      if (!mounted) return;
      
      console.log('🌍 Initializing language system...');

      try {
        // ALWAYS load English first as base
        await loadTranslations('en');
        
        if (!mounted) return;

        if (user) {
          try {
            // Get user's saved language preference
            const prefs = await getUserPreferences(user.uid);
            const savedLang = prefs?.language;

            console.log('💾 User preference:', savedLang || 'none');

            if (!mounted) return;

            // Only switch if user has a valid saved preference
            if (savedLang && SUPPORTED_LANGUAGES.includes(savedLang)) {
              console.log(`🌍 Switching to user preference: ${savedLang}`);
              setLanguage(savedLang);
              await loadTranslations(savedLang);
            } else {
              // Set English as default in Firestore if not set
              console.log('✅ Using default English');
              setLanguage('en');
              await updateUserPreferences(user.uid, { language: 'en' });
              console.log('💾 Saved English as default preference');
            }
          } catch (prefsError) {
            console.error('❌ Error loading user preferences:', prefsError);
            setLanguage('en');
          }
        } else {
          console.log('👤 No user logged in, using English');
          setLanguage('en');
        }
      } catch (error) {
        console.error('❌ Error initializing language:', error);
        setLanguage('en');
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    // ✅ NEW: Listen to auth state changes
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      initializeLanguage(user);
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  // ✅ Change language function (UNCHANGED - already saves to Firebase)
  const changeLanguage = async (newLang) => {
    try {
      if (!newLang || typeof newLang !== 'string') {
        console.error('❌ Invalid language code:', newLang);
        return false;
      }

      const targetLang = newLang.toLowerCase();

      if (targetLang === language) {
        console.log('ℹ️ Already using this language');
        return true;
      }

      console.log(`🔄 Changing language to: ${targetLang}`);

      const newTranslations = await loadTranslations(targetLang);

      setLanguage(targetLang);
      setTranslations(newTranslations);

      // ✅ SAVES TO FIREBASE (UNCHANGED)
      const user = auth.currentUser;
      if (user) {
        updateUserPreferences(user.uid, { language: targetLang })
          .then(() => console.log('✅ Language preference saved to Firebase'))
          .catch(err => console.error('⚠️ Failed to save preference:', err));
      }

      console.log(`✅ Language changed to ${targetLang}`);
      return true;
    } catch (error) {
      console.error('❌ Error changing language:', error);
      return false;
    }
  };

  // ✅ Translation function (UNCHANGED)
  const t = (key, params = {}) => {
    if (!key || typeof key !== 'string') {
      console.warn('⚠️ Invalid translation key:', key);
      return '';
    }

    const keys = key.split('.');
    let value = translations;

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        if (process.env.NODE_ENV !== 'production') {
          console.warn(`⚠️ Translation missing: ${key}`);
        }
        return key;
      }
    }

    if (typeof value === 'string') {
      if (Object.keys(params).length > 0) {
        return value.replace(/\{(\w+)\}/g, (match, paramKey) => {
          return params[paramKey] !== undefined ? params[paramKey] : match;
        });
      }
      return value;
    }

    console.warn(`⚠️ Translation exists but is not a string: ${key}`);
    return key;
  };

  const contextValue = {
    language,
    changeLanguage,
    t,
    loading,
    supportedLanguages: SUPPORTED_LANGUAGES
  };

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
}