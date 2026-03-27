'use client';

import { useTranslation } from 'react-i18next';

export default function LanguageToggle() {
  const { i18n } = useTranslation();
  return (
    <button
      onClick={() => i18n.changeLanguage(i18n.language === 'zh' ? 'en' : 'zh')}
      className="toggle-pill"
    >
      {i18n.language === 'zh' ? 'EN' : '中文'}
    </button>
  );
}
