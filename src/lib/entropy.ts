/**
 * Entropy processing module
 * Supports 6 input types matching Ian Coleman + enhancements
 */
import { sha256 } from '@noble/hashes/sha2.js';
import { bytesToHex } from '@noble/hashes/utils.js';

export type EntropyType = 'binary' | 'base6' | 'dice' | 'base10' | 'hex' | 'card';

export interface EntropyDetails {
  type: EntropyType;
  raw: string;            // Raw user input
  filtered: string;       // Valid chars only
  binaryStr: string;      // Full binary representation
  hexStr: string;         // Hex representation
  totalBits: number;      // Total entropy bits
  bitsPerEvent: number;   // Bits per input event
  eventCount: number;     // Number of valid events
  checksumBits: string;   // SHA-256 checksum bits
  wordIndexes: number[];  // 11-bit word indexes
  strength: EntropyStrength;
}

export interface EntropyStrength {
  bits: number;
  level: 'weak' | 'medium' | 'strong' | 'very-strong';
  crackTime: string;      // Human-readable crack time
}

// Bits per event for each type
const BITS_PER_EVENT: Record<EntropyType, number> = {
  binary: 1,        // 0-1: 1 bit
  base6: 2.585,     // 0-5: log2(6) ≈ 2.585
  dice: 2.585,      // 1-6: log2(6) ≈ 2.585
  base10: 3.322,    // 0-9: log2(10) ≈ 3.322
  hex: 4,           // 0-F: 4 bits
  card: 5.7,        // 52 cards: log2(52) ≈ 5.7
};

// Filter patterns for each type
const FILTERS: Record<EntropyType, RegExp> = {
  binary: /[^01]/g,
  base6: /[^0-5]/g,
  dice: /[^1-6]/g,
  base10: /[^0-9]/g,
  hex: /[^0-9a-fA-F]/g,
  card: /[^A2-9TJQKCDHS]/gi,
};

// Card values for deck tracking
const CARD_RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K'];
const CARD_SUITS = ['C', 'D', 'H', 'S'];

function parseCards(input: string): string[] {
  const cards: string[] = [];
  const upper = input.toUpperCase().replace(/10/g, 'T');
  let i = 0;
  while (i < upper.length) {
    const rank = upper[i];
    const suit = upper[i + 1];
    if (rank && suit && CARD_RANKS.includes(rank) && CARD_SUITS.includes(suit)) {
      cards.push(rank + suit);
      i += 2;
    } else {
      i++;
    }
  }
  return cards;
}

function filterInput(raw: string, type: EntropyType): string {
  if (type === 'card') {
    return parseCards(raw).join('');
  }
  return raw.replace(FILTERS[type], '');
}

function getEventCount(filtered: string, type: EntropyType): number {
  if (type === 'card') return filtered.length / 2;
  return filtered.length;
}

/**
 * Convert any entropy input to raw binary string
 */
function toBinaryString(filtered: string, type: EntropyType): string {
  switch (type) {
    case 'binary':
      return filtered;
    case 'base6':
      return filtered.split('').map(c => {
        const n = parseInt(c);
        // Use base conversion: each base6 digit maps to ~2.585 bits
        // For clean BIP39 compat, accumulate as big number
        return n.toString(2).padStart(3, '0'); // Approximate with 3 bits
      }).join('');
    case 'dice':
      return filtered.split('').map(c => {
        const n = parseInt(c) - 1; // Convert 1-6 to 0-5
        return n.toString(2).padStart(3, '0');
      }).join('');
    case 'base10':
      return filtered.split('').map(c => {
        return parseInt(c).toString(2).padStart(4, '0');
      }).join('');
    case 'hex':
      return filtered.split('').map(c => {
        return parseInt(c, 16).toString(2).padStart(4, '0');
      }).join('');
    case 'card': {
      const cards = parseCards(filtered);
      // Each card: rank (13 values) + suit (4 values) = 52 values ≈ 5.7 bits
      // Use SHA-256 hash for proper entropy extraction
      return cards.map(card => {
        const rankIdx = CARD_RANKS.indexOf(card[0]);
        const suitIdx = CARD_SUITS.indexOf(card[1]);
        const val = rankIdx * 4 + suitIdx; // 0-51
        return val.toString(2).padStart(6, '0');
      }).join('');
    }
    default:
      return '';
  }
}

/**
 * Convert binary string to hex (padded to 4-bit boundary)
 */
function binaryToHex(bin: string): string {
  // Pad to multiple of 4
  const padded = bin.padEnd(Math.ceil(bin.length / 4) * 4, '0');
  let hex = '';
  for (let i = 0; i < padded.length; i += 4) {
    hex += parseInt(padded.slice(i, i + 4), 2).toString(16);
  }
  return hex;
}

