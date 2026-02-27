import { useMemo, useState } from "react";
import type { Transaction } from "../types";
import { satsToBtc } from "../utils/format";
import type { FlowNode } from "../types";

interface Props {
  tx: Transaction;
  onAddressClick: (addr: string) => void;
}

const MAX_INPUTS = 8;
const MAX_OUTPUTS = 8;

const W = 900;
const H = 560;
const NODE_W = 140;
const NODE_H = 44;
const TX_W = 80;
const TX_H = 80;
const COL_LEFT = 20;
const COL_RIGHT = W - NODE_W - 60;
const COL_CENTER = (W - TX_W) / 2;

function shortAddr(addr: string) {
  if (!addr || addr.length <= 14) return addr;
  return addr.slice(0, 7) + "…" + addr.slice(-7);
}

function formatBtc(sats: number) {
  return satsToBtc(sats);
}

function buildNodes(tx: Transaction): FlowNode[] {
  const nodes: FlowNode[] = [];
  const isCoinbase = tx.vin[0]?.is_coinbase;

  const visInputs = tx.vin.slice(0, MAX_INPUTS);
  const hidInputs = tx.vin.slice(MAX_INPUTS);
  const inputItems: {
    label: string;
    value: number;
    addr?: string;
    isMore?: boolean;
    isCoinbase?: boolean;
  }[] = [];

  if (isCoinbase) {
    const reward = tx.vout.reduce((s, v) => s + (v.value ?? 0), 0);
    inputItems.push({
      label: "⛏  Coinbase Reward",
      value: reward,
      isCoinbase: true,
    });
  } else {
    visInputs.forEach((inp) => {
      const addr = inp.prevout?.scriptpubkey_address;
      inputItems.push({
        label: addr ? shortAddr(addr) : "unknown",
        value: inp.prevout?.value ?? 0,
        addr,
      });
    });
    if (hidInputs.length > 0) {
      const hidVal = hidInputs.reduce((s, v) => s + (v.prevout?.value ?? 0), 0);
      inputItems.push({
        label: `+${hidInputs.length} more inputs`,
        value: hidVal,
        isMore: true,
      });
    }
  }

  const visOutputs = tx.vout.slice(0, MAX_OUTPUTS);
  const hidOutputs = tx.vout.slice(MAX_OUTPUTS);
  const outputItems: {
    label: string;
    value: number;
    addr?: string;
    isMore?: boolean;
  }[] = [];
  visOutputs.forEach((out) => {
    const addr = out.scriptpubkey_address;
    outputItems.push({
      label: addr ? shortAddr(addr) : "OP_RETURN",
      value: out.value ?? 0,
      addr,
    });
  });
  if (hidOutputs.length > 0) {
    const hidVal = hidOutputs.reduce((s, v) => s + (v.value ?? 0), 0);
    outputItems.push({
      label: `+${hidOutputs.length} more outputs`,
      value: hidVal,
      isMore: true,
    });
  }

  const totalSideH = H - 80;
  const inputSpacing = Math.min(
    60,
    totalSideH / Math.max(inputItems.length, 1),
  );
  const outputSpacing = Math.min(
    60,
    totalSideH / Math.max(outputItems.length, 1),
  );
  const inputStartY = (H - (inputItems.length - 1) * inputSpacing - NODE_H) / 2;
  const outputStartY =
    (H - (outputItems.length - 1) * outputSpacing - NODE_H) / 2;

  inputItems.forEach((item, i) => {
    nodes.push({
      id: `input-${i}`,
      label: item.label,
      value: item.value,
      addr: item.addr,
      y: inputStartY + i * inputSpacing,
      side: "left",
      isMore: item.isMore,
      isCoinbase: item.isCoinbase,
    });
  });

  nodes.push({
    id: "tx-center",
    label: "TX",
    value: tx.totalInputValue ?? 0,
    y: (H - TX_H) / 2,
    side: "center",
  });

  outputItems.forEach((item, i) => {
    nodes.push({
      id: `output-${i}`,
      label: item.label,
      value: item.value,
      addr: item.addr,
      y: outputStartY + i * outputSpacing,
      side: "right",
      isMore: item.isMore,
    });
  });

  return nodes;
}

