'use client';

import { useState } from 'react';
import '@/i18n';
import { useTranslation } from 'react-i18next';
import { useMnemonic } from '@/hooks/useMnemonic';
import MnemonicSection from '@/components/MnemonicSection';
import EntropySection from '@/components/EntropySection';
import SeedDisplay from '@/components/SeedDisplay';
import DerivationTabs from '@/components/DerivationTabs';
import AddressTable from '@/components/AddressTable';
import Bip85Section from '@/components/Bip85Section';
import SplitMnemonicCards from '@/components/SplitMnemonicCards';
import AiSecurityPanel from '@/components/AiSecurityPanel';
import LanguageToggle from '@/components/LanguageToggle';
import QRModal from '@/components/QRModal';

export default function Home() {
  const { i18n } = useTranslation();
  const isZh = i18n.language === 'zh';
  const m = useMnemonic();
  const [privacyMode, setPrivacyMode] = useState(false);
  const [qrData, setQrData] = useState<{ text: string; label: string } | null>(null);

  return (
    <div className="min-h-screen">
      {/* Header - compact */}
      <header className="border-b border-[--border] bg-[--bg-secondary] sticky top-0 z-50">
        <div className="max-w-[1200px] mx-auto px-3 h-10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-[--accent]">BIP39</span>
            <span className="text-[11px] text-[--text-muted]">Mnemonic Code Converter</span>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setPrivacyMode(!privacyMode)}
              className={`toggle-pill ${privacyMode ? 'active' : ''}`}
            >
              {privacyMode ? '🔒' : '👁'} {privacyMode ? (isZh ? '已隐藏' : 'Hidden') : (isZh ? '隐私' : 'Privacy')}
            </button>
            <LanguageToggle />
          </div>
        </div>
      </header>

      {/* Main content - tighter spacing */}
      <main className="max-w-[1200px] mx-auto px-3 py-3 space-y-3">
        {/* Security notice */}
        <div className="text-[11px] text-[--text-muted] bg-[--bg-secondary] border border-[--border] rounded px-3 py-1.5">
          ⚠ {isZh
            ? '所有密钥操作在浏览器本地完成，不发送任何数据到服务器。建议断网使用。'
            : 'All key operations run locally in your browser. No data is sent to any server. Offline usage recommended.'}
        </div>

        <MnemonicSection
          mnemonic={m.mnemonic}
          setMnemonic={m.setMnemonic}
          wordCount={m.wordCount}
          setWordCount={m.setWordCount}
          wordlistLang={m.wordlistLang}
          setWordlistLang={m.setWordlistLang}
          passphrase={m.passphrase}
          setPassphrase={m.setPassphrase}
          isValid={m.isValid}
          generate={m.generate}
          privacyMode={privacyMode}
          pbkdf2Rounds={m.pbkdf2Rounds}
          setPbkdf2Rounds={m.setPbkdf2Rounds}
        />

        <EntropySection
          entropy={m.entropy}
          entropyBinary={m.entropyBinary}
          setEntropyHex={m.setEntropyHex}
          isValid={m.isValid}
          wordCount={m.wordCount}
        />

        <SeedDisplay
          seed={m.seed} rootKey={m.rootKey} privacyMode={privacyMode} onQR={setQrData}
          inputMode={m.inputMode} setInputMode={m.setInputMode}
          manualSeed={m.manualSeed} setManualSeed={m.setManualSeed}
          manualRootKey={m.manualRootKey} setManualRootKey={m.setManualRootKey}
        />

        <DerivationTabs
          bipType={m.bipType}
          setBipType={m.setBipType}
          coinId={m.coinId}
          setCoinId={m.setCoinId}
          coinType={m.coinType}
          account={m.account}
          setAccount={m.setAccount}
          change={m.change}
          setChange={m.setChange}
          xpub={m.xpub}
          xprv={m.xprv}
          customPath={m.customPath}
          setCustomPath={m.setCustomPath}
          bip141Script={m.bip141Script}
          setBip141Script={m.setBip141Script}
          isValid={m.isValid}
          privacyMode={privacyMode}
          onQR={setQrData}
        />

        <AddressTable
          addresses={m.addresses}
          loadMore={m.loadMore}
          startIndex={m.startIndex}
          setStartIndex={m.setStartIndex}
          addressCount={m.addressCount}
          setAddressCount={m.setAddressCount}
          hardened={m.hardened}
          setHardened={m.setHardened}
          privacyMode={privacyMode}
          onQR={setQrData}
        />

        <AiSecurityPanel
          mnemonic={m.mnemonic}
          isValid={m.isValid}
          wordCount={m.wordCount}
          passphrase={m.passphrase}
          bipType={m.bipType}
          coinId={m.coinId}
          pbkdf2Rounds={m.pbkdf2Rounds}
        />

        <SplitMnemonicCards mnemonic={m.mnemonic} isValid={m.isValid} />

        <Bip85Section seed={m.seed} isValid={m.isValid} privacyMode={privacyMode} />
      </main>

      {/* Footer */}
      <footer className="border-t border-[--border] mt-4 py-3">
        <div className="max-w-[1200px] mx-auto px-3 text-center text-[11px] text-[--text-muted]">
          BIP39.ai &middot; {isZh ? '开源助记词工具' : 'Open Source Mnemonic Tool'} &middot; {isZh ? '客户端加密' : 'Client-side Cryptography'}
        </div>
      </footer>

      {/* QR Modal */}
      {qrData && <QRModal text={qrData.text} label={qrData.label} onClose={() => setQrData(null)} />}
    </div>
  );
}
