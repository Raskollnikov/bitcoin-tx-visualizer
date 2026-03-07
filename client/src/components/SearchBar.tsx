import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

const EXAMPLES = [
  {
    label: "genesis block coinbase",
    txid: "4a5e1e4baab89f3a32518a88c31bc87f618f76673e2cc77ab2127b7afdeda33b",
    desc: "Block #0 · Jan 3, 2009",
    title: "first event in Bitcoin space",
  },
  {
    label: "me -> Satoshi",
    txid: "a73335706adad5c400453fbc3c992f23cacf56b0ca964bc584f5f44ac7e0d412",
    desc: "i sent Bitcoin to Satoshi's legacy address",
    title: "personal gratitude to the creator of the Evolution!! ( Bitcoin )",
  },
  {
    label: "bitcoin pizza",
    txid: "a1075db55d416d3ca199f55b6084e2115b9345e16c5cf302fc80e9d5fbf5d48d",
    desc: "Block #57,043 · 10,000 BTC",
    title: "most expensive Pizza ever",
  },
  {
    label: "me -> Mom",
    txid: "26fc906de7a6756e99475b361c2d4091010b923522f0a4dda491068ea5074eb7",
    desc: "New Year's gift for mom, paid in Bitcoin",
    title:
      "it was the first time, i sent money to my mom for christmas as a gift, using Bitcoin instead of mastercard",
  },
];

interface Props {
  onSearch: (txid: string) => void;
  loading: boolean;
  initialValue?: string;
}

export default function SearchBar({
  onSearch,
  loading,
  initialValue = "",
}: Props) {
  const [input, setInput] = useState(initialValue);
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSearch = (txid?: string) => {
    const trimmed = (txid ?? input).trim();
    if (!trimmed) return;
    setInput(trimmed);
    onSearch(trimmed);
  };

  return (
    <div
      className="space-y-3"
      style={{ fontFamily: "'IBM Plex Mono', monospace" }}
    >
      <div className="relative">
        <div
          className="absolute inset-0 rounded-2xl transition-all duration-300 pointer-events-none"
          style={{
            boxShadow: focused
              ? "0 0 0 1px rgba(249,115,22,0.5), 0 0 24px rgba(249,115,22,0.12)"
              : "0 0 0 1px rgba(55,65,81,0.8)",
            borderRadius: "16px",
          }}
        />

        <div className="flex gap-0 overflow-hidden rounded-2xl bg-gray-900/80 border border-transparent">
          <div className="flex items-center pl-4 pr-3 text-gray-600">
            {loading ? (
              <div className="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className={`transition-colors ${focused ? "text-orange-500" : "text-gray-600"}`}
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
            )}
          </div>

          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder="paste transaction id…"
            className="flex-1 bg-transparent outline-none py-3.5 pr-2 text-sm text-white placeholder-gray-600 font-mono min-w-0"
            autoComplete="off"
            spellCheck={false}
          />

          <AnimatePresence>
            {input && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                onClick={() => {
                  setInput("");
                  inputRef.current?.focus();
                }}
                className="px-2 text-gray-600 hover:text-gray-400 transition-colors shrink-0"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </motion.button>
            )}
          </AnimatePresence>

          <motion.button
            onClick={() => handleSearch()}
            disabled={loading || !input.trim()}
            whileTap={{ scale: 0.97 }}
            className="m-1.5 px-4 sm:px-7 py-2 rounded-xl text-xs sm:text-sm font-bold tracking-wider
              bg-orange-500 hover:bg-orange-400 disabled:opacity-30 disabled:cursor-not-allowed
              text-black transition-colors shrink-0 whitespace-nowrap"
          >
            {loading ? "…" : "search →"}
          </motion.button>
        </div>
      </div>

      <div
        className="flex items-start gap-2 overflow-x-auto pb-1 scrollbar-none flex-col lg:flex-row"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        <span className="text-[10px] text-white-600 tracking-widest uppercase mt-1.5 mr-1 font-bold shrink-0">
          TRY:
        </span>
        {EXAMPLES.map((ex) => (
          <motion.button
            key={ex.txid}
            title={ex.title}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => handleSearch(ex.txid)}
            className="group w-full lg:w-[300px] flex flex-col shrink-0 px-3 py-1.5 rounded-lg border border-gray-800 bg-gray-900/60
              hover:border-orange-600/50 hover:bg-orange-950/20 transition-all text-left"
          >
            <span className="text-[11px] text-orange-400/80 group-hover:text-orange-400 transition-colors whitespace-nowrap">
              {ex.label}
            </span>
            <span className="text-[9px] text-gray-700 group-hover:text-gray-600 tracking-wider mt-0.5 whitespace-nowrap">
              {ex.desc}
            </span>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
