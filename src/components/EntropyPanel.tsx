'use client';

import { useTranslation } from 'react-i18next';
import CopyButton from './CopyButton';

interface Props {
  entropy: string;
  entropyBinary: string;
  isValid: boolean;
  wordCount: number;
}

export default function EntropyPanel({ entropy, entropyBinary, isValid, wordCount }: Props) {
  const { i18n } = useTranslation();
  const isZh = i18n.language === 'zh';

  const entropyBits = wordCount === 12 ? 128 : wordCount === 15 ? 160 : wordCount === 18 ? 192 : wordCount === 21 ? 224 : 256;
  const checksumBits = entropyBits / 32;

  return (
    <div className="space-y-3">
      {/* Entropy Analysis Card */}
      <div className="bg-[#0c1220] border border-[#1a2235] rounded-xl p-4">
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
          {isZh ? '熵分析' : 'Entropy Analysis'}
        </h3>

        <div className="space-y-3">
          {/* Bits of Entropy */}
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-500">{isZh ? '熵强度' : 'Bits of Entropy'}</span>
            <span className={`text-sm font-bold ${entropy ? 'text-emerald-400' : 'text-gray-600'}`}>
              {entropy ? `${entropyBits} bits` : '—'}
            </span>
          </div>

          {/* Checksum */}
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-500">{isZh ? '校验和状态' : 'Checksum Valid'}</span>
            {entropy ? (
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${isValid ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                {isValid ? 'PASSED' : 'FAILED'}
              </span>
            ) : (
              <span className="text-xs text-gray-600">—</span>
            )}
          </div>

          {/* Checksum bits */}
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-500">{isZh ? '校验位' : 'Checksum Bits'}</span>
            <span className="text-xs text-gray-400">{entropy ? `${checksumBits} bits` : '—'}</span>
          </div>

          {/* Word count */}
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-500">{isZh ? '单词数' : 'Word Count'}</span>
            <span className="text-xs text-gray-400">{wordCount}</span>
          </div>
        </div>

        {/* Raw Entropy */}
        {entropy && (
          <div className="mt-3 pt-3 border-t border-[#1a2235]">
            <div className="flex justify-between items-center mb-1">
              <span className="text-[10px] text-gray-500 uppercase">{isZh ? '原始熵 (Hex)' : 'Raw Entropy (Hex)'}</span>
              <CopyButton text={entropy} className="scale-75" />
            </div>
            <p className="font-mono text-[10px] text-emerald-400/70 break-all leading-relaxed">{entropy}</p>
          </div>
        )}

        {/* Binary visualization */}
        {entropyBinary && (
          <div className="mt-2">
            <span className="text-[10px] text-gray-500 uppercase">{isZh ? '二进制' : 'Binary'}</span>
            <div className="flex flex-wrap gap-[2px] mt-1">
              {entropyBinary.split('').slice(0, 64).map((bit, i) => (
                <div
                  key={i}
                  className={`w-[6px] h-[6px] rounded-[1px] ${bit === '1' ? 'bg-emerald-500' : 'bg-[#1a2235]'}`}
                />
              ))}
              {entropyBinary.length > 64 && <span className="text-[8px] text-gray-600 ml-1">...</span>}
            </div>
          </div>
        )}
      </div>

      {/* Security Note */}
      <SecurityNote />
    </div>
  );
}

function SecurityNote() {
  const { i18n } = useTranslation();
  const isZh = i18n.language === 'zh';

  return (
    <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-emerald-400 text-sm">🔒</span>
        <h3 className="text-xs font-semibold text-emerald-400">
          {isZh ? '安全提示' : 'Security Note'}
        </h3>
      </div>
      <p className="text-[11px] text-gray-400 leading-relaxed">
        {isZh
          ? '助记词不应以数字形式存储。建议使用硬件钱包或不锈钢助记词板进行长期冷存储备份。'
          : 'Seed phrases should never be stored in digital form. Use a hardware wallet or stainless steel backup for long-term cold storage.'}
      </p>
    </div>
  );
}
