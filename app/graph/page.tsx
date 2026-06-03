import { buildGraphData } from "@/lib/content";
import { KnowledgeGraph } from "@/components/visualizations/knowledge-graph";

export const metadata = {
  title: "Knowledge Graph — System Design",
  description: "Visual map of relationships between systems and components.",
};

export default function GraphPage() {
  const data = buildGraphData();
  const systemCount = data.nodes.filter((n) => n.type === "system").length;
  const componentCount = data.nodes.filter((n) => n.type === "component").length;

  return (
    <main className="flex flex-col h-[calc(100vh-4rem)]">

      <div className="px-6 py-3.5 border-b border-border flex items-center justify-between gap-4 flex-wrap bg-background/95 backdrop-blur">

        <div className="flex items-center gap-5 min-w-0">
          <h1 className="font-display text-xl tracking-tight shrink-0">Knowledge Graph</h1>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-2 w-2 rounded-full bg-violet-500" />
              {systemCount} {systemCount === 1 ? "system" : "systems"}
            </span>
            <span className="text-border/60">·</span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-2 w-2 rounded-full bg-teal-500" />
              {componentCount} {componentCount === 1 ? "component" : "components"}
            </span>
            <span className="text-border/60">·</span>
            <span>{data.edges.length} edges</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground/70 flex-wrap">
          <HintChip>Drag</HintChip>
          <span>nodes</span>
          <span className="mx-1 text-border">·</span>
          <HintChip>Scroll</HintChip>
          <span>to zoom</span>
          <span className="mx-1 text-border">·</span>
          <HintChip>Click</HintChip>
          <span>to navigate</span>
        </div>

      </div>

      <div className="flex-1 min-h-0">
        <KnowledgeGraph data={data} />
      </div>

    </main>
  );
}

function HintChip({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="inline-flex items-center rounded border bg-card px-1.5 py-0.5 text-[10px] font-mono font-medium text-muted-foreground shadow-[0_1px_0_hsl(var(--border))]">
      {children}
    </kbd>
  );
}
