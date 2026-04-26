import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

/*
DISCLAIMER!!!: The transactions referenced here are publicly visible records from the blockchain and are used purely for educational and illustrative purposes,
because the Bitcoin blockchain is completely public, anyone can view any transaction and attach their own description or narrative to it without actually being involved in that transaction,
the labels such as “me → Satoshi” or “me → Mom” are simply fictional examples meant to demonstrate how transactions can be explored and interpreted, not claims of ownership or participation,
no identity can be reliably linked to a transaction solely by its TXID unless the owner of the sending address cryptographically proves control of the private key
*/

interface NetworkStats {
  block_height: number | null;
  mempool_count: number | null;
  fee_fastest: number | null;
  fee_economy: number | null;
  difficulty_change: number | null;
  progress_percent: number | null;
}

const EXAMPLES = [
  {
    label: "genesis block coinbase",
    txid: "4a5e1e4baab89f3a32518a88c31bc87f618f76673e2cc77ab2127b7afdeda33b",
    desc: "Block #0 · Jan 3, 2009",
    badge: "GENESIS",
    badgeColor: "text-yellow-400 border-yellow-800/50 bg-yellow-950/30",
  },

  {
    label: "Arsen -> Andreas Antonopoulos",
    txid: "aab7c94b8a213a222092c65aa7645d555d0a8b5b791815a30704cfe858a70303",
    desc: "Joined a historic bitcoin support for Andreas Antonopoulos in 2017, turning community respect into real-world value.",
    badge: "LEGENDARY",
    badgeColor: "text-amber-400 border-amber-800/50 bg-amber-950/30",
  },

  {
    label: "Arsen -> Mom",
    txid: "26fc906de7a6756e99475b361c2d4091010b923522f0a4dda491068ea5074eb7",
    desc: "new year's gift for mom, paid in Bitcoin, SUIII",
    badge: "PERSONAL",
    badgeColor: "text-amber-400 border-amber-800/50 bg-amber-950/30",
  },
  {
    label: "message in 666,666th block",
    txid: "057954bb28527ff9c7701c6fd2b7f770163718ded09745da56cc95e7606afe99",
    desc: `overcome evil (Romans 12:21) "do not be overcome by evil, but overcome evil with good"`,
    badge: "FAVORITE",
    badgeColor: "text-amber-400 border-amber-800/50 bg-amber-950/30",
  },
  {
    label: "Arsen -> Satoshi",
    txid: "a73335706adad5c400453fbc3c992f23cacf56b0ca964bc584f5f44ac7e0d412",
    desc: "I sent Bitcoin to Satoshi's legacy address",
    badge: "PERSONAL",
    badgeColor: "text-orange-400 border-orange-800/50 bg-orange-950/30",
  },
  {
    label: "bitcoin pizza",
    txid: "a1075db55d416d3ca199f55b6084e2115b9345e16c5cf302fc80e9d5fbf5d48d",
    desc: "10,000 BTC · May 22, 2010",
    badge: "LEGENDARY",
    badgeColor: "text-amber-400 border-amber-800/50 bg-amber-950/30",
  },

  {
    label: "Anonymous → Anonymous",
    txid: "f4330fd91a9b19feaa4e691f88ab3d5047e5268b69ca41870267deab1bd67c8a",
    desc: "a large anonymous transaction between unidentified parties",
    badge: "RANDOM",
    badgeColor: "text-amber-400 border-amber-800/50 bg-amber-950/30",
  },
];

function fmt(n: number | null): string {
  if (n == null) return "—";
  return n.toLocaleString();
}

function fmtDiff(n: number | null): string {
  if (n == null) return "—";
  return `${n >= 0 ? "+" : ""}${n.toFixed(2)}%`;
}

function Orb({
  x,
  y,
  size,
  delay,
  duration,
}: {
  x: string;
  y: string;
  size: number;
  delay: number;
  duration: number;
}) {
  return (
    <div
      className="absolute rounded-full pointer-events-none"
      style={{
        left: x,
        top: y,
        width: size,
        height: size,
        background:
          "radial-gradient(circle, rgba(249,115,22,0.12) 0%, transparent 70%)",
        animation: `float ${duration}s ease-in-out ${delay}s infinite alternate`,
      }}
    />
  );
}

