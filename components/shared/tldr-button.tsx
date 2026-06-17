"use client";

import { useCompletion } from "@ai-sdk/react";
import { Sparkles, Loader2, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

interface TldrButtonProps {
  slug: string;
  type: "system" | "component";
}

export function TldrButton({ slug, type }: TldrButtonProps) {
  const [open, setOpen] = useState(false);

  const { complete, completion, isLoading, error } = useCompletion({
    api: "/api/tldr",
    streamProtocol: "text",
  });

  async function handleClick() {
    if (open) {
      setOpen(false);
      return;
    }
    setOpen(true);
    if (!completion) {
      await complete("", { body: { slug, type } });
    }
  }

  return (
    <div className="not-prose">
      <button
        onClick={handleClick}
        disabled={isLoading}
        className="inline-flex items-center gap-2 text-sm font-medium px-3 py-1.5 rounded-md border border-border bg-background hover:bg-muted transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
        ) : (
          <Sparkles className="h-3.5 w-3.5 text-primary" />
        )}
        <span>{isLoading ? "Generating…" : "AI TLDR"}</span>
        {!isLoading && (
          open
            ? <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" />
            : <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
        )}
      </button>

      {open && (completion || error) && (
        <div className="mt-3 p-4 rounded-lg border border-border bg-muted/40 text-sm leading-relaxed">
          {error ? (
            <p className="text-destructive">{error.message}</p>
          ) : (
            <div className="whitespace-pre-wrap text-foreground/90">{completion}</div>
          )}
        </div>
      )}
    </div>
  );
}
