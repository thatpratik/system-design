# System Design

An interactive learning platform for exploring system design patterns — browse full system architectures, drill into individual building blocks, compare alternatives, and visualise relationships across a knowledge graph.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Package manager | Bun |
| Styling | Tailwind CSS v3 + `@tailwindcss/typography` |
| UI components | shadcn/ui (Radix UI primitives) |
| Icons | Lucide React |
| Fonts | Geist Sans + Geist Mono |
| Content | MDX — `next-mdx-remote/rsc` |
| Syntax highlighting | `rehype-pretty-code` + Shiki |
| Markdown extras | `remark-gfm` |
| Frontmatter parsing | `gray-matter` |
| Search | Fuse.js (client-side fuzzy search) |
| Search state | Zustand |
| Interactive diagrams | React Flow (`@xyflow/react`) |
| Knowledge graph | D3.js v7 (force-directed) |

## Commands

```bash
bun dev      # dev server at localhost:3000 (Turbopack)
bun build    # production build
bun start    # serve production build
bun lint     # ESLint via next lint
```

## Project Structure

```
app/                          # Next.js App Router pages
  page.tsx                    # Home / landing
  systems/
    page.tsx                  # Systems listing
    [slug]/page.tsx           # System detail (MDX + diagram)
  components/
    page.tsx                  # Components listing
    [slug]/page.tsx           # Component detail (MDX + diagram)
    compare/page.tsx          # Side-by-side component comparison
  graph/
    page.tsx                  # Knowledge graph

content/
  systems/<slug>/index.mdx   # One MDX file per system
  components/<slug>/index.mdx # One MDX file per component

components/
  layout/
    header.tsx                # Sticky nav header
  shared/
    search-command.tsx        # Cmd+K command palette (Fuse.js)
    mdx-content.tsx           # MDX renderer
    category-badge.tsx        # Coloured category tag
    content-card.tsx          # Card for listing pages
    comparison-table.tsx      # Side-by-side comparison rows
    compare-selector.tsx      # Dropdown pair → compare URL
  visualizations/
    load-balancer-diagram.tsx # React Flow round-robin animation
    cache-diagram.tsx         # React Flow hit/miss demo
    url-shortener-diagram.tsx # React Flow architecture diagram
    knowledge-graph.tsx       # D3 force-directed knowledge graph

lib/
  content.ts                  # MDX loaders, search index, graph data builders
  search-store.ts             # Zustand store for search palette open state
  utils.ts                    # cn() Tailwind class utility

types/
  index.ts                    # SystemMeta, ComponentMeta, ExternalLink, GraphNode, GraphEdge
```

## Content Model

All content lives in MDX files. There is no database or CMS — everything is read from the filesystem at build time.

### System frontmatter

```yaml
title: "URL Shortener"
slug: "url-shortener"
category: "networking"        # storage | messaging | compute | networking | coordination | observability
summary: "One-line description"
components:                   # slugs of components this system uses
  - "load-balancer"
  - "caching"
externalLinks:
  - label: "Link text"
    url: "https://..."
```

### Component frontmatter

```yaml
title: "Caching"
slug: "caching"
category: "storage"
summary: "One-line description"
usedIn:                       # slugs of systems that use this component
  - "url-shortener"
alternatives:                 # slugs of comparable components
  - "cdn"
externalLinks:
  - label: "Link text"
    url: "https://..."
# Structured comparison fields (used on /components/compare)
strengths:
  - "Sub-millisecond read latency for hot data"
weaknesses:
  - "Cache invalidation is hard to get right"
bestFor:
  - "Database query result caching"
notFor:
  - "Large binary files (images, videos)"
```

Systems and components are bidirectionally linked — a system lists its components, and each component lists the systems it appears in. The comparison fields power the `/components/compare` page.

## User Flows

### Browse systems
1. Land on `/` — the home page lists entry points for Systems and Components.
2. Navigate to `/systems` — all systems grouped by category.
3. Click a system card → `/systems/[slug]` — full MDX article, interactive architecture diagram, linked component breakdown, and external resources.
4. Click any linked component → `/components/[slug]`.

### Browse components
1. Navigate to `/components` — all building blocks grouped by category.
2. Click a component card → `/components/[slug]` — full MDX article, interactive diagram, list of systems that use it, alternatives, and external links.
3. Under **Alternatives**, click **Compare** → goes directly to the compare page pre-filled for that pair.

### Compare components
1. Navigate to `/components/compare` — two dropdowns let you pick any two components.
2. Select a pair and click **Compare**, or arrive via a direct link (`?a=caching&b=cdn`).
3. The comparison page shows:
   - A header card per component (category, title, summary)
   - Four structured rows side by side: **Best for**, **Strengths**, **Weaknesses**, **Not for**
   - External links for each component
4. Click **Change selection** to return to the picker.

### Search (Cmd+K)
1. Press `Cmd+K` (or click the search bar in the header) — a command palette opens.
2. Type any query — Fuse.js fuzzy-searches titles, summaries, and categories across all systems and components.
3. Results are grouped by type (Systems / Components) with keyboard navigation.
4. Press `Enter` or click a result to navigate to that page.

### Knowledge graph
1. Navigate to `/graph` via the header.
2. A D3 force-directed graph renders all systems (violet nodes) and components (emerald nodes) with directed edges showing which components each system uses.
3. **Drag** any node to reposition it.
4. **Scroll / pinch** to zoom in and out; **drag the canvas** to pan.
5. **Click** any node to navigate to its detail page.

## Adding Content

### New system

1. Create `content/systems/<slug>/index.mdx` with the frontmatter above.
2. List the component slugs it uses under `components:`.
3. Add the system's slug to `usedIn:` in each referenced component's frontmatter.
4. The system appears automatically on `/systems`, `/systems/[slug]`, the search index, and the knowledge graph.

### New component

1. Create `content/components/<slug>/index.mdx` with the frontmatter above.
2. Add the component's slug to `components:` in any system that uses it.
3. If the component has a React Flow diagram, create it in `components/visualizations/` and register it in the `componentVisualizations` map in `app/components/[slug]/page.tsx`.
4. The component appears automatically on `/components`, `/components/[slug]`, search, compare, and the graph.
