import { Badge } from "@/components/ui/badge";
import { CATEGORIES_CONFIG, mostrarCategoriaVisual } from "@/lib/config";

interface InstructorCategoryBadgeProps {
  category: string;
  disciplineName: string;
  showOnlyIfVisual?: boolean;
}

export function InstructorCategoryBadge({
  category,
  disciplineName,
  showOnlyIfVisual = true,
}: InstructorCategoryBadgeProps) {
  // Check if this discipline should show visual category
  if (showOnlyIfVisual && !mostrarCategoriaVisual(disciplineName)) {
    return null;
  }

  // Get category display name and color
  const categoryName =
    CATEGORIES_CONFIG.DISPLAY_NAMES[
      category as keyof typeof CATEGORIES_CONFIG.DISPLAY_NAMES
    ] || category;
  const categoryColor =
    CATEGORIES_CONFIG.BADGE_COLORS[
      category as keyof typeof CATEGORIES_CONFIG.BADGE_COLORS
    ] || "bg-gray-100 text-gray-800 border-gray-200";

  return (
    <Badge variant="outline" className={categoryColor}>
      {categoryName}
    </Badge>
  );
}
