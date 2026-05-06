import { TrendingUp, TrendingDown } from "lucide-react";
import { Sparkline } from "./Sparkline";
import type { RouteRate } from "@/types";
import type { SavedRoute } from "@/hooks/useDashboard";

/** Deterministic sparkline data so the same route always shows the same trend. */
function spark(seed: string, base: number) {
  const out: number[] = [];
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) | 0;
  for (let i = 0; i < 20; i++) {
    h = (h * 1664525 + 1013904223) | 0;
    const noise = ((h >>> 16) % 100) / 100 - 0.5;
    out.push(+(base + noise * 0.3).toFixed(2));
  }
  return out;
}
function pct(seed: string) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) | 0;
  return (h % 21) - 10;
}

export function RouteIntelligence({
  saved,
  allRates,
}: {
  saved: SavedRoute[];
  allRates: RouteRate[];
}) {
  // Match saved routes to known route_rates rows; fall back to the top routes if none saved.
  const matched = saved
    .map((s) => allRates.find((r) => r.origin === s.origin && r.destination === s.destination))
    .filter((r): r is RouteRate => !!r);
  const list = matched.length > 0 ? matched : allRates.slice(0, 5);

  if (list.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-card/50 p-8 text-center">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
          No route rates yet
        </p>
        <p className="mt-1 text-sm text-foreground/70">
          Save corridors from the board to see live $/km data here.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border/70 bg-card shadow-[0_1px_0_color-mix(in_oklab,var(--foreground)_5%,transparent)]">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-[color:var(--bg-secondary)]">
            <tr className="border-b border-border text-left">
              <th className="px-3 py-3 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Route
              </th>
              <th className="px-3 py-3 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                $/km
              </th>
              <th className="px-3 py-3 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                7-day
              </th>
              <th className="px-3 py-3 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Trend
              </th>
              <th className="px-3 py-3 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Loads
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {list.map((r) => {
              const ch = pct(r.id);
              const up = ch >= 0;
              return (
                <tr key={r.id} className="transition-colors hover:bg-muted/30">
                  <td className="px-3 py-3 font-display text-sm font-bold tracking-tight text-foreground">
                    {r.origin} → {r.destination}
                  </td>
                  <td className="px-3 py-3 font-mono-num font-bold text-foreground">
                    ${Number(r.avg_rate_per_km).toFixed(2)}
                  </td>
                  <td className="px-3 py-3">
                    <span
                      className={`inline-flex items-center gap-0.5 font-mono text-[11px] font-bold tabular-nums ${up ? "text-[color:var(--success)]" : "text-destructive"}`}
                    >
                      {up ? (
                        <TrendingUp className="h-3 w-3" />
                      ) : (
                        <TrendingDown className="h-3 w-3" />
                      )}
                      {Math.abs(ch)}%
                    </span>
                  </td>
                  <td className="px-3 py-3">
                    <Sparkline values={spark(r.id, Number(r.avg_rate_per_km))} positive={up} />
                  </td>
                  <td className="px-3 py-3 font-mono-num text-muted-foreground">
                    {r.weekly_loads}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
