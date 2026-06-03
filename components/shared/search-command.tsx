"use client";

import {
  useEffect,
  useState,
  useRef,
  useCallback,
  useMemo,
} from "react";
import * as Dialog from "@radix-ui/react-dialog";
import Fuse from "fuse.js";
import { useRouter } from "next/navigation";
import { Network, Boxes, Search, X, CornerDownLeft } from "lucide-react";
import type { SearchEntry } from "@/lib/content";
import { useSearchStore } from "@/lib/search-store";
import { cn } from "@/lib/utils";

interface SearchCommandProps {
  entries: SearchEntry[];
}

export function SearchCommand({ entries }: SearchCommandProps) {
  const { open, setOpen } = useSearchStore();
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const fuse = useMemo(
    () =>
      new Fuse(entries, {
        keys: [
          { name: "title", weight: 2 },
          { name: "summary", weight: 1 },
          { name: "category", weight: 0.5 },
        ],
        threshold: 0.35,
        includeScore: true,
      }),
    [entries]
  );

  const results = useMemo<SearchEntry[]>(
    () =>
      query.trim()
        ? fuse.search(query).map((r) => r.item)
        : entries,
    [query, fuse, entries]
  );

  const systems = useMemo(() => results.filter((r) => r.type === "system"), [results]);
  const components = useMemo(() => results.filter((r) => r.type === "component"), [results]);
  const flat = useMemo(() => [...systems, ...components], [systems, components]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  // Global Cmd+K / Ctrl+K shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen(true);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [setOpen]);

  // Focus input on open
  useEffect(() => {
    if (open) {
      const id = setTimeout(() => inputRef.current?.focus(), 30);
      setQuery("");
      setActiveIndex(0);
      return () => clearTimeout(id);
    }
  }, [open]);

  const navigate = useCallback(
    (entry: SearchEntry) => {
      const href =
        entry.type === "system"
          ? `/systems/${entry.slug}`
          : `/components/${entry.slug}`;
      router.push(href);
      setOpen(false);
    },
    [router, setOpen]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex((i) => (flat.length ? (i + 1) % flat.length : 0));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex((i) =>
          flat.length ? (i - 1 + flat.length) % flat.length : 0
        );
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (flat[activeIndex]) navigate(flat[activeIndex]);
      }
    },
    [flat, activeIndex, navigate]
  );

  // Scroll active item into view
  useEffect(() => {
    listRef.current
      ?.querySelector<HTMLElement>(`[data-index="${activeIndex}"]`)
      ?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-background/70 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content
          aria-describedby={undefined}
          onKeyDown={handleKeyDown}
          className="fixed left-1/2 top-[12vh] z-50 w-[calc(100vw-2rem)] max-w-[560px] -translate-x-1/2 overflow-hidden rounded-xl border border-border/80 bg-background shadow-[0_24px_64px_-12px_hsl(var(--foreground)/0.12)] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-top-4 data-[state=open]:slide-in-from-top-4"
        >
          <Dialog.Title className="sr-only">Search</Dialog.Title>

          {/* Input row */}
          <div className="flex items-center gap-3 px-4 py-3.5 border-b border-border/60">
            <Search className="h-[15px] w-[15px] shrink-0 text-muted-foreground" />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search systems and components…"
              spellCheck={false}
              autoComplete="off"
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/60 font-mono tracking-[-0.01em]"
            />
            {query ? (
              <button
                onClick={() => setQuery("")}
                className="shrink-0 rounded p-0.5 text-muted-foreground hover:text-foreground transition-colors hover:bg-muted"
              >
                <X className="h-3.5 w-3.5" />
                <span className="sr-only">Clear</span>
              </button>
            ) : (
              <kbd className="shrink-0 hidden sm:flex items-center gap-0.5 text-[10px] text-muted-foreground/70 border rounded px-1.5 py-0.5 font-mono bg-muted/40">
                esc
              </kbd>
            )}
          </div>

          {/* Results list */}
          <div ref={listRef} className="max-h-[320px] overflow-y-auto overscroll-contain">
            {flat.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 py-10">
                <Search className="h-7 w-7 text-muted-foreground/30" />
                <p className="text-sm text-muted-foreground">
                  No results for{" "}
                  <span className="font-medium text-foreground font-mono">
                    &ldquo;{query}&rdquo;
                  </span>
                </p>
              </div>
            ) : (
              <div className="py-1.5">
                {systems.length > 0 && (
                  <Group
                    label="Systems"
                    entries={systems}
                    flat={flat}
                    activeIndex={activeIndex}
                    onSelect={navigate}
                    onHover={setActiveIndex}
                  />
                )}
                {components.length > 0 && (
                  <>
                    {systems.length > 0 && (
                      <div className="mx-4 my-1.5 border-t border-border/40" />
                    )}
                    <Group
                      label="Components"
                      entries={components}
                      flat={flat}
                      activeIndex={activeIndex}
                      onSelect={navigate}
                      onHover={setActiveIndex}
                    />
                  </>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-4 py-2 border-t border-border/60 bg-muted/20">
            <div className="flex items-center gap-3 text-[10px] text-muted-foreground/60">
              <span className="flex items-center gap-1">
                <Kbd>↑↓</Kbd> navigate
              </span>
              <span className="flex items-center gap-1">
                <Kbd>
                  <CornerDownLeft className="h-2.5 w-2.5" />
                </Kbd>
                open
              </span>
              <span className="flex items-center gap-1">
                <Kbd>esc</Kbd> close
              </span>
            </div>
            <span className="text-[10px] text-muted-foreground/50 tabular-nums">
              {flat.length} result{flat.length !== 1 ? "s" : ""}
            </span>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="inline-flex items-center justify-center min-w-[20px] rounded border border-border bg-background px-1 py-0.5 font-mono text-[9px] text-muted-foreground shadow-[0_1px_0_hsl(var(--border))]">
      {children}
    </kbd>
  );
}

interface GroupProps {
  label: string;
  entries: SearchEntry[];
  flat: SearchEntry[];
  activeIndex: number;
  onSelect: (entry: SearchEntry) => void;
  onHover: (index: number) => void;
}

function Group({ label, entries, flat, activeIndex, onSelect, onHover }: GroupProps) {
  return (
    <section>
      <div className="px-4 pb-0.5 pt-1">
        <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
          {label}
        </span>
      </div>
      {entries.map((entry) => {
        const i = flat.indexOf(entry);
        return (
          <ResultItem
            key={entry.slug}
            entry={entry}
            index={i}
            active={activeIndex === i}
            onSelect={() => onSelect(entry)}
            onHover={() => onHover(i)}
          />
        );
      })}
    </section>
  );
}

interface ResultItemProps {
  entry: SearchEntry;
  index: number;
  active: boolean;
  onSelect: () => void;
  onHover: () => void;
}

function ResultItem({ entry, index, active, onSelect, onHover }: ResultItemProps) {
  return (
    <button
      data-index={index}
      onClick={onSelect}
      onMouseEnter={onHover}
      className={cn(
        "group relative w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors duration-75",
        active ? "bg-primary/[0.06]" : "hover:bg-muted/50"
      )}
    >
      {/* Active indicator bar */}
      <span
        className={cn(
          "absolute left-0 top-1.5 bottom-1.5 w-[2px] rounded-r-full bg-primary transition-all duration-100",
          active ? "opacity-100" : "opacity-0"
        )}
      />

      {/* Icon */}
      <span
        className={cn(
          "shrink-0 transition-colors duration-75",
          active
            ? "text-primary"
            : "text-muted-foreground group-hover:text-foreground/70"
        )}
      >
        {entry.type === "system" ? (
          <Network className="h-3.5 w-3.5" />
        ) : (
          <Boxes className="h-3.5 w-3.5" />
        )}
      </span>

      {/* Title + summary */}
      <span className="flex-1 min-w-0">
        <span
          className={cn(
            "block text-sm font-medium truncate leading-snug",
            active ? "text-foreground" : "text-foreground/85"
          )}
        >
          {entry.title}
        </span>
        <span className="block text-[11px] text-muted-foreground truncate mt-0.5 leading-snug">
          {entry.summary}
        </span>
      </span>

      {/* Category pill */}
      <span
        className={cn(
          "shrink-0 text-[9px] uppercase tracking-wide px-1.5 py-0.5 rounded font-semibold transition-colors duration-75",
          active
            ? "bg-primary/10 text-primary"
            : "bg-muted text-muted-foreground"
        )}
      >
        {entry.category}
      </span>
    </button>
  );
}
