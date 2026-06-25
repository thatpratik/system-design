"use client";

import { useState, useMemo, useCallback, useRef } from "react";
import { useTheme } from "next-themes";
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  Handle,
  Position,
  type NodeProps,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { Monitor, Server, Network, ArrowRight, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

type Algorithm = "round-robin" | "least-connections" | "ip-hash";
type Phase = "idle" | "to-lb" | "to-server";

// ── Custom nodes ─────────────────────────────────────────────────────────────

function HeaderNode({ data }: NodeProps) {
  const d = data as {
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    sublabel: string;
    borderColor: string;
    bgColor: string;
    textColor: string;
  };
  return (
    <div
      className="px-3 py-2.5 rounded-xl border-2 shadow-sm min-w-[148px] select-none"
      style={{ borderColor: d.borderColor, backgroundColor: d.bgColor }}
    >
      <Handle type="target" position={Position.Top} className="!w-2 !h-2 !bg-slate-400 !border-0" />
      <div className="flex items-center gap-2">
        <span style={{ color: d.textColor }}>
          <d.icon className="h-4 w-4 shrink-0" />
        </span>
        <div>
          <p className="text-xs font-semibold leading-tight" style={{ color: d.textColor }}>
            {d.label}
          </p>
          <p className="text-[10px] leading-tight text-slate-400">{d.sublabel}</p>
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} className="!w-2 !h-2 !bg-slate-400 !border-0" />
    </div>
  );
}

function ServerNode({ data }: NodeProps) {
  const d = data as {
    label: string;
    count: number;
    active: boolean;
    borderColor: string;
    textColor: string;
  };
  return (
    <div
      className="px-3 py-2.5 rounded-xl border-2 shadow-sm min-w-[110px] select-none"
      style={{
        borderColor: d.borderColor,
        backgroundColor: d.active ? `${d.borderColor}22` : `${d.borderColor}0d`,
        boxShadow: d.active ? `0 0 0 3px ${d.borderColor}30, 0 2px 8px ${d.borderColor}25` : undefined,
        transform: d.active ? "scale(1.05)" : "scale(1)",
        transition: "transform 150ms, background-color 150ms, box-shadow 150ms",
      }}
    >
      <Handle type="target" position={Position.Top} className="!w-2 !h-2 !bg-slate-400 !border-0" />
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <Server className="h-3.5 w-3.5 shrink-0" style={{ color: d.textColor }} />
          <p className="text-xs font-semibold" style={{ color: d.textColor }}>
            {d.label}
          </p>
        </div>
        <span
          className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-full"
          style={{
            backgroundColor: d.active ? `${d.borderColor}30` : "hsl(var(--muted))",
            color: d.textColor,
          }}
        >
          {d.count}
        </span>
      </div>
      <Handle type="source" position={Position.Bottom} className="!w-2 !h-2 !bg-slate-400 !border-0" />
    </div>
  );
}

const nodeTypes = { header: HeaderNode, server: ServerNode };

// ── Per-server color palette ──────────────────────────────────────────────────

const SERVER_PALETTE_LIGHT = [
  { borderColor: "#34d399", textColor: "#065f46" },
  { borderColor: "#60a5fa", textColor: "#1e3a8a" },
  { borderColor: "#c084fc", textColor: "#581c87" },
];

const SERVER_PALETTE_DARK = [
  { borderColor: "#34d399", textColor: "#6ee7b7" },
  { borderColor: "#60a5fa", textColor: "#93c5fd" },
  { borderColor: "#c084fc", textColor: "#d8b4fe" },
];

// ── Main component ────────────────────────────────────────────────────────────

