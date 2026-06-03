import { notFound } from "next/navigation";
import Link from "next/link";
import { ExternalLink, ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import { getSystem, getAllSystems, getComponentsBySlug } from "@/lib/content";
import { MdxContent } from "@/components/shared/mdx-content";
import { CategoryBadge } from "@/components/shared/category-badge";
import { Separator } from "@/components/ui/separator";
import { UrlShortenerDiagram } from "@/components/visualizations/url-shortener-diagram";

const systemVisualizations: Record<string, Record<string, React.ComponentType>> = {
  "url-shortener": { UrlShortenerDiagram },
};

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllSystems().map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  try {
    const { meta } = getSystem(slug);
    return { title: meta.title };
  } catch {
    return {};
  }
}

export default async function SystemPage({ params }: Props) {
  const { slug } = await params;

  let system;
  try {
    system = getSystem(slug);
  } catch {
    notFound();
  }

  const { meta, content } = system;
  const usedComponents = getComponentsBySlug(meta.components ?? []);

  return (
    <div className="container py-8 max-w-4xl">
      {/* Back link */}
      <Link
        href="/systems"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Systems
      </Link>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <CategoryBadge category={meta.category} />
        </div>
        <h1 className="font-display text-4xl sm:text-5xl tracking-tight mb-3">{meta.title}</h1>
        <p className="text-muted-foreground text-lg leading-relaxed max-w-2xl">{meta.summary}</p>
      </div>

      <Separator className="mb-8" />

      {/* MDX body */}
      <MdxContent source={content} components={systemVisualizations[slug]} />

      {/* Related sections */}
      {(usedComponents.length > 0 || meta.externalLinks?.length > 0) && (
        <>
          <Separator className="mt-10 mb-8" />
          <div className="grid gap-8 sm:grid-cols-2">
            {usedComponents.length > 0 && (
              <div>
                <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-4">
                  Components Used
                </h2>
                <ul className="space-y-2">
                  {usedComponents.map((c) => (
                    <li key={c.slug}>
                      <Link
                        href={`/components/${c.slug}`}
                        className="flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors group"
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                        {c.title}
                        <ArrowLeft className="h-3 w-3 rotate-180 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {meta.externalLinks?.length > 0 && (
              <div>
                <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-4">
                  External Links
                </h2>
                <ul className="space-y-2">
                  {meta.externalLinks.map((link) => (
                    <li key={link.url}>
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors"
                      >
                        <ExternalLink className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
