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
import Sidebar from '@/components/Sidebar';
import EntropyPanel from '@/components/EntropyPanel';

export default function Home() {
  const { i18n } = useTranslation();
  const isZh = i18n.language === 'zh';
  const m = useMnemonic();
  const [privacyMode, setPrivacyMode] = useState(false);
  const [qrData, setQrData] = useState<{ text: string; label: string } | null>(null);
  const [activeSection, setActiveSection] = useState('generator');

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-[#1a2235] bg-[#060a14] sticky top-0 z-50">
        <div className="px-4 lg:px-6 h-14 flex items-center justify-between">
          {/* Left: Logo + Title */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2.5">
              <svg width="36" height="36" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="32" height="32" rx="8" fill="url(#logo-grad)" />
                <path d="M7 9h5v5H7zM13.5 9h5v5h-5zM20 9h5v5h-5zM7 18h5v5H7zM13.5 18h5v5h-5zM20 18h5v5h-5z" fill="rgba(255,255,255,0.92)" rx="1.5" />
                <defs>
                  <linearGradient id="logo-grad" x1="0" y1="0" x2="32" y2="32">
                    <stop stopColor="#059669" />
                    <stop offset="1" stopColor="#10b981" />
                  </linearGradient>
                </defs>
              </svg>
              <span className="text-xl font-extrabold tracking-tight">
                <span className="text-emerald-400">BIP39</span>
                <span className="text-emerald-300/60">.ai</span>
              </span>
            </div>

            {/* Nav tabs - desktop */}
            <nav className="hidden md:flex items-center gap-1 ml-4 border-l border-[#1a2235] pl-4">
              {['Mnemonic', 'Entropy', 'Keys', 'Addresses'].map(tab => (
                <button
                  key={tab}
                  onClick={() => document.getElementById(tab.toLowerCase())?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                  className="px-3 py-1.5 text-sm text-gray-400 hover:text-emerald-400 hover:bg-emerald-500/5 rounded-lg transition-colors"
                >
                  {tab}
                </button>
              ))}
            </nav>
          </div>

          {/* Right: Secure Mode + Privacy + Language */}
          <div className="flex items-center gap-2">
            <span className="hidden sm:flex items-center gap-1.5 text-[10px] text-emerald-400/70 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-2.5 py-1">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
              {isZh ? '安全模式: 离线' : 'Secure Mode: Offline'}
            </span>
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

      {/* Body: Sidebar + Main + Right Panel */}
      <div className="flex flex-1 overflow-hidden max-w-[1400px] mx-auto w-full">
        {/* Left Sidebar */}
        <Sidebar activeSection={activeSection} onNavigate={setActiveSection} />

        {/* Main Content */}
        <main id="main-scroll" className="flex-1 overflow-y-auto px-4 lg:px-8 py-5 space-y-5">
          {/* Hero title */}
          <div className="mb-4">
            <h1 className="text-3xl lg:text-4xl font-bold text-white leading-tight">
              BIP39 Mnemonic Tool<br />
              <span className="text-emerald-400">100% Client-Side, Offline Safe.</span>
            </h1>
            <p className="text-base text-gray-400 mt-2 max-w-2xl">
              {isZh
                ? '安全生成、恢复和派生钱包。所有操作完全在浏览器本地运行，不发送任何数据到服务器。'
                : 'Generate, recover and derive wallets securely. Nothing is ever sent to any server.'}
            </p>
          </div>

          {/* Safety warning - RED */}
          <div className="text-sm text-red-300 bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 mb-1">
            ⚠️ {isZh
              ? '切勿在联网设备上输入真实资产助记词！强烈建议断网后使用本工具。'
              : 'Never enter real funds mnemonic on an online device. We strongly recommend using this tool offline.'}
          </div>

          {/* Trust cards - 4 pillars */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-2">
            <TrustCard icon="🔐" title={isZh ? '纯客户端' : 'Client-side Only'} desc={isZh ? '所有加密操作在浏览器本地运行' : 'All crypto operations run locally in your browser'} />
            <TrustCard icon="📂" title={isZh ? '开源代码' : 'Open Source'} desc={isZh ? '在 GitHub 上验证源代码' : 'Verify code on GitHub'} href="https://github.com/gonglian8-stack/bip39-app" />
            <TrustCard icon="🛡️" title={isZh ? '安全审计' : 'Security Audit'} desc={isZh ? '核心加密模块经过审计' : 'Core crypto modules are audited'} />
            <TrustCard icon="📥" title={isZh ? '离线可用' : 'Offline Ready'} desc={isZh ? '下载后断网运行' : 'Download and run without internet'} />
          </div>

          <div id="mnemonic">
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
          </div>

          {/* Entropy - shown in main on mobile, hidden on desktop (moved to right panel) */}
          <div id="entropy" className="lg:hidden">
            <EntropySection
              entropy={m.entropy}
              entropyBinary={m.entropyBinary}
              setEntropyHex={m.setEntropyHex}
              isValid={m.isValid}
              wordCount={m.wordCount}
            />
          </div>

          <div id="keys">
            <SeedDisplay
              seed={m.seed} rootKey={m.rootKey} privacyMode={privacyMode} onQR={setQrData}
              inputMode={m.inputMode} setInputMode={m.setInputMode}
              manualSeed={m.manualSeed} setManualSeed={m.setManualSeed}
              manualRootKey={m.manualRootKey} setManualRootKey={m.setManualRootKey}
            />
          </div>

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

          <div id="addresses">
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
          </div>

          <div id="ai-security">
          <AiSecurityPanel
            mnemonic={m.mnemonic}
            isValid={m.isValid}
            wordCount={m.wordCount}
            passphrase={m.passphrase}
            bipType={m.bipType}
            coinId={m.coinId}
            pbkdf2Rounds={m.pbkdf2Rounds}
          />
          </div>

          <SplitMnemonicCards mnemonic={m.mnemonic} isValid={m.isValid} />

          <Bip85Section seed={m.seed} isValid={m.isValid} privacyMode={privacyMode} />

          {/* Clear All Data */}
          <div className="flex justify-center pt-4">
            <button
              onClick={() => { window.location.reload(); }}
              className="px-6 py-2 text-sm text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/10 transition-colors"
            >
              🗑️ {isZh ? '清除所有数据 (内存 + 缓存)' : 'Clear All Data (Memory + Cache)'}
            </button>
          </div>

          {/* Entropy Section - full version on mobile */}
          <div className="lg:hidden">
            <EntropyPanel
              entropy={m.entropy}
              entropyBinary={m.entropyBinary}
              isValid={m.isValid}
              wordCount={m.wordCount}
            />
          </div>
        </main>

        {/* Right Panel - desktop only */}
        <aside className="hidden lg:block w-[280px] shrink-0 border-l border-[#1a2235] overflow-y-auto p-4">
          <EntropyPanel
            entropy={m.entropy}
            entropyBinary={m.entropyBinary}
            isValid={m.isValid}
            wordCount={m.wordCount}
          />

          {/* Desktop entropy input */}
          <div className="mt-3">
            <EntropySection
              entropy={m.entropy}
              entropyBinary={m.entropyBinary}
              setEntropyHex={m.setEntropyHex}
              isValid={m.isValid}
              wordCount={m.wordCount}
            />
          </div>
        </aside>
      </div>

      {/* Footer */}
      <footer className="border-t border-[#1a2235] py-3 bg-[#060a14]">
        <div className="px-4 lg:px-6 flex flex-wrap justify-center gap-4 text-xs text-gray-500">
          <span className="font-semibold text-emerald-400">BIP39</span><span className="font-semibold text-emerald-300/60">.ai</span>
          <span>&middot;</span>
          <a href="https://github.com/gonglian8-stack/bip39-app" target="_blank" rel="noopener noreferrer" className="hover:text-emerald-400 transition-colors">GitHub</a>
          <span>&middot;</span>
          <span>{isZh ? '安全审计' : 'Security Audits'}</span>
          <span>&middot;</span>
          <span>{isZh ? '隐私政策' : 'Privacy Policy'}</span>
          <span>&middot;</span>
          <span>{isZh ? '风险声明' : 'Disclaimer'}</span>
          <span>&middot;</span>
          <span>{isZh ? '纯客户端加密 · 离线安全' : 'Client-side Crypto · Offline Safe'}</span>
        </div>
      </footer>

      {/* QR Modal */}
      {qrData && <QRModal text={qrData.text} label={qrData.label} onClose={() => setQrData(null)} />}
    </div>
  );
}

function TrustCard({ icon, title, desc, href }: { icon: string; title: string; desc: string; href?: string }) {
  const inner = (
    <div className="bg-[#0c1220] border border-[#1a2235] rounded-xl p-4 hover:border-emerald-500/20 transition-colors h-full">
      <div className="text-2xl mb-2">{icon}</div>
      <h3 className="text-sm font-semibold text-white mb-1">{title}</h3>
      <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
    </div>
  );
  if (href) return <a href={href} target="_blank" rel="noopener noreferrer">{inner}</a>;
  return inner;
}
