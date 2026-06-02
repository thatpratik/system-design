import Link from "next/link";
import { ArrowRight, Boxes, Network } from "lucide-react";
import { getAllComponents, getAllSystems } from "@/lib/content";

export default function Home() {
  const systemCount = getAllSystems().length;
  const componentCount = getAllComponents().length;

  return (
    <div className="container py-12 md:py-20">
      {/* Hero */}
      <div className="mx-auto max-w-2xl text-center mb-14">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl mb-4">
          Learn System Design Visually
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          Explore real-world systems and the building blocks that power them.
          Interactive diagrams, trade-off tables, and bidirectional references.
        </p>
      </div>

      {/* Section cards */}
      <div className="mx-auto max-w-3xl grid gap-5 sm:grid-cols-2">
        <SectionCard
          icon={<Network className="h-5 w-5" />}
          title="Systems"
          description="End-to-end architectures — URL shorteners, chat systems, feed systems. Each broken down into the components that make them work."
          count={systemCount}
          label="system"
          href="/systems"
        />
        <SectionCard
          icon={<Boxes className="h-5 w-5" />}
          title="Components"
          description="Deep dives into individual building blocks — load balancers, caches, message queues, sharding strategies, and more."
          count={componentCount}
          label="component"
          href="/components"
        />
      </div>
    </div>
  );
}

function SectionCard({
  icon,
  title,
  description,
  count,
  label,
  href,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  count: number;
  label: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="group flex flex-col rounded-xl border bg-card p-6 hover:shadow-md hover:border-primary/30 transition-all"
    >
      <div className="flex items-center gap-2.5 mb-3">
        <div className="text-primary">{icon}</div>
        <h2 className="text-lg font-semibold">{title}</h2>
      </div>
      <p className="text-sm text-muted-foreground leading-relaxed mb-5 flex-1">
        {description}
      </p>
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">
          {count} {count === 1 ? label : `${label}s`}
        </span>
        <span className="flex items-center gap-1 font-medium text-primary group-hover:gap-2 transition-all">
          Explore <ArrowRight className="h-3.5 w-3.5" />
        </span>
      </div>
    </Link>
  );
}
