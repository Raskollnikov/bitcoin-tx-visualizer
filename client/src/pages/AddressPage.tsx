import { useParams, Link } from "react-router-dom";
import { useEffect, useReducer } from "react";
import { satsToBtc } from "../utils/format";
import type { AddressPageData, Transaction } from "../types";

interface State {
  data: AddressPageData | null;
  loading: boolean;
  error: string | null;
  page: number;
}

type Action =
  | { type: "FETCH_START" }
  | { type: "FETCH_SUCCESS"; payload: AddressPageData }
  | { type: "FETCH_ERROR"; payload: string }
  | { type: "SET_PAGE"; payload: number };

const initialState: State = { data: null, loading: true, error: null, page: 0 };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "FETCH_START":
      return { data: null, loading: true, error: null, page: 0 };
    case "FETCH_SUCCESS":
      return { ...state, loading: false, data: action.payload };
    case "FETCH_ERROR":
      return { ...state, loading: false, error: action.payload };
    case "SET_PAGE":
      return { ...state, page: action.payload };
    default:
      return state;
  }
}

function CopyBtn({ value }: { value: string }) {
  const [copied, dispatchCopy] = useReducer(
    (_: boolean, v: boolean) => v,
    false,
  );
  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        navigator.clipboard.writeText(value);
        dispatchCopy(true);
        setTimeout(() => dispatchCopy(false), 1500);
      }}
      className="flex items-center gap-1 text-[10px] tracking-widest px-2 py-1 rounded-md border transition-all duration-150
        border-gray-700 text-gray-500 hover:border-orange-600/60 hover:text-orange-400"
    >
      {copied ? (
        <>
          <svg
            width="11"
            height="11"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <path d="M20 6L9 17l-5-5" />
          </svg>
          COPIED
        </>
      ) : (
        <>
          <svg
            width="11"
            height="11"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <rect x="9" y="9" width="13" height="13" rx="2" />
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
          </svg>
          COPY
        </>
      )}
    </button>
  );
}

function BalanceBar({ received, sent }: { received: number; sent: number }) {
  if (!received) return null;
  const spentPct = Math.min((sent / received) * 100, 100);
  return (
    <div className="mt-3 space-y-1.5">
      <div className="flex justify-between text-[9px] tracking-widest text-gray-600 uppercase">
        <span>spent</span>
        <span>balance</span>
      </div>
      <div className="h-1.5 rounded-full bg-gray-800 overflow-hidden flex">
        <div
          className="h-full bg-red-500/40 transition-all"
          style={{ width: `${spentPct}%` }}
        />
        <div
          className="h-full bg-orange-500/60 transition-all"
          style={{ width: `${100 - spentPct}%` }}
        />
      </div>
    </div>
  );
}

function TxRow({ tx, addr }: { tx: Transaction; addr: string }) {
  const received =
    tx.vout?.reduce(
      (s, o) => (o.scriptpubkey_address === addr ? s + (o.value ?? 0) : s),
      0,
    ) ?? 0;
  const spent =
    tx.vin?.reduce(
      (s, i) =>
        i.prevout?.scriptpubkey_address === addr
          ? s + (i.prevout?.value ?? 0)
          : s,
      0,
    ) ?? 0;
  const net = received - spent;
  const hasNet = received > 0 || spent > 0;

  return (
    <Link
      to={`/tx/${tx.txid}`}
      className={`group flex items-center gap-4 px-5 py-4 ${net >= 0 ? "hover:bg-emerald-200/10" : "hover:bg-red-200/10"} transition-colors border-b border-gray-800/50 last:border-0`}
    >
      <div
        className={`shrink-0 w-2 h-2 rounded-full mt-0.5 ${tx.status?.confirmed ? "bg-emerald-500" : "bg-amber-400 animate-pulse"}`}
      />
      <div className="flex-1 min-w-0">
        <p className="font-mono text-[11px] text-orange-300/80 group-hover:text-orange-300 truncate transition-colors">
          {tx.txid}
        </p>
        <div className="flex items-center gap-3 mt-1">
          {tx.status?.confirmed ? (
            <span className="text-[9px] text-gray-600 tracking-widest">
              BLOCK #{tx.status.block_height?.toLocaleString()}
            </span>
          ) : (
            <span className="text-[9px] text-amber-500/70 tracking-widest">
              MEMPOOL
            </span>
          )}
          {tx.fee != null && (
            <span className="text-[9px] text-gray-700">
              fee: {tx.fee.toLocaleString()} sats
            </span>
          )}
        </div>
      </div>
      {hasNet && (
        <span
          className={`shrink-0 text-sm font-bold tabular-nums font-mono ${net >= 0 ? "text-emerald-400" : "text-red-400"}`}
        >
          {net >= 0 ? "+" : ""}
          {satsToBtc(net)} BTC
        </span>
      )}
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className="shrink-0 text-gray-700 group-hover:text-orange-500 transition-colors"
      >
        <path d="M5 12h14M12 5l7 7-7 7" />
      </svg>
    </Link>
  );
}

