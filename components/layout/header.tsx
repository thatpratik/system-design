"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Moon, Network, Search, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { useSearchStore } from "@/lib/search-store";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/components", label: "Components" },
  { href: "/systems", label: "Systems" },
  { href: "/graph", label: "Graph" },
];

function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return <div className="h-8 w-8" />;

  return (
    <button
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      className="flex items-center justify-center h-8 w-8 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
      aria-label="Toggle theme"
    >
      {resolvedTheme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  );
}

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const openSearch = useSearchStore((s) => s.setOpen);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">

        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5 mr-8">
          <Network className="h-4.5 w-4.5 text-primary shrink-0" />
          <span className="hidden sm:inline font-display text-[17px] tracking-tight text-foreground">
            System Design
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-stretch gap-1 h-16">
          {navLinks.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "relative inline-flex items-center px-3 text-sm transition-colors",
                  active
                    ? "text-foreground font-medium"
                    : "text-muted-foreground hover:text-foreground font-normal"
                )}
              >
                {link.label}
                {active && (
                  <span className="absolute bottom-0 left-3 right-3 h-[2px] rounded-full bg-primary" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Search + theme */}
        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={() => openSearch(true)}
            className="hidden md:flex items-center gap-1.5 h-8 rounded-lg border border-border/60 bg-secondary/60 px-2 text-muted-foreground hover:bg-secondary hover:text-foreground hover:border-border transition-all"
            aria-label="Open search"
          >
            <Search className="h-3.5 w-3.5 shrink-0" />
            <span className="flex items-center gap-0.5">
              <kbd className="rounded border border-border/60 bg-card px-1.5 py-0.5 text-[10px] font-mono shadow-[0_1px_0_hsl(var(--border))]">
                ⌘
              </kbd>
              <kbd className="rounded border border-border/60 bg-card px-1.5 py-0.5 text-[10px] font-mono shadow-[0_1px_0_hsl(var(--border))]">
                K
              </kbd>
            </span>
          </button>

          <button
            onClick={() => openSearch(true)}
            className="md:hidden flex items-center justify-center h-8 w-8 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          >
            <Search className="h-4 w-4" />
            <span className="sr-only">Search</span>
          </button>

          <ThemeToggle />
        </div>

        {/* Mobile hamburger */}
        <div className="md:hidden ml-1">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-60">
              <SheetHeader className="mb-6">
                <SheetTitle asChild>
                  <Link
                    href="/"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-2.5"
                  >
                    <Network className="h-4 w-4 text-primary" />
                    <span className="font-display text-[17px] tracking-tight">
                      System Design
                    </span>
                  </Link>
                </SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "rounded-lg px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground",
                      pathname === link.href
                        ? "bg-accent text-accent-foreground font-medium"
                        : "text-muted-foreground font-normal"
                    )}
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>

      </div>
    </header>
  );
}
