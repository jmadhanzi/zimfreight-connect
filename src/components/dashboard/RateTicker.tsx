import { TrendingUp, TrendingDown, ArrowRight } from "lucide-react";
import type { RouteRate } from "@/types";

function deterministicChange(seed: string): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) | 0;
  return ((h % 21) - 10) / 1; // -10 .. +10 percent
}

export function RateTicker({ rates }: { rates: RouteRate[] }) {
  if (rates.length === 0) return null;
  const top = rates.slice(0, 6);
  return (
    <div className="relative flex items-stretch overflow-hidden rounded-lg border border-border/70 bg-card">
      {/* Live indicator label */}
      <div className="hidden shrink-0 items-center gap-2 border-r border-border bg-[var(--bg-secondary)] px-4 sm:flex">
        <span className="dot-live" />
        <span className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-foreground">
          Live $/km
        </span>
      </div>
      <div className="flex flex-1 overflow-x-auto scrollbar-none">
        <div className="flex min-w-max items-center divide-x divide-border">
          {top.map((r) => {
            const code = `${r.origin.slice(0, 3).toUpperCase()}`;
            const dest = `${r.destination.slice(0, 3).toUpperCase()}`;
            const change = deterministicChange(r.id);
            const up = change >= 0;
            return (
              <div
                key={r.id}
                className="flex items-center gap-2.5 whitespace-nowrap px-4 py-2.5 text-xs"
              >
                <span className="font-mono text-[10px] font-bold tracking-[0.04em] text-foreground/80">
                  {code}
                  <ArrowRight className="mx-0.5 inline h-3 w-3 text-secondary" />
                  {dest}
                </span>
                <span className="font-mono tabular-nums font-bold text-foreground">
                  ${Number(r.avg_rate_per_km).toFixed(2)}
                </span>
                <span
                  className={`inline-flex items-center gap-0.5 font-mono text-[10px] font-bold tabular-nums ${up ? "text-[color:var(--success)]" : "text-destructive"}`}
                >
                  {up ? (
                    <TrendingUp className="h-2.5 w-2.5" strokeWidth={3} />
                  ) : (
                    <TrendingDown className="h-2.5 w-2.5" strokeWidth={3} />
                  )}
                  {Math.abs(change)}%
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
