import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { zodValidator, fallback } from "@tanstack/zod-adapter";
import { z } from "zod";
import { useEffect, useMemo, useState } from "react";
import { useLoads } from "@/hooks/useLoads";
import { LoadFilters, DEFAULT_FILTERS, type Filters } from "@/components/loads/LoadFilters";
import { LoadTable, getSaved, toggleSaved } from "@/components/loads/LoadTable";
import { SwipeableLoadCard } from "@/components/loads/SwipeableLoadCard";
import { LoadDetailSheet } from "@/components/loads/LoadDetailSheet";
import { StatsBar } from "@/components/loads/StatsBar";
import { CorridorBar, ZIM_CORRIDORS, type Corridor } from "@/components/loads/CorridorBar";
import { BackloadFinder } from "@/components/loads/BackloadFinder";
import { RateIntelligenceBar } from "@/components/loads/RateIntelligenceBar";
import { BoardSidebar } from "@/components/loads/Sidebar";
import { AuthModal } from "@/components/auth/AuthModal";
import type { Load, SortKey } from "@/types";
import { FREE_LOAD_LIMIT, PLAN_LEVEL, type PlanTier } from "@/types";
import { Lock } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { PricingModal } from "@/components/paywall/PricingModal";
import { SoftGateModal } from "@/components/conversion/SoftGateModal";
import { useIsMobile } from "@/hooks/use-mobile";
import { toast } from "sonner";

const HIDDEN_KEY = "zf:hidden_loads";
function getHidden(): string[] {
  if (typeof window === "undefined") return [];
  try { const v = JSON.parse(localStorage.getItem(HIDDEN_KEY) ?? "[]"); return Array.isArray(v) ? v : []; } catch { return []; }
}
function addHidden(id: string) {
  const next = Array.from(new Set([...getHidden(), id]));
  localStorage.setItem(HIDDEN_KEY, JSON.stringify(next));
  return next;
}

export const BOARD_DEFAULT_SEARCH = {
  q: "", origin: "all", destination: "all", loadType: "all", equipment: "all",
  pickup: "", minRate: 0, maxDistance: 2000, border: false, zimra: false,
  urgent: false, minWeight: 0, maxWeight: 40, payment: "all",
  sort: "newest" as const, load: undefined as string | undefined,
};

const searchSchema = z.object({
  q: fallback(z.string(), "").default(""),
  origin: fallback(z.string(), "all").default("all"),
  destination: fallback(z.string(), "all").default("all"),
  loadType: fallback(z.string(), "all").default("all"),
  equipment: fallback(z.string(), "all").default("all"),
  pickup: fallback(z.string(), "").default(""),
  minRate: fallback(z.number(), 0).default(0),
  maxDistance: fallback(z.number(), 2000).default(2000),
  border: fallback(z.boolean(), false).default(false),
  zimra: fallback(z.boolean(), false).default(false),
  urgent: fallback(z.boolean(), false).default(false),
  minWeight: fallback(z.number(), 0).default(0),
  maxWeight: fallback(z.number(), 40).default(40),
  payment: fallback(z.string(), "all").default("all"),
  sort: fallback(z.enum(["newest", "rate_high", "rate_low", "rate_per_km", "distance"]), "newest").default("newest"),
  load: fallback(z.string().optional(), undefined),
});

export const Route = createFileRoute("/board")({
  validateSearch: zodValidator(searchSchema),
  head: () => ({
    meta: [
      { title: "Load Board — ZimFreight" },
      { name: "description", content: "Browse live freight loads across Zimbabwe and SADC. Real-time updates, transparent USD rates." },
      { property: "og:title", content: "Live Load Board — ZimFreight" },
      { property: "og:description", content: "Browse live freight loads across Zimbabwe in real time." },
    ],
  }),
  component: LoadBoardPage,
});

