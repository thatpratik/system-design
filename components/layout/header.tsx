"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Network, Search } from "lucide-react";
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
  { href: "/systems", label: "Systems" },
  { href: "/components", label: "Components" },
];

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const openSearch = useSearchStore((s) => s.setOpen);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <Link href="/" className="flex items-center gap-2 font-semibold mr-6">
          <Network className="h-5 w-5 text-primary" />
          <span className="hidden sm:inline">System Design</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "text-sm font-medium transition-colors hover:text-foreground",
                pathname === link.href
                  ? "text-foreground"
                  : "text-muted-foreground"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Search trigger */}
        <div className="ml-auto flex items-center gap-2">
          {/* Desktop: full search bar */}
          <button
            onClick={() => openSearch(true)}
            className="hidden md:flex items-center gap-2 h-8 rounded-md border border-border/70 bg-muted/30 px-3 text-sm text-muted-foreground hover:bg-muted hover:text-foreground hover:border-border transition-all group"
          >
            <Search className="h-3.5 w-3.5 shrink-0" />
            <span className="text-xs">Search…</span>
            <span className="ml-3 flex items-center gap-0.5">
              <kbd className="rounded border border-border/70 bg-background px-1 py-0.5 text-[9px] font-mono shadow-[0_1px_0_hsl(var(--border))] group-hover:border-border transition-colors">
                ⌘
              </kbd>
              <kbd className="rounded border border-border/70 bg-background px-1 py-0.5 text-[9px] font-mono shadow-[0_1px_0_hsl(var(--border))] group-hover:border-border transition-colors">
                K
              </kbd>
            </span>
          </button>

          {/* Mobile: icon only */}
          <button
            onClick={() => openSearch(true)}
            className="md:hidden flex items-center justify-center h-8 w-8 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <Search className="h-4 w-4" />
            <span className="sr-only">Search</span>
          </button>
        </div>

        {/* Mobile hamburger */}
        <div className="md:hidden">
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
                    className="flex items-center gap-2 font-semibold"
                  >
                    <Network className="h-5 w-5 text-primary" />
                    System Design
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
                      "rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                      pathname === link.href
                        ? "bg-accent text-accent-foreground"
                        : "text-muted-foreground"
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