function nodeX(n: FlowNode) {
  if (n.side === "left") return COL_LEFT;
  if (n.side === "right") return COL_RIGHT;
  return COL_CENTER;
}
function nodeW(n: FlowNode) {
  return n.side === "center" ? TX_W : NODE_W;
}
function nodeH(n: FlowNode) {
  return n.side === "center" ? TX_H : NODE_H;
}
function nodeCenterY(n: FlowNode) {
  return n.y + nodeH(n) / 2;
}

function inputPath(inp: FlowNode, txNode: FlowNode) {
  const x1 = nodeX(inp) + nodeW(inp);
  const y1 = nodeCenterY(inp);
  const x2 = nodeX(txNode);
  const y2 = nodeCenterY(txNode);
  const cp = x1 + (x2 - x1) * 0.55;
  return `M ${x1} ${y1} C ${cp} ${y1}, ${cp} ${y2}, ${x2} ${y2}`;
}

function outputPath(txNode: FlowNode, out: FlowNode) {
  const x1 = nodeX(txNode) + nodeW(txNode);
  const y1 = nodeCenterY(txNode);
  const x2 = nodeX(out);
  const y2 = nodeCenterY(out);
  const cp = x1 + (x2 - x1) * 0.45;
  return `M ${x1} ${y1} C ${cp} ${y1}, ${cp} ${y2}, ${x2} ${y2}`;
}

function strokeW(value: number, total: number) {
  if (!total || !value) return 2;
  return Math.max(2, Math.min(28, (value / total) * 80));
}

