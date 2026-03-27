import { HDKey } from '@scure/bip32';
import { sha256 } from '@noble/hashes/sha2.js';
import { ripemd160 } from '@noble/hashes/legacy.js';
import { keccak_256 } from '@noble/hashes/sha3.js';
import { bytesToHex } from '@noble/hashes/utils.js';
import { Point } from '@noble/secp256k1';

// Bech32 encoding for segwit addresses
const BECH32_CHARSET = 'qpzry9x8gf2tvdw0s3jn54khce6mua7l';

function bech32Polymod(values: number[]): number {
  const GEN = [0x3b6a57b2, 0x26508e6d, 0x1ea119fa, 0x3d4233dd, 0x2a1462b3];
  let chk = 1;
  for (const v of values) {
    const b = chk >> 25;
    chk = ((chk & 0x1ffffff) << 5) ^ v;
    for (let i = 0; i < 5; i++) {
      if ((b >> i) & 1) chk ^= GEN[i];
    }
  }
  return chk;
}

function bech32HrpExpand(hrp: string): number[] {
  const ret: number[] = [];
  for (let i = 0; i < hrp.length; i++) ret.push(hrp.charCodeAt(i) >> 5);
  ret.push(0);
  for (let i = 0; i < hrp.length; i++) ret.push(hrp.charCodeAt(i) & 31);
  return ret;
}

function bech32CreateChecksum(hrp: string, data: number[], version: 'bech32' | 'bech32m'): number[] {
  const CONST = version === 'bech32m' ? 0x2bc830a3 : 1;
  const values = bech32HrpExpand(hrp).concat(data).concat([0, 0, 0, 0, 0, 0]);
  const polymod = bech32Polymod(values) ^ CONST;
  const ret: number[] = [];
  for (let i = 0; i < 6; i++) ret.push((polymod >> (5 * (5 - i))) & 31);
  return ret;
}

function bech32Encode(hrp: string, data: number[], version: 'bech32' | 'bech32m'): string {
  const checksum = bech32CreateChecksum(hrp, data, version);
  let ret = hrp + '1';
  for (const d of data.concat(checksum)) ret += BECH32_CHARSET[d];
  return ret;
}

function convertBits(data: Uint8Array, fromBits: number, toBits: number, pad: boolean): number[] {
  let acc = 0;
  let bits = 0;
  const ret: number[] = [];
  const maxv = (1 << toBits) - 1;
  for (let idx = 0; idx < data.length; idx++) {
    const value = data[idx];
    acc = (acc << fromBits) | value;
    bits += fromBits;
    while (bits >= toBits) {
      bits -= toBits;
      ret.push((acc >> bits) & maxv);
    }
  }
  if (pad) {
    if (bits > 0) ret.push((acc << (toBits - bits)) & maxv);
  }
  return ret;
}

function hash160(data: Uint8Array): Uint8Array {
  return ripemd160(sha256(data));
}

// Base58Check encoding
const BASE58_ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';

function base58check(payload: Uint8Array): string {
  const checksum = sha256(sha256(payload)).slice(0, 4);
  const full = new Uint8Array(payload.length + 4);
  full.set(payload);
  full.set(checksum, payload.length);

  let num = BigInt('0x' + bytesToHex(full));
  let str = '';
  while (num > 0n) {
    const mod = Number(num % 58n);
    str = BASE58_ALPHABET[mod] + str;
    num = num / 58n;
  }
  for (let i = 0; i < full.length; i++) {
    if (full[i] === 0) str = '1' + str;
    else break;
  }
  return str;
}

// WIF encoding for private key
function toWIF(privkey: Uint8Array, compressed: boolean = true): string {
  const prefix = new Uint8Array([0x80]);
  let payload: Uint8Array;
  if (compressed) {
    payload = new Uint8Array(prefix.length + privkey.length + 1);
    payload.set(prefix);
    payload.set(privkey, 1);
    payload[payload.length - 1] = 0x01;
  } else {
    payload = new Uint8Array(prefix.length + privkey.length);
    payload.set(prefix);
    payload.set(privkey, 1);
  }
  return base58check(payload);
}

export type BipType = 'BIP44' | 'BIP49' | 'BIP84' | 'BIP86' | 'BIP141' | 'BIP32';

export type Bip141ScriptType = 'P2WPKH' | 'P2WPKH-P2SH' | 'P2WSH' | 'P2WSH-P2SH';

export interface DerivedAddress {
  path: string;
  address: string;
  publicKey: string;
  privateKey: string;
  wif: string;
}

export interface DerivationConfig {
  bipType: BipType;
  coinType: number;   // 0 = BTC, 60 = ETH, etc.
  account: number;
  change: number;      // 0 = external, 1 = internal
  startIndex: number;
  count: number;
  hardened?: boolean;  // Use hardened child indexes
  customPath?: string; // For BIP32
  bip141Script?: Bip141ScriptType; // For BIP141
}

