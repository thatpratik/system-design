"use client";

import { useState, useMemo } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  BackgroundVariant,
  Handle,
  Position,
  type NodeProps,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import {
  Monitor,
  Server,
  Database,
  Zap,
  Network,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ── Types ────────────────────────────────────────────────────────────────────

type Mode = "overview" | "read" | "write";

type SystemNodeData = {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  sublabel?: string;
  border: string;
  text: string;
  bg: string;
};

// ── Custom node ───────────────────────────────────────────────────────────────

function SystemNode({ data }: NodeProps) {
  const d = data as SystemNodeData;
  return (
    <div
      className={cn(
        "px-3 py-2.5 rounded-xl border-2 shadow-sm min-w-[148px] select-none",
        d.bg,
        d.border
      )}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!w-2 !h-2 !bg-slate-400 !border-0"
      />
      <div className="flex items-center gap-2">
        <d.icon className={cn("h-4 w-4 shrink-0", d.text)} />
        <div>
          <p className={cn("text-xs font-semibold leading-tight", d.text)}>{d.label}</p>
          {d.sublabel && (
            <p className="text-[10px] leading-tight text-slate-400">{d.sublabel}</p>
          )}
        </div>
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-2 !h-2 !bg-slate-400 !border-0"
      />
    </div>
  );
}

const nodeTypes = { system: SystemNode };

// ── Node definitions ──────────────────────────────────────────────────────────

const NODES = [
  {
    id: "client",
    type: "system",
    position: { x: 248, y: 0 },
    data: {
      icon: Monitor,
      label: "Client",
      sublabel: "Browser / Mobile",
      border: "border-blue-400",
      bg: "bg-blue-50",
      text: "text-blue-700",
    },
  },
  {
    id: "lb",
    type: "system",
    position: { x: 228, y: 115 },
    data: {
      icon: Network,
      label: "Load Balancer",
      sublabel: "Round Robin",
      border: "border-amber-400",
      bg: "bg-amber-50",
      text: "text-amber-700",
    },
  },
  {
    id: "app",
    type: "system",
    position: { x: 228, y: 245 },
    data: {
      icon: Server,
      label: "App Server",
      sublabel: "Scales horizontally",
      border: "border-emerald-400",
      bg: "bg-emerald-50",
      text: "text-emerald-700",
    },
  },
  {
    id: "cache",
    type: "system",
    position: { x: 60, y: 380 },
    data: {
      icon: Zap,
      label: "Cache",
      sublabel: "Redis",
      border: "border-orange-400",
      bg: "bg-orange-50",
      text: "text-orange-700",
    },
  },
  {
    id: "db",
    type: "system",
    position: { x: 400, y: 380 },
    data: {
      icon: Database,
      label: "Database",
      sublabel: "PostgreSQL",
      border: "border-violet-400",
      bg: "bg-violet-50",
      text: "text-violet-700",
    },
  },
];

// ── Edge definitions ──────────────────────────────────────────────────────────

const EDGE_DEFS = [
  { id: "c-lb",    source: "client", target: "lb",    label: "Short URL / Create" },
  { id: "lb-app",  source: "lb",     target: "app",   label: "Route request" },
  { id: "app-c",   source: "app",    target: "cache", label: "1. Key lookup" },
  { id: "app-db",  source: "app",    target: "db",    label: "2. On miss / Write" },
];

const READ_ACTIVE  = new Set(["c-lb", "lb-app", "app-c"]);
const WRITE_ACTIVE = new Set(["c-lb", "lb-app", "app-db"]);

const COLORS: Record<Mode, string> = {
  overview: "#818cf8",
  read:     "#22c55e",
  write:    "#f97316",
};

function buildEdges(mode: Mode) {
  return EDGE_DEFS.map((e) => {
    const active =
      mode === "overview" ||
      (mode === "read"  && READ_ACTIVE.has(e.id)) ||
      (mode === "write" && WRITE_ACTIVE.has(e.id));

    return {
      ...e,
      type: "smoothstep",
      animated: active,
      style: {
        stroke: active ? COLORS[mode] : "#d1d5db",
        strokeWidth: active ? 2 : 1.5,
        opacity: active ? 1 : 0.3,
      },
      labelStyle: { fill: "#64748b", fontSize: 10, fontWeight: 500 },
      labelBgStyle: { fill: "#ffffff", fillOpacity: 0.9 },
      labelBgPadding: [4, 3] as [number, number],
      labelBgBorderRadius: 4,
      label: active ? e.label : undefined,
    };
  });
}

// ── Legend ────────────────────────────────────────────────────────────────────

const LEGEND = [
  { color: "bg-blue-400",    label: "Client" },
  { color: "bg-amber-400",   label: "Load Balancer" },
  { color: "bg-emerald-400", label: "App Server" },
  { color: "bg-orange-400",  label: "Cache" },
  { color: "bg-violet-400",  label: "Database" },
];

// ── Main component ────────────────────────────────────────────────────────────

export function UrlShortenerDiagram() {
  const [mode, setMode] = useState<Mode>("overview");
  const edges = useMemo(() => buildEdges(mode), [mode]);

  const modeButtons: { value: Mode; label: string }[] = [
    { value: "overview", label: "Architecture" },
    { value: "read",     label: "Read Path" },
    { value: "write",    label: "Write Path" },
  ];

  return (
    <div className="not-prose my-8 rounded-xl border bg-slate-50 overflow-hidden">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-b bg-white">
        <div className="flex items-center gap-1">
          {modeButtons.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setMode(value)}
              className={cn(
                "px-3 py-1 rounded-md text-xs font-medium transition-colors",
                mode === value
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Legend */}
        <div className="hidden sm:flex items-center gap-3">
          {LEGEND.map(({ color, label }) => (
            <span key={label} className="flex items-center gap-1.5 text-[11px] text-slate-500">
              <span className={cn("h-2 w-2 rounded-full", color)} />
              {label}
            </span>
          ))}
        </div>
      </div>

      {/* Mode description */}
      <div className="px-4 py-2 text-[11px] text-muted-foreground bg-white border-b">
        {mode === "overview" && "Full architecture — all data flows between components."}
        {mode === "read"  && "Read path — client visits a short URL and gets redirected. App checks cache first; falls back to DB on a miss."}
        {mode === "write" && "Write path — client submits a long URL. App generates a short key, stores the mapping in the DB, and optionally warms the cache."}
      </div>

      {/* Diagram */}
      <div style={{ height: 520 }} className="w-full">
        <ReactFlow
          nodes={NODES}
          edges={edges}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          nodesDraggable={false}
          nodesConnectable={false}
          elementsSelectable={false}
          zoomOnScroll={false}
          panOnDrag={true}
        >
          <Background
            variant={BackgroundVariant.Dots}
            gap={24}
            size={1}
            color="#e2e8f0"
          />
          <Controls showInteractive={false} />
        </ReactFlow>
      </div>
    </div>
  );
}
