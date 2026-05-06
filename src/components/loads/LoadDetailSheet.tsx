import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Lock,
  Phone,
  MessageCircle,
  ArrowRight,
  Bot,
  Share2,
  Bookmark,
  BookmarkCheck,
  ShieldCheck,
  Fuel,
  Clock,
  MapPin,
  Truck,
} from "lucide-react";
import { formatUSD, cn } from "@/lib/utils";
import type { Load } from "@/types";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useMemo, useState } from "react";
import { db } from "@/lib/db";
import type { BorderStatus, RouteRate } from "@/types";
import { toast } from "sonner";
import { recordLoadView } from "@/components/conversion/SoftGateModal";
import { cacheRate, getCachedRate } from "@/lib/offlineDb";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";
import {
  aggregateRatings,
  getRatings,
  isPreferredCarrier,
  addPreferredCarrier,
  removePreferredCarrier,
} from "@/lib/trust";
import { RatingStars, VerifiedPayerBadge, PreferredBadge } from "@/components/trust/Badges";
import { formatDual } from "@/lib/fx";
import { Heart } from "lucide-react";

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

export function LoadDetailSheet({
  load,
  onClose,
  onRequestAuth,
  onUpgrade,
  saved,
  onToggleSave,
}: Props) {
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
      if (cached) {
        setMarketRate(Number(cached.rate.avg_rate_per_km));
        setRateCachedAt(cached.cachedAt);
      }
      if (typeof navigator !== "undefined" && !navigator.onLine) return;
      const { data } = await db
        .from("route_rates")
        .select("*")
        .eq("origin", load.origin)
        .eq("destination", load.destination)
        .maybeSingle();
      const rate = data as RouteRate | null;
      if (rate) {
        setMarketRate(Number(rate.avg_rate_per_km));
        setRateCachedAt(null);
        void cacheRate(load.origin, load.destination, rate);
      }
    })();
    if (load.is_border_crossing) {
      if (typeof navigator !== "undefined" && !navigator.onLine) return;
      db.from("border_status")
        .select("*")
        .eq("border_name", "Beitbridge")
        .maybeSingle()
        .then(({ data }: { data: BorderStatus | null }) => setBeit(data));
    }
  }, [load, online]);

  // Trust signals (hooks must run before the early return)
  const brokerId =
    (load as (Load & { poster_id?: string; broker_id?: string }) | null)?.poster_id ??
    (load as (Load & { broker_id?: string }) | null)?.broker_id ??
    (load ? `broker_${load.id}` : "broker_unknown");
  const brokerAgg = useMemo(() => aggregateRatings(brokerId, getRatings()), [brokerId]);
  const [preferred, setPreferred] = useState(false);
  useEffect(() => {
    setPreferred(isPreferredCarrier(brokerId));
    const refresh = () => setPreferred(isPreferredCarrier(brokerId));
    window.addEventListener("zf:preferred-changed", refresh);
    return () => window.removeEventListener("zf:preferred-changed", refresh);
  }, [brokerId]);

  if (!load)
    return (
      <Sheet open={false} onOpenChange={(o) => !o && onClose()}>
        <SheetContent />
      </Sheet>
    );

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

  // Dual currency display
  const rateDual = formatDual(Number(load.rate_usd));

  const share = async () => {
    const url =
      typeof window !== "undefined" ? `${window.location.origin}/board?load=${load.id}` : "";
    try {
      if (navigator.share)
        await navigator.share({ title: `${load.origin} → ${load.destination}`, url });
      else {
        await navigator.clipboard.writeText(url);
        toast.success("Link copied");
      }
    } catch {
      /* user cancelled share */
    }
  };

  return (
    <Sheet open={!!load} onOpenChange={(o) => !o && onClose()}>
      <SheetContent
        side="right"
        className="w-full overflow-y-auto border-border bg-card p-0 sm:max-w-[440px]"
      >
        {/* top accent strip */}
        <span
          aria-hidden
          className="block h-1 w-full bg-gradient-to-r from-secondary via-primary to-secondary"
        />
        <SheetHeader className="border-b border-border p-5">
          <span className="section-kicker">Load detail</span>
          <SheetTitle className="mt-2 font-display text-2xl font-black tracking-[-0.035em]">
            {load.origin} <ArrowRight className="inline h-5 w-5 text-secondary" />{" "}
            {load.destination}
          </SheetTitle>
          <div className="flex flex-wrap gap-1.5 pt-1">
            {load.is_urgent && (
              <Badge className="border-0 bg-destructive text-[10px] font-bold uppercase tracking-[0.1em] text-destructive-foreground">
                Urgent
              </Badge>
            )}
            {load.is_border_crossing && (
              <Badge className="border-0 bg-[color-mix(in_oklab,var(--info)_20%,transparent)] text-[10px] font-bold uppercase tracking-[0.1em] text-[color:var(--info)]">
                Border
              </Badge>
            )}
            {load.zimra_required && (
              <Badge className="border-0 bg-[color-mix(in_oklab,var(--gold)_20%,transparent)] text-[10px] font-bold uppercase tracking-[0.1em] text-primary">
                ZIMRA
              </Badge>
            )}
          </div>
        </SheetHeader>

        <div className="space-y-5 p-5">
          {/* RATE SUMMARY */}
          <section>
            <div className="font-display text-[2.75rem] font-black leading-none tracking-[-0.04em] text-foreground">
              {formatUSD(load.rate_usd)}
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-2 font-mono text-xs text-muted-foreground">
              {load.rate_per_km && (
                <span className="font-semibold text-foreground/70">
                  ${Number(load.rate_per_km).toFixed(2)}/km
                </span>
              )}
              {load.rate_per_km && load.distance_km && <span className="text-border">·</span>}
              {load.distance_km && <span>{load.distance_km}km</span>}
              <span className="text-border">·</span>
              <span className="font-semibold text-secondary/85">{rateDual.zwl}</span>
            </div>
            {ratePos && marketRate && (
              <div className="mt-3 rounded-xl border border-border bg-background/40 p-3">
                <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.16em]">
                  <span className={cn("text-muted-foreground", rateCachedAt && "text-orange-400")}>
                    Market avg ${marketRate.toFixed(2)}
                    {rateCachedAt && (
                      <span className="ml-1.5 normal-case tracking-normal">
                        · cached {humanCacheAge(Date.now() - rateCachedAt)}
                      </span>
                    )}
                  </span>
                  <span
                    className={cn(
                      ratePos.tone === "success" && "text-[color:var(--success)]",
                      ratePos.tone === "destructive" && "text-destructive",
                      ratePos.tone === "primary" && "text-primary",
                    )}
                  >
                    {ratePos.label}
                  </span>
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
            <Cell
              label="Commodity value"
              value={load.commodity_value ? formatUSD(Number(load.commodity_value)) : "—"}
            />
          </section>

          {/* BROKER */}
          <section className="rounded-2xl border border-border/70 bg-card p-4">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                Broker profile
              </span>
              {canSeeContacts && (
                <button
                  type="button"
                  onClick={() => {
                    if (preferred) {
                      removePreferredCarrier(brokerId);
                      toast.success("Removed from preferred network");
                    } else {
                      addPreferredCarrier({
                        carrierId: brokerId,
                        name:
                          (load as Load & { poster?: { full_name?: string } }).poster?.full_name ??
                          "Verified Broker",
                      });
                      toast.success("Added to preferred network");
                    }
                  }}
                  className={cn(
                    "inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.14em] transition-colors",
                    preferred
                      ? "bg-destructive/12 text-destructive"
                      : "border border-border bg-card text-muted-foreground hover:border-foreground/15 hover:text-foreground",
                  )}
                  aria-label={preferred ? "Remove from preferred" : "Add to preferred"}
                >
                  <Heart
                    className={cn("h-3 w-3", preferred && "fill-current")}
                    strokeWidth={preferred ? 0 : 2}
                  />
                  {preferred ? "Preferred" : "Save broker"}
                </button>
              )}
            </div>

            {canSeeContacts ? (
              <div className="mt-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 font-display text-lg font-black text-primary">
                    {((load as Load & { poster?: { full_name?: string } }).poster?.full_name ??
                      "B")[0].toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-display text-base font-extrabold tracking-tight text-foreground">
                      {(load as Load & { poster?: { full_name?: string } }).poster?.full_name ??
                        "Verified Broker"}
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      <RatingStars agg={brokerAgg} size="sm" />
                      <VerifiedPayerBadge agg={brokerAgg} />
                      {preferred && <PreferredBadge />}
                      {load.zimra_required && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-secondary/15 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-secondary">
                          <ShieldCheck className="h-3 w-3" /> ZIMRA
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-3 gap-2">
                  <BrokerStat
                    value={brokerAgg.count > 0 ? String(brokerAgg.count) : "—"}
                    label="Bookings"
                  />
                  <BrokerStat value={load.payment_terms ?? "—"} label="Payment terms" />
                  <BrokerStat
                    value={
                      brokerAgg.paidOnTimePct !== undefined ? `${brokerAgg.paidOnTimePct}%` : "—"
                    }
                    label="Paid on time"
                    tone={(brokerAgg.paidOnTimePct ?? 0) >= 90 ? "success" : undefined}
                  />
                </div>
              </div>
            ) : (
              <div className="mt-3 rounded-xl border border-secondary/30 bg-secondary/[0.06] p-3">
                <div className="flex items-start gap-2">
                  <Lock className="mt-0.5 h-4 w-4 text-secondary" />
                  <div className="flex-1 text-xs text-muted-foreground">
                    <span className="font-bold text-foreground">Broker details locked.</span>{" "}
                    Upgrade to Basic to see ratings, payment history, and ZIMRA status.
                  </div>
                </div>
                <Button
                  size="sm"
                  onClick={() => {
                    if (!user) {
                      onClose();
                      onRequestAuth();
                    } else {
                      onUpgrade();
                    }
                  }}
                  className="mt-3 w-full rounded-full bg-secondary font-bold text-secondary-foreground btn-amber-glow hover:bg-secondary/90"
                >
                  {user ? "View plans →" : "Sign in →"}
                </Button>
              </div>
            )}
          </section>

          {/* ROUTE INFO */}
          <section className="rounded-lg border border-border bg-background/40 p-4">
            <h4 className="font-display text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Route info
            </h4>
            <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
              <RouteFact
                icon={<MapPin className="h-3.5 w-3.5" />}
                label="Highway"
                value={load.highway ?? "—"}
              />
              <RouteFact
                icon={<Clock className="h-3.5 w-3.5" />}
                label="Drive time"
                value={driveHours ? `~${driveHours}h` : "—"}
              />
              <RouteFact
                icon={<Fuel className="h-3.5 w-3.5" />}
                label="Fuel est."
                value={fuelLitres ? `~${fuelLitres}L (~$${fuelCost})` : "—"}
              />
              <RouteFact
                icon={<MapPin className="h-3.5 w-3.5" />}
                label="Tolls"
                value={
                  load.distance_km && load.distance_km > 200
                    ? `${Math.ceil(load.distance_km / 150)} gates`
                    : "—"
                }
              />
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
                {beit && (
                  <div className="mt-2 font-mono text-[11px] text-muted-foreground">
                    Beitbridge wait:{" "}
                    <span className="text-[color:var(--zim-yellow)]">
                      ~{Number(beit.wait_hours).toFixed(1)}h
                    </span>
                  </div>
                )}
              </div>
            )}
            {load.notes && (
              <p className="mt-3 rounded-md bg-background/60 p-3 text-xs text-muted-foreground">
                {load.notes}
              </p>
            )}
          </section>

          {/* ACTIONS */}
          <section className="space-y-2">
            <Button
              onClick={async () => {
                if (!user) {
                  onClose();
                  onRequestAuth();
                  return;
                }
                if (!canSeeContacts) {
                  onUpgrade();
                  return;
                }
                try {
                  const { error } = await db.from("bookings").insert({
                    load_id: load.id,
                    carrier_id: user.id,
                    status: "pending",
                  });
                  if (error) throw error;
                  toast.success("Booking request sent — the broker will be notified");
                } catch (e) {
                  toast.error(e instanceof Error ? e.message : "Failed to send booking request");
                }
              }}
              size="lg"
              className="w-full bg-secondary text-base font-bold tracking-wide text-secondary-foreground btn-amber-glow hover:bg-secondary/90"
            >
              <Truck className="mr-2 h-4 w-4" /> Book this load
            </Button>
            {canSeeContacts ? (
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  asChild
                  className="border-[color:var(--success)]/40 text-[color:var(--success)] hover:bg-[color:var(--success)]/10"
                >
                  <a
                    href={`https://wa.me/${(load as Load & { poster?: { phone_whatsapp?: string | null } }).poster?.phone_whatsapp?.replace(/\D/g, "") ?? ""}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <MessageCircle className="mr-1.5 h-4 w-4" /> WhatsApp
                  </a>
                </Button>
                <Button variant="outline" asChild>
                  <a
                    href={`tel:${(load as Load & { poster?: { phone_whatsapp?: string | null } }).poster?.phone_whatsapp ?? ""}`}
                  >
                    <Phone className="mr-1.5 h-4 w-4" /> Call
                  </a>
                </Button>
              </div>
            ) : (
              <Button
                variant="outline"
                onClick={onUpgrade}
                className="w-full border-border text-muted-foreground"
              >
                <Lock className="mr-1.5 h-4 w-4" /> Contact locked — Upgrade
              </Button>
            )}
            <div className="grid grid-cols-3 gap-2">
              <Button variant="ghost" onClick={share} className="text-xs">
                <Share2 className="mr-1 h-3.5 w-3.5" /> Share
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  if (!isPro) onUpgrade();
                  else toast.info("AI agent opening…");
                }}
                className="text-xs"
              >
                <Bot className="mr-1 h-3.5 w-3.5" /> {isPro ? "Ask AI" : "AI (Pro)"}
              </Button>
              <Button variant="ghost" onClick={() => onToggleSave(load.id)} className="text-xs">
                {saved ? (
                  <>
                    <BookmarkCheck className="mr-1 h-3.5 w-3.5 text-primary" /> Saved
                  </>
                ) : (
                  <>
                    <Bookmark className="mr-1 h-3.5 w-3.5" /> Save
                  </>
                )}
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
      <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
        {label}
      </div>
      <div className="text-foreground">{value}</div>
    </div>
  );
}
function RouteFact({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
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

function BrokerStat({ value, label, tone }: { value: string; label: string; tone?: "success" }) {
  return (
    <div className="rounded-xl bg-[var(--bg-secondary)] px-3 py-2.5 text-center">
      <div
        className={cn(
          "font-display text-base font-extrabold leading-none tracking-tight tabular-nums",
          tone === "success" ? "text-[color:var(--success)]" : "text-foreground",
        )}
      >
        {value}
      </div>
      <div className="mt-1 font-mono text-[9px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
        {label}
      </div>
    </div>
  );
}
