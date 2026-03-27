'use client';

import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import CopyButton from './CopyButton';
import { deriveBip85, type Bip85App } from '@/lib/bip85';

interface Props {
  seed: string;
  isValid: boolean;
  privacyMode?: boolean;
}

const APPS: { id: Bip85App; label: string }[] = [
  { id: 'bip39', label: 'BIP39' },
  { id: 'wif', label: 'WIF' },
  { id: 'xprv', label: 'XPRV' },
  { id: 'hex', label: 'Hex' },
];

export default function Bip85Section({ seed, isValid, privacyMode }: Props) {
  const { i18n } = useTranslation();
  const isZh = i18n.language === 'zh';
  const [show, setShow] = useState(false);
  const [app, setApp] = useState<Bip85App>('bip39');
  const [mnemonicLength, setMnemonicLength] = useState<12 | 18 | 24>(12);
  const [index, setIndex] = useState(0);
  const [bytes, setBytes] = useState(64);

  const result = useMemo(() => {
    if (!isValid || !seed || !show) return '';
    try {
      const seedBytes = new Uint8Array(seed.match(/.{2}/g)!.map(b => parseInt(b, 16)));
      return deriveBip85(seedBytes, { app, language: 0, mnemonicLength, index, bytes });
    } catch { return ''; }
  }, [seed, isValid, show, app, mnemonicLength, index, bytes]);

  return (
    <div className="section-card">
      <div className="flex items-center justify-between">
        <span className="section-header mb-0">BIP85 {isZh ? '子密钥派生' : 'Child Key Derivation'}</span>
        <label className="flex items-center gap-1 cursor-pointer">
          <input type="checkbox" checked={show} onChange={(e) => setShow(e.target.checked)} className="accent-blue-500 w-3 h-3" />
          <span className="text-[11px] text-[--text-secondary]">{isZh ? '启用' : 'Enable'}</span>
        </label>
      </div>

      {show && (
        <div className="mt-2 space-y-2">
          <div className="flex items-center gap-1">
            {APPS.map(a => (
              <button key={a.id} onClick={() => setApp(a.id)} className={`tab-btn ${app === a.id ? 'active' : ''}`}>
                {a.label}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap gap-2 items-end">
            {app === 'bip39' && (
              <div>
                <span className="field-label">{isZh ? '词数' : 'Words'}</span>
                <select value={mnemonicLength} onChange={(e) => setMnemonicLength(Number(e.target.value) as 12 | 18 | 24)} className="select-field block mt-0.5">
                  <option value={12}>12</option>
                  <option value={18}>18</option>
                  <option value={24}>24</option>
                </select>
              </div>
            )}
            {app === 'hex' && (
              <div>
                <span className="field-label">Bytes</span>
                <input type="number" min={16} max={64} value={bytes} onChange={(e) => setBytes(Number(e.target.value))} className="input-field w-16 block mt-0.5 text-xs" />
              </div>
            )}
            <div>
              <span className="field-label">Index</span>
              <input type="number" min={0} value={index} onChange={(e) => setIndex(Math.max(0, Number(e.target.value)))} className="input-field w-16 block mt-0.5 text-xs" />
            </div>
          </div>

          {result && (
            <div className="value-box">
              <p className={`mono text-[11px] text-emerald-400 break-all pr-6 select-all ${privacyMode ? 'blur-sm hover:blur-none' : ''}`}>
                {privacyMode ? '•'.repeat(30) : result}
              </p>
              {!privacyMode && <CopyButton text={result} className="absolute top-1 right-1" />}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
