import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import type { ReactNode } from "react";

interface DashboardChartProps {
  title: string;
  icon: ReactNode;
  description?: string;
  isLoading?: boolean;
  emptyMessage?: string;
  isEmpty?: boolean;
  children: ReactNode;
  footer?: ReactNode;
}

export function DashboardChart({
  title,
  icon,
  description,
  isLoading = false,
  emptyMessage = "No hay datos disponibles",
  isEmpty = false,
  children,
  footer,
}: DashboardChartProps) {
  return (
    <Card className="shadow-sm border-border hover:shadow-md transition-shadow">
      <CardHeader className="pb-2.5 p-3.5 border-b border-border/50">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <div className="text-primary/70">{icon}</div>
          <span>{title}</span>
        </CardTitle>
        {description && (
          <CardDescription className="text-xs mt-0.5">
            {description}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="p-3.5 pt-3">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : isEmpty ? (
          <div className="text-center py-8 text-muted-foreground text-sm">
            {emptyMessage}
          </div>
        ) : (
          <>
            <div className="h-[220px] w-full">{children}</div>
            {footer && (
              <div className="mt-2.5 pt-2.5 border-t border-border/50">
                {footer}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
