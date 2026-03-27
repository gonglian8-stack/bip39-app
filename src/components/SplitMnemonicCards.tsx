'use client';

import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

interface Props {
  mnemonic: string;
  isValid: boolean;
}

function splitMnemonic(mnemonic: string): string[][] {
  const words = mnemonic.trim().split(/\s+/);
  const third = Math.ceil(words.length / 3);
  const p1 = words.slice(0, third);
  const p2 = words.slice(third, third * 2);
  const p3 = words.slice(third * 2);
  return [[...p1, ...p2], [...p1, ...p3], [...p2, ...p3]];
}

export default function SplitMnemonicCards({ mnemonic, isValid }: Props) {
  const { i18n } = useTranslation();
  const isZh = i18n.language === 'zh';
  const [show, setShow] = useState(false);

  const cards = useMemo(() => {
    if (!isValid || !mnemonic.trim()) return [];
    return splitMnemonic(mnemonic);
  }, [mnemonic, isValid]);

  return (
    <div className="section-card">
      <div className="flex items-center justify-between">
        <span className="section-header mb-0">{isZh ? '分割备份 (2/3)' : 'Split Backup (2-of-3)'}</span>
        <label className="flex items-center gap-1 cursor-pointer">
          <input type="checkbox" checked={show} onChange={(e) => setShow(e.target.checked)} className="accent-blue-500 w-3 h-3" />
          <span className="text-[11px] text-[--text-secondary]">{isZh ? '显示' : 'Show'}</span>
        </label>
      </div>

      {show && cards.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-2">
          {cards.map((card, idx) => (
            <div key={idx} className="value-box">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-medium text-[--text-secondary]">Card {idx + 1}</span>
                <span className="text-[10px] text-[--text-muted]">{card.length} words</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {card.map((word, i) => (
                  <span key={i} className="tag">
                    <span className="tag-num">{i + 1}</span>
                    <span className="tag-word">{word}</span>
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
