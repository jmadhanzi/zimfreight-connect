import { useEffect, useState } from "react";
import { db } from "@/lib/db";
import type { BorderStatus, RouteRate } from "@/types";
import { RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

export function StatsBar() {
  const [loadCount, setLoadCount] = useState(847);
  const [carriers] = useState(312);
  const [avgRate, setAvgRate] = useState(2.84);
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

  const beitWait = beit?.wait_hours ?? 2.5;
  const beitOrange = beitWait > 2;

  return (
    <div className="sticky top-0 z-30 border-b border-border bg-[color:var(--bg-secondary)]/95 backdrop-blur supports-[backdrop-filter]:bg-[color:var(--bg-secondary)]/80">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-2 text-xs md:px-6">
        <Stat dot="success" label={<><span className="font-display text-base font-bold text-primary">{loadCount}</span> <span className="text-muted-foreground">loads today</span></>} />
        <Stat label={<><span className="font-display text-base font-bold text-foreground">{carriers}</span> <span className="text-muted-foreground">carriers online</span></>} />
        <Stat label={<><span className="text-muted-foreground">Avg</span> <span className="font-mono-num text-foreground">${avgRate.toFixed(2)}/km</span></>} />
        <Stat label={<><span className="text-muted-foreground">ZWL/USD:</span> <span className="font-mono-num text-foreground">3,850</span></>} />
        <Stat label={
          <span className={cn("font-mono-num", beitOrange ? "text-[color:var(--zim-yellow)]" : "text-foreground")}>
            <span className="text-muted-foreground">Beit Bridge:</span> ~{beitWait}h wait
          </span>
        } />
        <button onClick={refresh} className="ml-auto inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground">
          <RefreshCw className="h-3 w-3" />
          <span suppressHydrationWarning>Updated {updated ? fmtAgo(updated) : "—"}</span>
        </button>
      </div>
    </div>
  );
}

function Stat({ label, dot }: { label: React.ReactNode; dot?: "success" }) {
  return (
    <div className="inline-flex items-center gap-1.5">
      {dot === "success" && <span className="relative flex h-2 w-2"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[color:var(--success)] opacity-75" /><span className="relative inline-flex h-2 w-2 rounded-full bg-[color:var(--success)]" /></span>}
      {label}
    </div>
  );
}

function fmtAgo(d: Date) {
  const s = Math.max(0, Math.floor((Date.now() - d.getTime()) / 1000));
  if (s < 60) return `${s}s ago`;
  return `${Math.floor(s / 60)}m ago`;
}