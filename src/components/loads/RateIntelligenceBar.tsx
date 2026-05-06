import { TrendingUp, TrendingDown, Minus, Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

/**
 * RateIntelligenceBar — DAT-inspired market rate context bar.
 * Shows the current average rate for the selected corridor,
 * trend direction, and how the displayed loads compare to market.
 *
 * Zimbabwe-specific: shows both USD/km and ZWL equivalent.
 */

interface RateIntelligenceBarProps {
  corridor: string;
  avgRatePerKm: number | null;
  marketTrend: "up" | "down" | "flat";
  trendPct: number;
  zwlRate: number;
  className?: string;
}

export function RateIntelligenceBar({
  corridor,
  avgRatePerKm,
  marketTrend,
  trendPct,
  zwlRate,
  className,
}: RateIntelligenceBarProps) {
  if (!avgRatePerKm) return null;

  const TrendIcon =
    marketTrend === "up" ? TrendingUp : marketTrend === "down" ? TrendingDown : Minus;
  const trendColor =
    marketTrend === "up"
      ? "text-[color:var(--success)]"
      : marketTrend === "down"
        ? "text-destructive"
        : "text-muted-foreground";

  const zwlPerKm = (avgRatePerKm * zwlRate).toFixed(0);

  return (
    <TooltipProvider delayDuration={200}>
      <div
        className={cn(
          "flex flex-wrap items-center gap-x-6 gap-y-1.5 rounded-2xl border border-border/70 bg-card px-4 py-3 text-xs",
          className,
        )}
      >
        {/* Label */}
        <div className="flex items-center gap-2">
          <span className="dot-live" />
          <span className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-foreground">
            Market Rate
          </span>
          {corridor !== "all" && (
            <span className="font-display text-sm font-bold tracking-tight text-foreground">
              {corridor}
            </span>
          )}
        </div>

        {/* USD rate */}
        <div className="flex items-center gap-2">
          <span className="font-display text-base font-extrabold tracking-[-0.02em] tabular-nums text-foreground">
            ${avgRatePerKm.toFixed(2)}
            <span className="font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
              /km
            </span>
          </span>
          <span
            className={cn(
              "inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 font-mono text-[10px] font-bold tabular-nums",
              trendColor,
              marketTrend === "up"
                ? "bg-[color-mix(in_oklab,var(--success)_12%,transparent)]"
                : marketTrend === "down"
                  ? "bg-destructive/12"
                  : "bg-muted",
            )}
          >
            <TrendIcon className="h-3 w-3" strokeWidth={3} />
            {trendPct > 0 ? "+" : ""}
            {trendPct.toFixed(1)}%
          </span>
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="h-3.5 w-3.5 cursor-help text-muted-foreground hover:text-foreground" />
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-[220px] text-[11px]">
              30-day rolling average from all completed loads on this corridor. Updated daily.
            </TooltipContent>
          </Tooltip>
        </div>

        {/* ZWL equivalent */}
        <div className="flex items-center gap-2">
          <span className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
            ZWL equiv.
          </span>
          <span className="font-mono-num font-bold text-foreground">
            ZWL {Number(zwlPerKm).toLocaleString()}
            <span className="font-medium text-muted-foreground">/km</span>
          </span>
          <span className="font-mono text-[10px] text-muted-foreground">
            @ {zwlRate.toLocaleString()}
          </span>
        </div>

        {/* Rate guidance */}
        <div className="ml-auto flex items-center gap-1.5">
          <span className="glass-chip glass-chip-success uppercase">Above market</span>
          <span className="glass-chip glass-chip-amber uppercase">At market</span>
          <span className="glass-chip glass-chip-danger uppercase">Below market</span>
        </div>
      </div>
    </TooltipProvider>
  );
}
