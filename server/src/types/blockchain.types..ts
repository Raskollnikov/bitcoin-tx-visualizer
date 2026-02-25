export interface Vin {
  prev_out?: {
    addr?: string;
    value?: number;
    spent?: boolean;
    script?: string;
  };
  sequence?: number;
  witness?: string;
  script?: string;
}

export interface Vout {
  value: number;
  addr?: string;
  script: string;
  spent?: boolean;
}

export interface Transaction {
  txid: string;
  version: number;
  locktime: number;
  vin: Vin[];
  vout: Vout[];
  size: number;
  weight: number;
  fee: number;
  status: {
    confirmed: boolean;
    block_height?: number;
    block_hash?: string;
    block_time?: number;
  };
}

export interface AddressStats {
  tx_count: number;
  funded_txo_count: number;
  funded_txo_sum: number;
  spent_txo_count: number;
  spent_txo_sum: number;
}

export interface MempoolAddressSummary {
  address: string;
  chain_stats: AddressStats;
  mempool_stats: AddressStats;
}

export interface AddressTx {
  txid: string;
  vin: Vin[];
  vout: Vout[];
  size: number;
  weight: number;
  fee?: number;
  status: {
    confirmed: boolean;
    block_height?: number;
    block_hash?: string;
    block_time?: number;
  };
}

export interface Block {
  id: string;
  height: number;
  version: number;
  timestamp: number;
  tx_count: number;
  size: number;
  weight: number;
  merkle_root: string;
  previous_block_hash: string;
  nonce: number;
  bits: number;
  difficulty: number;
}
