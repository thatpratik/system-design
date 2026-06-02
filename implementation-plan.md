# Implementation Plan

---

## Phase 1 — Project Scaffolding

Set up the project foundation. Everything else builds on this.

- [ ] Init Next.js 14+ project with TypeScript and App Router
- [ ] Configure Tailwind CSS
- [ ] Install and configure shadcn/ui
- [ ] Set up MDX pipeline: `@next/mdx`, `next-mdx-remote/rsc`, `rehype-pretty-code`
- [ ] Install Zustand, Fuse.js, Lucide React
- [ ] Set up Vercel project and connect to GitHub repo
- [ ] Define folder structure:
  ```
  app/                        # Next.js App Router
  content/
    systems/<slug>/index.mdx
    components/<slug>/index.mdx
  components/ui/              # shadcn/ui components
  components/visualizations/  # custom viz components
  lib/                        # MDX loaders, utilities
  ```

---

## Phase 2 — Content Model

Define the data shape for systems and components before writing any UI.

- [ ] Define TypeScript types for `System` and `Component` (frontmatter schema)
- [ ] Define frontmatter fields:
  - System: `title`, `slug`, `category`, `summary`, `components[]`, `externalLinks[]`
  - Component: `title`, `slug`, `category`, `summary`, `usedIn[]` (systems), `alternatives[]` (for comparison)
- [ ] Write MDX loader utilities in `lib/` to read and parse all systems and components at build time
- [ ] Seed 2 components (e.g. Load Balancer, Caching) and 1 system (e.g. URL Shortener) as real content to validate the model

---

## Phase 3 — App Shell & Navigation

Build the structural layout used across all pages.

- [ ] Create root layout with header and mobile-responsive nav
- [ ] Build dashboard/home page (`/`) — entry point with links to Systems and Components sections
- [ ] Build Systems listing page (`/systems`) — grouped by category
- [ ] Build Components listing page (`/components`) — grouped by category
- [ ] Add active nav state and mobile menu (hamburger)

---

## Phase 4 — Content Pages

Render MDX content with full layout for each system and component.

- [ ] Build System detail page (`/systems/[slug]`):
  - MDX body rendering
  - Component breakdown section with links to `/components/[slug]`
  - External links section
- [ ] Build Component detail page (`/components/[slug]`):
  - MDX body rendering
  - "Used in systems" section with links to `/systems/[slug]`
  - Trade-offs section
- [ ] Add Mermaid rendering support inside MDX pages
- [ ] Add custom MDX components (callout boxes, info cards, link cards)
- [ ] Implement bidirectional links: system ↔ components cross-linking

---

## Phase 5 — Search

Client-side search across all systems and components.

- [ ] Build a search index at build time from all frontmatter metadata (title, summary, category)
- [ ] Integrate Fuse.js over the index
- [ ] Build search UI — command palette (`Cmd+K`) using shadcn/ui `Command` component
- [ ] Show grouped results (Systems / Components) with keyboard navigation
- [ ] Add search trigger in the header

---

## Phase 6 — Interactive Visualizations

Add React Flow-based interactive diagrams on system and component pages.

- [ ] Install and configure React Flow
- [ ] Build reusable `<DiagramCanvas>` wrapper component
- [ ] Build component visualizations:
  - [ ] Load balancer (round-robin animation)
  - [ ] Cache hit/miss demonstration
  - [ ] Sharding distribution
  - [ ] Message queue processing flow
- [ ] Build system visualizations:
  - [ ] Architecture diagram for URL Shortener
  - [ ] Request flow simulation
- [ ] Wire visualizations into the relevant MDX pages via custom MDX components

---

## Phase 7 — Knowledge Graph

Global visual graph showing relationships between all systems and components.

- [ ] Install D3.js
- [ ] Build `/graph` page
- [ ] Generate node/edge data from MDX frontmatter (systems → components links)
- [ ] Build D3 force-directed graph:
  - Systems as one node colour, components as another
  - Edges from bidirectional links
  - Labels on nodes
- [ ] Make nodes clickable — navigate to the relevant page on click
- [ ] Add zoom/pan and mobile touch support

---

## Phase 8 — Component Comparison

Side-by-side comparison for components that have defined alternatives.

- [ ] Add `alternatives[]` field to component frontmatter (e.g. Kafka lists Redis, RabbitMQ)
- [ ] Build `<ComparisonTable>` component — side-by-side rendering of two components
- [ ] Add "Compare with" selector on component pages that have alternatives
- [ ] Build `/components/compare?a=[slug]&b=[slug]` comparison route
- [ ] Populate comparison content for initial components (trade-offs, use cases, key differences)

---

## Phase 9 — AI TLDR

On-demand LLM summary for any system or component page.

- [ ] Install Vercel AI SDK
- [ ] Create `/api/tldr/route.ts` — Route Handler that accepts a slug and page type, calls LLM API with the page content as context, streams back a summary
- [ ] Build `<TldrButton>` component using `useCompletion` — shows a "Get TLDR" button that streams the summary inline
- [ ] Add `<TldrButton>` to system and component page layouts
- [ ] Add loading and error states

---

## Phase 10 — Content Expansion

Fill in real content now that all pages and visualizations are built and validated.

- [ ] Write 5 components: Load Balancer, Caching, Sharding, Message Queue, Blob Storage
- [ ] Write 5 systems: URL Shortener, Chat System, Notification System, Rate Limiter, Feed System
- [ ] Add external links per page
- [ ] Verify all bidirectional links are correct

---

## Phase 11 — Polish & Launch

- [ ] Mobile responsiveness audit across all pages
- [ ] Add SEO metadata and Open Graph tags to all pages
- [ ] Add 404 page
- [ ] Performance audit (Lighthouse) — optimize images, bundle size
- [ ] Final Vercel production deployment
- [ ] Set up custom domain (if applicable)

---

## Dependency Order

```
Phase 1 → Phase 2 → Phase 3 → Phase 4
                                  ↓
                    Phase 5    Phase 6    Phase 7    Phase 8    Phase 9
                                  ↓
                              Phase 10 → Phase 11
```

Phases 5–9 can be worked on in parallel after Phase 4 is complete.
