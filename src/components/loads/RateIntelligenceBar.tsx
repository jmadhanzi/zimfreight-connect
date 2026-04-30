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

  const TrendIcon = marketTrend === "up" ? TrendingUp : marketTrend === "down" ? TrendingDown : Minus;
  const trendColor =
    marketTrend === "up"
      ? "text-[color:var(--success)]"
      : marketTrend === "down"
      ? "text-destructive"
      : "text-muted-foreground";

  const zwlPerKm = (avgRatePerKm * zwlRate).toFixed(0);

  return (
    <TooltipProvider delayDuration={200}>
      <div className={cn("flex flex-wrap items-center gap-x-6 gap-y-1.5 rounded-lg border border-border bg-card px-4 py-2.5 text-xs", className)}>
        {/* Label */}
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <span className="font-mono uppercase tracking-widest">Market Rate</span>
          {corridor !== "all" && (
            <span className="font-semibold text-foreground">{corridor}</span>
          )}
        </div>

        {/* USD rate */}
        <div className="flex items-center gap-1.5">
          <span className="font-mono-num text-base font-bold text-foreground">
            ${avgRatePerKm.toFixed(2)}/km
          </span>
          <span className={cn("flex items-center gap-0.5 font-mono font-bold", trendColor)}>
            <TrendIcon className="h-3.5 w-3.5" />
            {trendPct > 0 ? "+" : ""}{trendPct.toFixed(1)}%
          </span>
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="h-3.5 w-3.5 cursor-help text-muted-foreground" />
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-[220px] text-[11px]">
              30-day rolling average from all completed loads on this corridor. Updated daily.
            </TooltipContent>
          </Tooltip>
        </div>

        {/* ZWL equivalent */}
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <span className="font-mono uppercase tracking-widest">ZWL equiv.</span>
          <span className="font-mono-num font-bold text-foreground">ZWL {Number(zwlPerKm).toLocaleString()}/km</span>
          <span className="text-muted-foreground">@ {zwlRate.toLocaleString()}</span>
        </div>

        {/* Rate guidance */}
        <div className="ml-auto flex items-center gap-1.5">
          <span className="inline-flex items-center gap-1 rounded-full bg-[color:var(--success)]/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-[color:var(--success)]">
            Above market
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-[color:var(--zim-yellow)]/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-[color:var(--zim-yellow)]">
            At market
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-destructive/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-destructive">
            Below market
          </span>
        </div>
      </div>
    </TooltipProvider>
  );
}
