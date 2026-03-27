'use client';

import { useTranslation } from 'react-i18next';
import CopyButton from './CopyButton';
import type { InputMode } from '@/hooks/useMnemonic';

interface Props {
  seed: string;
  rootKey: string;
  privacyMode?: boolean;
  onQR?: (data: { text: string; label: string }) => void;
  inputMode: InputMode;
  setInputMode: (m: InputMode) => void;
  manualSeed: string;
  setManualSeed: (s: string) => void;
  manualRootKey: string;
  setManualRootKey: (k: string) => void;
}

export default function SeedDisplay({
  seed, rootKey, privacyMode, onQR,
  inputMode, setInputMode,
  manualSeed, setManualSeed,
  manualRootKey, setManualRootKey,
}: Props) {
  const { i18n } = useTranslation();
  const isZh = i18n.language === 'zh';

  return (
    <div className="section-card">
      <div className="flex items-center justify-between mb-2">
        <span className="section-header mb-0">{isZh ? '种子 & 根密钥' : 'Seed & Root Key'}</span>
        <div className="flex gap-1">
          {(['mnemonic', 'seed', 'rootkey'] as InputMode[]).map(mode => (
            <button
              key={mode}
              onClick={() => setInputMode(mode)}
              className={`toggle-pill ${inputMode === mode ? 'active' : ''}`}
            >
              {mode === 'mnemonic' ? (isZh ? '助记词' : 'Mnemonic') :
               mode === 'seed' ? (isZh ? '种子输入' : 'Seed') :
               (isZh ? '根密钥输入' : 'Root Key')}
            </button>
          ))}
        </div>
      </div>

      {/* Manual seed input */}
      {inputMode === 'seed' && (
        <div className="mb-2">
          <span className="field-label">{isZh ? '输入 BIP39 种子 (128位十六进制)' : 'Enter BIP39 Seed (128 hex chars)'}</span>
          <textarea
            value={manualSeed}
            onChange={(e) => setManualSeed(e.target.value.replace(/[^0-9a-fA-F]/g, ''))}
            placeholder="Enter 128-character hex seed..."
            className="w-full input-field mono text-xs text-amber-400 resize-none p-2 mt-1"
            rows={2}
            spellCheck={false}
          />
        </div>
      )}

      {/* Manual root key input */}
      {inputMode === 'rootkey' && (
        <div className="mb-2">
          <span className="field-label">{isZh ? '输入 BIP32 根密钥 (xprv...)' : 'Enter BIP32 Root Key (xprv...)'}</span>
          <textarea
            value={manualRootKey}
            onChange={(e) => setManualRootKey(e.target.value.trim())}
            placeholder="xprv..."
            className="w-full input-field mono text-xs text-purple-400 resize-none p-2 mt-1"
            rows={2}
            spellCheck={false}
          />
        </div>
      )}

      {/* Display computed values */}
      {seed && inputMode !== 'seed' && (
        <div className="mt-1">
          <span className="field-label">BIP39 Seed</span>
          <div className="value-box mt-0.5">
            <p
              className={`mono text-[11px] text-amber-400 break-all pr-8 select-all cursor-pointer ${privacyMode ? 'blur-sm hover:blur-none' : ''}`}
              onClick={() => !privacyMode && onQR?.({ text: seed, label: 'BIP39 Seed' })}
            >
              {privacyMode ? '•'.repeat(40) : seed}
            </p>
            {!privacyMode && <CopyButton text={seed} className="absolute top-1 right-1" />}
          </div>
        </div>
      )}

      {rootKey && inputMode !== 'rootkey' && (
        <div className="mt-1.5">
          <span className="field-label">BIP32 Root Key</span>
          <div className="value-box mt-0.5">
            <p
              className={`mono text-[11px] text-purple-400 break-all pr-8 select-all cursor-pointer ${privacyMode ? 'blur-sm hover:blur-none' : ''}`}
              onClick={() => !privacyMode && onQR?.({ text: rootKey, label: 'BIP32 Root Key' })}
            >
              {privacyMode ? '•'.repeat(40) : rootKey}
            </p>
            {!privacyMode && <CopyButton text={rootKey} className="absolute top-1 right-1" />}
          </div>
        </div>
      )}

      {!seed && !rootKey && inputMode === 'mnemonic' && (
        <p className="text-[11px] text-[--text-muted] mt-1">{isZh ? '生成助记词后显示' : 'Displayed after generating mnemonic'}</p>
      )}
    </div>
  );
}
