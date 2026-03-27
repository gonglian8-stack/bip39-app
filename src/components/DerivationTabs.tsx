'use client';

import { useTranslation } from 'react-i18next';
import CopyButton from './CopyButton';
import { COINS } from '@/lib/coins';
import type { BipType, Bip141ScriptType } from '@/lib/derivation';

const BIP_TYPES: { id: BipType; label: string; short: string }[] = [
  { id: 'BIP44', label: 'BIP44', short: 'P2PKH' },
  { id: 'BIP49', label: 'BIP49', short: 'P2SH-SegWit' },
  { id: 'BIP84', label: 'BIP84', short: 'Bech32' },
  { id: 'BIP86', label: 'BIP86', short: 'Taproot' },
  { id: 'BIP141', label: 'BIP141', short: 'SegWit' },
  { id: 'BIP32', label: 'BIP32', short: 'Custom' },
];

const BIP32_PRESETS = [
  { label: 'Bitcoin Core', path: "m/0'/0'" },
  { label: 'blockchain.info', path: "m/44'/0'/0'" },
  { label: 'MultiBit HD', path: "m/0'/0" },
  { label: 'Coinomi', path: "m/44'/0'/0'" },
  { label: 'Mycelium', path: "m/44'/0'/0'/0" },
  { label: 'Electrum', path: "m/0" },
];

interface Props {
  bipType: BipType;
  setBipType: (t: BipType) => void;
  coinId: string;
  setCoinId: (id: string) => void;
  coinType: number;
  account: number;
  setAccount: (a: number) => void;
  change: number;
  setChange: (c: number) => void;
  xpub: string;
  xprv: string;
  customPath: string;
  setCustomPath: (p: string) => void;
  bip141Script: Bip141ScriptType;
  setBip141Script: (s: Bip141ScriptType) => void;
  isValid: boolean;
  privacyMode?: boolean;
  onQR?: (data: { text: string; label: string }) => void;
}

export default function DerivationTabs({
  bipType, setBipType,
  coinId, setCoinId, coinType,
  account, setAccount,
  change, setChange,
  xpub, xprv,
  customPath, setCustomPath,
  bip141Script, setBip141Script,
  isValid: _isValid, privacyMode, onQR,
}: Props) {
  const { i18n } = useTranslation();
  const isZh = i18n.language === 'zh';

  void _isValid;

  const purposeMap: Record<string, number> = { BIP44: 44, BIP49: 49, BIP84: 84, BIP86: 86 };
  const purpose = purposeMap[bipType] ?? 44;
  const pathDisplay = bipType === 'BIP32' || bipType === 'BIP141'
    ? customPath
    : `m/${purpose}'/${coinType}'/${account}'/${change}`;

  return (
    <div className="section-card">
      <span className="section-header">{isZh ? '派生路径' : 'Derivation Path'}</span>

      {/* BIP tabs */}
      <div className="flex gap-1 mb-2">
        {BIP_TYPES.map((bt) => (
          <button
            key={bt.id}
            onClick={() => setBipType(bt.id)}
            className={`tab-btn ${bipType === bt.id ? 'active' : ''}`}
            title={bt.short}
          >
            {bt.label}
          </button>
        ))}
      </div>

      {/* Config grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-2">
        <div>
          <span className="field-label">{isZh ? '币种' : 'Coin'}</span>
          <select
            value={coinId}
            onChange={(e) => setCoinId(e.target.value)}
            className="select-field w-full mt-0.5"
          >
            {COINS.map(c => (
              <option key={c.id} value={c.id}>{c.symbol} - {c.name}</option>
            ))}
          </select>
        </div>
        <div>
          <span className="field-label">{isZh ? '账户' : 'Account'}</span>
          <input
            type="number" min={0} value={account}
            onChange={(e) => setAccount(Number(e.target.value))}
            className="input-field w-full mt-0.5 text-xs"
          />
        </div>
        <div>
          <span className="field-label">{isZh ? '找零' : 'External/Internal'}</span>
          <select
            value={change}
            onChange={(e) => setChange(Number(e.target.value))}
            className="select-field w-full mt-0.5"
          >
            <option value={0}>0 - External</option>
            <option value={1}>1 - Internal</option>
          </select>
        </div>
        <div>
          <span className="field-label">{isZh ? '路径' : 'Path'}</span>
          <div className="mono text-xs text-[--accent] mt-1">{pathDisplay}</div>
        </div>
      </div>

      {/* BIP141 script selector */}
      {bipType === 'BIP141' && (
        <div className="flex flex-wrap gap-1 mb-2">
          {(['P2WPKH', 'P2WPKH-P2SH', 'P2WSH', 'P2WSH-P2SH'] as Bip141ScriptType[]).map(s => (
            <button
              key={s}
              onClick={() => setBip141Script(s)}
              className={`toggle-pill ${bip141Script === s ? 'active' : ''}`}
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* BIP32 custom path + presets */}
      {bipType === 'BIP32' && (
        <div className="mb-2 space-y-1">
          <div className="flex flex-wrap gap-1">
            {BIP32_PRESETS.map(p => (
              <button
                key={p.label}
                onClick={() => setCustomPath(p.path)}
                className={`toggle-pill ${customPath === p.path ? 'active' : ''}`}
              >
                {p.label}
              </button>
            ))}
          </div>
          <input
            type="text" value={customPath}
            onChange={(e) => setCustomPath(e.target.value)}
            className="input-field w-full mono text-xs"
            spellCheck={false}
          />
        </div>
      )}

      {/* Extended keys */}
      {xpub && (
        <div className="space-y-1.5 mt-2 pt-2 border-t border-[--border]">
          <div className="value-box">
            <span className="field-label">Account Extended Public Key</span>
            <p
              className="mono text-[10px] text-green-400 break-all pr-6 select-all cursor-pointer"
              onClick={() => onQR?.({ text: xpub, label: 'xpub' })}
            >
              {xpub}
            </p>
            <CopyButton text={xpub} className="absolute top-1 right-1" />
          </div>
          <div className="value-box">
            <span className="field-label">Account Extended Private Key</span>
            <p
              className={`mono text-[10px] text-red-400 break-all pr-6 select-all ${privacyMode ? 'blur-sm hover:blur-none' : ''}`}
            >
              {privacyMode ? '•'.repeat(40) : xprv}
            </p>
            {!privacyMode && <CopyButton text={xprv} className="absolute top-1 right-1" />}
          </div>
        </div>
      )}
    </div>
  );
}