function getBasePath(config: DerivationConfig): string {
  switch (config.bipType) {
    case 'BIP44': return `m/44'/${config.coinType}'/${config.account}'/${config.change}`;
    case 'BIP49': return `m/49'/${config.coinType}'/${config.account}'/${config.change}`;
    case 'BIP84': return `m/84'/${config.coinType}'/${config.account}'/${config.change}`;
    case 'BIP86': return `m/86'/${config.coinType}'/${config.account}'/${config.change}`;
    case 'BIP141': return config.customPath || `m/0`;
    case 'BIP32': return config.customPath || `m/44'/0'/0'/0`;
    default: return `m/44'/${config.coinType}'/${config.account}'/${config.change}`;
  }
}

function pubkeyToP2PKH(pubkey: Uint8Array): string {
  const h = hash160(pubkey);
  const payload = new Uint8Array(1 + h.length);
  payload[0] = 0x00; // mainnet
  payload.set(h, 1);
  return base58check(payload);
}

function pubkeyToP2SH_P2WPKH(pubkey: Uint8Array): string {
  const h = hash160(pubkey);
  // Create witness script: OP_0 <20-byte-hash>
  const witnessScript = new Uint8Array(22);
  witnessScript[0] = 0x00;
  witnessScript[1] = 0x14;
  witnessScript.set(h, 2);
  // Hash the witness script
  const scriptHash = hash160(witnessScript);
  const payload = new Uint8Array(1 + scriptHash.length);
  payload[0] = 0x05; // P2SH mainnet
  payload.set(scriptHash, 1);
  return base58check(payload);
}

function pubkeyToP2WPKH(pubkey: Uint8Array): string {
  const h = hash160(pubkey);
  const words = [0, ...convertBits(h, 8, 5, true)];
  return bech32Encode('bc', words, 'bech32');
}

function pubkeyToP2TR(pubkey: Uint8Array): string {
  // For Taproot, use x-only pubkey (32 bytes, strip the prefix byte)
  const xonly = pubkey.length === 33 ? pubkey.slice(1) : pubkey;
  const words = [1, ...convertBits(xonly, 8, 5, true)];
  return bech32Encode('bc', words, 'bech32m');
}

function pubkeyToP2WSH(pubkey: Uint8Array): string {
  // 1-of-1 multisig: OP_1 <pubkey> OP_1 OP_CHECKMULTISIG
  const script = new Uint8Array(pubkey.length + 4);
  script[0] = 0x51; // OP_1
  script[1] = pubkey.length;
  script.set(pubkey, 2);
  script[script.length - 2] = 0x51; // OP_1
  script[script.length - 1] = 0xae; // OP_CHECKMULTISIG
  const witnessHash = sha256(script);
  const words = [0, ...convertBits(witnessHash, 8, 5, true)];
  return bech32Encode('bc', words, 'bech32');
}

function pubkeyToP2WSH_P2SH(pubkey: Uint8Array): string {
  // P2WSH nested in P2SH
  const script = new Uint8Array(pubkey.length + 4);
  script[0] = 0x51;
  script[1] = pubkey.length;
  script.set(pubkey, 2);
  script[script.length - 2] = 0x51;
  script[script.length - 1] = 0xae;
  const witnessHash = sha256(script);
  // witness script: OP_0 <32-byte-hash>
  const witnessScript = new Uint8Array(34);
  witnessScript[0] = 0x00;
  witnessScript[1] = 0x20;
  witnessScript.set(witnessHash, 2);
  const scriptHash = hash160(witnessScript);
  const payload = new Uint8Array(1 + scriptHash.length);
  payload[0] = 0x05;
  payload.set(scriptHash, 1);
  return base58check(payload);
}

function pubkeyToAddress(pubkey: Uint8Array, bipType: BipType, bip141Script?: Bip141ScriptType): string {
  switch (bipType) {
    case 'BIP44': return pubkeyToP2PKH(pubkey);
    case 'BIP49': return pubkeyToP2SH_P2WPKH(pubkey);
    case 'BIP84': return pubkeyToP2WPKH(pubkey);
    case 'BIP86': return pubkeyToP2TR(pubkey);
    case 'BIP141':
      switch (bip141Script) {
        case 'P2WPKH': return pubkeyToP2WPKH(pubkey);
        case 'P2WPKH-P2SH': return pubkeyToP2SH_P2WPKH(pubkey);
        case 'P2WSH': return pubkeyToP2WSH(pubkey);
        case 'P2WSH-P2SH': return pubkeyToP2WSH_P2SH(pubkey);
        default: return pubkeyToP2WPKH(pubkey);
      }
    default: return pubkeyToP2PKH(pubkey);
  }
}

// ETH address from compressed public key using keccak256
function pubkeyToETH(compressedPubkey: Uint8Array): string {
  // Decompress the public key to get the full 65-byte uncompressed key
  const point = Point.fromHex(bytesToHex(compressedPubkey));
  const uncompressed = point.toHex(false); // 130 hex chars: 04 + x + y
  const uncompressedBytes = new Uint8Array(uncompressed.match(/.{2}/g)!.map(b => parseInt(b, 16)));
  // Keccak256 of the 64-byte public key (without 0x04 prefix)
  const hash = keccak_256(uncompressedBytes.slice(1));
  // Take last 20 bytes
  const addr = bytesToHex(hash.slice(12));
  return '0x' + toChecksumAddress(addr);
}

