import { buildGraphData } from "@/lib/content";
import { KnowledgeGraph } from "@/components/visualizations/knowledge-graph";

export const metadata = {
  title: "Knowledge Graph — System Design",
  description: "Visual map of relationships between systems and components.",
};

export default function GraphPage() {
  const data = buildGraphData();
  return (
    <main className="flex flex-col h-[calc(100vh-4rem)]">
      <div className="px-6 py-4 border-b border-border flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Knowledge Graph</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {data.nodes.filter((n) => n.type === "system").length} systems ·{" "}
            {data.nodes.filter((n) => n.type === "component").length} components ·{" "}
            {data.edges.length} relationships
          </p>
        </div>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="inline-block size-3 rounded-full bg-violet-500" />
            System
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block size-3 rounded-full bg-emerald-500" />
            Component
          </span>
        </div>
      </div>
      <div className="flex-1 min-h-0">
        <KnowledgeGraph data={data} />
      </div>
    </main>
  );
}
