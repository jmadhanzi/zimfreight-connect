import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useLoads } from "@/hooks/useLoads";
import { LoadCard } from "@/components/loads/LoadCard";
import { LoadFilters, type Filters } from "@/components/loads/LoadFilters";
import { LoadDetailDialog } from "@/components/loads/LoadDetailDialog";
import { AuthModal } from "@/components/auth/AuthModal";
import type { Load } from "@/types";
import { FREE_LOAD_LIMIT, PLAN_LEVEL, type PlanTier } from "@/types";
import { Truck, Lock } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { PricingModal } from "@/components/paywall/PricingModal";

export const Route = createFileRoute("/board")({
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
  const { loads, loading } = useLoads();
  const { user, subscription } = useAuth();
  const plan: PlanTier = (subscription?.plan as PlanTier) ?? "free";
  const isFree = !user || PLAN_LEVEL[plan] < PLAN_LEVEL.basic;
  const [filters, setFilters] = useState<Filters>({ q: "", origin: "all", destination: "all", loadType: "all" });
  const [selected, setSelected] = useState<Load | null>(null);
  const [authOpen, setAuthOpen] = useState(false);
  const [pricingOpen, setPricingOpen] = useState(false);

  const filtered = useMemo(() => {
    return loads.filter(l => {
      if (filters.origin !== "all" && l.origin !== filters.origin) return false;
      if (filters.destination !== "all" && l.destination !== filters.destination) return false;
      if (filters.loadType !== "all" && l.load_type !== filters.loadType) return false;
      if (filters.q) {
        const q = filters.q.toLowerCase();
        return [l.origin, l.destination, l.load_type, l.notes ?? "", l.equipment_required ?? ""].some(f => f.toLowerCase().includes(q));
      }
      return true;
    });
  }, [loads, filters]);

  const visible = isFree ? filtered.slice(0, FREE_LOAD_LIMIT) : filtered;
  const hiddenCount = isFree ? Math.max(0, filtered.length - FREE_LOAD_LIMIT) : 0;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 md:px-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <span className="font-mono text-xs uppercase tracking-widest text-primary">Live board</span>
          <h1 className="mt-1 font-display text-4xl font-black uppercase tracking-tight md:text-5xl">Available loads</h1>
        </div>
        <div className="font-mono text-xs text-muted-foreground">
          {loading ? "Loading…" : <>Showing <span className="text-foreground">{filtered.length}</span> of {loads.length}</>}
        </div>
      </div>

      <div className="mt-6 space-y-4">
        <LoadFilters filters={filters} setFilters={setFilters} />

        {!loading && filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-card/50 p-16 text-center">
            <Truck className="h-10 w-10 text-muted-foreground" />
            <h3 className="mt-4 font-display text-xl font-bold uppercase">No loads match your filters</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {loads.length === 0 ? "Be the first to post a load." : "Try widening your search."}
            </p>
          </div>
        ) : (
          <>
            <div className="grid gap-3 md:grid-cols-2">
              {visible.map(l => (
                <LoadCard key={l.id} load={l} onClick={() => setSelected(l)} />
              ))}
            </div>
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

      <LoadDetailDialog load={selected} onClose={() => setSelected(null)} onRequestAuth={() => setAuthOpen(true)} />
      <AuthModal open={authOpen} onOpenChange={setAuthOpen} />
      <PricingModal open={pricingOpen} onOpenChange={setPricingOpen} />
    </div>
  );
}
