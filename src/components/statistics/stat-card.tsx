import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ReactNode } from "react";

interface StatCardProps {
  title: string;
  icon: ReactNode;
  value: string | number;
  subtitle?: string;
  subtitleValue?: string | number;
  badge?: string;
  color?: "purple" | "indigo" | "blue" | "emerald" | "amber";
  footer?: ReactNode;
}

export function StatCard({
  title,
  icon,
  value,
  subtitle,
  subtitleValue,
  badge,
  color = "purple",
  footer,
}: StatCardProps) {
  const colorClasses = {
    purple: {
      header:
        "from-purple-50/30 to-background dark:from-purple-950/10 dark:to-background",
      iconBg: "bg-purple-100/50 dark:bg-purple-900/20",
      iconColor: "text-purple-600 dark:text-purple-400",
      badge:
        "bg-purple-600/15 text-purple-600 border-purple-600 dark:bg-purple-400/15 dark:text-purple-400 dark:border-purple-400",
    },
    indigo: {
      header:
        "from-indigo-50/30 to-background dark:from-indigo-950/10 dark:to-background",
      iconBg: "bg-indigo-100/50 dark:bg-indigo-900/20",
      iconColor: "text-indigo-600 dark:text-indigo-400",
      badge:
        "bg-indigo-600/15 text-indigo-600 border-indigo-600 dark:bg-indigo-400/15 dark:text-indigo-400 dark:border-indigo-400",
    },
    blue: {
      header:
        "from-blue-50/30 to-background dark:from-blue-950/10 dark:to-background",
      iconBg: "bg-blue-100/50 dark:bg-blue-900/20",
      iconColor: "text-blue-600 dark:text-blue-400",
      badge:
        "bg-blue-600/15 text-blue-600 border-blue-600 dark:bg-blue-400/15 dark:text-blue-400 dark:border-blue-400",
    },
    emerald: {
      header:
        "from-emerald-50/30 to-background dark:from-emerald-950/10 dark:to-background",
      iconBg: "bg-emerald-100/50 dark:bg-emerald-900/20",
      iconColor: "text-emerald-600 dark:text-emerald-400",
      badge:
        "bg-emerald-600/15 text-emerald-600 border-emerald-600 dark:bg-emerald-400/15 dark:text-emerald-400 dark:border-emerald-400",
    },
    amber: {
      header:
        "from-amber-50/30 to-background dark:from-amber-950/10 dark:to-background",
      iconBg: "bg-amber-100/50 dark:bg-amber-900/20",
      iconColor: "text-amber-600 dark:text-amber-400",
      badge:
        "bg-amber-600/15 text-amber-600 border-amber-600 dark:bg-amber-400/15 dark:text-amber-400 dark:border-amber-400",
    },
  };

  return (
    <Card className="shadow-sm border-border overflow-hidden hover:shadow-md transition-shadow">
      <CardHeader
        className={`pb-2.5 bg-gradient-to-br ${colorClasses[color].header} p-3.5 border-b border-border/50`}
      >
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <div
              className={`flex items-center justify-center w-6 h-6 rounded-md ${colorClasses[color].iconBg}`}
            >
              <div className={`h-3.5 w-3.5 ${colorClasses[color].iconColor}`}>
                {icon}
              </div>
            </div>
            <span className="text-muted-foreground">{title}</span>
          </CardTitle>
          {badge && (
            <Badge
              variant="outline"
              className={`${colorClasses[color].badge} text-[10px] px-1.5 py-0 h-5 font-medium border`}
            >
              {badge}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-3.5 pt-3">
        <div className="flex items-center justify-between">
          <div className="text-2xl font-bold tracking-tight">{value}</div>
          {subtitle && subtitleValue && (
            <div className="flex flex-col items-end gap-0.5">
              <div className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">
                {subtitle}
              </div>
              <div className="text-sm font-semibold">{subtitleValue}</div>
            </div>
          )}
        </div>
        {footer && (
          <div className="mt-2.5 pt-2.5 border-t border-border/50">
            {footer}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
