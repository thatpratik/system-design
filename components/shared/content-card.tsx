import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { CategoryBadge } from "./category-badge";
import type { Category } from "@/types";

interface ContentCardProps {
  title: string;
  summary: string;
  category: Category;
  href: string;
}

export function ContentCard({ title, summary, category, href }: ContentCardProps) {
  return (
    <Link href={href} className="group block h-full">
      <Card className="h-full transition-all hover:shadow-md hover:border-primary/30">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold leading-snug group-hover:text-primary transition-colors">
              {title}
            </h3>
            <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground mt-0.5 transition-transform group-hover:translate-x-0.5" />
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
            {summary}
          </p>
          <CategoryBadge category={category} />
        </CardContent>
      </Card>
    </Link>
  );
}
