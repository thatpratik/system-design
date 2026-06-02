# Tech Stack

## Core

- **Next.js 14+ App Router** + **TypeScript** + **Tailwind CSS** + **Vercel**

---

## UI Components — shadcn/ui

Copy-paste Tailwind-based components (not a dependency). Standard choice for Next.js + Tailwind projects. Fully customizable without fighting a component library's opinions.

## MDX Processing — @next/mdx + next-mdx-remote

`@next/mdx` for static page-level MDX, `next-mdx-remote/rsc` for dynamic loading within components. Add `rehype-pretty-code` for syntax highlighting in code blocks.

## Search — Fuse.js

Client-side fuzzy search over MDX frontmatter metadata. No server, no cost, works for a static content set of ~50–100 entries.

## Visualizations

Three tools, each for a different job:

| Tool | Use |
|---|---|
| **Mermaid** | Static architecture diagrams embedded in MDX content |
| **React Flow** | Interactive system/component diagrams (zoomable, clickable nodes) |
| **D3.js** | Global knowledge graph view (`/graph`) |

Avoid using D3 everywhere — steep API. Use React Flow for most interactive diagrams, reserve D3 for the graph view only.

## AI TLDR — Vercel AI SDK

Streaming LLM responses from Next.js Route Handlers. Provider-agnostic (OpenAI, Anthropic, etc.). Handles streaming UI with `useCompletion`.

## State Management — Zustand

Lightweight shared state for search, comparison selections, and graph filters. React Context alone gets messy beyond 3+ shared states.

## Icons — Lucide React

Ships with shadcn/ui.

---

## Full Stack Summary

```
Next.js + TypeScript + Tailwind
  shadcn/ui           → UI components
  @next/mdx           → MDX content pipeline
  rehype-pretty-code  → code block syntax highlighting
  Fuse.js             → client-side search
  Mermaid             → static diagrams in MDX
  React Flow          → interactive system visualizations
  D3.js               → knowledge graph view
  Vercel AI SDK       → AI TLDR streaming
  Zustand             → shared client state
  Vercel              → deployment
```

No backend, no database, no CMS. Everything either builds statically or runs as a Vercel serverless function.
