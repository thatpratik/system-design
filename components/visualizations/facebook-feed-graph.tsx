"use client";

import { useMemo } from "react";
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

const ROLE = {
  client:  { border: "#60a5fa", bg: "#eff6ff", text: "#1d4ed8" },
  infra:   { border: "#fbbf24", bg: "#fffbeb", text: "#92400e" },
  server:  { border: "#818cf8", bg: "#eef2ff", text: "#3730a3" },
  storage: { border: "#34d399", bg: "#ecfdf5", text: "#065f46" },
  service: { border: "#c084fc", bg: "#faf5ff", text: "#6b21a8" },
  cache:   { border: "#fb923c", bg: "#fff7ed", text: "#9a3412" },
} as const;

type Role = keyof typeof ROLE;

function FeedNode({ data }: NodeProps) {
  const d = data as { label: string; sublabel?: string; role: Role };
  const c = ROLE[d.role];
  return (
    <div
      className="px-3 py-2.5 rounded-xl border-2 shadow-sm min-w-[130px] select-none text-center"
      style={{ borderColor: c.border, backgroundColor: c.bg }}
    >
      <Handle type="target" position={Position.Top} className="!w-2 !h-2 !bg-slate-400 !border-0" />
      <p className="text-xs font-semibold leading-tight" style={{ color: c.text }}>{d.label}</p>
      {d.sublabel && (
        <p className="text-[10px] leading-tight mt-0.5" style={{ color: c.text, opacity: 0.6 }}>{d.sublabel}</p>
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

export function FacebookFeedGraph() {
  const nodes = useMemo(() => [
    {
      id: "client",
      type: "feed",
      position: { x: 200, y: 0 },
      data: { label: "Client", role: "client" as Role },
    },
    {
      id: "lb",
      type: "feed",
      position: { x: 200, y: 74 },
      data: { label: "Load Balancer", sublabel: "health checks · routing", role: "infra" as Role },
    },
    {
      id: "ws",
      type: "feed",
      position: { x: 200, y: 152 },
      data: { label: "Web Server", role: "server" as Role },
    },
    {
      id: "db",
      type: "feed",
      position: { x: 10, y: 248 },
      data: { label: "Database", sublabel: "posts · users · graph", role: "storage" as Role },
    },
    {
      id: "agg",
      type: "feed",
      position: { x: 200, y: 248 },
      data: { label: "Aggregator", sublabel: "collects followed posts", role: "service" as Role },
    },
    {
      id: "fg",
      type: "feed",
      position: { x: 200, y: 334 },
      data: { label: "Feed Generator", sublabel: "pre-computes ranked feed", role: "service" as Role },
    },
    {
      id: "post",
      type: "feed",
      position: { x: 60, y: 422 },
      data: { label: "Post Service", role: "service" as Role },
    },
    {
      id: "followers",
      type: "feed",
      position: { x: 340, y: 422 },
      data: { label: "Followers Service", role: "service" as Role },
    },
    {
      id: "ranker",
      type: "feed",
      position: { x: 200, y: 508 },
      data: { label: "Ranker / Merger", role: "service" as Role },
    },
    {
      id: "cache",
      type: "feed",
      position: { x: 200, y: 588 },
      data: { label: "Feed Cache", sublabel: "Redis", role: "cache" as Role },
    },
  ], []);

  const edges = useMemo(() => [
    { id: "c-lb",    source: "client",    target: "lb",        ...EDGE_DEFAULTS },
    { id: "lb-ws",   source: "lb",        target: "ws",        ...EDGE_DEFAULTS },
    { id: "ws-db",   source: "ws",        target: "db",        ...EDGE_DEFAULTS },
    { id: "ws-agg",  source: "ws",        target: "agg",       ...EDGE_DEFAULTS },
    { id: "agg-fg",  source: "agg",       target: "fg",        ...EDGE_DEFAULTS },
    { id: "fg-post", source: "fg",        target: "post",      ...EDGE_DEFAULTS },
    { id: "fg-fol",  source: "fg",        target: "followers", ...EDGE_DEFAULTS },
    { id: "post-r",  source: "post",      target: "ranker",    ...EDGE_DEFAULTS },
    { id: "fol-r",   source: "followers", target: "ranker",    ...EDGE_DEFAULTS },
    { id: "r-cache", source: "ranker",    target: "cache",     ...EDGE_DEFAULTS },
  ], []);

  return (
    <div className="rounded-xl border bg-slate-50 overflow-hidden" style={{ height: 668 }}>
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
        <Background variant={BackgroundVariant.Dots} gap={24} size={1} color="#e2e8f0" />
      </ReactFlow>
    </div>
  );
}