export default function FlowDiagram({ tx, onAddressClick }: Props) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const nodes = useMemo(() => buildNodes(tx), [tx]);

  const inputs = nodes.filter((n) => n.side === "left");
  const outputs = nodes.filter((n) => n.side === "right");
  const txNode = nodes.find((n) => n.side === "center")!;

  const totalIn = inputs.reduce((s, n) => s + n.value, 0);
  const totalOut = outputs.reduce((s, n) => s + n.value, 0);

  const hasFee = tx.fee > 0;

  return (
    <div
      className="w-full rounded-2xl border border-gray-800 bg-gray-950 p-2"
      style={{ overflowX: "auto" }}
    >
      <svg
        viewBox={`0 0 ${W} ${H}`}
        width="100%"
        style={{
          minWidth: 580,
          height: "auto",
          display: "block",
          overflow: "visible",
          isolation: "isolate",
        }}
      >
        <defs>
          <filter id="glowPath" x="-5%" y="-50%" width="110%" height="200%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="glow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter
            id="glowRight"
            x="-40"
            y="-12"
            width={NODE_W + 80}
            height={NODE_H + 24}
            filterUnits="userSpaceOnUse"
          >
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <pattern
            id="grid"
            width="40"
            height="40"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 40 0 L 0 0 0 40"
              fill="none"
              stroke="#ffffff06"
              strokeWidth="0.5"
            />
          </pattern>
        </defs>

        <rect width={W} height={H} fill="url(#grid)" />

        {inputs.map((inp) => {
          const isHov = hoveredId === inp.id || hoveredId === "tx-center";
          const sw = strokeW(inp.value, totalIn);
          const lx =
            nodeX(inp) +
            nodeW(inp) +
            (nodeX(txNode) - nodeX(inp) - nodeW(inp)) * 0.45;
          const ly = nodeCenterY(inp) - sw / 2 - 7;
          return (
            <g key={`pi-${inp.id}`}>
              <path
                d={inputPath(inp, txNode)}
                stroke="#f97316"
                strokeWidth={sw}
                fill="none"
                strokeLinecap="round"
                opacity={hoveredId && !isHov ? 0.1 : isHov ? 0.95 : 0.5}
                filter={isHov ? "url(#glow)" : undefined}
                style={{ transition: "opacity 0.2s" }}
              />
              {inp.value > 0 && (
                <text
                  x={lx}
                  y={ly}
                  textAnchor="middle"
                  fontSize={10}
                  fill={isHov ? "#fbbf24" : "#92400e"}
                  fontFamily="'Courier New', monospace"
                  opacity={hoveredId && !isHov ? 0.12 : 1}
                  style={{ transition: "fill 0.2s" }}
                >
                  {formatBtc(inp.value)} BTC
                </text>
              )}
            </g>
          );
        })}

        {outputs.map((out) => {
          const isHov = hoveredId === out.id || hoveredId === "tx-center";
          const sw = strokeW(out.value, totalOut);
          const lx =
            nodeX(txNode) +
            nodeW(txNode) +
            (nodeX(out) - nodeX(txNode) - nodeW(txNode)) * 0.55;
          const ly = nodeCenterY(out) - sw / 2 - 7;
          return (
            <g key={`po-${out.id}`}>
              <path
                d={outputPath(txNode, out)}
                stroke="#f97316"
                strokeWidth={sw}
                fill="none"
                strokeLinecap="round"
                opacity={hoveredId && !isHov ? 0.1 : isHov ? 0.95 : 0.5}
                filter={isHov ? "url(#glow)" : undefined}
                style={{ transition: "opacity 0.2s" }}
              />
              {out.value > 0 && (
                <text
                  x={lx}
                  y={ly}
                  textAnchor="middle"
                  fontSize={10}
                  fill={isHov ? "#fbbf24" : "#92400e"}
                  fontFamily="'Courier New', monospace"
                  opacity={hoveredId && !isHov ? 0.12 : 1}
                  style={{ transition: "fill 0.2s" }}
                >
                  {formatBtc(out.value)} BTC
                </text>
              )}
            </g>
          );
        })}

        {hasFee &&
          (() => {
            const feeNodeW = 120;
            const feeNodeH = 44;
            const feeNodeX = COL_CENTER + TX_W + 80;
            const feeNodeY = txNode.y + TX_H + 40;
            const feeNodeCenterY = feeNodeY + feeNodeH / 2;

            const x1 = COL_CENTER + TX_W;
            const y1 = nodeCenterY(txNode);
            const x2 = feeNodeX;
            const y2 = feeNodeCenterY;
            const cp1x = x1 + (x2 - x1) * 0.5;
            const cp1y = y1;
            const cp2x = x1 + (x2 - x1) * 0.5;
            const cp2y = y2;
            const feePath = `M ${x1} ${y1} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${x2} ${y2}`;

            const isHov = hoveredId === "tx-center";

            return (
              <g
                opacity={
                  hoveredId && hoveredId !== "tx-center" && hoveredId !== "fee"
                    ? 0.2
                    : 1
                }
                style={{ transition: "opacity 0.2s" }}
              >
                <path
                  d={feePath}
                  stroke="#d97706"
                  strokeWidth={3}
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray="6 4"
                  opacity={isHov ? 0.95 : 0.45}
                  filter={isHov ? "url(#glow)" : undefined}
                  style={{ transition: "opacity 0.2s" }}
                />
                <text
                  x={x1 + (x2 - x1) * 0.45}
                  y={y1 + (y2 - y1) * 0.45 - 8}
                  textAnchor="middle"
                  fontSize={10}
                  fontFamily="'Courier New', monospace"
                  fill={isHov ? "#fbbf24" : "#92400e"}
                  style={{ transition: "fill 0.2s" }}
                >
                  {formatBtc(tx.fee)} BTC
                </text>
                <g transform={`translate(${feeNodeX}, ${feeNodeY})`}>
                  <rect
                    width={feeNodeW}
                    height={feeNodeH}
                    rx={8}
                    fill="#1c1000"
                    stroke={isHov ? "#f97316" : "#92400e"}
                    strokeWidth={isHov ? 1.5 : 1}
                    filter={isHov ? "url(#glowRight)" : undefined}
                    style={{ transition: "stroke 0.15s" }}
                  />
                  <rect
                    x={feeNodeW - 3}
                    y={8}
                    width={3}
                    height={feeNodeH - 16}
                    rx={2}
                    fill="#d97706"
                    opacity={0.8}
                  />
                  <text
                    x={feeNodeW - 14}
                    y={feeNodeH / 2 - 4}
                    textAnchor="end"
                    fontSize={10}
                    fontFamily="'Courier New', monospace"
                    fill="#d97706"
                    fontWeight={600}
                  >
                    ⛏ Miner Fee
                  </text>
                  <text
                    x={feeNodeW - 14}
                    y={feeNodeH / 2 + 10}
                    textAnchor="end"
                    fontSize={10}
                    fontFamily="'Courier New', monospace"
                    fill={isHov ? "#fbbf24" : "#78350f"}
                  >
                    {formatBtc(tx.fee)} BTC
                  </text>
                </g>
              </g>
            );
          })()}

        {inputs.map((node) => {
          const isHov = hoveredId === node.id;
          const isClickable = !!node.addr && !node.isMore && !node.isCoinbase;
          return (
            <g
              key={node.id}
              transform={`translate(${nodeX(node)}, ${node.y})`}
              style={{ cursor: isClickable ? "pointer" : "default" }}
              onMouseEnter={() => setHoveredId(node.id)}
              onMouseLeave={() => setHoveredId(null)}
              onClick={() => {
                if (isClickable && node.addr) onAddressClick(node.addr);
              }}
            >
              <rect
                width={NODE_W}
                height={NODE_H}
                rx={8}
                fill={
                  node.isCoinbase
                    ? "#1c1a0e"
                    : node.isMore
                      ? "#111827"
                      : "#0f1923"
                }
                stroke={
                  node.isCoinbase
                    ? "#ca8a04"
                    : isHov
                      ? "#f97316"
                      : node.isMore
                        ? "#374151"
                        : "#1e3a2f"
                }
                strokeWidth={isHov ? 1.5 : 1}
                filter={isHov ? "url(#glow)" : undefined}
                style={{ transition: "stroke 0.15s" }}
              />
              {!node.isMore && (
                <rect
                  width={3}
                  height={NODE_H - 16}
                  x={0}
                  y={8}
                  rx={2}
                  fill={node.isCoinbase ? "#ca8a04" : "#f97316"}
                  opacity={isHov ? 1 : 0.6}
                />
              )}
              <text
                x={14}
                y={NODE_H / 2 - 4}
                fontSize={11}
                fontFamily="'Courier New', monospace"
                fill={
                  node.isMore
                    ? "#6b7280"
                    : node.isCoinbase
                      ? "#fbbf24"
                      : "#d1d5db"
                }
                fontWeight={isHov ? 600 : 400}
              >
                {node.label}
              </text>
              {!node.isMore && (
                <text
                  x={14}
                  y={NODE_H / 2 + 10}
                  fontSize={10}
                  fontFamily="'Courier New', monospace"
                  fill={isHov ? "#fbbf24" : "#4b5563"}
                >
                  {formatBtc(node.value)} BTC
                </text>
              )}
            </g>
          );
        })}

        {txNode &&
          (() => {
            const isHov = hoveredId === "tx-center";
            return (
              <g
                transform={`translate(${COL_CENTER}, ${txNode.y})`}
                onMouseEnter={() => setHoveredId("tx-center")}
                onMouseLeave={() => setHoveredId(null)}
                style={{ cursor: "default" }}
              >
                <rect
                  x={-6}
                  y={-6}
                  width={TX_W + 12}
                  height={TX_H + 12}
                  rx={16}
                  fill="none"
                  stroke="#f97316"
                  strokeWidth={isHov ? 1.5 : 0.5}
                  opacity={isHov ? 0.5 : 0.2}
                  filter="url(#glow)"
                  style={{ transition: "all 0.2s" }}
                />
                <rect
                  width={TX_W}
                  height={TX_H}
                  rx={12}
                  fill="#1a0f00"
                  stroke="#f97316"
                  strokeWidth={1.5}
                  filter={isHov ? "url(#glow)" : undefined}
                />
                <text
                  x={TX_W / 2}
                  y={TX_H / 2 - 6}
                  textAnchor="middle"
                  fontSize={22}
                  fill="#f97316"
                >
                  ₿
                </text>
                <text
                  x={TX_W / 2}
                  y={TX_H / 2 + 12}
                  textAnchor="middle"
                  fontSize={9}
                  fontFamily="'Courier New', monospace"
                  fill="#6b7280"
                  letterSpacing={1}
                >
                  {tx.txid.slice(0, 6)}…
                </text>
              </g>
            );
          })()}

        {outputs.map((node) => {
          const isHov = hoveredId === node.id || hoveredId === "tx-center";

          const isOpReturn = node.label === "OP_RETURN";
          const isClickable = !!node.addr && !node.isMore && !isOpReturn;
          return (
            <g
              key={node.id}
              transform={`translate(${nodeX(node)}, ${node.y})`}
              style={{ cursor: isClickable ? "pointer" : "default" }}
              onMouseEnter={() => setHoveredId(node.id)}
              onMouseLeave={() => setHoveredId(null)}
              onClick={() => {
                if (isClickable && node.addr) onAddressClick(node.addr);
              }}
            >
              <rect
                width={NODE_W}
                height={NODE_H}
                rx={8}
                fill={
                  isOpReturn ? "#0f0f1a" : node.isMore ? "#111827" : "#0f1923"
                }
                stroke={
                  isOpReturn
                    ? "#4c1d95"
                    : isHov
                      ? "#f97316"
                      : node.isMore
                        ? "#374151"
                        : "#1e3a2f"
                }
                strokeWidth={isHov ? 1.5 : 1}
                filter={isHov ? "url(#glowRight)" : undefined}
                style={{ transition: "stroke 0.15s" }}
              />
              {!node.isMore && (
                <rect
                  x={NODE_W - 3}
                  y={8}
                  width={3}
                  height={NODE_H - 16}
                  rx={2}
                  fill={isOpReturn ? "#7c3aed" : "#f97316"}
                  opacity={isHov ? 1 : 0.6}
                />
              )}
              <text
                x={NODE_W - 14}
                y={NODE_H / 2 - 4}
                textAnchor="end"
                fontSize={11}
                fontFamily="'Courier New', monospace"
                fill={
                  node.isMore ? "#6b7280" : isOpReturn ? "#7c3aed" : "#d1d5db"
                }
                fontWeight={isHov ? 600 : 400}
              >
                {node.label}
              </text>
              {!node.isMore && (
                <text
                  x={NODE_W - 14}
                  y={NODE_H / 2 + 10}
                  textAnchor="end"
                  fontSize={10}
                  fontFamily="'Courier New', monospace"
                  fill={isHov ? "#fbbf24" : "#4b5563"}
                >
                  {formatBtc(node.value)} BTC
                </text>
              )}
            </g>
          );
        })}

        <text
          x={COL_LEFT + NODE_W / 2}
          y={18}
          textAnchor="middle"
          fontSize={10}
          fill="#374151"
          fontFamily="'Courier New', monospace"
          letterSpacing={2}
        >
          INPUTS ({tx.vin.length})
        </text>
        <text
          x={COL_RIGHT + NODE_W / 2}
          y={18}
          textAnchor="middle"
          fontSize={10}
          fill="#374151"
          fontFamily="'Courier New', monospace"
          letterSpacing={2}
        >
          OUTPUTS ({tx.vout.length})
        </text>

        {(tx.vin.length > MAX_INPUTS || tx.vout.length > MAX_OUTPUTS) && (
          <text
            x={W / 2}
            y={H - 10}
            textAnchor="middle"
            fontSize={10}
            fill="#374151"
            fontFamily="'Courier New', monospace"
          >
            showing {Math.min(tx.vin.length, MAX_INPUTS)}/{tx.vin.length} inputs
            · {Math.min(tx.vout.length, MAX_OUTPUTS)}/{tx.vout.length} outputs
          </text>
        )}
      </svg>
    </div>
  );
}