/**
 * Get valid entropy hex for BIP39 (must be 128/160/192/224/256 bits)
 * Uses SHA-256 to derive clean entropy from arbitrary input
 */
export function toValidEntropyHex(raw: string, type: EntropyType, targetBits: number = 128): string {
  const filtered = filterInput(raw, type);
  if (!filtered) return '';

  if (type === 'hex') {
    // For hex input, use directly if valid length
    const bits = filtered.length * 4;
    if ([128, 160, 192, 224, 256].includes(bits)) {
      return filtered.toLowerCase();
    }
  }

  // For other types or non-standard hex lengths, hash to get clean entropy
  const binary = toBinaryString(filtered, type);
  if (!binary) return '';

  // Hash to get deterministic entropy of correct length
  const hash = sha256(new TextEncoder().encode(binary));
  const needed = targetBits / 8;
  return bytesToHex(hash.slice(0, needed));
}

/**
 * Compute detailed entropy analysis
 */
export function analyzeEntropy(raw: string, type: EntropyType): EntropyDetails | null {
  const filtered = filterInput(raw, type);
  if (!filtered) return null;

  const eventCount = getEventCount(filtered, type);
  const bitsPerEvent = BITS_PER_EVENT[type];
  const totalBits = Math.floor(eventCount * bitsPerEvent);
  const binaryStr = toBinaryString(filtered, type);
  const hexStr = binaryToHex(binaryStr);

  // Compute SHA-256 checksum
  const entropyBytes = new Uint8Array(
    hexStr.match(/.{2}/g)?.map(b => parseInt(b, 16)) || []
  );
  const checksumFull = bytesToHex(sha256(entropyBytes));
  const checksumBinaryFull = checksumFull.split('').map(c =>
    parseInt(c, 16).toString(2).padStart(4, '0')
  ).join('');
  // Checksum bits = entropy bits / 32
  const checksumLen = Math.floor(totalBits / 32);
  const checksumBits = checksumBinaryFull.slice(0, checksumLen);

  // Word indexes (11-bit chunks)
  const fullBinary = binaryStr.slice(0, Math.floor(binaryStr.length / 11) * 11) + checksumBits;
  const wordIndexes: number[] = [];
  for (let i = 0; i + 11 <= fullBinary.length; i += 11) {
    wordIndexes.push(parseInt(fullBinary.slice(i, i + 11), 2));
  }

  // Strength assessment
  const strength = assessStrength(totalBits);

  return {
    type,
    raw,
    filtered,
    binaryStr,
    hexStr,
    totalBits,
    bitsPerEvent,
    eventCount,
    checksumBits,
    wordIndexes,
    strength,
  };
}

function assessStrength(bits: number): EntropyStrength {
  let level: EntropyStrength['level'];
  if (bits < 80) level = 'weak';
  else if (bits < 128) level = 'medium';
  else if (bits < 192) level = 'strong';
  else level = 'very-strong';

  // Approximate crack time at 10^12 attempts/sec
  const attempts = Math.pow(2, bits);
  const seconds = attempts / 1e12;
  let crackTime: string;
  if (seconds < 1) crackTime = '< 1 second';
  else if (seconds < 60) crackTime = `${Math.round(seconds)} seconds`;
  else if (seconds < 3600) crackTime = `${Math.round(seconds / 60)} minutes`;
  else if (seconds < 86400) crackTime = `${Math.round(seconds / 3600)} hours`;
  else if (seconds < 365.25 * 86400) crackTime = `${Math.round(seconds / 86400)} days`;
  else if (seconds < 365.25 * 86400 * 1e6) crackTime = `${(seconds / (365.25 * 86400)).toExponential(1)} years`;
  else crackTime = `${(seconds / (365.25 * 86400)).toExponential(1)} years`;

  return { bits, level, crackTime };
}

export const ENTROPY_TYPES: { id: EntropyType; label: string; labelZh: string; placeholder: string }[] = [
  { id: 'binary', label: 'Binary [0-1]', labelZh: '二进制 [0-1]', placeholder: '01101001...' },
  { id: 'base6', label: 'Base 6 [0-5]', labelZh: 'Base6 [0-5]', placeholder: '012345012345...' },
  { id: 'dice', label: 'Dice [1-6]', labelZh: '骰子 [1-6]', placeholder: '1634526152...' },
  { id: 'base10', label: 'Base 10 [0-9]', labelZh: '十进制 [0-9]', placeholder: '7294058163...' },
  { id: 'hex', label: 'Hexadecimal [0-9A-F]', labelZh: '十六进制 [0-9A-F]', placeholder: 'a3f5b9c1...' },
  { id: 'card', label: 'Card [A2-9TJQK][CDHS]', labelZh: '扑克牌', placeholder: 'ACTS2H3D...' },
];
