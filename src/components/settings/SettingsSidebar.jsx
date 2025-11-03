'use client';

import { useLanguage } from '../../context/LanguageContext';

export default function SettingsSidebar({ activeSection, onSectionChange }) {
  const { t } = useLanguage();

  const sections = [
    { 
      id: 'account', 
      icon: '👤', 
      label: t('settings.sections.account') || 'Account'
    },
    { 
      id: 'privacy', 
      icon: '🔒', 
      label: t('settings.sections.privacy') || 'Privacy & Security'
    },
    { 
      id: 'language', 
      icon: '🌍', 
      label: t('settings.sections.language') || 'Language'
    },
    { 
      id: 'storage', 
      icon: '💾', 
      label: t('settings.sections.storage') || 'Storage'
    },
    { 
      id: 'support', 
      icon: '❓', 
      label: t('settings.sections.support') || 'Help & Support'
    },
    { 
      id: 'about', 
      icon: '📄', 
      label: t('settings.sections.about') || 'About'
    }
  ];

  return (
    <div className="w-full lg:w-64 mb-8 lg:mb-0">
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-2 sticky top-24">
        {sections.map((section) => (
          <button
            key={section.id}
            onClick={() => onSectionChange(section.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
              activeSection === section.id
                ? 'bg-blue-500/30 text-white shadow-lg' // ✅ ACTIVE STATE
                : 'text-white/60 hover:bg-white/10 hover:text-white' // Default
            }`}
          >
            <span className="text-xl">{section.icon}</span>
            <span className="font-medium text-sm">{section.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}