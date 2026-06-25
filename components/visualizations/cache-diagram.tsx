"use client";

import { useState, useMemo, useCallback } from "react";
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

function getCacheNodeData(phase: Phase, icon: typeof Monitor, label: string, sublabel: string, variant: "client" | "cache" | "db", isDark: boolean) {
  if (variant === "client") {
    const active = ["checking", "hit"].includes(phase);
    return {
      icon, label, sublabel, glow: active,
      borderColor: active ? "#60a5fa" : "#93c5fd",
      bgColor: isDark ? "#0f2544" : "#eff6ff",
      textColor: isDark ? "#93c5fd" : "#1d4ed8",
      badge: phase === "hit" ? "200 OK" : undefined,
      badgeTextColor: isDark ? "#4ade80" : "#15803d",
      badgeBgColor: isDark ? "#052e16" : "#dcfce7",
    };
  }

  if (variant === "cache") {
    const map: Record<Phase, { border: string; bg: string; bgDark: string; text: string; textDark: string; badge?: string }> = {
      idle:          { border: "#fb923c", bg: "#fff7ed", bgDark: "#2d1105", text: "#c2410c", textDark: "#fdba74" },
      checking:      { border: "#fb923c", bg: "#fff7ed", bgDark: "#2d1105", text: "#c2410c", textDark: "#fdba74" },
      hit:           { border: "#22c55e", bg: "#f0fdf4", bgDark: "#052e16", text: "#15803d", textDark: "#4ade80", badge: "HIT" },
      miss:          { border: "#ef4444", bg: "#fef2f2", bgDark: "#2a0a0a", text: "#b91c1c", textDark: "#f87171", badge: "MISS" },
      "fetching-db": { border: "#ef4444", bg: "#fef2f2", bgDark: "#2a0a0a", text: "#b91c1c", textDark: "#f87171", badge: "MISS" },
      populating:    { border: "#60a5fa", bg: "#eff6ff", bgDark: "#0f2544", text: "#1d4ed8", textDark: "#93c5fd", badge: "WARM" },
    };
    const s = map[phase];
    return {
      icon, label, sublabel, badge: s.badge, glow: phase !== "idle",
      borderColor: s.border,
      bgColor: isDark ? s.bgDark : s.bg,
      textColor: isDark ? s.textDark : s.text,
      badgeTextColor: isDark ? s.textDark : s.text,
      badgeBgColor: `${s.border}22`,
    };
  }

  // db
  const dbActive = ["fetching-db", "populating"].includes(phase);
  return {
    icon, label, sublabel, glow: dbActive,
    borderColor: dbActive ? "#a78bfa" : "#c4b5fd",
    bgColor: isDark ? "#1a1230" : "#f5f3ff",
    textColor: isDark ? "#d8b4fe" : "#6d28d9",
    badge: phase === "fetching-db" ? "QUERY" : undefined,
    badgeTextColor: isDark ? "#d8b4fe" : "#6d28d9",
    badgeBgColor: isDark ? "#2e1065" : "#ede9fe",
  };
}

// ── Main component ────────────────────────────────────────────────────────────

export function CacheDiagram() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

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
        data: getCacheNodeData(phase, Monitor, "Client", "Browser / App", "client", isDark),
      },
      {
        id: "cache",
        type: "cacheNode",
        position: { x: 90, y: 140 },
        data: getCacheNodeData(phase, Zap, "Cache", "Redis · in-memory", "cache", isDark),
      },
      {
        id: "db",
        type: "cacheNode",
        position: { x: 90, y: 290 },
        data: getCacheNodeData(phase, Database, "Database", "PostgreSQL · disk", "db", isDark),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [phase, isDark]
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
        labelBgStyle: { fill: "hsl(var(--card))", fillOpacity: 0.95 },
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
        labelBgStyle: { fill: "hsl(var(--card))", fillOpacity: 0.95 },
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
    <div className="not-prose my-8 rounded-xl border bg-background overflow-hidden">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-b bg-card">
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
            className="flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800 dark:hover:bg-blue-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
            ? "bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-900"
            : phase === "miss"
            ? "bg-red-50 text-red-700 border-red-100 dark:bg-red-950 dark:text-red-300 dark:border-red-900"
            : "bg-card text-muted-foreground"
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
          <Background variant={BackgroundVariant.Dots} gap={24} size={1} color="hsl(var(--border))" />
        </ReactFlow>
      </div>
    </div>
  );
}
