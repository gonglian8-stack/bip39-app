export interface Coin {
  id: string;
  name: string;
  symbol: string;
  coinType: number;  // SLIP44 coin type
  bipTypes: string[];  // Supported BIP types
  network?: 'mainnet' | 'testnet';
}

export const COINS: Coin[] = [
  // === Major coins ===
  { id: 'btc', name: 'Bitcoin', symbol: 'BTC', coinType: 0, bipTypes: ['BIP44', 'BIP49', 'BIP84', 'BIP86'] },
  { id: 'btc-test', name: 'Bitcoin Testnet', symbol: 'tBTC', coinType: 1, bipTypes: ['BIP44', 'BIP49', 'BIP84', 'BIP86'], network: 'testnet' },
  { id: 'eth', name: 'Ethereum', symbol: 'ETH', coinType: 60, bipTypes: ['BIP44'] },
  { id: 'ltc', name: 'Litecoin', symbol: 'LTC', coinType: 2, bipTypes: ['BIP44', 'BIP49', 'BIP84'] },
  { id: 'doge', name: 'Dogecoin', symbol: 'DOGE', coinType: 3, bipTypes: ['BIP44'] },
  { id: 'bch', name: 'Bitcoin Cash', symbol: 'BCH', coinType: 145, bipTypes: ['BIP44'] },
  { id: 'dash', name: 'Dash', symbol: 'DASH', coinType: 5, bipTypes: ['BIP44'] },
  { id: 'zec', name: 'Zcash', symbol: 'ZEC', coinType: 133, bipTypes: ['BIP44'] },
  { id: 'xrp', name: 'Ripple', symbol: 'XRP', coinType: 144, bipTypes: ['BIP44'] },

  // === Layer 1 ===
  { id: 'sol', name: 'Solana', symbol: 'SOL', coinType: 501, bipTypes: ['BIP44'] },
  { id: 'trx', name: 'Tron', symbol: 'TRX', coinType: 195, bipTypes: ['BIP44'] },
  { id: 'atom', name: 'Cosmos', symbol: 'ATOM', coinType: 118, bipTypes: ['BIP44'] },
  { id: 'dot', name: 'Polkadot', symbol: 'DOT', coinType: 354, bipTypes: ['BIP44'] },
  { id: 'ada', name: 'Cardano', symbol: 'ADA', coinType: 1815, bipTypes: ['BIP44'] },
  { id: 'xlm', name: 'Stellar', symbol: 'XLM', coinType: 148, bipTypes: ['BIP44'] },
  { id: 'ton', name: 'TON', symbol: 'TON', coinType: 607, bipTypes: ['BIP44'] },
  { id: 'near', name: 'NEAR', symbol: 'NEAR', coinType: 397, bipTypes: ['BIP44'] },
  { id: 'apt', name: 'Aptos', symbol: 'APT', coinType: 637, bipTypes: ['BIP44'] },
  { id: 'sui', name: 'Sui', symbol: 'SUI', coinType: 784, bipTypes: ['BIP44'] },
  { id: 'algo', name: 'Algorand', symbol: 'ALGO', coinType: 283, bipTypes: ['BIP44'] },
  { id: 'xtz', name: 'Tezos', symbol: 'XTZ', coinType: 1729, bipTypes: ['BIP44'] },
  { id: 'eos', name: 'EOS', symbol: 'EOS', coinType: 194, bipTypes: ['BIP44'] },
  { id: 'fil', name: 'Filecoin', symbol: 'FIL', coinType: 461, bipTypes: ['BIP44'] },
  { id: 'icp', name: 'Internet Computer', symbol: 'ICP', coinType: 223, bipTypes: ['BIP44'] },

  // === EVM Chains (coinType 60) ===
  { id: 'avax', name: 'Avalanche C-Chain', symbol: 'AVAX', coinType: 9000, bipTypes: ['BIP44'] },
  { id: 'matic', name: 'Polygon', symbol: 'MATIC', coinType: 60, bipTypes: ['BIP44'] },
  { id: 'bnb', name: 'BNB Smart Chain', symbol: 'BNB', coinType: 60, bipTypes: ['BIP44'] },
  { id: 'ftm', name: 'Fantom', symbol: 'FTM', coinType: 60, bipTypes: ['BIP44'] },
  { id: 'arb', name: 'Arbitrum', symbol: 'ARB', coinType: 60, bipTypes: ['BIP44'] },
  { id: 'op', name: 'Optimism', symbol: 'OP', coinType: 60, bipTypes: ['BIP44'] },
  { id: 'base', name: 'Base', symbol: 'BASE', coinType: 60, bipTypes: ['BIP44'] },
  { id: 'cro', name: 'Cronos', symbol: 'CRO', coinType: 60, bipTypes: ['BIP44'] },
  { id: 'etc', name: 'Ethereum Classic', symbol: 'ETC', coinType: 61, bipTypes: ['BIP44'] },
  { id: 'klay', name: 'Klaytn', symbol: 'KLAY', coinType: 8217, bipTypes: ['BIP44'] },
  { id: 'celo', name: 'Celo', symbol: 'CELO', coinType: 52752, bipTypes: ['BIP44'] },
  { id: 'glmr', name: 'Moonbeam', symbol: 'GLMR', coinType: 60, bipTypes: ['BIP44'] },
  { id: 'movr', name: 'Moonriver', symbol: 'MOVR', coinType: 60, bipTypes: ['BIP44'] },
  { id: 'one', name: 'Harmony', symbol: 'ONE', coinType: 1023, bipTypes: ['BIP44'] },
  { id: 'metis', name: 'Metis', symbol: 'METIS', coinType: 60, bipTypes: ['BIP44'] },
  { id: 'zksync', name: 'zkSync Era', symbol: 'ZK', coinType: 60, bipTypes: ['BIP44'] },
  { id: 'linea', name: 'Linea', symbol: 'ETH', coinType: 60, bipTypes: ['BIP44'] },
  { id: 'scroll', name: 'Scroll', symbol: 'ETH', coinType: 60, bipTypes: ['BIP44'] },
  { id: 'manta', name: 'Manta Pacific', symbol: 'ETH', coinType: 60, bipTypes: ['BIP44'] },
  { id: 'blast', name: 'Blast', symbol: 'ETH', coinType: 60, bipTypes: ['BIP44'] },

  // === Privacy ===
  { id: 'xmr', name: 'Monero', symbol: 'XMR', coinType: 128, bipTypes: ['BIP44'] },
  { id: 'firo', name: 'Firo', symbol: 'FIRO', coinType: 136, bipTypes: ['BIP44'] },
  { id: 'dcr', name: 'Decred', symbol: 'DCR', coinType: 42, bipTypes: ['BIP44'] },

  // === Bitcoin forks ===
  { id: 'btg', name: 'Bitcoin Gold', symbol: 'BTG', coinType: 156, bipTypes: ['BIP44', 'BIP49', 'BIP84'] },
  { id: 'bsv', name: 'Bitcoin SV', symbol: 'BSV', coinType: 236, bipTypes: ['BIP44'] },
  { id: 'dgb', name: 'DigiByte', symbol: 'DGB', coinType: 20, bipTypes: ['BIP44', 'BIP49', 'BIP84'] },
  { id: 'vtc', name: 'Vertcoin', symbol: 'VTC', coinType: 28, bipTypes: ['BIP44', 'BIP49', 'BIP84'] },
  { id: 'mona', name: 'MonaCoin', symbol: 'MONA', coinType: 22, bipTypes: ['BIP44', 'BIP49', 'BIP84'] },
  { id: 'nmc', name: 'Namecoin', symbol: 'NMC', coinType: 7, bipTypes: ['BIP44'] },
  { id: 'ppc', name: 'Peercoin', symbol: 'PPC', coinType: 6, bipTypes: ['BIP44'] },
  { id: 'via', name: 'Viacoin', symbol: 'VIA', coinType: 14, bipTypes: ['BIP44', 'BIP49', 'BIP84'] },
  { id: 'rdd', name: 'ReddCoin', symbol: 'RDD', coinType: 4, bipTypes: ['BIP44'] },
  { id: 'grs', name: 'Groestlcoin', symbol: 'GRS', coinType: 17, bipTypes: ['BIP44', 'BIP49', 'BIP84'] },

  // === DeFi / Misc ===
  { id: 'hbar', name: 'Hedera', symbol: 'HBAR', coinType: 3030, bipTypes: ['BIP44'] },
  { id: 'egld', name: 'MultiversX', symbol: 'EGLD', coinType: 508, bipTypes: ['BIP44'] },
  { id: 'vet', name: 'VeChain', symbol: 'VET', coinType: 818, bipTypes: ['BIP44'] },
  { id: 'theta', name: 'Theta', symbol: 'THETA', coinType: 500, bipTypes: ['BIP44'] },
  { id: 'iota', name: 'IOTA', symbol: 'IOTA', coinType: 4218, bipTypes: ['BIP44'] },
  { id: 'kas', name: 'Kaspa', symbol: 'KAS', coinType: 111111, bipTypes: ['BIP44'] },
  { id: 'xem', name: 'NEM', symbol: 'XEM', coinType: 43, bipTypes: ['BIP44'] },
  { id: 'waves', name: 'Waves', symbol: 'WAVES', coinType: 5741564, bipTypes: ['BIP44'] },
  { id: 'neo', name: 'NEO', symbol: 'NEO', coinType: 888, bipTypes: ['BIP44'] },
  { id: 'qtum', name: 'Qtum', symbol: 'QTUM', coinType: 2301, bipTypes: ['BIP44'] },
  { id: 'ont', name: 'Ontology', symbol: 'ONT', coinType: 1024, bipTypes: ['BIP44'] },
  { id: 'zen', name: 'Horizen', symbol: 'ZEN', coinType: 121, bipTypes: ['BIP44'] },
  { id: 'sc', name: 'Siacoin', symbol: 'SC', coinType: 1991, bipTypes: ['BIP44'] },
  { id: 'lsk', name: 'Lisk', symbol: 'LSK', coinType: 134, bipTypes: ['BIP44'] },
  { id: 'nano', name: 'Nano', symbol: 'NANO', coinType: 165, bipTypes: ['BIP44'] },
  { id: 'rvn', name: 'Ravencoin', symbol: 'RVN', coinType: 175, bipTypes: ['BIP44'] },
  { id: 'zil', name: 'Zilliqa', symbol: 'ZIL', coinType: 313, bipTypes: ['BIP44'] },
  { id: 'icx', name: 'ICON', symbol: 'ICX', coinType: 74, bipTypes: ['BIP44'] },
  { id: 'stx', name: 'Stacks', symbol: 'STX', coinType: 5757, bipTypes: ['BIP44'] },
  { id: 'ar', name: 'Arweave', symbol: 'AR', coinType: 472, bipTypes: ['BIP44'] },
  { id: 'flux', name: 'Flux', symbol: 'FLUX', coinType: 19167, bipTypes: ['BIP44'] },
  { id: 'kda', name: 'Kadena', symbol: 'KDA', coinType: 626, bipTypes: ['BIP44'] },
  { id: 'rose', name: 'Oasis', symbol: 'ROSE', coinType: 474, bipTypes: ['BIP44'] },
  { id: 'mina', name: 'Mina', symbol: 'MINA', coinType: 12586, bipTypes: ['BIP44'] },
  { id: 'ckb', name: 'Nervos', symbol: 'CKB', coinType: 309, bipTypes: ['BIP44'] },
  { id: 'sys', name: 'Syscoin', symbol: 'SYS', coinType: 57, bipTypes: ['BIP44', 'BIP84'] },
  { id: 'xdc', name: 'XDC Network', symbol: 'XDC', coinType: 550, bipTypes: ['BIP44'] },
  { id: 'ela', name: 'Elastos', symbol: 'ELA', coinType: 2305, bipTypes: ['BIP44'] },
  { id: 'fio', name: 'FIO', symbol: 'FIO', coinType: 235, bipTypes: ['BIP44'] },
  { id: 'rune', name: 'THORChain', symbol: 'RUNE', coinType: 931, bipTypes: ['BIP44'] },
  { id: 'osmo', name: 'Osmosis', symbol: 'OSMO', coinType: 118, bipTypes: ['BIP44'] },
  { id: 'inj', name: 'Injective', symbol: 'INJ', coinType: 60, bipTypes: ['BIP44'] },
  { id: 'sei', name: 'Sei', symbol: 'SEI', coinType: 118, bipTypes: ['BIP44'] },
  { id: 'tia', name: 'Celestia', symbol: 'TIA', coinType: 118, bipTypes: ['BIP44'] },
  { id: 'dym', name: 'Dymension', symbol: 'DYM', coinType: 60, bipTypes: ['BIP44'] },

  // === Testnets ===
  { id: 'ltc-test', name: 'Litecoin Testnet', symbol: 'tLTC', coinType: 1, bipTypes: ['BIP44', 'BIP49', 'BIP84'], network: 'testnet' },
  { id: 'doge-test', name: 'Dogecoin Testnet', symbol: 'tDOGE', coinType: 1, bipTypes: ['BIP44'], network: 'testnet' },
  { id: 'eth-test', name: 'Ethereum Sepolia', symbol: 'SepoliaETH', coinType: 1, bipTypes: ['BIP44'], network: 'testnet' },
];

export function getCoinById(id: string): Coin | undefined {
  return COINS.find(c => c.id === id);
}

export function getDefaultBipType(coin: Coin): string {
  if (coin.bipTypes.includes('BIP84')) return 'BIP84';
  return coin.bipTypes[0] || 'BIP44';
}
