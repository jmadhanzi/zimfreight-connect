import { TrendingUp, TrendingDown } from "lucide-react";
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
    <div className="overflow-x-auto rounded-md border border-border bg-card">
      <div className="flex min-w-max items-center divide-x divide-border">
        {top.map((r) => {
          const code = `${r.origin.slice(0, 3).toUpperCase()}→${r.destination.slice(0, 3).toUpperCase()}`;
          const change = deterministicChange(r.id);
          const up = change >= 0;
          return (
            <div key={r.id} className="flex items-center gap-2 whitespace-nowrap px-4 py-2 text-xs">
              <span className="font-mono font-semibold text-foreground">{code}</span>
              <span className="font-mono-num text-primary">${Number(r.avg_rate_per_km).toFixed(2)}/km</span>
              <span className={`inline-flex items-center gap-0.5 ${up ? "text-[color:var(--success)]" : "text-destructive"}`}>
                {up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                {Math.abs(change)}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}