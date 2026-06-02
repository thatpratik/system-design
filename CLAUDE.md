# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
bun dev          # dev server at localhost:3000 (Turbopack)
bun build        # production build
bun start        # serve production build
bun lint         # ESLint via next lint
```

## Architecture

**Framework**: Next.js 15 App Router + TypeScript + Tailwind CSS. Package manager is **Bun**.

### Two content sections

The platform has two parallel layers, each backed by MDX files in `content/`:

- `content/systems/<slug>/index.mdx` — full system designs (URL Shortener, Chat System, etc.)
- `content/components/<slug>/index.mdx` — individual building blocks (Load Balancer, Caching, etc.)

Systems and components are bidirectionally linked via frontmatter fields:
- System frontmatter has `components: string[]` (slugs of components it uses)
- Component frontmatter has `usedIn: string[]` (slugs of systems that use it) and `alternatives: string[]` (slugs of comparable components)

### Content pipeline

All content is read from the filesystem at build time — no database or CMS. The entry point is `lib/content.ts`, which uses `gray-matter` to parse MDX frontmatter and exports typed accessors:

- `getAllSystems()` / `getSystem(slug)` — returns `SystemMeta` / `ContentItem<SystemMeta>`
- `getAllComponents()` / `getComponent(slug)` — returns `ComponentMeta` / `ContentItem<ComponentMeta>`
- `buildSearchIndex()` — returns a flat array of all entries for Fuse.js

TypeScript types for frontmatter live in `types/index.ts`.

MDX content is rendered in page components using `next-mdx-remote/rsc`. Syntax highlighting uses `rehype-pretty-code` + `shiki`.

### Key directories

```
app/                    # Next.js App Router pages
content/
  systems/              # MDX for each system
  components/           # MDX for each component
components/
  ui/                   # shadcn/ui components
  visualizations/       # React Flow / D3 interactive diagrams
lib/
  content.ts            # MDX file loaders and search index builder
  utils.ts              # cn() Tailwind class utility
types/
  index.ts              # SystemMeta, ComponentMeta, ExternalLink types
```

### Planned features (not yet built)

- `/systems/[slug]` and `/components/[slug]` — detail pages with MDX rendering
- `/graph` — D3 force-directed knowledge graph of system↔component relationships
- `/components/compare` — side-by-side component comparison
- `app/api/tldr/route.ts` — Vercel AI SDK Route Handler for on-demand LLM summaries
- Client-side search via Fuse.js over `buildSearchIndex()` output
- React Flow interactive visualizations per system/component
