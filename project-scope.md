# Interactive System Design Knowledge Graph

## Overview

An interactive system design learning platform that breaks down complex systems into reusable components and visualizes how they interact. It is a public, mobile-first web application deployed on Vercel.

The platform has two parallel layers:

1. **Systems** — complete real-world architectures (e.g. Netflix, URL Shortener, Web Crawler)
2. **Components** — deep dives into individual building blocks (e.g. Load Balancer, Sharding, Bloom Filter)

Systems reference the components they use. Components list the systems where they appear. This bidirectional linking creates a navigable knowledge graph rather than isolated documentation.

---

## Objectives

- Understand system design through decomposition into components
- Build deep knowledge of core infrastructure concepts
- Create interactive visualizations to simulate real-world behavior
- Establish navigable relationships between systems and reusable components

---

## Tech Stack

| Concern | Choice |
|---|---|
| Framework | Next.js (App Router) + TypeScript |
| Styling | Tailwind CSS |
| Content | MDX files (committed to repo, no database or CMS) |
| Visualization | Mermaid / React Flow / D3 (decided per use case) |
| AI TLDR | Next.js Route Handler calling LLM API (no separate Express server) |
| Deployment | Vercel |

---

## Content Model

All content lives as `.mdx` files in the repository. No database. Content is imported at build time by Next.js.

### System entry

```
systems/<system-slug>/
  index.mdx          # overview, component breakdown, links to components
  data-flow.mdx      # request lifecycle and data flow
  diagrams/          # architecture diagram assets or Mermaid definitions
  visualizations/    # interactive React components for this system
```

Each system includes:
- Component breakdown (with links to component deep-dives)
- Architecture diagram
- Data flow / request lifecycle
- Links to external documentation and real-world references

### Component entry

```
components/<component-slug>/
  index.mdx          # problem definition, internal working
  types.mdx          # variations and subtypes
  tradeoffs.mdx      # trade-offs table
  visualizations/    # interactive React components for this component
```

Each component includes:
- Problem definition
- Internal working
- Types and variations
- Trade-offs
- Real-world usage examples
- Interactive visualization
- Bidirectional links: systems that use this component

---

## Features

### Dashboard
- Navigate between all systems and components
- Logical grouping by architecture category (e.g. Storage, Messaging, Compute, Networking)
- Client-side search across all systems and components

### Knowledge Graph View
- Visual graph (Mermaid or D3 force-directed) showing relationships between systems and components
- Clickable nodes navigate to the system or component page

### Component Comparison
- Side-by-side comparison of similar components (e.g. Kafka vs Redis for messaging queues)
- Only applies to components — not systems
- Triggered when a component page has defined alternatives

### AI TLDR
- On-demand summary for any system or component page
- Calls LLM API via a Next.js Route Handler (`app/api/tldr/route.ts`)
- Not pre-generated — user-triggered per page

### Visualizations
- **Systems**: architecture diagrams, request flow simulations
- **Components**: behaviour demonstrations (e.g. cache hit/miss, sharding distribution, queue processing, load balancing round-robin)
- Built with React Flow, D3, or SVG/Canvas — decided per visualization

---

## Routing Structure (App Router)

```
/                          # dashboard / home
/systems                   # all systems listing
/systems/[slug]            # individual system page
/components                # all components listing
/components/[slug]         # individual component page
/graph                     # global knowledge graph view
/api/tldr                  # Route Handler: LLM TLDR endpoint
```

---

## Non-Goals

- Building production-grade distributed systems
- Implementing full backend infrastructure
- Covering DevOps or deployment pipelines in depth
- CMS or database-backed content

---

## Expected Outcomes

- A structured, visual system design knowledge base
- Deep understanding of distributed system components
- A portfolio-ready project demonstrating system thinking
- Publicly hosted at Vercel

---

## Future Enhancements

- Animations and scenario simulations (failure modes, cascading failures)
- Reusable visualization component library
- More systems and components over time
