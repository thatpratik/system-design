import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { CategoryBadge } from "./category-badge";
import { cn } from "@/lib/utils";
import type { Category } from "@/types";

interface ContentCardProps {
  title: string;
  summary: string;
  category: Category;
  href: string;
}

const categoryAccent: Record<Category, string> = {
  "traffic-management": "border-l-blue-400",
  storage:     "border-l-teal-400",
  messaging:   "border-l-violet-400",
  compute:     "border-l-orange-400",
  coordination:"border-l-amber-400",
  observability:"border-l-rose-400",
};

export function ContentCard({ title, summary, category, href }: ContentCardProps) {
  return (
    <Link href={href} className="group block h-full">
      <Card
        className={cn(
          "h-full border-l-[3px] transition-all duration-200 hover:shadow-[0_8px_30px_rgba(0,0,0,0.07)] hover:-translate-y-0.5",
          categoryAccent[category]
        )}
      >
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-[15px] leading-snug group-hover:text-primary transition-colors">
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