function HexCell({ x, y, delay }: { x: number; y: number; delay: number }) {
  return (
    <div
      className="absolute w-12 h-12 border border-orange-500/5 rotate-45"
      style={{
        left: x,
        top: y,
        animation: `pulse-hex 4s ease-in-out ${delay}s infinite alternate`,
      }}
    />
  );
}

function StatTile({
  label,
  value,
  sub,
  live,
  accent,
}: {
  label: string;
  value: string;
  sub?: string;
  live?: boolean;
  accent?: "green" | "red" | "orange";
}) {
  const accentClass =
    accent === "green"
      ? "text-emerald-400"
      : accent === "red"
        ? "text-red-400"
        : accent === "orange"
          ? "text-orange-400"
          : "text-gray-300";
  return (
    <div className="flex flex-col items-center gap-1 px-3 py-3 rounded-xl border border-gray-800/60 bg-gray-900/40 min-w-[90px] flex-1">
      <div className="flex items-center gap-1.5">
        {live && (
          <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
        )}
        <span className="text-[8px] tracking-[0.2em] text-gray-700 uppercase text-center">
          {label}
        </span>
      </div>
      <span
        className={`text-xs font-bold font-mono tabular-nums ${accentClass} text-center`}
      >
        {value}
      </span>
      {sub && <span className="text-[9px] text-gray-700">{sub}</span>}
    </div>
  );
}

function SkeletonTile() {
  return (
    <div className="flex flex-col items-center gap-1 px-3 py-3 rounded-xl border border-gray-800/40 bg-gray-900/20 min-w-[90px] flex-1 animate-pulse">
      <div className="h-2 w-14 bg-gray-800 rounded" />
      <div className="h-4 w-16 bg-gray-800 rounded mt-1" />
    </div>
  );
}

