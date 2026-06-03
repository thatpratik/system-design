import Link from "next/link";
import { ArrowRight, Boxes, Network, Share2, ArrowLeftRight, Search } from "lucide-react";
import { getAllComponents, getAllSystems } from "@/lib/content";

export default function Home() {
  const systemCount = getAllSystems().length;
  const componentCount = getAllComponents().length;

  return (
    <div className="container flex flex-col justify-center h-[calc(100vh-4rem)] py-6">

      {/* ── Hero ─────────────────────────────────────────────────── */}
      <div
        className="mx-auto max-w-2xl w-full text-center mb-8 animate-fade-in-up"
        style={{ animationDelay: "0ms" }}
      >
        <h1 className="font-display text-4xl sm:text-5xl md:text-6xl tracking-tight mb-4 text-foreground">
          Learn System
          <br className="hidden sm:block" />
          Design Visually
        </h1>
        <p className="text-base text-muted-foreground leading-relaxed max-w-md mx-auto">
          Explore real-world architectures and the building blocks that power them —
          interactive diagrams, trade-off tables, bidirectional references.
        </p>
      </div>

      {/* ── Primary section cards ─────────────────────────────────── */}
      <div
        className="mx-auto max-w-3xl w-full grid gap-4 sm:grid-cols-2 mb-3 animate-fade-in-up"
        style={{ animationDelay: "120ms" }}
      >
        <SectionCard
          icon={<Network className="h-5 w-5" />}
          iconClass="text-primary"
          borderClass="border-l-primary/50"
          title="Systems"
          description="End-to-end architectures — URL shorteners, chat, feed systems — broken down into the components that make them work."
          count={systemCount}
          label="system"
          href="/systems"
        />
        <SectionCard
          icon={<Boxes className="h-5 w-5" />}
          iconClass="text-teal-500"
          borderClass="border-l-teal-400/60"
          title="Components"
          description="Deep dives into individual building blocks — load balancers, caches, message queues — with trade-off tables and alternatives."
          count={componentCount}
          label="component"
          href="/components"
        />
      </div>

      {/* ── Feature discovery strip ───────────────────────────────── */}
      <div
        className="mx-auto max-w-3xl w-full grid gap-3 sm:grid-cols-3 animate-fade-in-up"
        style={{ animationDelay: "230ms" }}
      >
        <FeatureTile
          href="/graph"
          icon={<Share2 className="h-4 w-4" />}
          iconBg="bg-violet-50 dark:bg-violet-950/40"
          iconColor="text-violet-500"
          title="Knowledge Graph"
          description="Visualise all relationships"
        />
        <FeatureTile
          href="/components/compare"
          icon={<ArrowLeftRight className="h-4 w-4" />}
          iconBg="bg-teal-50 dark:bg-teal-950/40"
          iconColor="text-teal-500"
          title="Compare"
          description="Side-by-side component diff"
        />
        <div className="flex items-center gap-3 rounded-xl border bg-card px-4 py-3">
          <div className="h-8 w-8 rounded-lg bg-secondary flex items-center justify-center shrink-0">
            <Search className="h-4 w-4 text-primary" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium">Search</p>
            <p className="text-xs text-muted-foreground">
              Press{" "}
              <kbd className="rounded border bg-muted px-1 py-px text-[10px] font-mono">
                ⌘K
              </kbd>
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}

function SectionCard({
  icon,
  iconClass,
  borderClass,
  title,
  description,
  count,
  label,
  href,
}: {
  icon: React.ReactNode;
  iconClass: string;
  borderClass: string;
  title: string;
  description: string;
  count: number;
  label: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className={`group flex flex-col rounded-xl border-l-[3px] border bg-card px-6 py-5 hover:shadow-[0_8px_30px_rgba(0,0,0,0.07)] hover:-translate-y-0.5 transition-all duration-200 ${borderClass}`}
    >
      <div className="flex items-center gap-2.5 mb-3">
        <span className={iconClass}>{icon}</span>
        <h2 className="text-base font-semibold">{title}</h2>
      </div>
      <p className="text-sm text-muted-foreground leading-relaxed mb-4 flex-1">
        {description}
      </p>
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground text-xs">
          {count} {count === 1 ? label : `${label}s`}
        </span>
        <span className="flex items-center gap-1 text-xs font-medium text-primary group-hover:gap-1.5 transition-all">
          Explore <ArrowRight className="h-3 w-3" />
        </span>
      </div>
    </Link>
  );
}

function FeatureTile({
  href,
  icon,
  iconBg,
  iconColor,
  title,
  description,
}: {
  href: string;
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-3 rounded-xl border bg-card px-4 py-3 hover:shadow-sm hover:border-primary/30 transition-all duration-150"
    >
      <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${iconBg}`}>
        <span className={iconColor}>{icon}</span>
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium">{title}</p>
        <p className="text-xs text-muted-foreground truncate">{description}</p>
      </div>
      <ArrowRight className="h-3.5 w-3.5 text-muted-foreground shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
    </Link>
  );
}
