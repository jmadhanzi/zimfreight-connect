import { useEffect, useState } from "react";
import { db } from "@/lib/db";
import type { BorderStatus, RouteRate } from "@/types";
import { ZIM_CITIES } from "@/types";
import { Bookmark, MapPin, TrendingDown, TrendingUp, Minus } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

const SAVED_KEY = "zf:saved_loads";

function getSavedRoutes(): { origin: string; destination: string }[] {
  if (typeof window === "undefined") return [];
  try {
    const r = JSON.parse(localStorage.getItem("zf:onboarding:routes") ?? "[]");
    return Array.isArray(r) ? r.slice(0, 4) : [];
  } catch { return []; }
}

export function BoardSidebar() {
  const [rates, setRates] = useState<RouteRate[]>([]);
  const [borders, setBorders] = useState<BorderStatus[]>([]);
  const [savedCount, setSavedCount] = useState(0);
  const [routes, setRoutes] = useState<{ origin: string; destination: string }[]>([]);

  useEffect(() => {
    db.from("route_rates").select("*").order("weekly_loads", { ascending: false }).limit(5)
      .then(({ data }: { data: RouteRate[] | null }) => setRates(data ?? []));
    db.from("border_status").select("*").order("border_name")
      .then(({ data }: { data: BorderStatus[] | null }) => setBorders(data ?? []));
    setRoutes(getSavedRoutes());
    try {
      const saved = JSON.parse(localStorage.getItem(SAVED_KEY) ?? "[]");
      setSavedCount(Array.isArray(saved) ? saved.length : 0);
    } catch { setSavedCount(0); }
    const onStorage = () => {
      try {
        const saved = JSON.parse(localStorage.getItem(SAVED_KEY) ?? "[]");
        setSavedCount(Array.isArray(saved) ? saved.length : 0);
      } catch {}
    };
    window.addEventListener("storage", onStorage);
    window.addEventListener("zf:saved-changed", onStorage);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("zf:saved-changed", onStorage);
    };
  }, []);

  // Trend direction is deterministic from origin+destination so SSR matches.
  const trend = (key: string) => {
    const h = [...key].reduce((a, c) => a + c.charCodeAt(0), 0);
    const dir = h % 3; // 0=up, 1=down, 2=flat
    const pct = ((h % 9) + 1);
    return { dir, pct };
  };

  return (
    <aside className="hidden w-[260px] shrink-0 lg:block">
      <div className="sticky top-[44px] space-y-4 py-4 pr-2">
        <Section title="My route feeds">
          {routes.length === 0 ? (
            <p className="text-xs text-muted-foreground">No saved routes yet. Add some during onboarding.</p>
          ) : (
            <ul className="space-y-1">
              {routes.map((r, i) => (
                <li key={i}>
                  <Link to="/board" search={{ origin: r.origin, destination: r.destination } as never}
                    className="flex items-center justify-between rounded px-2 py-1.5 text-xs text-foreground hover:bg-card">
                    <span className="truncate">{r.origin} → {r.destination}</span>
                    <span className="rounded bg-primary/15 px-1.5 py-0.5 font-mono text-[10px] text-primary">{((i + 3) * 4) + 1}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Section>

        <Section title="Saved loads" rightSlot={<span className="font-mono text-[10px] text-muted-foreground">{savedCount}</span>}>
          {savedCount === 0 ? (
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground"><Bookmark className="h-3 w-3" /> Bookmark a load to see it here.</p>
          ) : (
            <p className="text-xs text-muted-foreground">{savedCount} load{savedCount === 1 ? "" : "s"} saved.</p>
          )}
        </Section>

        <Section title="Rate ticker">
          <ul className="space-y-1.5">
            {rates.map(r => {
              const { dir, pct } = trend(r.origin + r.destination);
              return (
                <li key={r.id} className="flex items-center justify-between text-xs">
                  <span className="truncate text-foreground">{abbr(r.origin)} → {abbr(r.destination)}</span>
                  <span className="flex items-center gap-1 font-mono-num">
                    <span className="text-foreground">${Number(r.avg_rate_per_km).toFixed(2)}</span>
                    <TrendIcon dir={dir} pct={pct} />
                  </span>
                </li>
              );
            })}
          </ul>
        </Section>

        <Section title="Border status">
          <ul className="space-y-1.5">
            {borders.map(b => (
              <li key={b.id} className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 text-foreground"><MapPin className="h-3 w-3 text-muted-foreground" />{b.border_name}</span>
                <span className={cn("font-mono-num", b.wait_hours > 4 ? "text-destructive" : b.wait_hours > 2 ? "text-[color:var(--zim-yellow)]" : "text-[color:var(--success)]")}>
                  {Number(b.wait_hours).toFixed(1)}h
                </span>
              </li>
            ))}
          </ul>
        </Section>
      </div>
    </aside>
  );
}

function Section({ title, children, rightSlot }: { title: string; children: React.ReactNode; rightSlot?: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-border bg-card p-3">
      <div className="mb-2 flex items-center justify-between">
        <h4 className="font-display text-xs font-bold uppercase tracking-widest text-muted-foreground">{title}</h4>
        {rightSlot}
      </div>
      {children}
    </div>
  );
}

function TrendIcon({ dir, pct }: { dir: number; pct: number }) {
  if (dir === 0) return <span className="inline-flex items-center gap-0.5 text-[color:var(--success)]"><TrendingUp className="h-3 w-3" />{pct}%</span>;
  if (dir === 1) return <span className="inline-flex items-center gap-0.5 text-destructive"><TrendingDown className="h-3 w-3" />{pct}%</span>;
  return <span className="inline-flex items-center gap-0.5 text-muted-foreground"><Minus className="h-3 w-3" /></span>;
}

function abbr(c: string) {
  const map: Record<string, string> = {
    "Harare": "HRE", "Bulawayo": "BYO", "Mutare": "MUT", "Beitbridge": "BBR",
    "Chirundu": "CHI", "Victoria Falls": "VFA", "Plumtree": "PLU", "Gweru": "GWE",
    "Masvingo": "MSV", "Hwange": "HWA",
  };
  return map[c] ?? c.slice(0, 3).toUpperCase();
}
// avoid unused-import warning
void ZIM_CITIES;