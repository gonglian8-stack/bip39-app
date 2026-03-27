/**
 * BIP85 - Deterministic Entropy from BIP32 Keychains
 * Derives child mnemonics, WIF keys, hex entropy from a master seed
 */
import { HDKey } from '@scure/bip32';
import { hmac } from '@noble/hashes/hmac.js';
import { sha512 } from '@noble/hashes/sha2.js';
import { bytesToHex } from '@noble/hashes/utils.js';
import { entropyToMnemonic } from '@scure/bip39';
import { wordlist as english } from '@scure/bip39/wordlists/english.js';

export type Bip85App = 'bip39' | 'wif' | 'xprv' | 'hex';

export interface Bip85Config {
  app: Bip85App;
  language: number;    // 0 = English (only English supported currently)
  mnemonicLength: 12 | 18 | 24;
  index: number;
  bytes: number;       // For hex output
}

const STRENGTH_MAP: Record<number, number> = { 12: 16, 18: 24, 24: 32 };

/**
 * BIP85 derivation
 * Path: m/83696968'/<app>'/<params>'/<index>'
 */
export function deriveBip85(seed: Uint8Array, config: Bip85Config): string {
  const master = HDKey.fromMasterSeed(seed);

  let path: string;
  let outputBytes: number;

  switch (config.app) {
    case 'bip39':
      // m/83696968'/39'/<language>'/<words>'/<index>'
      path = `m/83696968'/39'/${config.language}'/${config.mnemonicLength}'/${config.index}'`;
      outputBytes = STRENGTH_MAP[config.mnemonicLength] || 16;
      break;
    case 'wif':
      // m/83696968'/2'/<index>'
      path = `m/83696968'/2'/${config.index}'`;
      outputBytes = 32;
      break;
    case 'xprv':
      // m/83696968'/32'/<index>'
      path = `m/83696968'/32'/${config.index}'`;
      outputBytes = 64;
      break;
    case 'hex':
      // m/83696968'/128169'/<num_bytes>'/<index>'
      path = `m/83696968'/128169'/${config.bytes}'/${config.index}'`;
      outputBytes = config.bytes;
      break;
    default:
      return '';
  }

  const child = master.derive(path);
  if (!child.privateKey) return '';

  // HMAC-SHA512 with key "bip-entropy-from-k"
  const keyBytes = new TextEncoder().encode('bip-entropy-from-k');
  const entropy = hmac(sha512, keyBytes, child.privateKey);
  const trimmed = entropy.slice(0, outputBytes);

  switch (config.app) {
    case 'bip39':
      return entropyToMnemonic(trimmed, english);
    case 'wif':
      return bytesToHex(trimmed);
    case 'xprv': {
      const childKey = HDKey.fromMasterSeed(trimmed);
      return childKey.privateExtendedKey;
    }
    case 'hex':
      return bytesToHex(trimmed);
    default:
      return '';
  }
}
