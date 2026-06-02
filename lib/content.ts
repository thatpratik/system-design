import fs from "fs";
import path from "path";
import matter from "gray-matter";
import type { ComponentMeta, SystemMeta, ContentItem } from "@/types";

const CONTENT_ROOT = path.join(process.cwd(), "content");

function readMdx(filePath: string): { data: Record<string, unknown>; content: string } {
  const raw = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(raw);
  return { data, content };
}

function getSlugs(section: "systems" | "components"): string[] {
  const dir = path.join(CONTENT_ROOT, section);
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter((name) => {
    const stat = fs.statSync(path.join(dir, name));
    return stat.isDirectory();
  });
}

// ── Components ────────────────────────────────────────────────────────────────

export function getAllComponents(): ComponentMeta[] {
  return getSlugs("components").map((slug) => getComponentMeta(slug));
}

export function getComponentMeta(slug: string): ComponentMeta {
  const { data } = readMdx(path.join(CONTENT_ROOT, "components", slug, "index.mdx"));
  return data as unknown as ComponentMeta;
}

export function getComponent(slug: string): ContentItem<ComponentMeta> {
  const { data, content } = readMdx(path.join(CONTENT_ROOT, "components", slug, "index.mdx"));
  return { meta: data as unknown as ComponentMeta, content };
}

// ── Systems ───────────────────────────────────────────────────────────────────

export function getAllSystems(): SystemMeta[] {
  return getSlugs("systems").map((slug) => getSystemMeta(slug));
}

export function getSystemMeta(slug: string): SystemMeta {
  const { data } = readMdx(path.join(CONTENT_ROOT, "systems", slug, "index.mdx"));
  return data as unknown as SystemMeta;
}

export function getSystem(slug: string): ContentItem<SystemMeta> {
  const { data, content } = readMdx(path.join(CONTENT_ROOT, "systems", slug, "index.mdx"));
  return { meta: data as unknown as SystemMeta, content };
}

// ── Search index ──────────────────────────────────────────────────────────────

export interface SearchEntry {
  type: "system" | "component";
  title: string;
  slug: string;
  category: string;
  summary: string;
}

export function buildSearchIndex(): SearchEntry[] {
  const systems = getAllSystems().map((s) => ({
    type: "system" as const,
    title: s.title,
    slug: s.slug,
    category: s.category,
    summary: s.summary,
  }));

  const components = getAllComponents().map((c) => ({
    type: "component" as const,
    title: c.title,
    slug: c.slug,
    category: c.category,
    summary: c.summary,
  }));

  return [...systems, ...components];
}
