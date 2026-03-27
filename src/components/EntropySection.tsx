'use client';

import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import CopyButton from './CopyButton';
import {
  type EntropyType,
  ENTROPY_TYPES,
  analyzeEntropy,
  toValidEntropyHex,
} from '@/lib/entropy';

interface Props {
  entropy: string;
  entropyBinary: string;
  setEntropyHex: (hex: string) => void;
  isValid: boolean;
  wordCount: number;
}

const STRENGTH_MAP: Record<number, number> = { 12: 128, 15: 160, 18: 192, 21: 224, 24: 256 };

export default function EntropySection({
  entropy, entropyBinary, setEntropyHex, isValid: _isValid, wordCount,
}: Props) {
  void _isValid;
  const { i18n } = useTranslation();
  const isZh = i18n.language === 'zh';

  const [entropyType, setEntropyType] = useState<EntropyType>('hex');
  const [entropyInput, setEntropyInput] = useState('');
  const [useCustom, setUseCustom] = useState(false);
  const [showBinary, setShowBinary] = useState(false);

  const targetBits = STRENGTH_MAP[wordCount] || 128;

  const details = useMemo(() => {
    if (!useCustom || !entropyInput) return null;
    return analyzeEntropy(entropyInput, entropyType);
  }, [entropyInput, entropyType, useCustom]);

  const handleEntropyInput = (value: string) => {
    setEntropyInput(value);
    if (!value.trim()) return;
    const hex = toValidEntropyHex(value, entropyType, targetBits);
    if (hex) setEntropyHex(hex);
  };

  return (
    <div className="section-card">
      <div className="flex items-center justify-between">
        <span className="section-header mb-0">{isZh ? '熵' : 'Entropy'}</span>
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-1 cursor-pointer">
            <input type="checkbox" checked={useCustom} onChange={(e) => setUseCustom(e.target.checked)} className="accent-blue-500 w-3 h-3" />
            <span className="text-[11px] text-[--text-secondary]">{isZh ? '自定义' : 'Custom'}</span>
          </label>
          <label className="flex items-center gap-1 cursor-pointer">
            <input type="checkbox" checked={showBinary} onChange={(e) => setShowBinary(e.target.checked)} className="accent-blue-500 w-3 h-3" />
            <span className="text-[11px] text-[--text-secondary]">{isZh ? '二进制' : 'Binary'}</span>
          </label>
        </div>
      </div>

      {/* Custom entropy */}
      {useCustom && (
        <div className="mt-2 space-y-2">
          <div className="flex flex-wrap gap-1">
            {ENTROPY_TYPES.map(et => (
              <button
                key={et.id}
                onClick={() => { setEntropyType(et.id); setEntropyInput(''); }}
                className={`toggle-pill ${entropyType === et.id ? 'active' : ''}`}
              >
                {isZh ? et.labelZh : et.label}
              </button>
            ))}
          </div>
          <textarea
            value={entropyInput}
            onChange={(e) => handleEntropyInput(e.target.value)}
            placeholder={ENTROPY_TYPES.find(e => e.id === entropyType)?.placeholder}
            className="w-full input-field mono text-xs resize-none p-2 text-amber-400"
            rows={2}
            spellCheck={false}
          />
          {details && (
            <div className="flex flex-wrap gap-3 text-[11px] text-[--text-secondary]">
              <span>Events: <span className="text-[--text-primary]">{details.eventCount}</span></span>
              <span>Bits/event: <span className="text-[--text-primary]">{details.bitsPerEvent.toFixed(2)}</span></span>
              <span>Total: <span className="text-[--text-primary]">{details.totalBits} bits</span></span>
              <span>Crack: <span className="text-[--text-primary]">{details.strength.crackTime}</span></span>
            </div>
          )}
        </div>
      )}

      {/* Hex entropy */}
      {entropy && (
        <div className="mt-2">
          <div className="flex items-center justify-between mb-1">
            <span className="field-label">Hex ({entropy.length * 4} bits)</span>
          </div>
          <div className="value-box">
            <input
              type="text"
              value={entropy}
              onChange={(e) => setEntropyHex(e.target.value.replace(/[^0-9a-fA-F]/g, ''))}
              className="w-full bg-transparent mono text-xs text-emerald-400 outline-none pr-6"
              spellCheck={false}
            />
            <CopyButton text={entropy} className="absolute top-1 right-1" />
          </div>
        </div>
      )}

      {/* Binary */}
      {showBinary && entropyBinary && (
        <div className="mt-2">
          <span className="field-label">{isZh ? '二进制' : 'Binary'}</span>
          <div className="value-box mono text-[10px] text-cyan-400 break-all leading-relaxed select-all mt-1">
            {entropyBinary.match(/.{1,11}/g)?.map((chunk, i) => (
              <span key={i} className={i % 2 === 0 ? 'text-cyan-400' : 'text-cyan-300/70'}>{chunk} </span>
            ))}
          </div>
        </div>
      )}

      {/* Heatmap */}
      {entropy && (
        <div className="mt-2 flex flex-wrap gap-px">
          {entropy.split('').map((c, i) => {
            const val = parseInt(c, 16);
            const opacity = 0.15 + (val / 15) * 0.85;
            return (
              <div key={i} className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: `rgba(59, 130, 246, ${opacity})` }} title={`0x${c}`} />
            );
          })}
        </div>
      )}
    </div>
  );
}
