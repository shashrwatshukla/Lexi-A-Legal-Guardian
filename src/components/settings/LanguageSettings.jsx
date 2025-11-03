'use client';

import { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';

export default function LanguageSettings({ preferences, onUpdate }) {
  const { language, changeLanguage, t } = useLanguage();
  const [changing, setChanging] = useState(false);

  // ✅ Only show languages that have translation files
  const languages = [
    { 
      code: 'en', 
      name: 'English', 
      nativeName: 'English',
      flag: '🇺🇸',
      available: true // ✅ Has translation files
    },
    { 
      code: 'es', 
      name: 'Spanish', 
      nativeName: 'Español',
      flag: '🇪🇸',
      available: true // ✅ Has translation files
    },
    // ⚠️ Other languages (will fallback to English)
    { 
      code: 'fr', 
      name: 'French', 
      nativeName: 'Français',
      flag: '🇫🇷',
      available: false // ❌ No translation files yet
    },
    { 
      code: 'de', 
      name: 'German', 
      nativeName: 'Deutsch',
      flag: '🇩🇪',
      available: false
    },
    { 
      code: 'it', 
      name: 'Italian', 
      nativeName: 'Italiano',
      flag: '🇮🇹',
      available: false
    },
    { 
      code: 'pt', 
      name: 'Portuguese', 
      nativeName: 'Português',
      flag: '🇵🇹',
      available: false
    },
    { 
      code: 'zh', 
      name: 'Chinese (Simplified)', 
      nativeName: '简体中文',
      flag: '🇨🇳',
      available: false
    },
    { 
      code: 'ja', 
      name: 'Japanese', 
      nativeName: '日本語',
      flag: '🇯🇵',
      available: false
    },
    { 
      code: 'ko', 
      name: 'Korean', 
      nativeName: '한국어',
      flag: '🇰🇷',
      available: false
    },
    { 
      code: 'hi', 
      name: 'Hindi', 
      nativeName: 'हिन्दी',
      flag: '🇮🇳',
      available: false
    },
    { 
      code: 'ar', 
      name: 'Arabic', 
      nativeName: 'العربية',
      flag: '🇸🇦',
      available: false
    }
  ];

  const handleLanguageChange = async (langCode) => {
    if (langCode === language) {
      console.log('ℹ️ Already using this language');
      return;
    }
    
    setChanging(true);
    console.log(`🔄 Changing language to: ${langCode}`);
    
    try {
      const success = await changeLanguage(langCode);
      
      if (success) {
        console.log('✅ Language changed successfully');
        
        // Show success message
        const selectedLang = languages.find(l => l.code === langCode);
        if (!selectedLang?.available) {
          alert(`Language changed! Note: ${selectedLang?.name} translations are not fully available yet. Using English as fallback.`);
        }
        
        // Trigger parent update
        if (onUpdate) {
          onUpdate();
        }
      } else {
        console.error('❌ Language change failed');
        alert('Failed to change language. Please try again.');
      }
    } catch (error) {
      console.error('❌ Language change error:', error);
      alert('An error occurred while changing language.');
    } finally {
      setChanging(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">
          {t('settings.language.title')}
        </h2>
        <p className="text-white/60 text-sm">
          {t('settings.language.description')}
        </p>
      </div>

      {/* Current Language */}
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-semibold">{t('settings.language.currentLanguage')}</h3>
          <div className="flex items-center gap-2">
            <span className="text-2xl">
              {languages.find(l => l.code === language)?.flag || '🌍'}
            </span>
            <span className="text-white font-semibold">
              {languages.find(l => l.code === language)?.nativeName || 'English'}
            </span>
          </div>
        </div>
      </div>

      {/* Language Options */}
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6">
        <h3 className="text-white font-semibold mb-4">{t('settings.language.availableLanguages')}</h3>
        
        <div className="space-y-3">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleLanguageChange(lang.code)}
              disabled={changing || language === lang.code}
              className={`w-full flex items-center justify-between p-4 rounded-xl transition-all duration-200 ${
                language === lang.code
                  ? 'bg-blue-500/30 shadow-lg border border-blue-500/50'
                  : 'bg-white/5 hover:bg-white/10 border border-white/10'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <div className="flex items-center gap-3">
                <span className="text-3xl">{lang.flag}</span>
                <div className="text-left">
                  <div className="flex items-center gap-2">
                    <p className="text-white font-semibold">{lang.nativeName}</p>
                    {!lang.available && (
                      <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded-full border border-yellow-500/30">
                        Beta
                      </span>
                    )}
                  </div>
                  <p className="text-white/60 text-sm">{lang.name}</p>
                </div>
              </div>
              
              {language === lang.code && (
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-blue-400 text-sm font-semibold">{t('settings.language.selected')}</span>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Information */}
      <div className="bg-blue-500/10 backdrop-blur-xl rounded-2xl p-6 border border-blue-500/20">
        <div className="flex items-start gap-3">
          <div className="text-2xl">ℹ️</div>
          <div>
            <h3 className="text-blue-400 font-semibold mb-1">About Translations</h3>
            <p className="text-white/60 text-sm leading-relaxed">
              Currently, <strong className="text-white">English</strong> and <strong className="text-white">Spanish</strong> have full translations. 
              Other languages are in beta and will use English as a fallback until translations are complete.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}