export function LoadBalancerDiagram() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const SERVER_PALETTE = isDark ? SERVER_PALETTE_DARK : SERVER_PALETTE_LIGHT;

  const [algorithm, setAlgorithm] = useState<Algorithm>("round-robin");
  const [phase, setPhase] = useState<Phase>("idle");
  const [activeServer, setActiveServer] = useState<number>(-1);
  const [counts, setCounts] = useState([0, 0, 0]);
  const [totalRequests, setTotalRequests] = useState(0);
  const rrIndexRef = useRef(0);

  const resetStats = useCallback(() => {
    setCounts([0, 0, 0]);
    setTotalRequests(0);
    rrIndexRef.current = 0;
  }, []);

  const sendRequest = useCallback(() => {
    if (phase !== "idle") return;

    let next: number;
    if (algorithm === "round-robin") {
      next = rrIndexRef.current % 3;
      rrIndexRef.current = (rrIndexRef.current + 1) % 3;
    } else if (algorithm === "least-connections") {
      const min = Math.min(...counts);
      const mins = counts.reduce<number[]>((acc, c, i) => (c === min ? [...acc, i] : acc), []);
      next = mins[Math.floor(Math.random() * mins.length)];
    } else {
      next = Math.floor(Math.random() * 3);
    }

    setActiveServer(next);
    setPhase("to-lb");
    setTimeout(() => setPhase("to-server"), 450);
    setTimeout(() => {
      setCounts((prev) => {
        const updated = [...prev];
        updated[next]++;
        return updated;
      });
      setTotalRequests((t) => t + 1);
      setPhase("idle");
      setTimeout(() => setActiveServer(-1), 250);
    }, 1050);
  }, [phase, algorithm, counts]);

  const nodes = useMemo(
    () => [
      {
        id: "client",
        type: "header",
        position: { x: 170, y: 0 },
        data: {
          icon: Monitor,
          label: "Client",
          sublabel: "HTTP Request",
          borderColor: "#60a5fa",
          bgColor: isDark ? "#0f2544" : "#eff6ff",
          textColor: isDark ? "#93c5fd" : "#1d4ed8",
        },
      },
      {
        id: "lb",
        type: "header",
        position: { x: 150, y: 120 },
        data: {
          icon: Network,
          label: "Load Balancer",
          sublabel:
            algorithm === "round-robin"
              ? "Round Robin"
              : algorithm === "least-connections"
              ? "Least Connections"
              : "IP Hash",
          borderColor: "#fbbf24",
          bgColor: isDark ? "#2d1d04" : "#fffbeb",
          textColor: isDark ? "#fcd34d" : "#b45309",
        },
      },
      ...([0, 1, 2] as const).map((i) => ({
        id: `s${i + 1}`,
        type: "server",
        position: { x: i * 170 + 10, y: 265 },
        data: {
          label: `Server ${i + 1}`,
          count: counts[i],
          active: activeServer === i && phase === "to-server",
          ...SERVER_PALETTE[i],
        },
      })),
    ],
    [algorithm, counts, activeServer, phase]
  );

  const edges = useMemo(() => {
    const ACTIVE = { stroke: "#22c55e", strokeWidth: 2, opacity: 1 };
    const DIM = { stroke: "#d1d5db", strokeWidth: 1.5, opacity: 0.3 };
    const toLb = phase !== "idle";
    const toServer = phase === "to-server";

    return [
      {
        id: "c-lb",
        source: "client",
        target: "lb",
        type: "smoothstep",
        animated: toLb,
        style: toLb ? ACTIVE : DIM,
      },
      ...[0, 1, 2].map((i) => ({
        id: `lb-s${i + 1}`,
        source: "lb",
        target: `s${i + 1}`,
        type: "smoothstep",
        animated: toServer && activeServer === i,
        style: toServer && activeServer === i ? ACTIVE : DIM,
      })),
    ];
  }, [phase, activeServer]);

  const statusText = useMemo(() => {
    if (phase === "to-lb") return "Routing request to load balancer…";
    if (phase === "to-server") return `Forwarding to Server ${activeServer + 1}`;
    if (totalRequests === 0)
      return "Press 'Send Request' to simulate traffic — watch how requests distribute across servers";
    return `${totalRequests} requests distributed  ·  ${counts.map((c, i) => `S${i + 1}: ${c}`).join("  ·  ")}`;
  }, [phase, activeServer, totalRequests, counts]);

  const algorithms: { value: Algorithm; label: string }[] = [
    { value: "round-robin", label: "Round Robin" },
    { value: "least-connections", label: "Least Connections" },
    { value: "ip-hash", label: "IP Hash" },
  ];

  return (
    <div className="not-prose my-8 rounded-xl border bg-background overflow-hidden">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-b bg-card">
        <div className="flex items-center gap-1">
          {algorithms.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => {
                setAlgorithm(value);
                resetStats();
              }}
              className={cn(
                "px-3 py-1 rounded-md text-xs font-medium transition-colors",
                algorithm === value
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          {totalRequests > 0 && (
            <button
              onClick={resetStats}
              disabled={phase !== "idle"}
              className="flex items-center gap-1 px-2 py-1 rounded-md text-xs text-muted-foreground hover:bg-accent hover:text-accent-foreground disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <RotateCcw className="h-3 w-3" />
              Reset
            </button>
          )}
          <button
            onClick={sendRequest}
            disabled={phase !== "idle"}
            className="flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800 dark:hover:bg-emerald-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ArrowRight className="h-3 w-3" />
            Send Request
          </button>
        </div>
      </div>

      {/* Status */}
      <div className="px-4 py-2 text-[11px] text-muted-foreground bg-card border-b font-mono">
        {statusText}
      </div>

      {/* Diagram */}
      <div style={{ height: 390 }} className="w-full">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.25 }}
          nodesDraggable={false}
          nodesConnectable={false}
          elementsSelectable={false}
          zoomOnScroll={false}
          panOnDrag={false}
          preventScrolling={false}
        >
          <Background variant={BackgroundVariant.Dots} gap={24} size={1} color="hsl(var(--border))" />
        </ReactFlow>
      </div>
    </div>
  );
}
