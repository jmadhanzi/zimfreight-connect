import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Lock, Phone, MessageCircle, ArrowRight, Bot, Share2, Bookmark, BookmarkCheck, ShieldCheck, Fuel, Clock, MapPin } from "lucide-react";
import { formatUSD, cn } from "@/lib/utils";
import type { Load } from "@/types";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import { db } from "@/lib/db";
import type { BorderStatus, RouteRate } from "@/types";
import { toast } from "sonner";
import { recordLoadView } from "@/components/conversion/SoftGateModal";
import { cacheRate, getCachedRate } from "@/lib/offlineDb";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";

function humanCacheAge(ms: number) {
  const m = Math.floor(ms / 60_000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

interface Props {
  load: Load | null;
  onClose: () => void;
  onRequestAuth: () => void;
  onUpgrade: () => void;
  saved: boolean;
  onToggleSave: (id: string) => void;
}

export function LoadDetailSheet({ load, onClose, onRequestAuth, onUpgrade, saved, onToggleSave }: Props) {
  const { user, subscription } = useAuth();
  const plan = subscription?.plan ?? "free";
  const canSeeContacts = !!user && (plan === "basic" || plan === "pro" || plan === "fleet");
  const isPro = !!user && (plan === "pro" || plan === "fleet");
  const [marketRate, setMarketRate] = useState<number | null>(null);
  const [rateCachedAt, setRateCachedAt] = useState<number | null>(null);
  const [beit, setBeit] = useState<BorderStatus | null>(null);
  const online = useNetworkStatus();

  useEffect(() => {
    if (!load) return;
    recordLoadView(load.id);
    (async () => {
      const cached = await getCachedRate(load.origin, load.destination);
      if (cached) { setMarketRate(Number(cached.rate.avg_rate_per_km)); setRateCachedAt(cached.cachedAt); }
      if (typeof navigator !== "undefined" && !navigator.onLine) return;
      const { data } = await db.from("route_rates").select("*").eq("origin", load.origin).eq("destination", load.destination).maybeSingle();
      const rate = data as RouteRate | null;
      if (rate) { setMarketRate(Number(rate.avg_rate_per_km)); setRateCachedAt(null); void cacheRate(load.origin, load.destination, rate); }
    })();
    if (load.is_border_crossing) {
      if (typeof navigator !== "undefined" && !navigator.onLine) return;
      db.from("border_status").select("*").eq("border_name", "Beitbridge").maybeSingle()
        .then(({ data }: { data: BorderStatus | null }) => setBeit(data));
    }
  }, [load, online]);

  if (!load) return <Sheet open={false} onOpenChange={(o) => !o && onClose()}><SheetContent /></Sheet>;

  const fuelLitres = load.distance_km ? Math.round(load.distance_km * 0.4) : null;
  const fuelCost = fuelLitres ? Math.round(fuelLitres * 1.6) : null;
  const driveHours = load.distance_km ? Math.round((load.distance_km / 60) * 10) / 10 : null;

  const ratePos = (() => {
    if (!marketRate || !load.rate_per_km) return null;
    const diff = (Number(load.rate_per_km) - marketRate) / marketRate;
    if (diff > 0.05) return { tone: "success" as const, label: "ABOVE MARKET" };
    if (diff < -0.05) return { tone: "destructive" as const, label: "BELOW MARKET" };
    return { tone: "primary" as const, label: "AT MARKET" };
  })();

  const share = async () => {
    const url = typeof window !== "undefined" ? `${window.location.origin}/board?load=${load.id}` : "";
    try {
      if (navigator.share) await navigator.share({ title: `${load.origin} → ${load.destination}`, url });
      else { await navigator.clipboard.writeText(url); toast.success("Link copied"); }
    } catch {}
  };

  return (
    <Sheet open={!!load} onOpenChange={(o) => !o && onClose()}>
      <SheetContent side="right" className="w-full overflow-y-auto border-border bg-card p-0 sm:max-w-[440px]">
        <SheetHeader className="border-b border-border p-5">
          <SheetTitle className="font-display text-2xl font-black tracking-tight">
            {load.origin} <ArrowRight className="inline h-5 w-5 text-primary" /> {load.destination}
          </SheetTitle>
          <div className="flex flex-wrap gap-1.5 pt-1">
            {load.is_urgent && <Badge className="border-0 bg-destructive text-[10px] font-bold uppercase text-destructive-foreground">Urgent</Badge>}
            {load.is_border_crossing && <Badge className="border-0 bg-[color-mix(in_oklab,var(--info)_20%,transparent)] text-[10px] font-bold uppercase text-[color:var(--info)]">Border</Badge>}
            {load.zimra_required && <Badge className="border-0 bg-[color-mix(in_oklab,var(--gold)_20%,transparent)] text-[10px] font-bold uppercase text-primary">ZIMRA</Badge>}
          </div>
        </SheetHeader>

        <div className="space-y-5 p-5">
          {/* RATE SUMMARY */}
          <section>
            <div className="font-display text-4xl font-black text-primary">{formatUSD(load.rate_usd)}</div>
            <div className="font-mono text-xs text-muted-foreground">
              {load.rate_per_km && <>${Number(load.rate_per_km).toFixed(2)}/km · </>}{load.distance_km}km
            </div>
            {ratePos && marketRate && (
              <div className="mt-3 rounded-md border border-border bg-background/40 p-3">
                <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest">
                  <span className={cn("text-muted-foreground", rateCachedAt && "text-orange-400")}>
                    Market avg ${marketRate.toFixed(2)}
                    {rateCachedAt && <span className="ml-1.5 normal-case tracking-normal">· cached {humanCacheAge(Date.now() - rateCachedAt)}</span>}
                  </span>
                  <span className={cn(
                    ratePos.tone === "success" && "text-[color:var(--success)]",
                    ratePos.tone === "destructive" && "text-destructive",
                    ratePos.tone === "primary" && "text-primary",
                  )}>{ratePos.label}</span>
                </div>
                <div className="relative mt-2 h-1.5 overflow-hidden rounded-full bg-background">
                  <div className="absolute inset-y-0 left-0 w-1/2 bg-destructive/60" />
                  <div className="absolute inset-y-0 left-1/3 w-1/3 bg-primary/60" />
                  <div className="absolute inset-y-0 right-0 w-1/3 bg-[color:var(--success)]/60" />
                </div>
              </div>
            )}
          </section>

          {/* DETAILS GRID */}
          <section className="grid grid-cols-2 gap-2 text-sm">
            <Cell label="Load type" value={load.load_type} />
            <Cell label="Equipment" value={load.equipment_required ?? "—"} />
            <Cell label="Weight" value={load.weight_tonnes ? `${load.weight_tonnes} t` : "—"} />
            <Cell label="Loads available" value={`${load.num_loads}`} />
            <Cell label="Pickup date" value={load.pickup_date ?? "—"} />
            <Cell label="Delivery by" value={load.delivery_deadline ?? "—"} />
            <Cell label="Payment" value={load.payment_terms ?? "—"} />
            <Cell label="Commodity value" value={load.commodity_value ? formatUSD(Number(load.commodity_value)) : "—"} />
          </section>

          {/* BROKER */}
          <section className="rounded-lg border border-border bg-background/40 p-4">
            <h4 className="font-display text-xs font-bold uppercase tracking-widest text-muted-foreground">Broker</h4>
            {canSeeContacts ? (
              <div className="mt-2">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/15 font-display font-bold text-primary">VB</div>
                  <div>
                    <div className="font-medium text-foreground">Verified Broker · Harare</div>
                    <div className="text-[11px] text-muted-foreground">⭐ 4.8 / 5.0 · 47 loads posted · Member since 2024</div>
                  </div>
                </div>
                <div className="mt-3 grid gap-1">
                  {[5,4,3,2,1].map(n => (
                    <div key={n} className="flex items-center gap-2 text-[10px] text-muted-foreground">
                      <span className="w-3">{n}★</span>
                      <div className="h-1 flex-1 overflow-hidden rounded-full bg-background"><div className="h-full bg-primary" style={{ width: `${[68, 22, 6, 3, 1][5-n]}%` }} /></div>
                    </div>
                  ))}
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px]">
                  <Badge variant="outline" className="border-border text-foreground">Days to pay: 14</Badge>
                  {load.zimra_required && <Badge className="border-0 bg-[color-mix(in_oklab,var(--gold)_20%,transparent)] text-primary"><ShieldCheck className="mr-1 h-3 w-3" /> ZIMRA Registered</Badge>}
                  <Badge variant="outline" className="border-[color:var(--success)]/40 text-[color:var(--success)]">Credit: Good</Badge>
                </div>
              </div>
            ) : (
              <div className="mt-2 rounded-md border border-primary/30 bg-primary/5 p-3">
                <div className="flex items-start gap-2">
                  <Lock className="mt-0.5 h-4 w-4 text-primary" />
                  <div className="flex-1 text-xs text-muted-foreground">
                    <span className="font-bold text-foreground">Broker details locked.</span> Upgrade to Basic to see ratings, payment terms, and ZIMRA status.
                  </div>
                </div>
                <Button size="sm" onClick={() => { if (!user) { onClose(); onRequestAuth(); } else { onUpgrade(); } }}
                  className="mt-2 w-full bg-primary text-primary-foreground hover:bg-primary/90">
                  {user ? "View plans →" : "Sign in →"}
                </Button>
              </div>
            )}
          </section>

          {/* ROUTE INFO */}
          <section className="rounded-lg border border-border bg-background/40 p-4">
            <h4 className="font-display text-xs font-bold uppercase tracking-widest text-muted-foreground">Route info</h4>
            <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
              <RouteFact icon={<MapPin className="h-3.5 w-3.5" />} label="Highway" value={load.highway ?? "—"} />
              <RouteFact icon={<Clock className="h-3.5 w-3.5" />} label="Drive time" value={driveHours ? `~${driveHours}h` : "—"} />
              <RouteFact icon={<Fuel className="h-3.5 w-3.5" />} label="Fuel est." value={fuelLitres ? `~${fuelLitres}L (~$${fuelCost})` : "—"} />
              <RouteFact icon={<MapPin className="h-3.5 w-3.5" />} label="Tolls" value={load.distance_km && load.distance_km > 200 ? `${Math.ceil(load.distance_km / 150)} gates` : "—"} />
            </div>
            {load.is_border_crossing && (
              <div className="mt-3 rounded-md border border-[color:var(--info)]/30 bg-[color:var(--info)]/5 p-3 text-xs">
                <div className="font-bold text-foreground">ZIMRA documents required</div>
                <ul className="mt-1 space-y-0.5 text-muted-foreground">
                  <li>• Bill of Entry (Form 21)</li>
                  <li>• Commercial invoice + packing list</li>
                  <li>• Transit bond / carnet</li>
                  <li>• Vehicle TIP &amp; driver passport</li>
                </ul>
                {beit && <div className="mt-2 font-mono text-[11px] text-muted-foreground">Beitbridge wait: <span className="text-[color:var(--zim-yellow)]">~{Number(beit.wait_hours).toFixed(1)}h</span></div>}
              </div>
            )}
            {load.notes && <p className="mt-3 rounded-md bg-background/60 p-3 text-xs text-muted-foreground">{load.notes}</p>}
          </section>

          {/* ACTIONS */}
          <section className="space-y-2">
            <Button onClick={() => { if (!user) { onClose(); onRequestAuth(); } else if (!canSeeContacts) onUpgrade(); else toast.success("Booking request sent"); }}
              size="lg" className="w-full bg-primary text-base font-bold uppercase tracking-wide text-primary-foreground hover:bg-primary/90">
              🚛 Book this load
            </Button>
            {canSeeContacts ? (
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" className="border-[color:var(--success)]/40 text-[color:var(--success)] hover:bg-[color:var(--success)]/10"><MessageCircle className="mr-1.5 h-4 w-4" /> WhatsApp</Button>
                <Button variant="outline"><Phone className="mr-1.5 h-4 w-4" /> Call</Button>
              </div>
            ) : (
              <Button variant="outline" onClick={onUpgrade} className="w-full border-border text-muted-foreground"><Lock className="mr-1.5 h-4 w-4" /> Contact locked — Upgrade</Button>
            )}
            <div className="grid grid-cols-3 gap-2">
              <Button variant="ghost" onClick={share} className="text-xs"><Share2 className="mr-1 h-3.5 w-3.5" /> Share</Button>
              <Button variant="ghost" onClick={() => { if (!isPro) onUpgrade(); else toast.info("AI agent opening…"); }} className="text-xs"><Bot className="mr-1 h-3.5 w-3.5" /> {isPro ? "Ask AI" : "AI (Pro)"}</Button>
              <Button variant="ghost" onClick={() => onToggleSave(load.id)} className="text-xs">
                {saved ? <><BookmarkCheck className="mr-1 h-3.5 w-3.5 text-primary" /> Saved</> : <><Bookmark className="mr-1 h-3.5 w-3.5" /> Save</>}
              </Button>
            </div>
          </section>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function Cell({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border bg-background/40 px-3 py-2">
      <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className="text-foreground">{value}</div>
    </div>
  );
}
function RouteFact({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2 rounded-md bg-background/60 px-2 py-1.5">
      <span className="text-muted-foreground">{icon}</span>
      <div className="min-w-0">
        <div className="font-mono text-[9px] uppercase text-muted-foreground">{label}</div>
        <div className="truncate text-foreground">{value}</div>
      </div>
    </div>
  );
}