import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { zodValidator, fallback } from "@tanstack/zod-adapter";
import { z } from "zod";
import { useEffect, useMemo, useState } from "react";
import { useLoads } from "@/hooks/useLoads";
import { LoadFilters, DEFAULT_FILTERS, type Filters } from "@/components/loads/LoadFilters";
import { LoadTable, getSaved, toggleSaved } from "@/components/loads/LoadTable";
import { LoadDetailSheet } from "@/components/loads/LoadDetailSheet";
import { StatsBar } from "@/components/loads/StatsBar";
import { BoardSidebar } from "@/components/loads/Sidebar";
import { AuthModal } from "@/components/auth/AuthModal";
import type { Load, SortKey } from "@/types";
import { FREE_LOAD_LIMIT, PLAN_LEVEL, type PlanTier } from "@/types";
import { Lock } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { PricingModal } from "@/components/paywall/PricingModal";

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

  useEffect(() => { setSavedIds(getSaved()); }, []);

  const onToggleSave = (id: string) => setSavedIds(toggleSaved(id));

  const filtered = useMemo(() => {
    const f = filters;
    let arr = loads.filter(l => {
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
  }, [loads, filters, search.sort]);

  const visible = isFree ? filtered.slice(0, FREE_LOAD_LIMIT) : filtered;
  const hiddenCount = isFree ? Math.max(0, filtered.length - FREE_LOAD_LIMIT) : 0;

  const selected = useMemo(() => loads.find(l => l.id === search.load) ?? null, [loads, search.load]);
  const setSelected = (l: Load | null) => navigate({ search: (prev: Record<string, unknown>) => ({ ...prev, load: l?.id }) as never, replace: true });

  return (
    <div>
      <StatsBar />
      <div className="mx-auto flex max-w-7xl gap-6 px-4 md:px-6">
        <BoardSidebar />
        <main className="min-w-0 flex-1 py-6">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <span className="font-mono text-xs uppercase tracking-widest text-primary">Live board</span>
              <h1 className="mt-1 font-display text-3xl font-black uppercase tracking-tight md:text-4xl">Available loads</h1>
            </div>
            <div className="font-mono text-xs text-muted-foreground">
              {loading ? "Loading…" : <>Showing <span className="text-foreground">{filtered.length}</span> of {loads.length}</>}
            </div>
          </div>

          <div className="mt-4 space-y-3">
            <LoadFilters filters={filters} setFilters={setFilters} />

            {!loading && filtered.length === 0 ? (
              <div className="rounded-lg border border-dashed border-border bg-card/50 p-16 text-center">
                <h3 className="font-display text-xl font-bold uppercase">No loads match your filters</h3>
                <p className="mt-1 text-sm text-muted-foreground">Try widening your search or clearing filters.</p>
                <Button variant="outline" className="mt-4" onClick={() => setFilters(DEFAULT_FILTERS)}>Reset filters</Button>
              </div>
            ) : (
              <>
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
                {hiddenCount > 0 && (
                  <div className="rounded-xl border border-primary/30 bg-gradient-to-b from-primary/10 to-card p-8 text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/15 text-primary">
                      <Lock className="h-6 w-6" />
                    </div>
                    <h3 className="mt-3 font-display text-2xl font-black uppercase tracking-tight">You've seen today's free loads</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{hiddenCount} more loads waiting — upgrade to see all of them and unlock broker contacts.</p>
                    <Button onClick={() => (user ? setPricingOpen(true) : setAuthOpen(true))} className="mt-4 bg-primary text-primary-foreground hover:bg-primary/90">
                      Upgrade to Basic — $19/mo →
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
    </div>
  );
}
