import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { CATEGORY_LABELS } from "@/lib/constants";
import type { Category } from "@/types";

const categoryStyles: Record<Category, string> = {
  "traffic-management":
    "bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-100 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800",
  storage:
    "bg-green-100 text-green-700 border-green-200 hover:bg-green-100 dark:bg-green-950 dark:text-green-300 dark:border-green-800",
  messaging:
    "bg-purple-100 text-purple-700 border-purple-200 hover:bg-purple-100 dark:bg-purple-950 dark:text-purple-300 dark:border-purple-800",
  compute:
    "bg-orange-100 text-orange-700 border-orange-200 hover:bg-orange-100 dark:bg-orange-950 dark:text-orange-300 dark:border-orange-800",
  coordination:
    "bg-yellow-100 text-yellow-700 border-yellow-200 hover:bg-yellow-100 dark:bg-yellow-950 dark:text-yellow-300 dark:border-yellow-800",
  observability:
    "bg-red-100 text-red-700 border-red-200 hover:bg-red-100 dark:bg-red-950 dark:text-red-300 dark:border-red-800",
  system:
    "bg-green-100 text-green-700 border-green-200 hover:bg-green-100 dark:bg-green-950 dark:text-green-300 dark:border-green-800",
};

export function CategoryBadge({ category }: { category: Category }) {
  return (
    <Badge
      variant="outline"
      className={cn("w-fit text-xs font-medium", categoryStyles[category])}
    >
      {CATEGORY_LABELS[category]}
    </Badge>
  );
}
