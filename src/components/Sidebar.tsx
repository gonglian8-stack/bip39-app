'use client';

import { useTranslation } from 'react-i18next';

interface Props {
  activeSection: string;
  onNavigate: (section: string) => void;
}

const NAV_ITEMS = [
  { id: 'generator', icon: '🔑', en: 'Generator', zh: '生成器' },
  { id: 'ai-scan', icon: '🤖', en: 'AI Security', zh: 'AI 安全' },
  { id: 'audit', icon: '🛡️', en: 'Security Audit', zh: '安全审计' },
  { id: 'docs', icon: '📄', en: 'Documentation', zh: '文档' },
  { id: 'licensing', icon: '⚖️', en: 'Licensing', zh: '许可证' },
];

export default function Sidebar({ activeSection, onNavigate }: Props) {
  const { i18n } = useTranslation();
  const isZh = i18n.language === 'zh';

  return (
    <aside className="hidden lg:flex flex-col w-14 bg-[#060a14] border-r border-[#1a2235] py-4 items-center gap-1 shrink-0">
      {NAV_ITEMS.map(item => (
        <button
          key={item.id}
          onClick={() => onNavigate(item.id)}
          className={`group relative w-10 h-10 rounded-lg flex items-center justify-center text-lg transition-all
            ${activeSection === item.id
              ? 'bg-emerald-500/15 text-emerald-400'
              : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
            }`}
          title={isZh ? item.zh : item.en}
        >
          {item.icon}
          {/* Tooltip */}
          <span className="absolute left-full ml-2 px-2 py-1 bg-[#1a2235] text-xs text-gray-200 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 shadow-lg">
            {isZh ? item.zh : item.en}
          </span>
        </button>
      ))}
    </aside>
  );
}
