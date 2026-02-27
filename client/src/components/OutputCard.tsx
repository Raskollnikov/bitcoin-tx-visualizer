import type { Vout } from "../types";
import { satsToBtc } from "../utils/format";

interface Props {
  output: Vout;
  index: number;
  onAddressClick: (addr: string) => void;
}

export default function OutputCard({ output, index, onAddressClick }: Props) {
  const address = output.scriptpubkey_address;

  return (
    <div className="bg-gray-800 border border-gray-700 hover:border-orange-500/50 rounded-xl p-4 transition">
      <div className="text-xs text-gray-500 mb-2">output #{index}</div>
      <button
        onClick={() => address && onAddressClick(address)}
        className="font-mono text-sm text-orange-400 hover:text-orange-300 truncate block w-full text-left"
      >
        {address ?? "OP_RETURN ( unspendable )"}
      </button>
      <div className="text-green-400 font-bold mt-1">
        {satsToBtc(output.value)} BTC
      </div>
      <div className="text-gray-500 text-xs mt-0.5">
        {output.value.toLocaleString()} sats · {output.scriptpubkey_type}
      </div>
    </div>
  );
}
