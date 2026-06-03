"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeftRight } from "lucide-react";
import type { ComponentMeta } from "@/types";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Props {
  components: ComponentMeta[];
  defaultA?: string;
  defaultB?: string;
}

export function CompareSelector({ components, defaultA, defaultB }: Props) {
  const router = useRouter();
  const [a, setA] = useState(defaultA ?? "");
  const [b, setB] = useState(defaultB ?? "");

  function handleCompare() {
    if (a && b && a !== b) {
      router.push(`/components/compare?a=${a}&b=${b}`);
    }
  }

  const canCompare = a && b && a !== b;

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
      <Select value={a} onValueChange={setA}>
        <SelectTrigger className="flex-1">
          <SelectValue placeholder="First component…" />
        </SelectTrigger>
        <SelectContent>
          {components.map((c) => (
            <SelectItem key={c.slug} value={c.slug} disabled={c.slug === b}>
              {c.title}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <ArrowLeftRight className="h-4 w-4 text-muted-foreground shrink-0 mx-auto sm:mx-0" />

      <Select value={b} onValueChange={setB}>
        <SelectTrigger className="flex-1">
          <SelectValue placeholder="Second component…" />
        </SelectTrigger>
        <SelectContent>
          {components.map((c) => (
            <SelectItem key={c.slug} value={c.slug} disabled={c.slug === a}>
              {c.title}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button onClick={handleCompare} disabled={!canCompare} className="sm:w-auto">
        Compare
      </Button>
    </div>
  );
}
