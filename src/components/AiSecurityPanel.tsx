'use client';

import { useState, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { shannonEntropy } from '@/lib/bip39';

interface Props {
  mnemonic: string;
  isValid: boolean;
  wordCount: number;
  passphrase: string;
  bipType: string;
  coinId: string;
  pbkdf2Rounds: number;
}

function quickCheck(
  mnemonic: string, wordCount: number, hasPassphrase: boolean, pbkdf2Rounds: number, isZh: boolean,
) {
  const words = mnemonic.trim().split(/\s+/);
  const items: { text: string; ok: boolean }[] = [];

  items.push({
    text: `${wordCount} ${isZh ? '词' : 'words'} (${wordCount * 10.67 | 0}-bit)`,
    ok: wordCount >= 15,
  });
  items.push({
    text: isZh ? (hasPassphrase ? '密码短语: 已设置' : '密码短语: 未设置') : (hasPassphrase ? 'Passphrase: Set' : 'Passphrase: Not set'),
    ok: hasPassphrase,
  });

  const unique = new Set(words);
  items.push({
    text: isZh ? `重复词: ${words.length - unique.size}` : `Repeated: ${words.length - unique.size}`,
    ok: unique.size === words.length,
  });

  const score = shannonEntropy(mnemonic);
  items.push({
    text: `Shannon: ${score.toFixed(3)}`,
    ok: score > 0.9,
  });

  items.push({
    text: `PBKDF2: ${pbkdf2Rounds}`,
    ok: pbkdf2Rounds >= 2048,
  });

  return items;
}

export default function AiSecurityPanel({
  mnemonic, isValid, wordCount, passphrase, bipType, coinId, pbkdf2Rounds,
}: Props) {
  const { i18n } = useTranslation();
  const isZh = i18n.language === 'zh';
  const [aiResult, setAiResult] = useState('');
  const [loading, setLoading] = useState(false);

  const checks = useMemo(() => {
    if (!isValid || !mnemonic.trim()) return null;
    return quickCheck(mnemonic, wordCount, !!passphrase, pbkdf2Rounds, isZh);
  }, [mnemonic, isValid, wordCount, passphrase, pbkdf2Rounds, isZh]);

  const requestAi = useCallback(async () => {
    if (!isValid) return;
    setLoading(true);
    setAiResult('');
    const words = mnemonic.trim().split(/\s+/);
    try {
      const res = await fetch('/api/ai-analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'mnemonic_check',
          data: {
            wordCount, hasPassphrase: !!passphrase,
            hasRepeatedWords: new Set(words).size < words.length,
            shannonScore: shannonEntropy(mnemonic),
            pbkdf2Rounds, bipType, coinType: coinId,
          },
          language: isZh ? 'zh' : 'en',
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setAiResult(data.result);
      } else {
        setAiResult(isZh ? 'AI 服务暂不可用' : 'AI service unavailable');
      }
    } catch {
      setAiResult(isZh ? '网络错误' : 'Network error');
    } finally {
      setLoading(false);
    }
  }, [mnemonic, isValid, wordCount, passphrase, pbkdf2Rounds, bipType, coinId, isZh]);

  if (!checks) return null;

  return (
    <div className="section-card">
      <div className="flex items-center justify-between mb-2">
        <span className="section-header mb-0">{isZh ? '安全检查' : 'Security Check'}</span>
        <button onClick={requestAi} disabled={loading} className="btn btn-secondary">
          {loading ? '...' : (isZh ? 'AI 分析' : 'AI Analysis')}
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {checks.map((c, i) => (
          <span key={i} className={`text-[11px] px-2 py-0.5 rounded ${
            c.ok ? 'bg-green-900/30 text-green-400' : 'bg-yellow-900/30 text-yellow-400'
          }`}>
            {c.ok ? '✓' : '!'} {c.text}
          </span>
        ))}
      </div>

      {aiResult && (
        <div className="mt-2 value-box text-[12px] text-[--text-primary] whitespace-pre-wrap leading-relaxed">
          {aiResult}
        </div>
      )}
    </div>
  );
}
