'use client';

import { useTranslation } from 'react-i18next';

interface Props {
  activeSection: string;
  onNavigate: (section: string) => void;
}

const NAV_ITEMS = [
  { id: 'generator', scrollTo: 'mnemonic', icon: '🔑', en: 'Generator', zh: '生成器' },
  { id: 'ai-scan', scrollTo: 'ai-security', icon: '🤖', en: 'AI Security', zh: 'AI 安全' },
  { id: 'audit', scrollTo: 'keys', icon: '🛡️', en: 'Keys & Audit', zh: '密钥审计' },
  { id: 'docs', scrollTo: 'addresses', icon: '📄', en: 'Addresses', zh: '地址列表' },
  { id: 'settings', scrollTo: 'top', icon: '⚙️', en: 'Back to Top', zh: '返回顶部' },
];

export default function Sidebar({ activeSection, onNavigate }: Props) {
  const { i18n } = useTranslation();
  const isZh = i18n.language === 'zh';

  const handleClick = (item: typeof NAV_ITEMS[0]) => {
    onNavigate(item.id);
    const container = document.getElementById('main-scroll');
    if (!container) return;
    if (item.scrollTo === 'top') {
      container.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const el = document.getElementById(item.scrollTo);
    if (el) {
      const top = el.offsetTop - container.offsetTop;
      container.scrollTo({ top, behavior: 'smooth' });
    }
  };

  return (
    <aside className="hidden lg:flex flex-col w-14 bg-[#060a14] border-r border-[#1a2235] py-4 items-center gap-1 shrink-0">
      {NAV_ITEMS.map(item => (
        <button
          key={item.id}
          onClick={() => handleClick(item)}
          className={`group relative w-10 h-10 rounded-lg flex items-center justify-center text-lg transition-all
            ${activeSection === item.id
              ? 'bg-emerald-500/15 text-emerald-400'
              : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
            }`}
          title={isZh ? item.zh : item.en}
        >
          {item.icon}
          <span className="absolute left-full ml-2 px-2 py-1 bg-[#1a2235] text-xs text-gray-200 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 shadow-lg">
            {isZh ? item.zh : item.en}
          </span>
        </button>
      ))}
    </aside>
  );
}
