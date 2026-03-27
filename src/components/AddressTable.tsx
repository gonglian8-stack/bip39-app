'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import CopyButton from './CopyButton';
import type { DerivedAddress } from '@/lib/derivation';

interface Props {
  addresses: DerivedAddress[];
  loadMore: () => void;
  startIndex: number;
  setStartIndex: (i: number) => void;
  addressCount: number;
  setAddressCount: (c: number) => void;
  hardened: boolean;
  setHardened: (h: boolean) => void;
  privacyMode: boolean;
  onQR?: (data: { text: string; label: string }) => void;
}

type ColKey = 'path' | 'address' | 'publicKey' | 'privateKey' | 'wif';

export default function AddressTable({
  addresses, loadMore: _loadMore, startIndex, setStartIndex, addressCount, setAddressCount, hardened, setHardened, privacyMode, onQR,
}: Props) {
  void _loadMore;
  const { i18n } = useTranslation();
  const isZh = i18n.language === 'zh';
  const [cols, setCols] = useState<Record<ColKey, boolean>>({
    path: true, address: true, publicKey: false, privateKey: false, wif: false,
  });

  const toggleCol = (key: ColKey) => setCols(prev => ({ ...prev, [key]: !prev[key] }));

  const exportCSV = () => {
    const headers = ['Path', 'Address', 'Public Key', 'Private Key', 'WIF'];
    const rows = addresses.map(a => [a.path, a.address, a.publicKey, a.privateKey, a.wif]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'bip39-addresses.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  const colLabels: Record<ColKey, string> = {
    path: isZh ? '路径' : 'Path',
    address: isZh ? '地址' : 'Address',
    publicKey: isZh ? '公钥' : 'PubKey',
    privateKey: isZh ? '私钥' : 'PrivKey',
    wif: 'WIF',
  };

  return (
    <div className="section-card">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
        <span className="section-header mb-0">
          {isZh ? '派生地址' : 'Derived Addresses'}
          {addresses.length > 0 && <span className="text-[--text-muted] font-normal ml-1">({addresses.length})</span>}
        </span>
        <div className="flex items-center gap-1">
          {(Object.keys(cols) as ColKey[]).map(key => (
            <button key={key} onClick={() => toggleCol(key)} className={`toggle-pill ${cols[key] ? 'active' : ''}`}>
              {colLabels[key]}
            </button>
          ))}
          <button onClick={exportCSV} className="btn btn-secondary ml-1">CSV</button>
        </div>
      </div>

      {/* Options */}
      <div className="flex items-center gap-3 mb-2 text-[11px]">
        <div className="flex items-center gap-1">
          <span className="text-[--text-secondary]">{isZh ? '起始' : 'Start'}:</span>
          <input
            type="number" min={0} value={startIndex}
            onChange={(e) => setStartIndex(Math.max(0, Number(e.target.value)))}
            className="input-field w-14 text-[11px]"
          />
        </div>
        <div className="flex items-center gap-1">
          <span className="text-[--text-secondary]">{isZh ? '数量' : 'Count'}:</span>
          <input
            type="number" min={1} max={1000} value={addressCount}
            onChange={(e) => setAddressCount(Math.max(1, Math.min(1000, Number(e.target.value))))}
            className="input-field w-14 text-[11px]"
          />
        </div>
        <label className="flex items-center gap-1 cursor-pointer">
          <input type="checkbox" checked={hardened} onChange={(e) => setHardened(e.target.checked)} className="accent-blue-500 w-3 h-3" />
          <span className="text-[--text-secondary]">{isZh ? '硬化' : 'Hardened'}</span>
        </label>
      </div>

      {/* Table */}
      {addresses.length > 0 && (
        <>
          <div className="overflow-x-auto -mx-4 px-4">
            <table className="addr-table">
              <thead>
                <tr>
                  {cols.path && <th>Path</th>}
                  {cols.address && <th>Address</th>}
                  {cols.publicKey && <th>Public Key</th>}
                  {cols.privateKey && <th>Private Key</th>}
                  {cols.wif && <th>WIF</th>}
                </tr>
              </thead>
              <tbody>
                {addresses.map((addr, i) => (
                  <tr key={i}>
                    {cols.path && <td className="text-[--text-muted] whitespace-nowrap">{addr.path}</td>}
                    {cols.address && (
                      <td>
                        <div className="flex items-center gap-1">
                          <span
                            className="text-[--accent] break-all cursor-pointer hover:underline"
                            onClick={() => onQR?.({ text: addr.address, label: `Address ${addr.path}` })}
                          >
                            {addr.address}
                          </span>
                          <CopyButton text={addr.address} />
                        </div>
                      </td>
                    )}
                    {cols.publicKey && (
                      <td>
                        <div className="flex items-center gap-1">
                          <span className="text-green-400/80 break-all">{addr.publicKey}</span>
                          <CopyButton text={addr.publicKey} />
                        </div>
                      </td>
                    )}
                    {cols.privateKey && (
                      <td>
                        <div className="flex items-center gap-1">
                          <span className={`text-red-400/80 break-all ${privacyMode ? 'blur-sm hover:blur-none' : ''}`}>
                            {privacyMode ? '••••••••' : addr.privateKey}
                          </span>
                          {!privacyMode && <CopyButton text={addr.privateKey} />}
                        </div>
                      </td>
                    )}
                    {cols.wif && (
                      <td>
                        <div className="flex items-center gap-1">
                          <span className={`text-orange-400/80 break-all ${privacyMode ? 'blur-sm hover:blur-none' : ''}`}>
                            {privacyMode ? '••••••••' : addr.wif}
                          </span>
                          {!privacyMode && <CopyButton text={addr.wif} />}
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Tip */}
          <p className="text-[10px] text-[--text-muted] mt-1.5 text-center">
            {isZh ? `显示索引 ${startIndex} - ${startIndex + addressCount - 1}，修改 Count 查看更多` : `Showing index ${startIndex}-${startIndex + addressCount - 1}. Adjust Count to see more.`}
          </p>
        </>
      )}
    </div>
  );
}
