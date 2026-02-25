import { Request, Response } from "express";
import type {
  Transaction,
  Block,
  AddressTx,
  MempoolAddressSummary,
} from "../types/blockchain.types.";

export const getTxInfo = async (req: Request, res: Response) => {
  const { txid } = req.params;

  if (!txid || typeof txid !== "string" || txid.length < 32) {
    return res.status(400).json({ error: "invalid or missing txid" });
  }

  try {
    const response = await fetch(`https://mempool.space/api/tx/${txid}`);

    if (!response.ok) {
      return res.status(response.status).json({
        error: `blockchain.info error: ${response.statusText}`,
      });
    }
    const data = (await response.json()) as Transaction;
    return res.json({ data });
  } catch (error) {
    console.error("getTxInfo error:", error);
    return res.status(500).json({ error: "failed to fetch transaction" });
  }
};

export const getAddress = async (req: Request, res: Response) => {
  const { addr } = req.params;

  if (!addr || typeof addr !== "string" || addr.length < 26) {
    return res.status(400).json({ error: "invalid or missing address" });
  }

  try {
    const summaryRes = await fetch(`https://mempool.space/api/address/${addr}`);
    if (!summaryRes.ok) {
      return res.status(summaryRes.status).json({
        error: `mempool.space error: ${summaryRes.statusText}`,
      });
    }

    const summary = (await summaryRes.json()) as MempoolAddressSummary;

    const txsRes = await fetch(`https://mempool.space/api/address/${addr}/txs`);

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
      recent_txs: txs.slice(0, 25),
      next_after_txid: txs.length > 0 ? txs[txs.length - 1].txid : null,
    };

    return res.json({ data: combinedData });
  } catch (error) {
    console.error("getAddress error:", error);
    return res.status(500).json({ error: "failed to fetch address data" });
  }
};

export const getBlock = async (req: Request, res: Response) => {
  const { block } = req.params;

  if (!block || typeof block !== "string" || block.length !== 64) {
    return res.status(400).json({
      error: "invalid block hash ( must be 64 hexadecimal characters )",
    });
  }

  try {
    const base = "https://mempool.space/api";

    const headerRes = await fetch(`${base}/block/${block}`);
    if (!headerRes.ok) {
      return res.status(headerRes.status).json({
        error: `mempool.space error: ${headerRes.statusText}`,
      });
    }

    const header = (await headerRes.json()) as Block;

    const startStr = req.query.start as string | undefined;
    const limitStr = req.query.limit as string | undefined;

    const start = startStr ? Number(startStr) : 0;
    const requestedLimit = limitStr ? Number(limitStr) : 25;

    if (isNaN(start) || start < 0 || start % 25 !== 0) {
      return res.status(400).json({
        error: "start must be a multiple of 25",
      });
    }

    const limit = Math.max(0, Math.min(requestedLimit, 100));

    let recentTxs: Transaction[] = [];
    let shownTxCount = 0;
    let hasMore = false;

    if (limit > 0) {
      const txRes = await fetch(`${base}/block/${block}/txs/${start}`);

      if (txRes.ok) {
        recentTxs = (await txRes.json()) as Transaction[];
        recentTxs = recentTxs.slice(0, limit);
        shownTxCount = recentTxs.length;
        hasMore = header.tx_count > start + shownTxCount;
      } else {
        console.warn(
          `transaction fetch failed for block ${block} at start=${start}: ${txRes.status}`,
        );
      }
    }

    const responseData = {
      ...header,
      recent_txs: recentTxs,
      shown_tx_count: shownTxCount,
      has_more_txs: hasMore,
      next_start: hasMore ? start + shownTxCount : null,
      total_tx_count: header.tx_count,
    };

    return res.json({ data: responseData });
  } catch (error) {
    console.error("getBlock error:", error);
    return res.status(500).json({ error: "failed to fetch block" });
  }
};
