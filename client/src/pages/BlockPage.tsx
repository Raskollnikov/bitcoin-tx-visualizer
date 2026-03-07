import { useEffect, useReducer } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { fetchBlock } from "../api/blockchain";
import { formatTime, shortenHash } from "../utils/format";
import { satsToBtc } from "../utils/format";
import type { Block, Transaction } from "../types";
import { BiSolidChevronsLeft } from "react-icons/bi";

interface State {
  block: Block | null;
  loading: boolean;
  error: string | null;
  start: number;
}

type Action =
  | { type: "FETCH_START" }
  | { type: "FETCH_SUCCESS"; payload: Block }
  | { type: "FETCH_ERROR"; payload: string }
  | { type: "SET_START"; payload: number };

const initialState: State = {
  block: null,
  loading: true,
  error: null,
  start: 0,
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "FETCH_START":
      return { ...state, loading: true, error: null };
    case "FETCH_SUCCESS":
      return { ...state, loading: false, block: action.payload };
    case "FETCH_ERROR":
      return { ...state, loading: false, error: action.payload };
    case "SET_START":
      return { ...state, start: action.payload };
    default:
      return state;
  }
}

function feeRateColor(rate: number) {
  if (rate > 50) return "text-red-400";
  if (rate > 20) return "text-orange-400";
  return "text-emerald-400";
}

