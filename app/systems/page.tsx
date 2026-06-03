import type { Metadata } from "next";
import { getAllSystems } from "@/lib/content";
import { ContentCard } from "@/components/shared/content-card";
import { Separator } from "@/components/ui/separator";
import { CATEGORY_LABELS } from "@/lib/constants";
import type { Category, SystemMeta } from "@/types";

export const metadata: Metadata = { title: "Systems" };

export default function SystemsPage() {
  const systems = getAllSystems();

  const grouped = systems.reduce<Record<string, SystemMeta[]>>((acc, system) => {
    const cat = system.category;
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(system);
    return acc;
  }, {});

  const categories = Object.keys(grouped) as Category[];

  return (
    <div className="container py-10">
      <div className="mb-10">
        <h1 className="font-display text-4xl sm:text-5xl tracking-tight mb-3">Systems</h1>
        <p className="text-muted-foreground max-w-xl">
          End-to-end architectures of real-world systems, broken down into reusable components.
        </p>
      </div>

      {systems.length === 0 ? (
        <p className="text-muted-foreground">No systems added yet.</p>
      ) : (
        <div className="space-y-10">
          {categories.map((category, i) => (
            <div key={category}>
              {i > 0 && <Separator className="mb-10" />}
              <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">
                {CATEGORY_LABELS[category] ?? category}
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {grouped[category].map((system) => (
                  <ContentCard
                    key={system.slug}
                    title={system.title}
                    summary={system.summary}
                    category={system.category}
                    href={`/systems/${system.slug}`}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
