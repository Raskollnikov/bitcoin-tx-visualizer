import axios, { AxiosError } from "axios";
import type { Transaction } from "../types";

const api = axios.create({
  baseURL: "",
});

export async function fetchTx(txid: string): Promise<Transaction> {
  try {
    const res = await api.get(`/api/tx/${txid.trim()}`);
    return res.data.data;
  } catch (err: unknown) {
    if (err instanceof AxiosError) {
      if (err.response?.status === 404) {
        throw new Error("Transaction not found");
      }
      if (err.response?.data?.error) {
        throw new Error(err.response.data.error);
      }
    }
    throw new Error("Failed to fetch transaction");
  }
}

export async function fetchBlock(hash: string, start = 0) {
  const res = await api.get(`/api/block/${hash}?start=${start}`);
  return res.data.data;
}
