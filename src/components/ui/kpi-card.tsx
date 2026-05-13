import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ArrowDown, ArrowUp, Minus, type LucideIcon } from "lucide-react";

interface KpiCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  hint?: string;
  trend?: { value: number; positive: boolean } | null;
  trendLabel?: string;
  accent?: "blue" | "violet" | "pink" | "emerald" | "amber" | "sky" | "rose" | "neutral";
}

const accents: Record<NonNullable<KpiCardProps["accent"]>, string> = {
  blue: "text-blue-400",
  violet: "text-violet-400",
  pink: "text-pink-400",
  emerald: "text-emerald-400",
  amber: "text-amber-400",
  sky: "text-sky-400",
  rose: "text-rose-400",
  neutral: "text-muted-foreground",
};

export function KpiCard({ title, value, icon: Icon, hint, trend, trendLabel, accent = "neutral" }: KpiCardProps) {
  return (
    <Card className="relative overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{title}</CardTitle>
        <Icon className={cn("h-4 w-4", accents[accent])} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <div className="flex items-center gap-2 mt-1">
          {trend && (
            <span
              className={cn(
                "inline-flex items-center text-xs font-medium",
                trend.value === 0
                  ? "text-muted-foreground"
                  : trend.positive
                  ? "text-emerald-400"
                  : "text-rose-400"
              )}
            >
              {trend.value === 0 ? (
                <Minus className="h-3 w-3 mr-0.5" />
              ) : trend.positive ? (
                <ArrowUp className="h-3 w-3 mr-0.5" />
              ) : (
                <ArrowDown className="h-3 w-3 mr-0.5" />
              )}
              {trend.value.toFixed(1)}%
            </span>
          )}
          {(hint || trendLabel) && (
            <p className="text-xs text-muted-foreground">{trend ? trendLabel : hint}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
