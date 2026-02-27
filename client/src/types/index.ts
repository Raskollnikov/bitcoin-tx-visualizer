export interface Prevout {
  scriptpubkey: string;
  scriptpubkey_type: string;
  scriptpubkey_address?: string;
  value?: number;
}

export interface Vin {
  txid: string;
  vout: number;
  is_coinbase: boolean;
  scriptsig: string;
  sequence: number;
  witness?: string[];
  prevout?: Prevout | null;
}

export interface Vout {
  scriptpubkey: string;
  scriptpubkey_type: string;
  scriptpubkey_address?: string;
  value: number;
}

export interface TxStatus {
  confirmed: boolean;
  block_height?: number;
  block_hash?: string;
  block_time?: number;
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
  status: TxStatus;
  totalInputValue?: number;
  totalOutputValue?: number;
  isCoinbase?: boolean;
}

export type AddressTx = Transaction;

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

export interface AddressPageData {
  address: string;
  balance: number;
  total_received: number;
  total_sent: number;
  tx_count: number;
  mempool_balance: number;
  mempool_tx_count: number;
  recent_txs: Transaction[];
  next_after_txid: string | null;
  has_more: boolean;
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
  previousblockhash?: string;
  nonce: number;
  bits: number;
  difficulty: number;
  txs: Transaction[];
  has_more?: boolean;
  next_start?: number | null;
  current_start?: number;
  total_tx_count?: number;
}

export interface FlowNode {
  id: string;
  label: string;
  value: number;
  addr?: string;
  y: number;
  side: "left" | "right" | "center";
  isMore?: boolean;
  isCoinbase?: boolean;
}
