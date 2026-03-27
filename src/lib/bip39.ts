import {
  generateMnemonic,
  validateMnemonic,
  mnemonicToSeedSync,
  mnemonicToEntropy,
  entropyToMnemonic,
} from '@scure/bip39';
import { wordlist as english } from '@scure/bip39/wordlists/english.js';
import { sha256 } from '@noble/hashes/sha2.js';
import { sha512 } from '@noble/hashes/sha2.js';
import { pbkdf2 } from '@noble/hashes/pbkdf2.js';
import { bytesToHex, hexToBytes } from '@noble/hashes/utils.js';

export type WordCount = 12 | 15 | 18 | 21 | 24;

const STRENGTH_MAP: Record<WordCount, number> = {
  12: 128,
  15: 160,
  18: 192,
  21: 224,
  24: 256,
};

// We only ship English wordlist in the bundle; others loaded dynamically
const wordlistCache: Record<string, string[]> = { english };

export function getWordlist(lang: string = 'english'): string[] {
  return wordlistCache[lang] || english;
}

export function getWordlistCache(): Record<string, string[]> {
  return wordlistCache;
}

const wordlistLoaders: Record<string, () => Promise<{ wordlist: string[] }>> = {
  english: () => import('@scure/bip39/wordlists/english.js'),
  czech: () => import('@scure/bip39/wordlists/czech.js'),
  french: () => import('@scure/bip39/wordlists/french.js'),
  italian: () => import('@scure/bip39/wordlists/italian.js'),
  japanese: () => import('@scure/bip39/wordlists/japanese.js'),
  korean: () => import('@scure/bip39/wordlists/korean.js'),
  portuguese: () => import('@scure/bip39/wordlists/portuguese.js'),
  spanish: () => import('@scure/bip39/wordlists/spanish.js'),
  chinese_simplified: () => import('@scure/bip39/wordlists/simplified-chinese.js'),
  chinese_traditional: () => import('@scure/bip39/wordlists/traditional-chinese.js'),
};

export async function loadWordlist(lang: string): Promise<string[]> {
  if (wordlistCache[lang]) return wordlistCache[lang];
  const loader = wordlistLoaders[lang];
  if (!loader) return english;
  try {
    const mod = await loader();
    wordlistCache[lang] = mod.wordlist;
    return mod.wordlist;
  } catch {
    return english;
  }
}

export function generate(wordCount: WordCount = 12, lang: string = 'english'): string {
  const wl = getWordlist(lang);
  return generateMnemonic(wl, STRENGTH_MAP[wordCount]);
}

export function validate(mnemonic: string, lang: string = 'english'): boolean {
  const wl = getWordlist(lang);
  return validateMnemonic(mnemonic.trim().toLowerCase(), wl);
}

export function toSeed(mnemonic: string, passphrase: string = '', rounds: number = 2048): Uint8Array {
  if (rounds === 2048) {
    return mnemonicToSeedSync(mnemonic.trim().toLowerCase(), passphrase);
  }
  // Custom PBKDF2 rounds
  const mnemonicBytes = new TextEncoder().encode(mnemonic.trim().toLowerCase().normalize('NFKD'));
  const salt = new TextEncoder().encode(('mnemonic' + passphrase).normalize('NFKD'));
  return pbkdf2(sha512, mnemonicBytes, salt, { c: rounds, dkLen: 64 });
}

export function toEntropy(mnemonic: string, lang: string = 'english'): string {
  const wl = getWordlist(lang);
  const entropy = mnemonicToEntropy(mnemonic.trim().toLowerCase(), wl);
  return bytesToHex(entropy);
}

export function fromEntropy(hex: string, lang: string = 'english'): string {
  const wl = getWordlist(lang);
  const bytes = hexToBytes(hex);
  return entropyToMnemonic(bytes, wl);
}

export function entropyToBinary(hex: string): string {
  return hex
    .split('')
    .map((c) => parseInt(c, 16).toString(2).padStart(4, '0'))
    .join('');
}

export function binaryToEntropy(bin: string): string {
  let hex = '';
  for (let i = 0; i < bin.length; i += 4) {
    hex += parseInt(bin.slice(i, i + 4), 2).toString(16);
  }
  return hex;
}

// Dice (1-6) to entropy: Base6 encoding
export function diceToEntropy(dice: string, bits: number = 128): string {
  // Use SHA-256 of the dice string, then take required bytes
  const hash = sha256(new TextEncoder().encode(dice));
  const needed = bits / 8;
  return bytesToHex(hash.slice(0, needed));
}

// Shannon entropy score (0-1 normalized for word count)
export function shannonEntropy(mnemonic: string): number {
  const words = mnemonic.trim().split(/\s+/);
  const freq: Record<string, number> = {};
  for (const w of words) {
    freq[w] = (freq[w] || 0) + 1;
  }
  let entropy = 0;
  const n = words.length;
  for (const count of Object.values(freq)) {
    const p = count / n;
    entropy -= p * Math.log2(p);
  }
  // Max possible entropy for n words from 2048 wordlist
  const maxEntropy = Math.log2(n);
  return maxEntropy > 0 ? entropy / maxEntropy : 0;
}

export const WORDLIST_LANGS = [
  { id: 'english', label: 'English', labelZh: '英语' },
  { id: 'chinese_simplified', label: 'Chinese Simplified', labelZh: '中文简体' },
  { id: 'chinese_traditional', label: 'Chinese Traditional', labelZh: '中文繁体' },
  { id: 'japanese', label: 'Japanese', labelZh: '日语' },
  { id: 'korean', label: 'Korean', labelZh: '韩语' },
  { id: 'spanish', label: 'Spanish', labelZh: '西班牙语' },
  { id: 'french', label: 'French', labelZh: '法语' },
  { id: 'italian', label: 'Italian', labelZh: '意大利语' },
  { id: 'czech', label: 'Czech', labelZh: '捷克语' },
  { id: 'portuguese', label: 'Portuguese', labelZh: '葡萄牙语' },
];

export const WORD_COUNTS: WordCount[] = [12, 15, 18, 21, 24];
