"use client";

import { useMemo } from "react";
import { useTheme } from "next-themes";
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  Handle,
  Position,
  MarkerType,
  type NodeProps,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

const ROLE_LIGHT = {
  client:  { border: "#60a5fa", bg: "#eff6ff", text: "#1d4ed8" },
  infra:   { border: "#fbbf24", bg: "#fffbeb", text: "#92400e" },
  server:  { border: "#818cf8", bg: "#eef2ff", text: "#3730a3" },
  storage: { border: "#34d399", bg: "#ecfdf5", text: "#065f46" },
  service: { border: "#c084fc", bg: "#faf5ff", text: "#6b21a8" },
  cache:   { border: "#fb923c", bg: "#fff7ed", text: "#9a3412" },
} as const;

const ROLE_DARK = {
  client:  { border: "#60a5fa", bg: "#0f2544", text: "#93c5fd" },
  infra:   { border: "#fbbf24", bg: "#2d1d04", text: "#fcd34d" },
  server:  { border: "#818cf8", bg: "#1a1240", text: "#a5b4fc" },
  storage: { border: "#34d399", bg: "#04261c", text: "#6ee7b7" },
  service: { border: "#c084fc", bg: "#230943", text: "#d8b4fe" },
  cache:   { border: "#fb923c", bg: "#2d1105", text: "#fdba74" },
} as const;

type Role = keyof typeof ROLE_LIGHT;

function FeedNode({ data }: NodeProps) {
  const d = data as { label: string; sublabel?: string; border: string; bg: string; text: string };
  return (
    <div
      className="px-3 py-2.5 rounded-xl border-2 shadow-sm min-w-[130px] select-none text-center"
      style={{ borderColor: d.border, backgroundColor: d.bg }}
    >
      <Handle type="target" position={Position.Top} className="!w-2 !h-2 !bg-slate-400 !border-0" />
      <p className="text-xs font-semibold leading-tight" style={{ color: d.text }}>{d.label}</p>
      {d.sublabel && (
        <p className="text-[10px] leading-tight mt-0.5" style={{ color: d.text, opacity: 0.7 }}>{d.sublabel}</p>
      )}
      <Handle type="source" position={Position.Bottom} className="!w-2 !h-2 !bg-slate-400 !border-0" />
    </div>
  );
}

const nodeTypes = { feed: FeedNode };

const EDGE_DEFAULTS = {
  type: "smoothstep" as const,
  style: { stroke: "#cbd5e1", strokeWidth: 1.5 },
  markerEnd: { type: MarkerType.ArrowClosed, color: "#94a3b8", width: 14, height: 14 },
};
const EDGE_STRAIGHT = {
  type: "straight" as const,
  style: { stroke: "#cbd5e1", strokeWidth: 1.5 },
  markerEnd: { type: MarkerType.ArrowClosed, color: "#94a3b8", width: 14, height: 14 },
};

export function FacebookFeedGraph() {
  const { resolvedTheme } = useTheme();
  const R = resolvedTheme === "dark" ? ROLE_DARK : ROLE_LIGHT;

  const nodes = useMemo(() => {
    const n = (id: string, role: Role, label: string, sublabel?: string, x = 200, y = 0) => ({
      id, type: "feed", position: { x, y },
      data: { label, sublabel, ...R[role] },
    });
    return [
      n("client",    "client",  "Client",           undefined,                     200, 0),
      n("lb",        "infra",   "Load Balancer",    "health checks · routing",     200, 74),
      n("ws",        "server",  "Web Server",       undefined,                     200, 152),
      n("db",        "storage", "Database",         "posts · users · graph",       10,  248),
      n("agg",       "service", "Aggregator",       "collects followed posts",      200, 248),
      n("fg",        "service", "Feed Generator",   "pre-computes ranked feed",     200, 334),
      n("post",      "service", "Post Service",     undefined,                     60,  422),
      n("followers", "service", "Followers Service",undefined,                     340, 422),
      n("ranker",    "service", "Ranker / Merger",  undefined,                     200, 508),
      n("cache",     "cache",   "Feed Cache",       "Redis",                       200, 588),
    ];
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resolvedTheme]);

  const edges = useMemo(() => [
    { id: "c-lb",    source: "client",    target: "lb",        ...EDGE_STRAIGHT },
    { id: "lb-ws",   source: "lb",        target: "ws",        ...EDGE_STRAIGHT },
    { id: "ws-db",   source: "ws",        target: "db",        ...EDGE_DEFAULTS },
    { id: "ws-agg",  source: "ws",        target: "agg",       ...EDGE_DEFAULTS },
    { id: "agg-fg",  source: "agg",       target: "fg",        ...EDGE_STRAIGHT },
    { id: "fg-post", source: "fg",        target: "post",      ...EDGE_DEFAULTS },
    { id: "fg-fol",  source: "fg",        target: "followers", ...EDGE_DEFAULTS },
    { id: "post-r",  source: "post",      target: "ranker",    ...EDGE_DEFAULTS },
    { id: "fol-r",   source: "followers", target: "ranker",    ...EDGE_DEFAULTS },
    { id: "r-cache", source: "ranker",    target: "cache",     ...EDGE_DEFAULTS },
  ], []);

  return (
    <div className="rounded-xl border bg-background overflow-hidden" style={{ height: 668 }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.12 }}
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
  );
}
