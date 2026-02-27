import { Request, Response } from "express";
import type {
  Transaction,
  Block,
  AddressTx,
  MempoolAddressSummary,
} from "../types/blockchain.types.";
import { cache, TTL } from "../middleware/cache";

export const getTxInfo = async (req: Request, res: Response) => {
  const { txid } = req.params;

  if (!txid || typeof txid !== "string" || txid.length < 32) {
    return res.status(400).json({ error: "invalid or missing txid" });
  }

  const cacheKey = `tx:${txid}`;
  const cached = cache(cacheKey, TTL.CONFIRMED_TX).get();

  if (cached) {
    return res.json({ data: cached, fromCache: true });
  }

  try {
    const response = await fetch(`https://mempool.space/api/tx/${txid}`);

    if (!response.ok) {
      return res.status(response.status).json({
        error: `mempool.space error: ${response.statusText}`,
      });
    }
    const data = (await response.json()) as Transaction;

    const ttl = data.status.confirmed ? TTL.CONFIRMED_TX : TTL.UNCONFIRMED_TX;
    cache(cacheKey, ttl).set(data);

    return res.json({ data });
  } catch (error) {
    console.error("getTxInfo error:", error);
    return res.status(500).json({ error: "failed to fetch transaction" });
  }
};

export const getAddress = async (req: Request, res: Response) => {
  const { addr } = req.params;

  if (!addr || typeof addr !== "string" || addr.length < 26) {
    return res.status(400).json({ error: "Invalid or missing address" });
  }

  const cacheKey = `address:${addr}`;
  const cached = cache(cacheKey, TTL.ADDRESS).get();

  if (cached) {
    return res.json({ data: cached, fromCache: true });
  }

  try {
    const [summaryRes, txsRes] = await Promise.all([
      fetch(`https://mempool.space/api/address/${addr}`),
      fetch(`https://mempool.space/api/address/${addr}/txs`),
    ]);
    if (!summaryRes.ok) {
      return res.status(summaryRes.status).json({
        error: `mempool.space error: ${summaryRes.statusText}`,
      });
    }

    const summary = (await summaryRes.json()) as MempoolAddressSummary;

    if (!txsRes.ok) {
      return res.status(txsRes.status).json({
        error: `mempool.space error: ${txsRes.statusText}`,
      });
    }

    const txs = (await txsRes.json()) as AddressTx[];

    const combinedData = {
      address: summary.address,
      balance:
        summary.chain_stats.funded_txo_sum - summary.chain_stats.spent_txo_sum,
      total_received: summary.chain_stats.funded_txo_sum,
      total_sent: summary.chain_stats.spent_txo_sum,
      tx_count: summary.chain_stats.tx_count,
      mempool_balance:
        summary.mempool_stats.funded_txo_sum -
        summary.mempool_stats.spent_txo_sum,
      mempool_tx_count: summary.mempool_stats.tx_count,
      recent_txs: txs.slice(0, 50),
      next_after_txid: txs.length > 0 ? txs[txs.length - 1].txid : null,
    };

    cache(cacheKey, TTL.ADDRESS).set(combinedData);

    return res.json({ data: combinedData });
  } catch (error) {
    console.error("getAddress error:", error);
    return res.status(500).json({ error: "failed to fetch address data" });
  }
};

export const getBlock = async (req: Request, res: Response) => {
  const { block } = req.params;

  if (!block || block.length < 64) {
    return res.status(400).json({
      error: "invalid block hash (must be 64 hex characters)",
    });
  }

  const start = Number(req.query.start ?? 0);

  if (isNaN(start) || start < 0 || start % 25 !== 0) {
    return res.status(400).json({
      error: "start must be a non-negative multiple of 25",
    });
  }

  const cacheKey = `block:${block}:${start}`;
  const cached = cache(cacheKey, TTL.BLOCK).get();
  if (cached) return res.json({ data: cached, fromCache: true });

  try {
    const [headerRes, txRes] = await Promise.all([
      fetch(`https://mempool.space/api/block/${block}`),
      fetch(`https://mempool.space/api/block/${block}/txs/${start}`),
    ]);

    if (!headerRes.ok) {
      return res.status(headerRes.status).json({
        error: `mempool.space error: ${headerRes.statusText}`,
      });
    }

    const header = (await headerRes.json()) as Block;
    const txs: Transaction[] = txRes.ok ? await txRes.json() : [];

    const hasMore = header.tx_count > start + txs.length;

    const responseData = {
      ...header,
      txs,
      has_more: hasMore,
      next_start: hasMore ? start + txs.length : null,
      current_start: start,
      total_tx_count: header.tx_count,
    };

    cache(cacheKey, TTL.BLOCK).set(responseData);
    return res.json({ data: responseData });
  } catch (error) {
    console.error("getBlock error:", error);
    return res.status(500).json({ error: "failed to fetch block" });
  }
};

// for main route of these website, i need following data ( BLOCK HEIGHT, mempool txs, fee rate adn difficulty )
// so i am creating new route to get the data ( i could directly fetch the data on UI, but for cache ( not spamming third party API, i preferred these option ) )

export const getNetworkStats = async (_req: Request, res: Response) => {
  const cacheKey = "network:stats";
  const cached = cache(cacheKey, TTL.UNCONFIRMED_TX).get();
  if (cached) return res.json({ data: cached, fromCache: true });

  try {
    const [blocksRes, mempoolRes, feesRes, diffRes] = await Promise.all([
      fetch("https://mempool.space/api/blocks/tip/height"),
      fetch("https://mempool.space/api/mempool"),
      fetch("https://mempool.space/api/v1/fees/recommended"),
      fetch("https://mempool.space/api/v1/difficulty-adjustment"),
    ]);

    const [blockHeight, mempool, fees, diff] = await Promise.all([
      blocksRes.ok ? blocksRes.json() : null,
      mempoolRes.ok ? mempoolRes.json() : null,
      feesRes.ok ? feesRes.json() : null,
      diffRes.ok ? diffRes.json() : null,
    ]);

    const data = {
      block_height: blockHeight ?? null,
      mempool_count: mempool?.count ?? null,
      mempool_vsize: mempool?.vsize ?? null,
      fee_fastest: fees?.fastestFee ?? null,
      fee_half_hour: fees?.halfHourFee ?? null,
      fee_hour: fees?.hourFee ?? null,
      fee_economy: fees?.economyFee ?? null,
      difficulty_change: diff?.difficultyChange ?? null,
      estimated_retarget: diff?.remainingTime ?? null,
      progress_percent: diff?.progressPercent ?? null,
    };

    cache(cacheKey, TTL.UNCONFIRMED_TX).set(data);
    return res.json({ data });
  } catch (error) {
    console.error("getNetworkStats error:", error);
    return res.status(500).json({ error: "failed to fetch network stats" });
  }
};