export default function HeroHome({
  onSearch,
}: {
  onSearch: (txid: string) => void;
}) {
  const [input, setInput] = useState("");
  const [focused, setFocused] = useState(false);
  const [glitching, setGlitching] = useState(false);
  const [stats, setStats] = useState<NetworkStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const navigate = useNavigate();
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const t = setInterval(() => {
      setGlitching(true);
      setTimeout(() => setGlitching(false), 150);
    }, 5000);
    return () => clearInterval(t);
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/stats");
      if (!res.ok) return;
      const json = await res.json();
      setStats(json.data);
    } catch {
      //
    } finally {
      setStatsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    pollRef.current = setInterval(fetchStats, 30_000);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  const handleSearch = (txid: string) => {
    const trimmed = txid.trim();
    if (!trimmed) return;
    onSearch(trimmed);
    navigate(`/tx/${trimmed}`);
  };

  const isValid = input.trim().length === 64;
  const diffAccent: "green" | "red" | undefined =
    stats?.difficulty_change == null
      ? undefined
      : stats.difficulty_change >= 0
        ? "green"
        : "red";

  return (
    <>
      <style>{`
        @keyframes float {
          from { transform: translateY(0px) scale(1); }
          to   { transform: translateY(-24px) scale(1.05); }
        }
        @keyframes pulse-hex {
          from { opacity: 0.3; transform: rotate(45deg) scale(1); }
          to   { opacity: 0.05; transform: rotate(45deg) scale(1.1); }
        }
        @keyframes scan-line {
          0%   { transform: translateY(-100%); }
          100% { transform: translateY(100vh); }
        }
        @keyframes glitch {
          0%   { clip-path: inset(0 0 95% 0); transform: translate(-4px, 0); }
          20%  { clip-path: inset(30% 0 50% 0); transform: translate(4px, 0); }
          40%  { clip-path: inset(60% 0 20% 0); transform: translate(-2px, 0); }
          60%  { clip-path: inset(80% 0 5% 0);  transform: translate(2px, 0); }
          80%  { clip-path: inset(10% 0 75% 0); transform: translate(-1px, 0); }
          100% { clip-path: inset(0 0 0 0);     transform: translate(0, 0); }
        }
        .glitch-text { position: relative; }
        .glitch-text::before, .glitch-text::after { content: attr(data-text); position: absolute; inset: 0; }
        .glitch-text.glitching::before { animation: glitch 0.15s steps(1) forwards; color: #f97316; left: 2px; }
        .glitch-text.glitching::after  { animation: glitch 0.15s steps(1) reverse forwards; color: #0ea5e9; left: -2px; }
        .scan-line { animation: scan-line 8s linear infinite; }
        .scrollbar-none::-webkit-scrollbar { display: none; }
        .examples-scroll::-webkit-scrollbar { display: none; }
      `}</style>

      <div className="relative min-h-[calc(100vh-56px)] flex flex-col items-center justify-center overflow-hidden -mt-6 -mx-4 px-4">
        <Orb x="10%" y="20%" size={400} delay={0} duration={7} />
        <Orb x="60%" y="50%" size={300} delay={2} duration={9} />
        <Orb x="80%" y="10%" size={250} delay={1} duration={6} />
        <Orb x="20%" y="70%" size={200} delay={3} duration={8} />

        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {Array.from({ length: 20 }, (_, i) => (
            <HexCell
              key={i}
              x={((i * 137.5) % 1400) - 100}
              y={((i * 97.3) % 800) - 100}
              delay={(i * 0.3) % 4}
            />
          ))}
        </div>

        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-orange-500/20 to-transparent scan-line pointer-events-none" />

        <div className="relative z-10 w-full max-w-2xl mx-auto text-center space-y-6">
          <div className="flex items-center justify-center gap-2">
            <div className="h-px w-12 bg-gradient-to-r from-transparent to-orange-500/50" />
            <span className="text-[9px] tracking-[0.4em] text-orange-500/60 uppercase select-none">
              Bitcoin Explorer
            </span>
            <div className="h-px w-12 bg-gradient-to-l from-transparent to-orange-500/50" />
          </div>

          <div className="space-y-2 select-none">
            <h1
              className={`glitch-text text-4xl sm:text-5xl md:text-7xl font-black tracking-tighter text-white ${glitching ? "glitching" : ""}`}
              data-text="TX VISUALIZER"
              style={{ fontFamily: "'IBM Plex Mono', monospace" }}
            >
              <span className="text-orange-400">TX</span>{" "}
              <span className="text-white">VISUALIZER</span>
            </h1>
            <p className="text-gray-600 text-sm tracking-widest">
              DECODE · INSPECT · EXPLORE
            </p>
          </div>

          <p className="text-gray-500 text-sm leading-relaxed max-w-md mx-auto select-none">
            visualize Bitcoin transaction flows in real time, trace inputs,
            outputs, and fees with beautiful interactive diagrams
          </p>

          <div className="space-y-3 text-left">
            <div
              className="relative rounded-2xl transition-all duration-300"
              style={{
                boxShadow: focused
                  ? "0 0 0 1px rgba(249,115,22,0.6), 0 0 40px rgba(249,115,22,0.15)"
                  : "0 0 0 1px rgba(55,65,81,0.6), 0 4px 24px rgba(0,0,0,0.4)",
              }}
            >
              <div className="flex overflow-hidden rounded-2xl bg-gray-900/90 backdrop-blur-sm">
                <div className="flex items-center pl-4 pr-3">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className={`transition-colors shrink-0 ${focused ? "text-orange-500" : "text-gray-600"}`}
                  >
                    <circle cx="11" cy="11" r="8" />
                    <path d="m21 21-4.35-4.35" />
                  </svg>
                </div>
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch(input)}
                  onFocus={() => setFocused(true)}
                  onBlur={() => setFocused(false)}
                  placeholder="paste transaction id…"
                  className="flex-1 bg-transparent outline-none py-4 pr-2 text-sm text-white placeholder-gray-600 font-mono min-w-0"
                  autoComplete="off"
                  spellCheck={false}
                />
                {input.length > 0 && (
                  <div className="hidden sm:flex items-center pr-3">
                    <span
                      className={`text-[9px] font-mono tabular-nums transition-colors ${isValid ? "text-emerald-500" : "text-gray-700"}`}
                    >
                      {input.trim().length}/64
                    </span>
                  </div>
                )}
                <button
                  onClick={() => handleSearch(input)}
                  disabled={!input.trim()}
                  className="m-1.5 px-4 sm:px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold tracking-wider bg-orange-500 hover:bg-orange-400 disabled:opacity-30 disabled:cursor-not-allowed text-black transition-all hover:shadow-lg hover:shadow-orange-500/25 shrink-0 whitespace-nowrap"
                >
                  SEARCH →
                </button>
              </div>
            </div>

            <div className="pt-1 text-left">
              <span className="text-[9px] text-gray-600 tracking-[0.25em] uppercase font-bold block mb-2">
                try:
              </span>
              <div className="relative">
                <div
                  className="space-y-1.5 overflow-y-auto examples-scroll"
                  style={{
                    maxHeight: "300px",
                    scrollBehavior: "smooth",
                    scrollbarWidth: "none",
                    msOverflowStyle: "none",
                  }}
                >
                  {EXAMPLES.map((ex) => (
                    <button
                      key={ex.txid}
                      onClick={() => handleSearch(ex.txid)}
                      className="group w-full cursor-pointer flex items-center gap-3 px-3 py-2.5 rounded-xl border border-gray-800/80 bg-gray-900/50 hover:border-orange-600/40 hover:bg-orange-950/20 transition-all duration-200 text-left"
                    >
                      <span
                        className={`text-[8px] px-1.5 py-0.5 rounded border font-bold tracking-widest shrink-0 min-w-[58px] text-center ${ex.badgeColor}`}
                      >
                        {ex.badge}
                      </span>
                      <div className="flex flex-col min-w-0">
                        <span className="text-[11px] text-orange-400/70 group-hover:text-orange-400 transition-colors leading-tight truncate">
                          {ex.label}
                        </span>
                        <span className="text-[9px] text-gray-700 leading-tight mt-0.5 truncate">
                          {ex.desc}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
                <div
                  className="absolute bottom-0 left-0 right-0 h-2 pointer-events-none rounded-b-xl"
                  style={{
                    background:
                      "linear-gradient(to bottom, transparent, rgba(6,10,14,0.92))",
                  }}
                />
                <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 flex gap-1 pointer-events-none">
                  <div className="w-1 h-1 rounded-full bg-orange-500/40" />
                  <div className="w-1 h-1 rounded-full bg-orange-500/20" />
                  <div className="w-1 h-1 rounded-full bg-orange-500/20" />
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 select-none">
            {[
              { icon: "⚡", text: "Real-time data" },
              { icon: "🔍", text: "Flow visualization" },
              { icon: "🔗", text: "Address explorer" },
              { icon: "📦", text: "Block inspector" },
            ].map(({ icon, text }) => (
              <div
                key={text}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gray-800/60 bg-gray-900/30 text-gray-600"
              >
                <span className="text-xs">{icon}</span>
                <span className="text-[10px] tracking-wider">{text}</span>
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-center gap-2">
              <div className="h-px flex-1 max-w-[60px] bg-gray-800" />
              <span className="text-[8px] tracking-[0.3em] text-gray-700 uppercase">
                Live Network
              </span>
              <div className="h-px flex-1 max-w-[60px] bg-gray-800" />
            </div>

            <div className="flex items-stretch justify-center gap-2">
              {statsLoading ? (
                <>
                  <SkeletonTile />
                  <SkeletonTile />
                  <SkeletonTile />
                  <SkeletonTile />
                </>
              ) : stats ? (
                <>
                  <StatTile
                    label="Block Height"
                    value={fmt(stats.block_height)}
                    live
                    accent="orange"
                  />
                  <StatTile
                    label="Mempool TXs"
                    value={fmt(stats.mempool_count)}
                    live
                  />
                  <StatTile
                    label="Priority Fee"
                    value={
                      stats.fee_fastest != null
                        ? `${stats.fee_fastest} s/vB`
                        : "—"
                    }
                    accent="orange"
                  />
                  <StatTile
                    label="Difficulty Δ"
                    value={fmtDiff(stats.difficulty_change)}
                    accent={diffAccent}
                  />
                </>
              ) : (
                <span className="text-[10px] text-gray-700">
                  stats unavailable
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#060a0e] to-transparent pointer-events-none" />
      </div>
    </>
  );
}