function LoadBoardPage() {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: "/board" });
  const { loads, loading } = useLoads();
  const { user, subscription } = useAuth();
  const plan: PlanTier = (subscription?.plan as PlanTier) ?? "free";
  const isFree = !user || PLAN_LEVEL[plan] < PLAN_LEVEL.basic;
  const canSeeContacts = !isFree;
  const [activeCorridor, setActiveCorridor] = useState("all");
  // TODO: Replace with a live RBZ/forex API call once available.
  // The rate is stored here so it flows consistently to RateIntelligenceBar and ZwlChart.
  const zwlRate = 3850;

  const filters: Filters = useMemo(() => ({
    q: search.q, origin: search.origin, destination: search.destination,
    loadType: search.loadType, equipment: search.equipment, pickup: search.pickup,
    minRate: search.minRate, maxDistance: search.maxDistance, border: search.border,
    zimra: search.zimra, urgent: search.urgent, minWeight: search.minWeight,
    maxWeight: search.maxWeight, payment: search.payment,
  }), [search]);

  const setFilters = (f: Filters) => {
    navigate({ search: (prev: Record<string, unknown>) => ({ ...prev, ...f }) as never, replace: true });
  };
  const setSort = (s: SortKey) => navigate({ search: (prev: Record<string, unknown>) => ({ ...prev, sort: s }) as never, replace: true });

  const [authOpen, setAuthOpen] = useState(false);
  const [pricingOpen, setPricingOpen] = useState(false);
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [hiddenIds, setHiddenIds] = useState<string[]>([]);
  const isMobile = useIsMobile();

  useEffect(() => { setSavedIds(getSaved()); setHiddenIds(getHidden()); }, []);

  const onToggleSave = (id: string) => setSavedIds(toggleSaved(id));
  const onHide = (id: string) => {
    setHiddenIds(addHidden(id));
    toast("Hidden from your feed", {
      action: { label: "Undo", onClick: () => {
        const next = getHidden().filter(x => x !== id);
        localStorage.setItem(HIDDEN_KEY, JSON.stringify(next));
        setHiddenIds(next);
      }},
    });
  };

  const filtered = useMemo(() => {
    const f = filters;
    let arr = loads.filter(l => {
      if (hiddenIds.includes(l.id)) return false;
      if (f.origin !== "all" && l.origin !== f.origin) return false;
      if (f.destination !== "all" && l.destination !== f.destination) return false;
      if (f.loadType !== "all" && l.load_type !== f.loadType) return false;
      if (f.equipment !== "all" && l.equipment_required !== f.equipment) return false;
      if (f.payment !== "all" && l.payment_terms !== f.payment) return false;
      if (f.minRate > 0 && Number(l.rate_usd) < f.minRate) return false;
      if (l.distance_km && f.maxDistance < 2000 && l.distance_km > f.maxDistance) return false;
      if (f.border && !l.is_border_crossing) return false;
      if (f.zimra && !l.zimra_required) return false;
      if (f.urgent && !l.is_urgent) return false;
      if (l.weight_tonnes != null) {
        if (f.minWeight > 0 && Number(l.weight_tonnes) < f.minWeight) return false;
        if (f.maxWeight > 0 && Number(l.weight_tonnes) > f.maxWeight) return false;
      }
      if (f.pickup && l.pickup_date && l.pickup_date < f.pickup) return false;
      if (f.q) {
        const q = f.q.toLowerCase();
        return [l.origin, l.destination, l.load_type, l.notes ?? "", l.equipment_required ?? ""].some(x => x.toLowerCase().includes(q));
      }
      return true;
    });
    arr = [...arr].sort((a, b) => {
      switch (search.sort) {
        case "rate_high": return Number(b.rate_usd) - Number(a.rate_usd);
        case "rate_low": return Number(a.rate_usd) - Number(b.rate_usd);
        case "rate_per_km": return (Number(b.rate_per_km ?? 0) - Number(a.rate_per_km ?? 0));
        case "distance": return (b.distance_km ?? 0) - (a.distance_km ?? 0);
        default: return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });
    return arr;
  }, [loads, filters, search.sort, hiddenIds]);

  const visible = isFree ? filtered.slice(0, FREE_LOAD_LIMIT) : filtered;
  const hiddenCount = isFree ? Math.max(0, filtered.length - FREE_LOAD_LIMIT) : 0;

  const selected = useMemo(() => loads.find(l => l.id === search.load) ?? null, [loads, search.load]);
  const setSelected = (l: Load | null) => navigate({ search: (prev: Record<string, unknown>) => ({ ...prev, load: l?.id }) as never, replace: true });

  const handleCorridorSelect = (c: Corridor) => {
    setActiveCorridor(c.id);
    navigate({
      search: (prev: Record<string, unknown>) => ({ ...prev, origin: c.origin, destination: c.destination }) as never,
      replace: true,
    });
  };

  const returnOrigin = search.destination !== "all" ? search.destination : "";
  const returnDest = search.origin !== "all" ? search.origin : "";
  const returnCount = returnOrigin && returnDest
    ? loads.filter(l => l.origin === returnOrigin && l.destination === returnDest && l.status === "available").length
    : 0;

  const avgRatePerKm = useMemo(() => {
    const withRate = filtered.filter(l => l.rate_per_km && Number(l.rate_per_km) > 0);
    if (!withRate.length) return null;
    return withRate.reduce((s, l) => s + Number(l.rate_per_km), 0) / withRate.length;
  }, [filtered]);

  return (
    <div>
      <StatsBar />
      <CorridorBar active={activeCorridor} onSelect={handleCorridorSelect} resultCount={filtered.length} loading={loading} />
      <div className="mx-auto flex max-w-7xl gap-6 px-4 md:px-6">
        <BoardSidebar />
        <main className="min-w-0 flex-1 py-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="section-kicker">Live board</div>
              <h1 className="mt-1.5 font-display text-2xl font-bold tracking-tight md:text-3xl">Available loads</h1>
            </div>
            <div className="text-xs text-muted-foreground">
              {loading ? "Loading…" : <>Showing <span className="font-medium text-foreground">{filtered.length}</span> of {loads.length} loads</>}
            </div>
          </div>

          <div className="mt-4 space-y-3">
            <LoadFilters filters={filters} setFilters={setFilters} />
            {avgRatePerKm && (
              <RateIntelligenceBar
                corridor={activeCorridor !== "all" ? `${search.origin} → ${search.destination}` : "All Zimbabwe"}
                avgRatePerKm={avgRatePerKm}
                marketTrend="up"
                trendPct={2.3}
                zwlRate={zwlRate}
              />
            )}
            {returnCount > 0 && returnOrigin && returnDest && (
              <BackloadFinder
                origin={returnOrigin}
                destination={returnDest}
                returnCount={returnCount}
                onFind={() => handleCorridorSelect(
                  ZIM_CORRIDORS.find(c => c.origin === returnOrigin && c.destination === returnDest) ?? ZIM_CORRIDORS[0]
                )}
              />
            )}

            {!loading && filtered.length === 0 ? (
              <div className="rounded-lg border border-dashed border-border bg-muted/20 p-16 text-center">
                <h3 className="font-display text-base font-semibold">No loads match your filters</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">Try widening your search or clearing filters.</p>
                <Button variant="outline" size="sm" className="mt-4" onClick={() => setFilters(DEFAULT_FILTERS)}>Reset filters</Button>
              </div>
            ) : (
              <>
                {isMobile ? (
                  <div className="space-y-2.5">
                    <p className="px-1 text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                      Swipe right to save · left to hide
                    </p>
                    {visible.map((l) => (
                      <SwipeableLoadCard
                        key={l.id}
                        load={l}
                        saved={savedIds.includes(l.id)}
                        onClick={() => setSelected(l)}
                        onSave={() => onToggleSave(l.id)}
                        onHide={() => onHide(l.id)}
                      />
                    ))}
                  </div>
                ) : (
                  <LoadTable
                    loads={visible}
                    onSelect={(l) => setSelected(l)}
                    canSeeContacts={canSeeContacts}
                    onUpgrade={() => (user ? setPricingOpen(true) : setAuthOpen(true))}
                    sort={search.sort}
                    onSort={setSort}
                    savedIds={savedIds}
                    onToggleSave={onToggleSave}
                  />
                )}
                {hiddenCount > 0 && (
                  <div className="rounded-lg border border-border bg-muted/30 p-8 text-center">
                    <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                      <Lock className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <h3 className="mt-3 font-display text-lg font-bold tracking-tight">You've seen today's free loads</h3>
                    <p className="mt-1.5 text-sm text-muted-foreground">{hiddenCount} more loads waiting — upgrade to see all of them and unlock broker contacts.</p>
                    <Button onClick={() => (user ? setPricingOpen(true) : setAuthOpen(true))} className="mt-4">
                      Upgrade to Basic — $19/mo
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </main>
      </div>

      <LoadDetailSheet
        load={selected}
        onClose={() => setSelected(null)}
        onRequestAuth={() => setAuthOpen(true)}
        onUpgrade={() => setPricingOpen(true)}
        saved={selected ? savedIds.includes(selected.id) : false}
        onToggleSave={onToggleSave}
      />
      <AuthModal open={authOpen} onOpenChange={setAuthOpen} />
      <PricingModal open={pricingOpen} onOpenChange={setPricingOpen} />
      <SoftGateModal onUpgrade={() => (user ? setPricingOpen(true) : setAuthOpen(true))} />
    </div>
  );
}
