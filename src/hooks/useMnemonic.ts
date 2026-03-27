'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import * as bip39 from '@/lib/bip39';
import { deriveAddresses, getExtendedKeys, deriveFromRootKey, type BipType, type Bip141ScriptType, type DerivationConfig } from '@/lib/derivation';
import { COINS } from '@/lib/coins';
import { bytesToHex } from '@noble/hashes/utils.js';

export type InputMode = 'mnemonic' | 'seed' | 'rootkey';

export function useMnemonic() {
  const [mnemonic, setMnemonicRaw] = useState('');
  const [wordCount, setWordCount] = useState<bip39.WordCount>(12);
  const [wordlistLang, setWordlistLang] = useState('english');
  const [passphrase, setPassphrase] = useState('');
  const [pbkdf2Rounds, setPbkdf2Rounds] = useState(2048);
  const [bipType, setBipType] = useState<BipType>('BIP84');
  const [coinId, setCoinId] = useState('btc');
  const [account, setAccount] = useState(0);
  const [change, setChange] = useState(0);
  const [addressCount, setAddressCount] = useState(20);
  const [startIndex, setStartIndex] = useState(0);
  const [hardened, setHardened] = useState(false);
  const [bip141Script, setBip141Script] = useState<Bip141ScriptType>('P2WPKH');
  const [customPath, setCustomPath] = useState("m/44'/0'/0'/0");
  const [inputMode, setInputMode] = useState<InputMode>('mnemonic');
  const [manualSeed, setManualSeed] = useState('');
  const [manualRootKey, setManualRootKey] = useState('');

  const coin = useMemo(() => COINS.find(c => c.id === coinId) || COINS[0], [coinId]);
  const coinType = coin.coinType;

  useEffect(() => {
    if (bipType === 'BIP32' || bipType === 'BIP141') return;
    if (!coin.bipTypes.includes(bipType)) {
      if (coin.bipTypes.includes('BIP84')) setBipType('BIP84');
      else if (coin.bipTypes.includes('BIP44')) setBipType('BIP44');
      else setBipType(coin.bipTypes[0] as BipType);
    }
  }, [coinId, bipType, coin]);

  const isValid = useMemo(() => {
    if (inputMode === 'seed') return /^[0-9a-fA-F]{128}$/.test(manualSeed.trim());
    if (inputMode === 'rootkey') return manualRootKey.trim().startsWith('xprv');
    if (!mnemonic.trim()) return false;
    return bip39.validate(mnemonic, wordlistLang);
  }, [mnemonic, wordlistLang, inputMode, manualSeed, manualRootKey]);

  const entropy = useMemo(() => {
    if (inputMode !== 'mnemonic' || !isValid) return '';
    try { return bip39.toEntropy(mnemonic, wordlistLang); } catch { return ''; }
  }, [mnemonic, isValid, wordlistLang, inputMode]);

  const entropyBinary = useMemo(() => {
    if (!entropy) return '';
    return bip39.entropyToBinary(entropy);
  }, [entropy]);

  const seed = useMemo(() => {
    if (inputMode === 'seed') return manualSeed.trim();
    if (inputMode === 'rootkey') return ''; // root key mode skips seed
    if (!isValid) return '';
    try { return bytesToHex(bip39.toSeed(mnemonic, passphrase, pbkdf2Rounds)); } catch { return ''; }
  }, [mnemonic, passphrase, pbkdf2Rounds, isValid, inputMode, manualSeed]);

  const derivationConfig: DerivationConfig = useMemo(() => ({
    bipType, coinType, account, change, startIndex,
    count: addressCount, hardened,
    customPath: (bipType === 'BIP32' || bipType === 'BIP141') ? customPath : undefined,
    bip141Script: bipType === 'BIP141' ? bip141Script : undefined,
  }), [bipType, coinType, account, change, startIndex, addressCount, hardened, customPath, bip141Script]);

  const { rootKey, xpub, xprv } = useMemo(() => {
    if (inputMode === 'rootkey' && isValid) {
      try {
        return deriveFromRootKey(manualRootKey.trim(), derivationConfig);
      } catch { return { rootKey: manualRootKey.trim(), xpub: '', xprv: '' }; }
    }
    if (!seed) return { rootKey: '', xpub: '', xprv: '' };
    try {
      const seedBytes = new Uint8Array(seed.match(/.{2}/g)!.map(b => parseInt(b, 16)));
      return getExtendedKeys(seedBytes, derivationConfig);
    } catch { return { rootKey: '', xpub: '', xprv: '' }; }
  }, [seed, derivationConfig, inputMode, manualRootKey, isValid]);

  const addresses = useMemo(() => {
    if (inputMode === 'rootkey' && isValid) {
      try {
        const { addresses: addrs } = deriveFromRootKey(manualRootKey.trim(), derivationConfig);
        return addrs || [];
      } catch { return []; }
    }
    if (!seed) return [];
    try {
      const seedBytes = new Uint8Array(seed.match(/.{2}/g)!.map(b => parseInt(b, 16)));
      return deriveAddresses(seedBytes, derivationConfig);
    } catch { return []; }
  }, [seed, derivationConfig, inputMode, manualRootKey, isValid]);

  const generate = useCallback(() => {
    setInputMode('mnemonic');
    const m = bip39.generate(wordCount, wordlistLang);
    setMnemonicRaw(m);
  }, [wordCount, wordlistLang]);

  useEffect(() => {
    if (!mnemonic) {
      const m = bip39.generate(wordCount, wordlistLang);
      setMnemonicRaw(m);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setMnemonic = useCallback((m: string) => {
    setMnemonicRaw(m);
    if (inputMode !== 'mnemonic') setInputMode('mnemonic');
  }, [inputMode]);

  const setEntropyHex = useCallback((hex: string) => {
    try {
      const m = bip39.fromEntropy(hex, wordlistLang);
      setMnemonicRaw(m);
    } catch { /* ignore */ }
  }, [wordlistLang]);

  const loadMore = useCallback(() => {
    setAddressCount(c => c + 20);
  }, []);

  useEffect(() => {
    bip39.loadWordlist(wordlistLang).then(() => {
      if (mnemonic.trim()) {
        try {
          let entropyHex = '';
          for (const lang of Object.keys(bip39.getWordlistCache())) {
            try { entropyHex = bip39.toEntropy(mnemonic, lang); break; } catch { /* */ }
          }
          if (entropyHex) {
            const converted = bip39.fromEntropy(entropyHex, wordlistLang);
            setMnemonicRaw(converted);
          }
        } catch { /* */ }
      }
    });
  }, [wordlistLang]); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    mnemonic, setMnemonic,
    wordCount, setWordCount,
    wordlistLang, setWordlistLang,
    passphrase, setPassphrase,
    pbkdf2Rounds, setPbkdf2Rounds,
    isValid,
    entropy, entropyBinary, setEntropyHex,
    seed, rootKey, xpub, xprv,
    bipType, setBipType,
    coinId, setCoinId, coinType,
    account, setAccount,
    change, setChange,
    addresses, addressCount, setAddressCount,
    startIndex, setStartIndex,
    hardened, setHardened,
    bip141Script, setBip141Script,
    customPath, setCustomPath,
    generate, loadMore,
    inputMode, setInputMode,
    manualSeed, setManualSeed,
    manualRootKey, setManualRootKey,
  };
}
