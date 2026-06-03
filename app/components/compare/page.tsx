import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowLeftRight } from "lucide-react";
import type { Metadata } from "next";
import { getComponentMeta, getAllComponents } from "@/lib/content";
import { ComparisonTable } from "@/components/shared/comparison-table";
import { CompareSelector } from "@/components/shared/compare-selector";

interface Props {
  searchParams: Promise<{ a?: string; b?: string }>;
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { a, b } = await searchParams;
  if (!a || !b) return { title: "Compare Components" };
  try {
    const metaA = getComponentMeta(a);
    const metaB = getComponentMeta(b);
    return { title: `${metaA.title} vs ${metaB.title}` };
  } catch {
    return { title: "Compare Components" };
  }
}

export default async function ComparePage({ searchParams }: Props) {
  const { a, b } = await searchParams;

  const allComponents = getAllComponents();

  // If we don't have both params, show the selector UI
  if (!a || !b) {
    return (
      <div className="container py-8 max-w-3xl">
        <Link
          href="/components"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Components
        </Link>
        <div className="flex items-center gap-3 mb-2">
          <ArrowLeftRight className="h-5 w-5 text-primary" />
          <h1 className="font-display text-3xl tracking-tight">Compare Components</h1>
        </div>
        <p className="text-muted-foreground mb-8">
          Select two components to compare them side by side.
        </p>
        <CompareSelector components={allComponents} />
      </div>
    );
  }

  let metaA, metaB;
  try {
    metaA = getComponentMeta(a);
  } catch {
    notFound();
  }
  try {
    metaB = getComponentMeta(b);
  } catch {
    notFound();
  }

  return (
    <div className="container py-8 max-w-5xl">
      <Link
        href="/components"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Components
      </Link>

      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <ArrowLeftRight className="h-5 w-5 text-primary" />
          <h1 className="font-display text-3xl tracking-tight">
            {metaA.title} vs {metaB.title}
          </h1>
        </div>
        <Link
          href="/components/compare"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Change selection
        </Link>
      </div>

      <ComparisonTable a={metaA} b={metaB} />
    </div>
  );
}
