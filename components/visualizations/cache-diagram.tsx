"use client";

import { useState, useMemo, useCallback } from "react";
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  Handle,
  Position,
  type NodeProps,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { Monitor, Database, Zap, Play, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

type Phase = "idle" | "checking" | "hit" | "miss" | "fetching-db" | "populating";

// ── Custom node ───────────────────────────────────────────────────────────────

function CacheFlowNode({ data }: NodeProps) {
  const d = data as {
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    sublabel: string;
    borderColor: string;
    bgColor: string;
    textColor: string;
    badge?: string;
    badgeTextColor?: string;
    badgeBgColor?: string;
    glow?: boolean;
  };
  return (
    <div
      className="px-3 py-2.5 rounded-xl border-2 shadow-sm min-w-[172px] select-none"
      style={{
        borderColor: d.borderColor,
        backgroundColor: d.bgColor,
        boxShadow: d.glow
          ? `0 0 0 3px ${d.borderColor}30, 0 4px 14px ${d.borderColor}20`
          : undefined,
        transition: "border-color 200ms, background-color 200ms, box-shadow 200ms",
      }}
    >
      <Handle type="target" position={Position.Top} className="!w-2 !h-2 !bg-slate-400 !border-0" />
      <div className="flex items-center justify-between gap-2">
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
        {d.badge && (
          <span
            className="text-[9px] font-bold font-mono px-1.5 py-0.5 rounded"
            style={{
              backgroundColor: d.badgeBgColor,
              color: d.badgeTextColor,
              border: `1px solid ${d.badgeTextColor}30`,
            }}
          >
            {d.badge}
          </span>
        )}
      </div>
      <Handle type="source" position={Position.Bottom} className="!w-2 !h-2 !bg-slate-400 !border-0" />
    </div>
  );
}

const nodeTypes = { cacheNode: CacheFlowNode };

// ── Phase → node appearance maps ─────────────────────────────────────────────

function getCacheNodeData(phase: Phase, icon: typeof Monitor, label: string, sublabel: string, variant: "client" | "cache" | "db") {
  if (variant === "client") {
    const active = ["checking", "hit"].includes(phase);
    return {
      icon,
      label,
      sublabel,
      borderColor: active ? "#60a5fa" : "#93c5fd",
      bgColor: "#eff6ff",
      textColor: "#1d4ed8",
      badge: phase === "hit" ? "200 OK" : undefined,
      badgeTextColor: "#15803d",
      badgeBgColor: "#dcfce7",
      glow: active,
    };
  }

  if (variant === "cache") {
    const map: Record<Phase, { border: string; bg: string; text: string; badge?: string }> = {
      idle:         { border: "#fb923c", bg: "#fff7ed", text: "#c2410c" },
      checking:     { border: "#fb923c", bg: "#fff7ed", text: "#c2410c" },
      hit:          { border: "#22c55e", bg: "#f0fdf4", text: "#15803d", badge: "HIT" },
      miss:         { border: "#ef4444", bg: "#fef2f2", text: "#b91c1c", badge: "MISS" },
      "fetching-db":{ border: "#ef4444", bg: "#fef2f2", text: "#b91c1c", badge: "MISS" },
      populating:   { border: "#60a5fa", bg: "#eff6ff", text: "#1d4ed8", badge: "WARM" },
    };
    const s = map[phase];
    const active = phase !== "idle";
    return {
      icon,
      label,
      sublabel,
      borderColor: s.border,
      bgColor: s.bg,
      textColor: s.text,
      badge: s.badge,
      badgeTextColor: s.text,
      badgeBgColor: `${s.border}22`,
      glow: active,
    };
  }

  // db
  const dbActive = ["fetching-db", "populating"].includes(phase);
  return {
    icon,
    label,
    sublabel,
    borderColor: dbActive ? "#a78bfa" : "#c4b5fd",
    bgColor: "#f5f3ff",
    textColor: "#6d28d9",
    badge: phase === "fetching-db" ? "QUERY" : undefined,
    badgeTextColor: "#6d28d9",
    badgeBgColor: "#ede9fe",
    glow: dbActive,
  };
}

// ── Main component ────────────────────────────────────────────────────────────

export function CacheDiagram() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [hits, setHits] = useState(0);
  const [total, setTotal] = useState(0);
  const [lastResult, setLastResult] = useState<"hit" | "miss" | null>(null);

  const sendRequest = useCallback(() => {
    if (phase !== "idle") return;
    const isHit = Math.random() < 0.7;

    setPhase("checking");

    setTimeout(() => {
      if (isHit) {
        setHits((h) => h + 1);
        setTotal((t) => t + 1);
        setLastResult("hit");
        setPhase("hit");
        setTimeout(() => setPhase("idle"), 1100);
      } else {
        setTotal((t) => t + 1);
        setLastResult("miss");
        setPhase("miss");
        setTimeout(() => {
          setPhase("fetching-db");
          setTimeout(() => {
            setPhase("populating");
            setTimeout(() => setPhase("idle"), 750);
          }, 800);
        }, 400);
      }
    }, 400);
  }, [phase]);

  const hitRate = total > 0 ? Math.round((hits / total) * 100) : null;

  const nodes = useMemo(
    () => [
      {
        id: "client",
        type: "cacheNode",
        position: { x: 90, y: 0 },
        data: getCacheNodeData(phase, Monitor, "Client", "Browser / App", "client"),
      },
      {
        id: "cache",
        type: "cacheNode",
        position: { x: 90, y: 140 },
        data: getCacheNodeData(phase, Zap, "Cache", "Redis · in-memory", "cache"),
      },
      {
        id: "db",
        type: "cacheNode",
        position: { x: 90, y: 290 },
        data: getCacheNodeData(phase, Database, "Database", "PostgreSQL · disk", "db"),
      },
    ],
    [phase]
  );

  const edges = useMemo(() => {
    const checking = ["checking", "hit", "miss"].includes(phase);
    const fetching = ["fetching-db", "populating"].includes(phase);
    const DIM = { stroke: "#d1d5db", strokeWidth: 1.5, opacity: 0.3 };

    return [
      {
        id: "client-cache",
        source: "client",
        target: "cache",
        type: "smoothstep",
        animated: checking,
        style: checking
          ? { stroke: phase === "hit" ? "#22c55e" : "#60a5fa", strokeWidth: 2, opacity: 1 }
          : DIM,
        label: phase === "checking" ? "lookup" : phase === "hit" ? "data" : undefined,
        labelStyle: { fill: "#64748b", fontSize: 10, fontWeight: 500 },
        labelBgStyle: { fill: "#ffffff", fillOpacity: 0.9 },
        labelBgPadding: [4, 3] as [number, number],
        labelBgBorderRadius: 4,
      },
      {
        id: "cache-db",
        source: "cache",
        target: "db",
        type: "smoothstep",
        animated: fetching,
        style: fetching
          ? {
              stroke: phase === "populating" ? "#a78bfa" : "#fb923c",
              strokeWidth: 2,
              opacity: 1,
            }
          : DIM,
        label:
          phase === "fetching-db"
            ? "on miss"
            : phase === "populating"
            ? "populate"
            : undefined,
        labelStyle: { fill: "#64748b", fontSize: 10, fontWeight: 500 },
        labelBgStyle: { fill: "#ffffff", fillOpacity: 0.9 },
        labelBgPadding: [4, 3] as [number, number],
        labelBgBorderRadius: 4,
      },
    ];
  }, [phase]);

  const statusMessage: Record<Phase, string> = {
    idle:
      lastResult === "hit"
        ? "Cache HIT — data returned from Redis (sub-millisecond)"
        : lastResult === "miss"
        ? "Cache MISS — result fetched from DB and written to cache"
        : "Press 'Send Request' to simulate the cache-aside lookup pattern",
    checking: "Checking cache for requested key…",
    hit: "Cache HIT — key found in Redis, returning data immediately ✓",
    miss: "Cache MISS — key not found",
    "fetching-db": "Falling back to database query…",
    populating: "Writing DB result into cache for future requests",
  };

  return (
    <div className="not-prose my-8 rounded-xl border bg-slate-50 overflow-hidden">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-b bg-white">
        <div className="flex items-center gap-3">
          <span className="text-xs font-medium text-muted-foreground">Cache-Aside Pattern</span>
          {hitRate !== null && (
            <div className="flex items-center gap-1.5">
              <div className="h-1.5 w-20 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${hitRate}%`,
                    backgroundColor:
                      hitRate >= 80 ? "#22c55e" : hitRate >= 60 ? "#fbbf24" : "#ef4444",
                  }}
                />
              </div>
              <span className="text-[11px] tabular-nums text-muted-foreground">
                {hitRate}% hit rate ({hits}/{total})
              </span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          {total > 0 && (
            <button
              onClick={() => {
                setHits(0);
                setTotal(0);
                setLastResult(null);
                setPhase("idle");
              }}
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
            className="flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Play className="h-3 w-3" />
            Send Request
          </button>
        </div>
      </div>

      {/* Status */}
      <div
        className={cn(
          "px-4 py-2 text-[11px] border-b font-mono transition-colors duration-200",
          phase === "hit"
            ? "bg-emerald-50 text-emerald-700 border-emerald-100"
            : phase === "miss"
            ? "bg-red-50 text-red-700 border-red-100"
            : "bg-white text-muted-foreground"
        )}
      >
        {statusMessage[phase]}
      </div>

      {/* Diagram */}
      <div style={{ height: 430 }} className="w-full">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.3 }}
          nodesDraggable={false}
          nodesConnectable={false}
          elementsSelectable={false}
          zoomOnScroll={false}
          panOnDrag={false}
          preventScrolling={false}
        >
          <Background variant={BackgroundVariant.Dots} gap={24} size={1} color="#e2e8f0" />
        </ReactFlow>
      </div>
    </div>
  );
}
