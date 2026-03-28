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
      {/* Sentence-style header with inline controls */}
      <div className="flex flex-wrap items-center gap-x-2 gap-y-2 mb-3 text-sm text-gray-400 leading-relaxed">
        <span>{isZh ? '生成' : 'Generate a'}</span>
        <select
          value={wordCount}
          onChange={(e) => setWordCount(Number(e.target.value) as WordCount)}
          className="inline-flex items-center px-2.5 py-1.5 text-lg font-extrabold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 rounded-lg cursor-pointer hover:bg-emerald-500/20 transition-colors appearance-none text-center"
          style={{ minWidth: '3.5rem' }}
        >
          {WORD_COUNTS.map(wc => (
            <option key={wc} value={wc}>{wc}</option>
          ))}
        </select>
        <span>{isZh ? '位助记词' : 'word mnemonic'}</span>
        <button onClick={generate} className="px-4 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-sm rounded-lg transition-colors tracking-wide uppercase shadow-lg shadow-emerald-500/20">
          {isZh ? '生成' : 'GENERATE'}
        </button>
        <span>{isZh ? '或在下方输入' : 'or enter your own below.'}</span>
        {mnemonic && (
          <span className={`text-[10px] px-1.5 py-0.5 rounded ${
            isValid ? 'bg-green-900/40 text-green-400' : 'bg-red-900/40 text-red-400'
          }`}>
            {isValid ? '✓ Valid' : '✗ Invalid'}
          </span>
        )}
        <select
          value={pbkdf2Rounds}
          onChange={(e) => setPbkdf2Rounds(Number(e.target.value))}
          className="select-field text-[10px] ml-auto"
        >
          <option value={2048}>PBKDF2: 2048</option>
          <option value={4096}>PBKDF2: 4096</option>
          <option value={8192}>PBKDF2: 8192</option>
        </select>
      </div>

      {/* Wordlist language pills */}
      <div className="flex flex-wrap gap-1.5 mb-2">
        {WORDLIST_LANGS.map(wl => (
          <button
            key={wl.id}
            onClick={() => setWordlistLang(wl.id)}
            className={`px-2.5 py-1 text-xs rounded-md transition-colors ${
              wordlistLang === wl.id
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                : 'bg-[#0c1220] text-gray-400 border border-[#1a2235] hover:border-emerald-500/30 hover:text-gray-300'
            }`}
          >
            {wl.native}
          </button>
        ))}
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