function pageWindow(current: number, total: number, size = 5) {
  const half = Math.floor(size / 2);
  let start = Math.max(0, current - half);
  const end = Math.min(total - 1, start + size - 1);
  if (end - start < size - 1) start = Math.max(0, end - size + 1);
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
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
            : "bg-gray-900/80 border-gray-800 text-gray-400 hover:border-orange-600/50 hover:text-orange-400"
        } disabled:opacity-25 disabled:cursor-not-allowed`}
    >
      {children}
    </button>
  );
}

function TxRow({ tx }: { tx: Transaction }) {
  const isCoinbase =
    tx.vin?.[0]?.is_coinbase ||
    tx.vin?.[0]?.txid ===
      "0000000000000000000000000000000000000000000000000000000000000000";
  const totalOut = tx.vout?.reduce((s, v) => s + (v.value ?? 0), 0) ?? 0;
  const feeRate = tx.weight > 0 ? Math.round(tx.fee / (tx.weight / 4)) : 0;

  return (
    <Link
      to={`/tx/${tx.txid}`}
      className="group flex hover:bg-emerald-200/5 items-center gap-3 px-4 py-3.5 transition-colors border-b border-gray-800/50 last:border-0"
    >
      <div className="shrink-0">
        {isCoinbase ? (
          <div className="w-9 h-9 rounded-lg bg-yellow-900/30 border border-yellow-700/30 flex items-center justify-center text-sm">
            ⛏
          </div>
        ) : (
          <div className="w-9 h-9 rounded-lg bg-gray-800/60 border border-gray-700/40 flex items-center justify-center text-[9px] font-bold text-gray-500 tracking-wider">
            TX
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="font-mono text-[11px] text-orange-200/80 font-bold group-hover:text-orange-300 truncate transition-colors">
          {shortenHash(tx.txid, 16)}
        </p>
        {isCoinbase && (
          <p className="text-[9px] text-yellow-600 tracking-widest mt-0.5">
            COINBASE REWARD
          </p>
        )}
        {tx.fee > 0 && (
          <p className={`text-[9px] mt-0.5 sm:hidden ${feeRateColor(feeRate)}`}>
            {feeRate} sat/vB
          </p>
        )}
      </div>

      <div className="hidden sm:flex items-center gap-4 shrink-0 text-right">
        {tx.fee > 0 && (
          <div className="min-w-[72px]">
            <p className="text-[9px] text-gray-600 tracking-wider">Fee rate</p>
            <p className={`text-xs font-bold ${feeRateColor(feeRate)}`}>
              {feeRate} sat/vB
            </p>
          </div>
        )}
        <div className="min-w-[80px]">
          <p className="text-[9px] text-gray-600 tracking-wider">Fee</p>
          <p className="text-xs font-medium text-gray-400 tabular-nums">
            {tx.fee === 0 ? "—" : `${tx.fee.toLocaleString()} sats`}
          </p>
        </div>
        <div className="min-w-[90px]">
          <p className="text-[9px] text-gray-600 tracking-wider">Value</p>
          <p className="text-xs font-bold text-emerald-400 tabular-nums">
            {satsToBtc(totalOut)} BTC
          </p>
        </div>
      </div>

      <div className="sm:hidden shrink-0 text-right">
        <p className="text-xs font-bold text-emerald-400 tabular-nums">
          {satsToBtc(totalOut)} BTC
        </p>
        {tx.fee > 0 && (
          <p className="text-[9px] text-gray-600 tabular-nums">
            {tx.fee.toLocaleString()} sats
          </p>
        )}
      </div>

      <svg
        width="13"
        height="13"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className="text-gray-700 group-hover:text-orange-500 transition-colors shrink-0"
      >
        <path d="M5 12h14M12 5l7 7-7 7" />
      </svg>
    </Link>
  );
}

export default function BlockPage() {
  const { hash } = useParams<{ hash: string }>();
  const navigate = useNavigate();
  const [{ block, loading, error, start }, dispatch] = useReducer(
    reducer,
    initialState,
  );

  const PAGE_SIZE = 25;

  useEffect(() => {
    if (!hash) return;
    let cancelled = false;

    dispatch({ type: "FETCH_START" });

    fetchBlock(hash, start)
      .then((data) => {
        if (!cancelled) dispatch({ type: "FETCH_SUCCESS", payload: data });
      })
      .catch((e) => {
        if (!cancelled) dispatch({ type: "FETCH_ERROR", payload: e.message });
      });

    return () => {
      cancelled = true;
    };
  }, [hash, start]);

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-3">
        <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-500 text-xs tracking-widest font-mono">
          LOADING BLOCK…
        </p>
      </div>
    );

  if (error)
    return (
      <div className="mx-4 mt-6 bg-red-950/40 border border-red-800/50 text-red-400 rounded-2xl p-6 text-center font-mono">
        <p className="text-sm font-bold mb-1">Block not found</p>
        <p className="text-xs text-red-500">{error}</p>
      </div>
    );

  if (!block) return null;

  const totalPages = Math.ceil(block.tx_count / PAGE_SIZE);
  const currentPage = Math.floor(start / PAGE_SIZE);
  const window5 = pageWindow(currentPage, totalPages, 5);

  const goToPage = (page: number) => {
    const newStart = page * PAGE_SIZE;
    dispatch({ type: "SET_START", payload: newStart });
  };

  return (
    <div
      className="min-h-screen bg-[#080c10] text-gray-100 px-4 pb-16 max-w-5xl mx-auto"
      style={{ fontFamily: "'IBM Plex Mono', monospace" }}
    >
      <div className="relative rounded-2xl border border-gray-800/80 bg-gray-900/40 overflow-hidden mt-6">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-orange-500/60 to-transparent" />

        <div className="p-4 md:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3 mb-5">
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[9px] tracking-[0.25em] text-orange-500/60 uppercase">
                  Block
                </span>
              </div>
              <h1
                className="text-3xl sm:text-4xl font-black text-white tracking-tight flex cursor-pointer"
                onClick={() => navigate(`/block/${block.previousblockhash}`)}
                title="go to prev block"
              >
                <BiSolidChevronsLeft className="cursor-pointer" />
                {block.height.toLocaleString()}
              </h1>
              <p className="font-mono text-[10px] text-gray-600 mt-1.5 break-all leading-relaxed">
                {block.id}
              </p>
            </div>
            <div className="flex flex-wrap gap-2 shrink-0 flex-col lg:flex-row">
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl border-gray-800 bg-gray-950/60">
                <span className="text-[9px] text-gray-600 tracking-widest uppercase">
                  TXS
                </span>
                <span className="text-white font-bold text-sm">
                  {block.tx_count.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-800 bg-gray-950/60">
                <span className="text-[9px] text-gray-600 tracking-widest uppercase">
                  Mined
                </span>
                <span className="text-white font-bold text-xs sm:text-sm">
                  {formatTime(block.timestamp)}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            {[
              { label: "SIZE", value: `${(block.size / 1000).toFixed(1)} KB` },
              {
                label: "WEIGHT",
                value: `${(block.weight / 1000).toFixed(1)} KWU`,
              },
            ].map(({ label, value }) => (
              <div
                key={label}
                className="bg-gray-950/60 rounded-xl p-3.5 border border-gray-800/60"
              >
                <p className="text-[9px] text-gray-600 tracking-[0.2em] uppercase mb-1.5">
                  {label}
                </p>
                <p className="text-sm font-bold text-gray-100">{value}</p>
              </div>
            ))}
            <div className="col-span-2 bg-gray-950/60 rounded-xl p-3.5 border border-gray-800/60">
              <p className="text-[9px] text-gray-600 tracking-[0.2em] uppercase mb-1.5">
                MERKLE ROOT
              </p>
              <p className="text-sm font-bold text-gray-100 break-all leading-relaxed">
                {block.merkle_root ?? "—"}
              </p>
            </div>
            <div className="col-span-2 bg-gray-950/60 rounded-xl p-3.5 border border-gray-800/60">
              <p className="text-[9px] text-gray-600 tracking-[0.2em] uppercase mb-1.5">
                PREVIOUS
              </p>
              <p className="text-sm font-bold text-gray-100">
                {block.height > 0 ? (
                  <button
                    onClick={() =>
                      navigate(`/block/${block.previousblockhash}`)
                    }
                    className="text-orange-400 hover:text-orange-300 transition-colors font-bold cursor-pointer"
                  >
                    ← #{(block.height - 1).toLocaleString()}
                  </button>
                ) : (
                  <span className="text-yellow-500">Genesis</span>
                )}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-gray-800/80 bg-gray-900/30 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-4 border-b border-gray-800/60">
          <div className="flex items-center gap-3">
            <span className="text-xs tracking-[0.2em] text-gray-400 uppercase">
              Transactions
            </span>
            <span className="text-[10px] bg-gray-800 text-gray-500 px-2 py-0.5 rounded-full tracking-wider">
              {block.tx_count.toLocaleString()}
            </span>
          </div>
          <span className="text-[10px] text-gray-600 tracking-widest">
            {start + 1}–{Math.min(start + PAGE_SIZE, block.tx_count)} of{" "}
            {block.tx_count.toLocaleString()}
          </span>
        </div>

        {block.txs?.length > 0 ? (
          <div>
            {block.txs.map((tx) => (
              <TxRow key={tx.txid} tx={tx} />
            ))}
          </div>
        ) : (
          <div className="py-16 text-center text-gray-600 text-sm tracking-widest">
            NO TRANSACTIONS
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-1.5 px-4 py-4 border-t border-gray-800/60 flex-wrap">
            <PageBtn disabled={currentPage === 0} onClick={() => goToPage(0)}>
              «
            </PageBtn>
            <PageBtn
              disabled={currentPage === 0}
              onClick={() => goToPage(currentPage - 1)}
            >
              ‹
            </PageBtn>

            {window5[0] > 0 && (
              <>
                <PageBtn onClick={() => goToPage(0)}>1</PageBtn>
                {window5[0] > 1 && (
                  <span className="text-gray-700 px-1 text-xs">…</span>
                )}
              </>
            )}

            {window5.map((p) => (
              <PageBtn
                key={p}
                active={p === currentPage}
                onClick={() => goToPage(p)}
              >
                {p + 1}
              </PageBtn>
            ))}

            {window5[window5.length - 1] < totalPages - 1 && (
              <>
                {window5[window5.length - 1] < totalPages - 2 && (
                  <span className="text-gray-700 px-1 text-xs">…</span>
                )}
                <PageBtn onClick={() => goToPage(totalPages - 1)}>
                  {totalPages}
                </PageBtn>
              </>
            )}

            <PageBtn
              disabled={currentPage === totalPages - 1}
              onClick={() => goToPage(currentPage + 1)}
            >
              ›
            </PageBtn>
            <PageBtn
              disabled={currentPage === totalPages - 1}
              onClick={() => goToPage(totalPages - 1)}
            >
              »
            </PageBtn>
          </div>
        )}
      </div>
    </div>
  );
}
