import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTx } from "../ hooks/useTx";
import FlowDiagram from "../components/FlowDiagram";
import SearchBar from "../components/SearchBar";
import HeroHome from "../components/HeroHome";
import { formatTime, satsToBtc } from "../utils/format";

function CopyBtn({ value }: { value: string }) {
  return (
    <button
      onClick={() => navigator.clipboard.writeText(value)}
      className="ml-2 opacity-40 hover:opacity-100 transition-opacity text-orange-400"
      title="Copy"
    >
      <svg
        width="13"
        height="13"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <rect x="9" y="9" width="13" height="13" rx="2" />
        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
      </svg>
    </button>
  );
}

function ArrowRight({ className = "" }: { className?: string }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      className={className}
    >
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  );
}

function ExternalIcon() {
  return (
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
  );
}

export default function TransactionPage() {
  const { txid } = useParams<{ txid: string }>();
  const { tx, loading, error, search } = useTx();
  const navigate = useNavigate();

  const goToTx = useCallback(
    (id: string) => {
      const trimmed = id.trim();
      if (!trimmed) return;
      navigate(`/tx/${trimmed}`);
    },
    [navigate],
  );

  useEffect(() => {
    if (txid) search(txid);
  }, [txid]);

  const totalIn =
    tx?.vin?.reduce((s, v) => s + (v.prevout?.value ?? 0), 0) ?? 0;
  const totalOut = tx?.vout?.reduce((s, v) => s + (v.value ?? 0), 0) ?? 0;
  const isCoinbase = tx?.vin?.[0]?.is_coinbase;

  if (!txid) {
    return <HeroHome onSearch={goToTx} />;
  }

  return (
    <div
      className="min-h-screen bg-[#080c10] text-gray-100"
      style={{ fontFamily: "'IBM Plex Mono', monospace" }}
    >
      <div className="px-4 pt-6 pb-2">
        <SearchBar
          key={txid}
          onSearch={goToTx}
          loading={loading}
          initialValue={txid ?? ""}
        />
      </div>

      <AnimatePresence mode="wait">
        {error && (
          <motion.div
            key="error"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mx-4 mt-4 bg-red-950/40 border border-red-800/50 text-red-400 rounded-xl p-4 text-sm font-mono"
          >
            ✗ {error}
          </motion.div>
        )}

        {loading && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-32 gap-3"
          >
            <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-500 text-sm tracking-widest">
              FETCHING TX…
            </p>
          </motion.div>
        )}

        {tx && !loading && (
          <motion.div
            key={tx.txid}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="px-4 pb-12 space-y-5 max-w-7xl mx-auto"
          >
            <div className="relative rounded-2xl border border-gray-800/80 bg-gray-900/40 overflow-hidden backdrop-blur-sm">
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-orange-500/60 to-transparent" />
              <div className="p-5 md:p-6">
                <div className="flex flex-wrap items-start justify-between gap-3 mb-5">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-orange-400 flex gap-3 items-center text-xs tracking-[0.2em] font-semibold uppercase">
                        Transaction
                        <a
                          href={`https://mempool.space/tx/${txid}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-1 text-[10px] tracking-widest px-2 py-1 rounded-md border transition-all border-gray-700 text-gray-500 hover:border-orange-600/60 hover:text-orange-400"
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
                          check
                        </a>
                      </span>
                      {isCoinbase && (
                        <span className="text-[10px] bg-yellow-900/50 border border-yellow-700/40 text-yellow-400 px-2 py-0.5 rounded-full tracking-wider">
                          ⛏ COINBASE
                        </span>
                      )}
                    </div>
                    <div className="flex items-center">
                      <p className="font-mono text-[11px] text-gray-400 break-all leading-relaxed">
                        {tx.txid}
                      </p>
                      <CopyBtn value={tx.txid} />
                    </div>
                  </div>
                  <div
                    className={`shrink-0 flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold tracking-widest border ${
                      tx.status.confirmed
                        ? "bg-emerald-950/60 border-emerald-700/40 text-emerald-400"
                        : "bg-amber-950/60 border-amber-700/40 text-amber-400 animate-pulse"
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${tx.status.confirmed ? "bg-emerald-400" : "bg-amber-400"}`}
                    />
                    {tx.status.confirmed ? "CONFIRMED" : "UNCONFIRMED"}
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    {
                      label: "FEE",
                      value: `${tx.fee.toLocaleString()} sats`,
                      sub: tx.size
                        ? `${(tx.fee / tx.size).toFixed(1)} sat/vB`
                        : null,
                      accent: false,
                      onClick: undefined,
                    },
                    {
                      label: "SIZE",
                      value: `${tx.size.toLocaleString()} bytes`,
                      sub: tx.weight
                        ? `${tx.weight.toLocaleString()} wu`
                        : null,
                      accent: false,
                      onClick: undefined,
                    },
                    {
                      label: "BLOCK",
                      value: tx.status.block_height
                        ? `#${tx.status.block_height.toLocaleString()}`
                        : "Mempool",
                      sub: tx.status.block_hash
                        ? tx.status.block_hash.slice(0, 10) + "…"
                        : null,
                      accent: !!tx.status.block_height,
                      onClick: tx.status.block_hash
                        ? () => navigate(`/block/${tx.status.block_hash}`)
                        : undefined,
                    },
                    {
                      label: "MINED",
                      value: tx.status.block_time
                        ? formatTime(tx.status.block_time)
                        : "—",
                      sub: null,
                      accent: false,
                      onClick: undefined,
                    },
                  ].map(({ label, value, sub, accent, onClick }) => (
                    <div
                      key={label}
                      className={`bg-gray-950/60 rounded-xl p-3.5 border border-gray-800/60 ${onClick ? "cursor-pointer hover:border-orange-600/50 transition-colors group" : ""}`}
                      onClick={onClick}
                    >
                      <p className="text-[9px] text-gray-600 tracking-[0.2em] mb-1.5 uppercase">
                        {label}
                      </p>
                      <p
                        className={`text-sm font-bold ${accent ? "text-orange-400 group-hover:text-orange-300" : "text-gray-100"}`}
                      >
                        {value}
                      </p>
                      {sub && (
                        <p className="text-[10px] text-gray-600 mt-0.5">
                          {sub}
                        </p>
                      )}
                    </div>
                  ))}
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-3 py-3 px-4 bg-gray-950/40 rounded-xl border border-gray-800/40">
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] text-gray-600 tracking-widest uppercase">
                      Total In
                    </span>
                    <span className="text-orange-300 text-sm font-bold">
                      {satsToBtc(totalIn)} BTC
                    </span>
                  </div>
                  <ArrowRight className="text-gray-700" />
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] text-gray-600 tracking-widest uppercase">
                      Total Out
                    </span>
                    <span className="text-orange-300 text-sm font-bold">
                      {satsToBtc(totalOut)} BTC
                    </span>
                  </div>
                  {tx.fee > 0 && (
                    <>
                      <div className="w-px h-4 bg-gray-800 mx-1" />
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] text-gray-600 tracking-widest uppercase">
                          Fee
                        </span>
                        <span className="text-amber-500 text-sm font-bold">
                          {satsToBtc(tx.fee)} BTC
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            <FlowDiagram
              tx={tx}
              onAddressClick={(addr) => navigate(`/address/${addr}`)}
            />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="rounded-2xl border border-gray-800/80 bg-gray-900/30 overflow-hidden">
                <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-800/60">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-orange-500" />
                    <span className="text-xs tracking-[0.2em] text-gray-400 uppercase">
                      Inputs
                    </span>
                    <span className="text-xs bg-gray-800 text-gray-500 px-2 py-0.5 rounded-full">
                      {tx.vin.length}
                    </span>
                  </div>
                  <span className="text-xs text-orange-400 font-bold">
                    {satsToBtc(totalIn)} BTC
                  </span>
                </div>
                <div className="divide-y divide-gray-800/40 max-h-[520px] overflow-y-auto">
                  {isCoinbase ? (
                    <div className="px-5 py-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-yellow-900/30 border border-yellow-700/30 flex items-center justify-center text-sm">
                          ⛏
                        </div>
                        <div>
                          <p className="text-yellow-400 text-sm font-semibold">
                            Coinbase
                          </p>
                          <p className="text-gray-600 text-[10px] mt-0.5">
                            Newly minted BTC
                          </p>
                        </div>
                      </div>
                      <span className="text-yellow-400 text-sm font-bold">
                        {satsToBtc(totalIn)} BTC
                      </span>
                    </div>
                  ) : (
                    tx.vin.map((inp, i) => {
                      const addr = inp.prevout?.scriptpubkey_address;
                      const val = inp.prevout?.value ?? 0;
                      return (
                        <div
                          key={i}
                          className={`px-5 py-3.5 flex items-center justify-between gap-3 transition-colors ${addr ? "hover:bg-orange-950/10 cursor-pointer group" : ""}`}
                          onClick={() => addr && navigate(`/address/${addr}`)}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-1.5 h-8 rounded-full bg-orange-500/30 shrink-0 group-hover:bg-orange-500/70 transition-colors" />
                            <div className="min-w-0">
                              {addr ? (
                                <p className="text-orange-300/80 text-[11px] font-mono truncate group-hover:text-orange-300 transition-colors">
                                  {addr}
                                </p>
                              ) : (
                                <p className="text-gray-600 text-[11px] font-mono">
                                  Unknown
                                </p>
                              )}
                              <p className="text-gray-600 text-[10px] mt-0.5">
                                Input #{i}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-gray-300 text-xs font-bold tabular-nums">
                              {satsToBtc(val)} BTC
                            </span>
                            {addr && <ExternalIcon />}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              <div className="rounded-2xl border border-gray-800/80 bg-gray-900/30 overflow-hidden">
                <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-800/60">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="text-xs tracking-[0.2em] text-gray-400 uppercase">
                      Outputs
                    </span>
                    <span className="text-xs bg-gray-800 text-gray-500 px-2 py-0.5 rounded-full">
                      {tx.vout.length}
                    </span>
                  </div>
                  <span className="text-xs text-emerald-400 font-bold">
                    {satsToBtc(totalOut)} BTC
                  </span>
                </div>
                <div className="divide-y divide-gray-800/40 max-h-[520px] overflow-y-auto">
                  {tx.vout.map((out, i) => {
                    const addr = out.scriptpubkey_address;
                    const isOpReturn =
                      !addr || out.scriptpubkey_type === "op_return";
                    const val = out.value ?? 0;
                    const pct = totalOut > 0 ? (val / totalOut) * 100 : 0;
                    return (
                      <div
                        key={i}
                        className={`px-5 py-3.5 transition-colors ${addr && !isOpReturn ? "hover:bg-emerald-950/10 cursor-pointer group" : ""}`}
                        onClick={() =>
                          addr && !isOpReturn && navigate(`/address/${addr}`)
                        }
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <div
                              className={`w-1.5 h-8 rounded-full shrink-0 transition-colors ${isOpReturn ? "bg-violet-500/30" : "bg-emerald-500/30 group-hover:bg-emerald-500/70"}`}
                            />
                            <div className="min-w-0">
                              {isOpReturn ? (
                                <p className="text-violet-400 text-[11px] font-mono">
                                  OP_RETURN
                                </p>
                              ) : addr ? (
                                <p className="text-emerald-300/80 text-[11px] font-mono truncate group-hover:text-emerald-300 transition-colors">
                                  {addr}
                                </p>
                              ) : (
                                <p className="text-gray-600 text-[11px] font-mono">
                                  Unknown script
                                </p>
                              )}
                              <p className="text-gray-600 text-[10px] mt-0.5">
                                Output #{i} · {pct.toFixed(1)}%
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span
                              className={`text-xs font-bold tabular-nums ${isOpReturn ? "text-violet-400" : "text-gray-300"}`}
                            >
                              {satsToBtc(val)} BTC
                            </span>
                            {addr && !isOpReturn && <ExternalIcon />}
                          </div>
                        </div>
                        {pct > 0 && (
                          <div className="ml-[18px] mt-2 h-0.5 bg-gray-800 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${isOpReturn ? "bg-violet-500/50" : "bg-emerald-500/40"}`}
                              style={{ width: `${Math.max(pct, 1)}%` }}
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                {tx.fee > 0 && (
                  <div className="px-5 py-3 border-t border-gray-800/60 bg-amber-950/10 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-1.5 h-6 rounded-full bg-amber-500/40 shrink-0" />
                      <div>
                        <p className="text-amber-500/80 text-[11px] font-mono">
                          Miner Fee
                        </p>
                        <p className="text-gray-600 text-[10px] mt-0.5">
                          {tx.size
                            ? `${(tx.fee / tx.size).toFixed(1)} sat/vB`
                            : ""}
                        </p>
                      </div>
                    </div>
                    <span className="text-amber-500 text-xs font-bold tabular-nums">
                      {satsToBtc(tx.fee)} BTC
                    </span>
                  </div>
                )}
              </div>
            </div>

            <details className="group rounded-2xl border border-gray-800/60 bg-gray-900/20 overflow-hidden">
              <summary className="px-5 py-4 cursor-pointer flex items-center justify-between text-xs text-gray-600 tracking-widest uppercase hover:text-gray-400 transition-colors list-none">
                <span>Raw Details</span>
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="group-open:rotate-180 transition-transform"
                >
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </summary>
              <div className="px-5 pb-5 grid grid-cols-2 md:grid-cols-3 gap-3 border-t border-gray-800/40">
                {[
                  ["Version", tx.version],
                  ["Locktime", tx.locktime],
                  ["Weight", `${tx.weight?.toLocaleString() ?? "—"} wu`],
                  ["vSize", tx.weight ? `${Math.ceil(tx.weight / 4)} vB` : "—"],
                  ["Inputs", tx.vin.length],
                  ["Outputs", tx.vout.length],
                ].map(([k, v]) => (
                  <div
                    key={String(k)}
                    className="bg-gray-950/40 rounded-lg p-3 border border-gray-800/40"
                  >
                    <p className="text-[9px] text-gray-700 tracking-widest uppercase mb-1">
                      {k}
                    </p>
                    <p className="text-gray-300 text-sm font-mono">{v}</p>
                  </div>
                ))}
              </div>
            </details>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
