<div align="center">

# System Design

[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js&logoColor=white)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript&logoColor=white)](https://typescriptlang.org)
[![Bun](https://img.shields.io/badge/Bun-latest-fbf0df?logo=bun&logoColor=black)](https://bun.sh)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v3-38bdf8?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![React](https://img.shields.io/badge/React-19-61dafb?logo=react&logoColor=black)](https://react.dev)

*A knowledge-graph-powered platform for learning distributed system design.*
*Browse architectures, drill into building blocks, compare alternatives — all cross-linked and searchable.*

</div>

---

## Contents

- [System Design](#system-design)
  - [Contents](#contents)
  - [🚀 Quick Start](#-quick-start)
  - [✨ Features](#-features)
  - [🗺️ Architecture](#️-architecture)
  - [📦 Tech Stack](#-tech-stack)
  - [🧩 Content Model](#-content-model)
  - [🕸️ Knowledge Graph](#️-knowledge-graph)
  - [🧭 User Flows](#-user-flows)
  - [🗂️ Project Structure](#️-project-structure)
  - [➕ Adding Content](#-adding-content)
  - [📄 License](#-license)

---

## 🚀 Quick Start

```bash
bun install        # install dependencies
bun dev            # dev server at http://localhost:3000 (Turbopack)
bun build          # production build
bun start          # serve production build
bun lint           # ESLint via next lint
```

---

## ✨ Features

| Feature | Description |
|---|---|
| 📖 **System Deep-Dives** | Full MDX articles with interactive React Flow architecture diagrams |
| 🧩 **Component Library** | Reusable building blocks with strengths, weaknesses, and best-fit guidance |
| ⚖️ **Side-by-Side Compare** | Pick any two components and compare them across four structured dimensions |
| 🔍 **Cmd+K Search** | Fuzzy full-text search across all systems and components via Fuse.js |
| 🕸️ **Knowledge Graph** | D3 force-directed graph visualising every system↔component relationship |
| 🔗 **Bidirectional Links** | Systems list their components; components list the systems that use them |

---

## 🗺️ Architecture

> **Note:** All content is read from MDX files at build time — there is no database or CMS.

```mermaid
flowchart TD
    accTitle: Content Pipeline Architecture
    accDescr: MDX files are parsed at build time by gray-matter, processed through lib/content.ts, and power four output surfaces: system pages, component pages, the Fuse.js search index, and the D3 knowledge graph.

    mdx_systems["📄 content/systems/\n&lt;slug&gt;/index.mdx"]
    mdx_components["📄 content/components/\n&lt;slug&gt;/index.mdx"]
    parser["⚙️ gray-matter\nfrontmatter parser"]
    content_ts["lib/content.ts\ngetAllSystems · getAllComponents\nbuildSearchIndex · buildGraphData"]

    mdx_systems --> parser
    mdx_components --> parser
    parser --> content_ts

    content_ts --> systems_page["🖥️ /systems\n/systems/[slug]"]
    content_ts --> components_page["🧩 /components\n/components/[slug]\n/components/compare"]
    content_ts --> search_idx["🔍 Fuse.js\nSearch Index"]
    content_ts --> graph_data["🕸️ D3\nKnowledge Graph"]

    classDef file fill:#dbeafe,stroke:#2563eb,stroke-width:2px,color:#1e3a5f
    classDef lib fill:#f3e8ff,stroke:#7c3aed,stroke-width:2px,color:#3b0764
    classDef page fill:#dcfce7,stroke:#16a34a,stroke-width:2px,color:#14532d

    class mdx_systems,mdx_components file
    class parser,content_ts lib
    class systems_page,components_page,search_idx,graph_data page
```

---

## 📦 Tech Stack

| Layer | Technology |
|---|---|
| **Framework & Language** | |
| Framework | Next.js 15 (App Router) |
| Language | TypeScript 5 |
| Package manager | Bun |
| **Styling & UI** | |
| Styling | Tailwind CSS v3 + `@tailwindcss/typography` |
| UI components | shadcn/ui (Radix UI primitives) |
| Icons | Lucide React |
| Fonts | Geist Sans + Geist Mono |
| **Content Pipeline** | |
| Content format | MDX via `next-mdx-remote/rsc` |
| Syntax highlighting | `rehype-pretty-code` + Shiki |
| Markdown extras | `remark-gfm` |
| Frontmatter parsing | `gray-matter` |
| **Data, Search & Visualization** | |
| Search | Fuse.js (client-side fuzzy search) |
| Search state | Zustand |
| Interactive diagrams | React Flow (`@xyflow/react`) |
| Knowledge graph | D3.js v7 (force-directed) |

---

## 🧩 Content Model

Systems and components are bidirectionally linked through frontmatter. A system declares the components it uses; each component declares which systems use it and what its alternatives are. The comparison fields (`strengths`, `weaknesses`, `bestFor`, `notFor`) power the `/components/compare` page.

```mermaid
erDiagram
    accTitle: Content Model — System and Component Relationships
    accDescr: Systems have a components array pointing to components by slug. Components have a usedIn array pointing back to systems, and an alternatives array pointing to comparable components. Both share category, title, slug, summary, and externalLinks fields.

    SYSTEM {
        string title
        string slug
        string category
        string summary
        string[] components
        ExternalLink[] externalLinks
    }

    COMPONENT {
        string title
        string slug
        string category
        string summary
        string[] usedIn
        string[] alternatives
        string[] strengths
        string[] weaknesses
        string[] bestFor
        string[] notFor
        ExternalLink[] externalLinks
    }

    SYSTEM ||--o{ COMPONENT : "uses via components[]"
    COMPONENT }o--|| SYSTEM : "appears in via usedIn[]"
    COMPONENT }o--o{ COMPONENT : "compared via alternatives[]"
```

<details>
<summary><strong>System frontmatter</strong></summary>

```yaml
title: "URL Shortener"
slug: "url-shortener"
category: "system"        # storage | messaging | compute | System | coordination | observability
summary: "One-line description"
components:
  - "load-balancer"
  - "caching"
externalLinks:
  - label: "Link text"
    url: "https://..."
```

</details>

<details>
<summary><strong>Component frontmatter</strong></summary>

```yaml
title: "Caching"
slug: "caching"
category: "storage"
summary: "One-line description"
usedIn:
  - "url-shortener"
alternatives:
  - "cdn"
strengths:
  - "Sub-millisecond read latency for hot data"
weaknesses:
  - "Cache invalidation is hard to get right"
bestFor:
  - "Database query result caching"
notFor:
  - "Large binary files (images, videos)"
externalLinks:
  - label: "Link text"
    url: "https://..."
```

</details>

---

## 🕸️ Knowledge Graph

Every system and component becomes a node. Edges flow from system → component, forming a navigable web of relationships visible at `/graph`. The live graph supports drag-to-reposition, scroll/pinch to zoom, and click-to-navigate.

```mermaid
graph LR
    accTitle: Knowledge Graph — Sample Relationships
    accDescr: Sample showing how the URL Shortener system connects to its component building blocks via directed edges, and how components relate to one another as alternatives.

    url_shortener["🔗 URL Shortener\n(system)"]
    load_balancer["⚖️ Load Balancer"]
    caching["⚡ Caching"]
    cdn["🌐 CDN"]
    api_gateway["🚪 API Gateway"]

    url_shortener --> load_balancer
    url_shortener --> caching
    url_shortener --> cdn
    url_shortener --> api_gateway

    load_balancer <-.->|alternatives| api_gateway
    caching <-.->|alternatives| cdn

    classDef system fill:#ede9fe,stroke:#7c3aed,stroke-width:2px,color:#3b0764
    classDef component fill:#d1fae5,stroke:#059669,stroke-width:2px,color:#064e3b

    class url_shortener system
    class load_balancer,caching,cdn,api_gateway component
```

---

## 🧭 User Flows

```mermaid
flowchart TD
    accTitle: User Navigation Flows
    accDescr: Five main journeys through the platform — browse systems, browse components, compare two components side by side, use Cmd+K search, and explore the force-directed knowledge graph.

    home["🏠 /\nHome"]

    home --> systems_list["/systems\nall systems by category"]
    home --> components_list["/components\nall components by category"]
    home --> graph_page["/graph\nknowledge graph"]
    home -->|"Cmd+K"| search["🔍 Search Palette\nFuse.js fuzzy search"]

    systems_list --> system_detail["/systems/[slug]\nMDX article · React Flow diagram\nlinked components · external refs"]
    system_detail -->|"linked component"| component_detail

    components_list --> component_detail["/components/[slug]\nMDX article · diagram\nalternatives · systems using it"]
    component_detail -->|"Compare →"| compare["/components/compare\nside-by-side: bestFor\nstrengths · weaknesses · notFor"]
    components_list --> compare

    search -->|"select result"| system_detail
    search -->|"select result"| component_detail
    graph_page -->|"click node"| system_detail
    graph_page -->|"click node"| component_detail

    classDef nav fill:#fef3c7,stroke:#d97706,stroke-width:2px,color:#78350f
    classDef content fill:#dbeafe,stroke:#2563eb,stroke-width:2px,color:#1e3a5f
    classDef feature fill:#fce7f3,stroke:#db2777,stroke-width:2px,color:#831843

    class home,systems_list,components_list nav
    class system_detail,component_detail,compare content
    class search,graph_page feature
```

---

## 🗂️ Project Structure

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

---

## ➕ Adding Content

Categories: `storage` · `messaging` · `compute` · `system` · `coordination` · `observability`

<details>
<summary><strong>Add a new system</strong></summary>

1. Create `content/systems/<slug>/index.mdx` with the System frontmatter above.
2. List the component slugs it uses under `components:`.
3. Add the system's slug to `usedIn:` in each referenced component's frontmatter.
4. The system appears automatically on `/systems`, `/systems/[slug]`, search, and the knowledge graph.

</details>

<details>
<summary><strong>Add a new component</strong></summary>

1. Create `content/components/<slug>/index.mdx` with the Component frontmatter above.
2. Add the component's slug to `components:` in any system that uses it.
3. Optionally create a React Flow diagram in `components/visualizations/` and register it in `app/components/[slug]/page.tsx`.
4. The component appears automatically on `/components`, `/components/[slug]`, search, compare, and the graph.

</details>

---

## 📄 License

MIT — see [LICENSE](LICENSE)
