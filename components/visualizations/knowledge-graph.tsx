"use client";

import { useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import * as d3 from "d3";
import type { GraphData, GraphNode } from "@/lib/content";

interface SimNode extends d3.SimulationNodeDatum, GraphNode {}
interface SimEdge extends d3.SimulationLinkDatum<SimNode> {
  source: SimNode | string;
  target: SimNode | string;
}

const NODE_RADIUS = 22;
const SYSTEM_COLOR = "#8b5cf6";   // violet-500
const COMPONENT_COLOR = "#10b981"; // emerald-500
const EDGE_COLOR = "#6b7280";      // gray-500
const LABEL_COLOR = "#f9fafb";     // gray-50

export function KnowledgeGraph({ data }: { data: GraphData }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const router = useRouter();

  const handleNodeClick = useCallback(
    (node: SimNode) => {
      const path = node.type === "system" ? `/systems/${node.slug}` : `/components/${node.slug}`;
      router.push(path);
    },
    [router]
  );

  useEffect(() => {
    const svg = d3.select(svgRef.current!);
    svg.selectAll("*").remove();

    const container = svgRef.current!.parentElement!;
    const width = container.clientWidth;
    const height = container.clientHeight;

    svg.attr("width", width).attr("height", height).attr("viewBox", `0 0 ${width} ${height}`);

    // ── Zoom ──────────────────────────────────────────────────────────────────
    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.2, 3])
      .on("zoom", (event) => {
        g.attr("transform", event.transform);
      });

    svg.call(zoom).on("dblclick.zoom", null);

    const g = svg.append("g");

    // ── Arrow marker ──────────────────────────────────────────────────────────
    svg
      .append("defs")
      .append("marker")
      .attr("id", "arrowhead")
      .attr("viewBox", "0 -5 10 10")
      .attr("refX", NODE_RADIUS + 10)
      .attr("refY", 0)
      .attr("markerWidth", 6)
      .attr("markerHeight", 6)
      .attr("orient", "auto")
      .append("path")
      .attr("d", "M0,-5L10,0L0,5")
      .attr("fill", EDGE_COLOR);

    // ── Data ──────────────────────────────────────────────────────────────────
    const nodes: SimNode[] = data.nodes.map((n) => ({ ...n }));
    const nodeById = new Map(nodes.map((n) => [n.id, n]));

    const edges: SimEdge[] = data.edges.flatMap((e) => {
      const src = nodeById.get(e.source);
      const tgt = nodeById.get(e.target);
      if (!src || !tgt) return [];
      return [{ source: src, target: tgt }];
    });

    // ── Simulation ────────────────────────────────────────────────────────────
    const simulation = d3
      .forceSimulation<SimNode>(nodes)
      .force(
        "link",
        d3
          .forceLink<SimNode, SimEdge>(edges)
          .id((d) => d.id)
          .distance(140)
      )
      .force("charge", d3.forceManyBody().strength(-400))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collision", d3.forceCollide(NODE_RADIUS + 20));

    // ── Edges ─────────────────────────────────────────────────────────────────
    const link = g
      .append("g")
      .selectAll<SVGLineElement, SimEdge>("line")
      .data(edges)
      .join("line")
      .attr("stroke", EDGE_COLOR)
      .attr("stroke-opacity", 0.5)
      .attr("stroke-width", 1.5)
      .attr("marker-end", "url(#arrowhead)");

    // ── Node groups ───────────────────────────────────────────────────────────
    const drag = d3
      .drag<SVGGElement, SimNode>()
      .on("start", (event, d) => {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
      })
      .on("drag", (event, d) => {
        d.fx = event.x;
        d.fy = event.y;
      })
      .on("end", (event, d) => {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
      });

    const node = g
      .append("g")
      .selectAll<SVGGElement, SimNode>("g")
      .data(nodes)
      .join("g")
      .attr("cursor", "pointer")
      .call(drag)
      .on("click", (_event, d) => handleNodeClick(d));

    // Circle
    node
      .append("circle")
      .attr("r", NODE_RADIUS)
      .attr("fill", (d) => (d.type === "system" ? SYSTEM_COLOR : COMPONENT_COLOR))
      .attr("fill-opacity", 0.9)
      .attr("stroke", "#fff")
      .attr("stroke-width", 2)
      .on("mouseenter", function () {
        d3.select(this).attr("stroke-width", 3).attr("fill-opacity", 1);
      })
      .on("mouseleave", function () {
        d3.select(this).attr("stroke-width", 2).attr("fill-opacity", 0.9);
      });

    // Label inside circle (truncated)
    node
      .append("text")
      .text((d) => {
        const words = d.label.split(" ");
        if (words.length === 1) return d.label.length > 8 ? d.label.slice(0, 7) + "…" : d.label;
        return words.map((w) => w[0]).join(""); // initials for multi-word
      })
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "central")
      .attr("font-size", 11)
      .attr("font-weight", "600")
      .attr("fill", LABEL_COLOR)
      .attr("pointer-events", "none");

    // Tooltip label below circle
    node
      .append("text")
      .text((d) => d.label)
      .attr("text-anchor", "middle")
      .attr("y", NODE_RADIUS + 14)
      .attr("font-size", 11)
      .attr("fill", "#d1d5db") // gray-300
      .attr("pointer-events", "none");

    // ── Tick ─────────────────────────────────────────────────────────────────
    simulation.on("tick", () => {
      link
        .attr("x1", (d) => (d.source as SimNode).x!)
        .attr("y1", (d) => (d.source as SimNode).y!)
        .attr("x2", (d) => (d.target as SimNode).x!)
        .attr("y2", (d) => (d.target as SimNode).y!);

      node.attr("transform", (d) => `translate(${d.x},${d.y})`);
    });

    // ── Initial zoom to fit ───────────────────────────────────────────────────
    simulation.on("end", () => {
      const bounds = g.node()!.getBBox();
      const padding = 60;
      const scale = Math.min(
        width / (bounds.width + padding * 2),
        height / (bounds.height + padding * 2),
        1
      );
      const tx = width / 2 - scale * (bounds.x + bounds.width / 2);
      const ty = height / 2 - scale * (bounds.y + bounds.height / 2);
      svg.transition().duration(500).call(zoom.transform, d3.zoomIdentity.translate(tx, ty).scale(scale));
    });

    // ── Resize observer ───────────────────────────────────────────────────────
    const ro = new ResizeObserver(() => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      svg.attr("width", w).attr("height", h).attr("viewBox", `0 0 ${w} ${h}`);
      simulation.force("center", d3.forceCenter(w / 2, h / 2)).alpha(0.3).restart();
    });
    ro.observe(container);

    return () => {
      simulation.stop();
      ro.disconnect();
    };
  }, [data, handleNodeClick]);

  return (
    <svg
      ref={svgRef}
      className="w-full h-full bg-background touch-none select-none"
      aria-label="Knowledge graph of systems and components"
    />
  );
}