function PageBtn({
  children,
  active,
  disabled,
  onClick,
}: {
  children: React.ReactNode;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`min-w-[36px] h-9 px-3 rounded-lg text-xs font-mono border transition-all
        ${
          active
            ? "bg-orange-500 border-orange-500 text-black font-bold shadow-lg shadow-orange-500/20"
            : "bg-gray-900 border-gray-800 text-gray-400 hover:border-orange-600/50 hover:text-orange-400"
        }
        disabled:opacity-25 disabled:cursor-not-allowed`}
    >
      {children}
    </button>
  );
}

export default function AddressPage() {
  const { addr } = useParams<{ addr: string }>();
  const [{ data, loading, error, page }, dispatch] = useReducer(
    reducer,
    initialState,
  );
  const PAGE_SIZE = 10;

  useEffect(() => {
    if (!addr) return;
    let cancelled = false;

    dispatch({ type: "FETCH_START" });

    fetch(`/api/address/${addr}`)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((res) => {
        if (!cancelled) dispatch({ type: "FETCH_SUCCESS", payload: res.data });
      })
      .catch(() => {
        if (!cancelled)
          dispatch({
            type: "FETCH_ERROR",
            payload: "failed to load address data",
          });
      });

    return () => {
      cancelled = true;
    };
  }, [addr]);

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-3">
        <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-500 text-xs tracking-widest font-mono">
          LOADING ADDRESS…
        </p>
      </div>
    );

  if (error)
    return (
      <div className="mx-4 mt-6 bg-red-950/40 border border-red-800/50 text-red-400 rounded-xl p-4 text-sm font-mono">
        x {error}
      </div>
    );

  if (!data) return null;

  const txs = data.recent_txs ?? ([] as Transaction[]);
  const totalPages = Math.ceil(txs.length / PAGE_SIZE);
  const paginated = txs.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);
  const balance = data.balance ?? 0;
  const received = data.total_received ?? 0;
  const sent = data.total_sent ?? 0;
  const txCount = data.tx_count ?? 0;
  const hasMempoolBalance = data.mempool_balance && data.mempool_balance !== 0;

  const setPage = (p: number) => dispatch({ type: "SET_PAGE", payload: p });

  const pageWindow = (() => {
    let start = Math.max(0, page - 2);
    let end = Math.min(totalPages - 1, page + 2);
    if (end - start < 4) {
      if (start === 0) end = Math.min(4, totalPages - 1);
      else start = Math.max(0, end - 4);
    }
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  })();

  return (
    <div
      className="min-h-screen bg-[#080c10] text-gray-100 px-4 pb-16 max-w-5xl mx-auto"
      style={{ fontFamily: "'IBM Plex Mono', monospace" }}
    >
      <div className="relative rounded-2xl border border-gray-800/80 bg-gray-900/40 overflow-hidden mt-6">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-orange-500/50 to-transparent" />
        <div className="p-5 md:p-6 space-y-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-[9px] tracking-[0.25em] text-gray-600 uppercase mb-2">
                Bitcoin address
              </p>
              <p className="font-mono text-orange-400 text-sm break-all leading-relaxed">
                {addr}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <CopyBtn value={addr ?? ""} />
              <a
                href={`https://mempool.space/address/${addr}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-[10px] tracking-widest px-2 py-1 rounded-md border transition-all border-gray-700 text-gray-500 hover:border-orange-600/60 hover:text-orange-400"
              >
                <svg
                  width="11"
                  height="11"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                  <polyline points="15 3 21 3 21 9" />
                  <line x1="10" y1="14" x2="21" y2="3" />
                </svg>
                MEMPOOL
              </a>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              {
                label: "BALANCE",
                value: satsToBtc(balance) + " BTC",
                sub: balance === 0 ? "empty" : "current",
                color: balance > 0 ? "text-orange-300" : "text-gray-500",
                border:
                  balance > 0 ? "border-orange-900/40" : "border-gray-800/60",
              },
              {
                label: "RECEIVED",
                value: satsToBtc(received) + " BTC",
                sub: "total in",
                color: "text-emerald-300",
                border: "border-gray-800/60",
              },
              {
                label: "SENT",
                value: satsToBtc(sent) + " BTC",
                sub: "total out",
                color: "text-red-300",
                border: "border-gray-800/60",
              },
              {
                label: "TRANSACTIONS",
                value: txCount.toLocaleString(),
                // i am only loading 50 transaction of x address
                // because some addresses has few thousand tx's in total
                sub: `${txs.length} loaded`,
                color: "text-gray-100",
                border: "border-gray-800/60",
              },
            ].map(({ label, value, sub, color, border }) => (
              <div
                key={label}
                className={`bg-gray-950/60 rounded-xl p-3.5 border ${border}`}
              >
                <p className="text-[9px] text-gray-600 tracking-[0.2em] uppercase mb-2">
                  {label}
                </p>
                <p className={`text-sm font-bold ${color}`}>{value}</p>
                <p className="text-[9px] text-gray-700 mt-1 uppercase tracking-wider">
                  {sub}
                </p>
              </div>
            ))}
          </div>

          <BalanceBar received={received} sent={sent} />

          {hasMempoolBalance && (
            <div className="flex items-center gap-2 px-4 py-2.5 bg-amber-950/20 border border-amber-800/30 rounded-xl">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              <span className="text-[11px] text-amber-400">
                Pending in mempool:{" "}
                <strong>{satsToBtc(data.mempool_balance)} BTC</strong>
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-gray-800/80 bg-gray-900/30 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800/60">
          <div className="flex items-center gap-3">
            <span className="text-xs tracking-[0.2em] text-gray-400 uppercase">
              Transactions
            </span>
            <span className="text-[10px] bg-gray-800 text-gray-500 px-2 py-0.5 rounded-full tracking-wider">
              {txCount.toLocaleString()}
            </span>
          </div>
          <span className="text-[10px] text-gray-600 tracking-widest">
            {page * PAGE_SIZE + 1}–
            {Math.min(page * PAGE_SIZE + PAGE_SIZE, txs.length)} of {txs.length}
          </span>
        </div>

        {txs.length === 0 ? (
          <div className="py-16 text-center text-gray-600 text-sm tracking-widest">
            NO TRANSACTIONS FOUND
          </div>
        ) : (
          <div>
            {paginated.map((tx) =>
              tx?.txid ? (
                <TxRow key={tx.txid} tx={tx} addr={addr ?? ""} />
              ) : null,
            )}
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-1.5 px-5 py-4 border-t border-gray-800/60">
            <PageBtn disabled={page === 0} onClick={() => setPage(0)}>
              «
            </PageBtn>
            <PageBtn disabled={page === 0} onClick={() => setPage(page - 1)}>
              ‹
            </PageBtn>

            {pageWindow[0] > 0 && (
              <>
                <PageBtn onClick={() => setPage(0)}>1</PageBtn>
                {pageWindow[0] > 1 && (
                  <span className="text-gray-700 px-1 text-xs">…</span>
                )}
              </>
            )}

            {pageWindow.map((i) => (
              <PageBtn key={i} active={i === page} onClick={() => setPage(i)}>
                {i + 1}
              </PageBtn>
            ))}

            {pageWindow[pageWindow.length - 1] < totalPages - 1 && (
              <>
                {pageWindow[pageWindow.length - 1] < totalPages - 2 && (
                  <span className="text-gray-700 px-1 text-xs">…</span>
                )}
                <PageBtn onClick={() => setPage(totalPages - 1)}>
                  {totalPages}
                </PageBtn>
              </>
            )}

            <PageBtn
              disabled={page === totalPages - 1}
              onClick={() => setPage(page + 1)}
            >
              ›
            </PageBtn>
            <PageBtn
              disabled={page === totalPages - 1}
              onClick={() => setPage(totalPages - 1)}
            >
              »
            </PageBtn>
          </div>
        )}
      </div>
    </div>
  );
}