// EIP-55 checksum encoding
function toChecksumAddress(addr: string): string {
  const lower = addr.toLowerCase();
  const hash = bytesToHex(keccak_256(new TextEncoder().encode(lower)));
  let result = '';
  for (let i = 0; i < lower.length; i++) {
    if (parseInt(hash[i], 16) >= 8) {
      result += lower[i].toUpperCase();
    } else {
      result += lower[i];
    }
  }
  return result;
}

// Coins that use ETH-style addresses (EVM chains)
const EVM_COIN_TYPES = new Set([60, 9000]); // ETH, AVAX (and MATIC/BNB/FTM/ARB/OP share coinType 60)

// Determine if a coinType uses EVM-style addressing
function isEVMCoin(coinType: number): boolean {
  return EVM_COIN_TYPES.has(coinType);
}

export function deriveAddresses(seed: Uint8Array, config: DerivationConfig): DerivedAddress[] {
  const master = HDKey.fromMasterSeed(seed);
  const basePath = getBasePath(config);
  const results: DerivedAddress[] = [];
  const evm = isEVMCoin(config.coinType);

  for (let i = config.startIndex; i < config.startIndex + config.count; i++) {
    const indexStr = config.hardened ? `${i}'` : `${i}`;
    const path = config.bipType === 'BIP32' && config.customPath
      ? `${config.customPath}/${indexStr}`
      : `${basePath}/${indexStr}`;

    const child = master.derive(path);
    const pubkey = child.publicKey!;
    const privkey = child.privateKey!;

    let address: string;
    if (evm) {
      address = pubkeyToETH(pubkey);
    } else {
      address = pubkeyToAddress(pubkey, config.bipType, config.bip141Script);
    }

    results.push({
      path,
      address,
      publicKey: bytesToHex(pubkey),
      privateKey: bytesToHex(privkey),
      wif: evm ? bytesToHex(privkey) : toWIF(privkey),
    });
  }

  return results;
}

// Extended keys (xpub/xprv)
export function getExtendedKeys(seed: Uint8Array, config: DerivationConfig): {
  xpub: string;
  xprv: string;
  rootKey: string;
} {
  const master = HDKey.fromMasterSeed(seed);
  const rootKey = master.privateExtendedKey;

  // Derive to account level
  let accountPath: string;
  switch (config.bipType) {
    case 'BIP44': accountPath = `m/44'/${config.coinType}'/${config.account}'`; break;
    case 'BIP49': accountPath = `m/49'/${config.coinType}'/${config.account}'`; break;
    case 'BIP84': accountPath = `m/84'/${config.coinType}'/${config.account}'`; break;
    case 'BIP86': accountPath = `m/86'/${config.coinType}'/${config.account}'`; break;
    default: accountPath = `m/44'/${config.coinType}'/${config.account}'`;
  }

  const account = master.derive(accountPath);
  return {
    xpub: account.publicExtendedKey,
    xprv: account.privateExtendedKey,
    rootKey,
  };
}

// Derive from an xprv root key string
export function deriveFromRootKey(xprvStr: string, config: DerivationConfig): {
  rootKey: string;
  xpub: string;
  xprv: string;
  addresses: DerivedAddress[];
} {
  const master = HDKey.fromExtendedKey(xprvStr);
  const basePath = getBasePath(config);
  const evm = isEVMCoin(config.coinType);

  // Account-level extended keys
  let accountPath: string;
  switch (config.bipType) {
    case 'BIP44': accountPath = `m/44'/${config.coinType}'/${config.account}'`; break;
    case 'BIP49': accountPath = `m/49'/${config.coinType}'/${config.account}'`; break;
    case 'BIP84': accountPath = `m/84'/${config.coinType}'/${config.account}'`; break;
    case 'BIP86': accountPath = `m/86'/${config.coinType}'/${config.account}'`; break;
    default: accountPath = `m/44'/${config.coinType}'/${config.account}'`;
  }

  let xpub = '', xprv = '';
  try {
    const acc = master.derive(accountPath);
    xpub = acc.publicExtendedKey;
    xprv = acc.privateExtendedKey;
  } catch { /* root key might not support full path */ }

  const addresses: DerivedAddress[] = [];
  for (let i = config.startIndex; i < config.startIndex + config.count; i++) {
    const indexStr = config.hardened ? `${i}'` : `${i}`;
    const path = config.bipType === 'BIP32' && config.customPath
      ? `${config.customPath}/${indexStr}`
      : `${basePath}/${indexStr}`;

    try {
      const child = master.derive(path);
      const pubkey = child.publicKey!;
      const privkey = child.privateKey!;
      let address: string;
      if (evm) {
        address = pubkeyToETH(pubkey);
      } else {
        address = pubkeyToAddress(pubkey, config.bipType, config.bip141Script);
      }
      addresses.push({
        path, address,
        publicKey: bytesToHex(pubkey),
        privateKey: bytesToHex(privkey),
        wif: evm ? bytesToHex(privkey) : toWIF(privkey),
      });
    } catch { break; }
  }

  return { rootKey: xprvStr, xpub, xprv, addresses };
}
