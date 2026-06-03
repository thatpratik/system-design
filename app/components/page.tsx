import type { Metadata } from "next";
import { getAllComponents } from "@/lib/content";
import { ContentCard } from "@/components/shared/content-card";
import { Separator } from "@/components/ui/separator";
import { CATEGORY_LABELS } from "@/lib/constants";
import type { Category, ComponentMeta } from "@/types";

export const metadata: Metadata = { title: "Components" };

export default function ComponentsPage() {
  const components = getAllComponents();

  const grouped = components.reduce<Record<string, ComponentMeta[]>>((acc, component) => {
    const cat = component.category;
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(component);
    return acc;
  }, {});

  const categories = Object.keys(grouped) as Category[];

  return (
    <div className="container py-10">
      <div className="mb-10">
        <h1 className="font-display text-4xl sm:text-5xl tracking-tight mb-3">Components</h1>
        <p className="text-muted-foreground max-w-xl">
          Individual building blocks of distributed systems — how they work, their trade-offs, and where they are used.
        </p>
      </div>

      {components.length === 0 ? (
        <p className="text-muted-foreground">No components added yet.</p>
      ) : (
        <div className="space-y-10">
          {categories.map((category, i) => (
            <div key={category}>
              {i > 0 && <Separator className="mb-10" />}
              <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">
                {CATEGORY_LABELS[category] ?? category}
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {grouped[category].map((component) => (
                  <ContentCard
                    key={component.slug}
                    title={component.title}
                    summary={component.summary}
                    category={component.category}
                    href={`/components/${component.slug}`}
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
