import type { Vin } from "../types";
import { satsToBtc, shortenHash } from "../utils/format";

interface Props {
  input: Vin;
  index: number;
  onAddressClick: (addr: string) => void;
}

export default function InputCard({ input, index, onAddressClick }: Props) {
  const address = input.prevout?.scriptpubkey_address;
  const value = input.prevout?.value ?? 0;

  return (
    <div className="bg-gray-800 border border-gray-700 hover:border-orange-500/50 rounded-xl p-4 transition">
      <div className="text-xs text-gray-500 mb-2">input #{index}</div>

      {input.is_coinbase ? (
        <div className="text-yellow-400 font-bold">
          ⛏ coinbase  new BTC minted
        </div>
      ) : (
        <>
          <button
            onClick={() => address && onAddressClick(address)}
            className="font-mono text-sm text-orange-400 hover:text-orange-300 truncate block w-full text-left"
          >
            {address ? shortenHash(address, 12, 6) : "unknown"}
          </button>
          <div className="text-green-400 font-bold mt-1">
            {satsToBtc(value)} BTC
          </div>
          <div className="text-gray-500 text-xs mt-0.5">
            {value.toLocaleString()} sats
          </div>
        </>
      )}
    </div>
  );
}
