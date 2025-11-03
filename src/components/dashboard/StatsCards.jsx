'use client';

import { useLanguage } from '../../context/LanguageContext';

export default function StatsCards({ stats }) {
  const { t } = useLanguage();

  const cards = [
    {
      icon: '📄',
      label: t('dashboard.stats.uploaded') || 'Documents Uploaded',
      value: stats?.totalUploaded || 0,
      bgColor: 'bg-blue-500/20', // ✅ Solid color, no gradient
      textColor: 'text-blue-400'
    },
    {
      icon: '✅',
      label: t('dashboard.stats.analyzed') || 'Documents Analyzed',
      value: stats?.totalAnalyzed || 0,
      bgColor: 'bg-green-500/20', // ✅ Solid color, no gradient
      textColor: 'text-green-400'
    },
    {
      icon: '✍️',
      label: t('dashboard.stats.drafted') || 'Documents Drafted',
      value: stats?.totalDrafted || 0,
      bgColor: 'bg-purple-500/20', // ✅ Solid color, no gradient
      textColor: 'text-purple-400'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-8">
      {cards.map((card, index) => (
        <div
          key={index}
          className={`${card.bgColor} backdrop-blur-xl rounded-2xl p-6 hover:scale-105 transition-transform duration-300`}
        >
          <div className="flex items-center gap-4">
            {/* Icon */}
            <div className="text-4xl">{card.icon}</div>
            
            {/* Content */}
            <div className="flex-1">
              <p className="text-white/60 text-sm font-medium mb-1">
                {card.label}
              </p>
              <p className={`text-3xl font-black ${card.textColor}`}>
                {card.value}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}