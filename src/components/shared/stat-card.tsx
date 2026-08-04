import * as React from "react";
import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";

export interface StatCardProps {
  title: string;
  value: React.ReactNode;
  icon?: React.ReactNode;
  trend?: number;
  trendLabel?: string;
  hint?: string;
  className?: string;
  accent?: "primary" | "success" | "danger" | "warning" | "info";
}

const accentMap = {
  primary: "from-violet-500/15",
  success: "from-emerald-500/15",
  danger: "from-rose-500/15",
  warning: "from-amber-500/15",
  info: "from-sky-500/15",
};

export function StatCard({
  title,
  value,
  icon,
  trend,
  trendLabel,
  hint,
  className,
  accent = "primary",
}: StatCardProps) {
  const hasTrend = typeof trend === "number";
  const isUp = (trend ?? 0) >= 0;

  return (
    <Card
      className={cn(
        "relative overflow-hidden bg-gradient-to-b from-transparent",
        accentMap[accent],
        className,
      )}
    >
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          {icon ? (
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              {icon}
            </div>
          ) : null}
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-semibold tracking-tight">{value}</span>
          {hasTrend ? (
            <span
              className={cn(
                "inline-flex items-center gap-0.5 text-xs font-medium",
                isUp ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400",
              )}
            >
              {isUp ? (
                <ArrowUpRight className="h-3.5 w-3.5" />
              ) : (
                <ArrowDownRight className="h-3.5 w-3.5" />
              )}
              {Math.abs(trend!).toFixed(1)}%
              {trendLabel ? (
                <span className="text-muted-foreground">{trendLabel}</span>
              ) : null}
            </span>
          ) : null}
        </div>
        {hint ? (
          <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
        ) : null}
      </CardContent>
    </Card>
  );
}

export function TrendBadge({ value }: { value: number }) {
  const isUp = value >= 0;
  const Icon = isUp ? ArrowUpRight : ArrowDownRight;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-medium",
        isUp
          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
          : "bg-rose-500/10 text-rose-600 dark:text-rose-400",
      )}
    >
      <Icon className="h-3 w-3" />
      {Math.abs(value).toFixed(1)}%
    </span>
  );
}

export function NeutralIcon() {
  return <Minus className="h-4 w-4" />;
}