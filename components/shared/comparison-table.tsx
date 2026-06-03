import Link from "next/link";
import { Check, X, ArrowRight } from "lucide-react";
import type { ComponentMeta } from "@/types";
import { CategoryBadge } from "@/components/shared/category-badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

interface Props {
  a: ComponentMeta;
  b: ComponentMeta;
}

const ROWS: { label: string; field: keyof ComponentMeta }[] = [
  { label: "Best for",    field: "bestFor"    },
  { label: "Strengths",  field: "strengths"  },
  { label: "Weaknesses", field: "weaknesses" },
  { label: "Not for",    field: "notFor"     },
];

/* Violet for A, teal for B — mirrors knowledge-graph palette */
const ACCENTS = [
  { bar: "bg-violet-400", col: "bg-violet-50/50 dark:bg-violet-950/20" },
  { bar: "bg-teal-400",   col: "bg-teal-50/50 dark:bg-teal-950/20"    },
] as const;

function BulletList({
  items,
  variant,
}: {
  items: string[];
  variant: "positive" | "negative" | "neutral";
}) {
  const Icon =
    variant === "positive" ? Check : variant === "negative" ? X : ArrowRight;
  const iconClass =
    variant === "positive"
      ? "text-teal-500"
      : variant === "negative"
      ? "text-rose-400"
      : "text-muted-foreground";

  return (
    <ul className="space-y-2">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-2 text-sm">
          <Icon className={`h-3.5 w-3.5 mt-0.5 shrink-0 ${iconClass}`} />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function Cell({
  items,
  field,
}: {
  items: string[] | undefined;
  field: keyof ComponentMeta;
}) {
  if (!items?.length) {
    return <p className="text-sm text-muted-foreground italic">—</p>;
  }
  const variant =
    field === "strengths" || field === "bestFor"
      ? "positive"
      : field === "weaknesses" || field === "notFor"
      ? "negative"
      : "neutral";

  return <BulletList items={items} variant={variant} />;
}

export function ComparisonTable({ a, b }: Props) {
  const components = [a, b];

  return (
    <div className="w-full">
      {/* Header cards */}
      <div className="grid grid-cols-2 gap-4 mb-5">
        {components.map((component, idx) => (
          <div key={component.slug} className="rounded-xl border bg-card overflow-hidden">
            <div className={cn("h-1", ACCENTS[idx].bar)} />
            <div className="p-5">
              <div className="mb-2.5">
                <CategoryBadge category={component.category} />
              </div>
              <Link
                href={`/components/${component.slug}`}
                className="font-display text-xl hover:text-primary transition-colors"
              >
                {component.title}
              </Link>
              <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                {component.summary}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Comparison rows */}
      <div className="rounded-xl border overflow-hidden">
        {ROWS.map((row, i) => (
          <div key={row.field}>
            {i > 0 && <Separator />}
            <div className="px-5 py-2.5 bg-muted/40">
              <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                {row.label}
              </span>
            </div>
            <div className="grid grid-cols-2 divide-x">
              {components.map((component, idx) => (
                <div
                  key={component.slug}
                  className={cn("px-5 py-4", ACCENTS[idx].col)}
                >
                  <Cell
                    items={component[row.field] as string[] | undefined}
                    field={row.field}
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* External links */}
      {(a.externalLinks?.length > 0 || b.externalLinks?.length > 0) && (
        <div className="grid grid-cols-2 gap-4 mt-5">
          {components.map((component) => (
            <div key={component.slug}>
              {component.externalLinks?.length > 0 && (
                <ul className="space-y-1.5">
                  {component.externalLinks.map((link) => (
                    <li key={link.url}>
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <ArrowRight className="h-3 w-3 shrink-0" />
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
