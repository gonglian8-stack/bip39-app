'use client';

import { useTranslation } from 'react-i18next';
import CopyButton from './CopyButton';
import { WORD_COUNTS, WORDLIST_LANGS, type WordCount } from '@/lib/bip39';

interface Props {
  mnemonic: string;
  setMnemonic: (m: string) => void;
  wordCount: WordCount;
  setWordCount: (wc: WordCount) => void;
  wordlistLang: string;
  setWordlistLang: (l: string) => void;
  passphrase: string;
  setPassphrase: (p: string) => void;
  isValid: boolean;
  generate: () => void;
  privacyMode?: boolean;
  pbkdf2Rounds: number;
  setPbkdf2Rounds: (r: number) => void;
}

export default function MnemonicSection({
  mnemonic, setMnemonic,
  wordCount, setWordCount,
  wordlistLang, setWordlistLang,
  passphrase, setPassphrase,
  isValid, generate, privacyMode,
  pbkdf2Rounds, setPbkdf2Rounds,
}: Props) {
  const { i18n } = useTranslation();
  const isZh = i18n.language === 'zh';
  const words = mnemonic.trim().split(/\s+/).filter(Boolean);

  return (
    <div className="section-card">
      {/* Header row */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="section-header mb-0">{isZh ? '助记词' : 'Mnemonic'}</span>
          {mnemonic && (
            <span className={`text-[10px] px-1.5 py-0.5 rounded ${
              isValid ? 'bg-green-900/40 text-green-400' : 'bg-red-900/40 text-red-400'
            }`}>
              {isValid ? '✓' : '✗'}
            </span>
          )}
        </div>
        <button onClick={generate} className="btn btn-primary">
          ↻ {isZh ? '生成' : 'Generate'}
        </button>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-2 mb-2">
        <select
          value={wordCount}
          onChange={(e) => setWordCount(Number(e.target.value) as WordCount)}
          className="select-field"
        >
          {WORD_COUNTS.map(wc => (
            <option key={wc} value={wc}>{wc} {isZh ? '词' : 'words'}</option>
          ))}
        </select>
        <select
          value={wordlistLang}
          onChange={(e) => setWordlistLang(e.target.value)}
          className="select-field"
        >
          {WORDLIST_LANGS.map(wl => (
            <option key={wl.id} value={wl.id}>{isZh ? wl.labelZh : wl.label}</option>
          ))}
        </select>
        <select
          value={pbkdf2Rounds}
          onChange={(e) => setPbkdf2Rounds(Number(e.target.value))}
          className="select-field"
        >
          <option value={2048}>PBKDF2: 2048</option>
          <option value={4096}>PBKDF2: 4096</option>
          <option value={8192}>PBKDF2: 8192</option>
        </select>
      </div>

      {/* Textarea */}
      <div className="relative mb-2">
        <textarea
          value={privacyMode ? mnemonic.replace(/\S/g, '•') : mnemonic}
          onChange={(e) => !privacyMode && setMnemonic(e.target.value)}
          readOnly={privacyMode}
          placeholder={isZh ? '输入助记词或点击生成...' : 'Type mnemonic or click Generate...'}
          className="w-full input-field mono text-sm resize-none p-2"
          rows={2}
          spellCheck={false}
          autoComplete="off"
        />
        {mnemonic && <CopyButton text={mnemonic} className="absolute top-1 right-1" />}
      </div>

      {/* Word chips */}
      {words.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {words.map((word, i) => (
            <span key={i} className="tag">
              <span className="tag-num">{i + 1}</span>
              <span className={`tag-word ${privacyMode ? 'blur-sm' : ''}`}>{word}</span>
            </span>
          ))}
        </div>
      )}

      {/* Passphrase */}
      <div className="flex items-center gap-2">
        <span className="field-label whitespace-nowrap">BIP39 Passphrase</span>
        <input
          type="text"
          value={passphrase}
          onChange={(e) => setPassphrase(e.target.value)}
          placeholder={isZh ? '可选密码短语' : 'Optional passphrase'}
          className="input-field flex-1 text-xs"
          spellCheck={false}
          autoComplete="off"
        />
      </div>
      {pbkdf2Rounds !== 2048 && (
        <div className="text-[10px] text-[--warning] mt-1">
          ⚠ {isZh ? `非标准 PBKDF2 轮数 (${pbkdf2Rounds})，可能与其他钱包不兼容` : `Non-standard PBKDF2 rounds (${pbkdf2Rounds}), may be incompatible with other wallets`}
        </div>
      )}
    </div>
  );
}
