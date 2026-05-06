import { useEffect, useState } from "react";
import { db } from "@/lib/db";
import type { BorderStatus, RouteRate } from "@/types";
import { RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

export function StatsBar() {
  // Bug fix: use null as initial state instead of hardcoded placeholder values
  // so the UI shows "—" until real data is fetched from the database.
  const [loadCount, setLoadCount] = useState<number | null>(null);
  const [avgRate, setAvgRate] = useState<number | null>(null);
  const [beit, setBeit] = useState<BorderStatus | null>(null);
  const [updated, setUpdated] = useState<Date | null>(null);

  async function refresh() {
    const [{ count }, { data: rates }, { data: borders }] = await Promise.all([
      db.from("loads").select("id", { count: "exact", head: true }).eq("status", "available"),
      db.from("route_rates").select("avg_rate_per_km"),
      db.from("border_status").select("*"),
    ]);
    if (typeof count === "number") setLoadCount(count);
    if (rates && rates.length) {
      const avg = rates.reduce((s: number, r: RouteRate) => s + Number(r.avg_rate_per_km), 0) / rates.length;
      setAvgRate(Math.round(avg * 100) / 100);
    }
    const b = (borders ?? []).find((x: BorderStatus) => x.border_name === "Beitbridge");
    if (b) setBeit(b);
    setUpdated(new Date());
  }

  useEffect(() => {
    refresh();
    const t = setInterval(refresh, 60_000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const beitWait = beit?.wait_hours ?? null;
  const beitOrange = beitWait !== null && beitWait > 2;

  return (
    <div className="sticky top-0 z-30 border-b border-border bg-[color:var(--bg-secondary)]/95 backdrop-blur supports-[backdrop-filter]:bg-[color:var(--bg-secondary)]/85">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-2.5 text-xs md:px-6">
        <Stat dot="success" label={<><span className="font-display text-[15px] font-extrabold tracking-tight text-foreground">{loadCount ?? "—"}</span> <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">loads today</span></>} />
        <span className="hidden h-3 w-px bg-border md:inline-block" />
        <Stat label={<><span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Avg</span> <span className="font-mono-num text-foreground">{avgRate !== null ? `$${avgRate.toFixed(2)}/km` : "—"}</span></>} />
        <span className="hidden h-3 w-px bg-border md:inline-block" />
        <Stat label={<><span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">ZWL/USD</span> <span className="font-mono-num text-foreground">3,850</span></>} />
        <span className="hidden h-3 w-px bg-border md:inline-block" />
        <Stat label={
          <span className={cn("font-mono-num", beitOrange ? "text-[color:var(--zim-yellow)]" : "text-foreground")}>
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Beit Bridge</span> {beitWait !== null ? `~${beitWait}h wait` : "—"}
          </span>
        } />
        <button onClick={refresh} className="ml-auto inline-flex items-center gap-1.5 rounded-md px-2 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:bg-card hover:text-foreground">
          <RefreshCw className="h-3 w-3" />
          <span suppressHydrationWarning>Updated {updated ? fmtAgo(updated) : "—"}</span>
        </button>
      </div>
    </div>
  );
}

function Stat({ label, dot }: { label: React.ReactNode; dot?: "success" }) {
  return (
    <div className="inline-flex items-center gap-2">
      {dot === "success" && <span className="dot-live" />}
      {label}
    </div>
  );
}

function fmtAgo(d: Date) {
  const s = Math.max(0, Math.floor((Date.now() - d.getTime()) / 1000));
  if (s < 60) return `${s}s ago`;
  return `${Math.floor(s / 60)}m ago`;
}
