import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  Truck,
  Plus,
  Calendar,
  Phone,
  MessageCircle,
  ShieldCheck,
  Search,
  Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ZIM_CITIES, ALL_DEST_CITIES } from "@/types";
import { getTruckPosts, seedTruckPostsIfEmpty, type TruckPost } from "@/lib/truckPosts";
import { aggregateRatings, getRatings } from "@/lib/trust";
import { RatingStars, VerifiedBadge } from "@/components/trust/Badges";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/trucks")({
  head: () => ({
    meta: [
      { title: "Available Trucks — ZimFreight" },
      {
        name: "description",
        content:
          "Browse trucks looking for loads. Carriers post their available capacity, brokers book directly.",
      },
    ],
  }),
  component: TrucksPage,
});

function TrucksPage() {
  const [posts, setPosts] = useState<TruckPost[]>([]);
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [equipment, setEquipment] = useState("");
  const [search, setSearch] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    seedTruckPostsIfEmpty();
    const refresh = () => setPosts(getTruckPosts());
    refresh();
    window.addEventListener("zf:truck-posts-changed", refresh);
    return () => window.removeEventListener("zf:truck-posts-changed", refresh);
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return posts.filter((p) => {
      if (origin && p.origin !== origin) return false;
      if (destination && p.destination !== destination) return false;
      if (equipment && !p.equipment.toLowerCase().includes(equipment.toLowerCase())) return false;
      if (
        q &&
        !`${p.carrierName} ${p.origin} ${p.destination} ${p.equipment}`.toLowerCase().includes(q)
      )
        return false;
      return p.status === "available";
    });
  }, [posts, origin, destination, equipment, search]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-6 md:py-10">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <span className="section-kicker">
            <Truck className="h-3 w-3" /> Trucks
          </span>
          <h1 className="mt-3 font-display text-4xl font-bold tracking-[-0.04em] md:text-5xl">
            Find a <span className="text-secondary">truck</span>
          </h1>
          <p className="mt-2 max-w-xl text-muted-foreground">
            Carriers post their available capacity here. Find a truck heading your way and book the
            lane directly &mdash; no empty miles for them, no scrambling for you.
          </p>
        </div>
        <Button
          asChild
          className="bg-secondary font-semibold text-secondary-foreground hover:bg-secondary/90"
        >
          <Link to="/trucks/post">
            <Plus className="mr-1.5 h-4 w-4" /> Post my truck
          </Link>
        </Button>
      </div>

      {/* Search + filter row */}
      <div className="mt-6 grid gap-3 md:grid-cols-[1fr_auto]">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search carriers, routes, equipment..."
            className="pl-10"
          />
        </div>
        <Button
          variant="outline"
          onClick={() => setShowFilters((v) => !v)}
          className="rounded-full"
        >
          <Filter className="mr-1.5 h-4 w-4" />
          Filters{" "}
          {(origin || destination || equipment) && (
            <span className="ml-1.5 rounded-full bg-secondary/20 px-1.5 text-[10px] font-bold text-secondary">
              on
            </span>
          )}
        </Button>
      </div>

      {showFilters && (
        <div className="mt-3 grid gap-3 rounded-lg border border-border/70 bg-card p-4 md:grid-cols-3">
          <div>
            <label className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
              Origin
            </label>
            <Select value={origin || "all"} onValueChange={(v) => setOrigin(v === "all" ? "" : v)}>
              <SelectTrigger className="mt-1.5">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All origins</SelectItem>
                {ZIM_CITIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
              Destination
            </label>
            <Select
              value={destination || "all"}
              onValueChange={(v) => setDestination(v === "all" ? "" : v)}
            >
              <SelectTrigger className="mt-1.5">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All destinations</SelectItem>
                {ALL_DEST_CITIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
              Equipment
            </label>
            <Input
              value={equipment}
              onChange={(e) => setEquipment(e.target.value)}
              placeholder="Flatbed, Tanker, Reefer..."
              className="mt-1.5"
            />
          </div>
        </div>
      )}

      {/* Result count */}
      <div className="mt-5 flex items-center justify-between">
        <span className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
          <span className="text-foreground">{filtered.length}</span> truck
          {filtered.length === 1 ? "" : "s"} available
        </span>
        <span className="hidden font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground sm:flex items-center gap-1.5">
          <span className="dot-live" /> Updated live
        </span>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="mt-6 rounded-lg border border-dashed border-border bg-card/50 p-12 text-center">
          <Truck className="mx-auto h-6 w-6 text-muted-foreground/60" />
          <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            No trucks match
          </p>
          <p className="mt-1 text-sm text-foreground/70">
            Try clearing filters or post a load to attract carriers.
          </p>
        </div>
      ) : (
        <div className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => (
            <TruckPostCard key={p.id} post={p} />
          ))}
        </div>
      )}
    </div>
  );
}

function TruckPostCard({ post }: { post: TruckPost }) {
  const ratings = useMemo(() => getRatings(), []);
  const agg = useMemo(() => aggregateRatings(post.carrierId, ratings), [post.carrierId, ratings]);
  const ageMs = Date.now() - new Date(post.created_at).getTime();
  const ageMin = Math.floor(ageMs / 60000);
  const age =
    ageMin < 60
      ? `${ageMin}m`
      : ageMin < 1440
        ? `${Math.floor(ageMin / 60)}h`
        : `${Math.floor(ageMin / 1440)}d`;
  const date = new Date(post.available_date).toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  return (
    <div className=" relative flex flex-col overflow-hidden rounded-lg border border-border/70 bg-card p-5 pt-[18px]">
      <span
        aria-hidden
        className="hidden"
      />

      {/* Route */}
      <div className="flex items-baseline gap-1.5">
        <span className="font-display text-lg font-bold leading-none tracking-[-0.025em] text-foreground">
          {post.origin}
        </span>
        <ArrowRight className="h-4 w-4 shrink-0 text-secondary" />
        <span className="font-display text-lg font-bold leading-none tracking-[-0.025em] text-foreground">
          {post.destination}
        </span>
        {post.is_cross_border && (
          <span className="ml-auto inline-flex items-center gap-1 rounded-md border border-border bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground uppercase">Border</span>
        )}
      </div>

      {/* Date + age */}
      <div className="mt-2 flex items-center gap-2 text-xs">
        <Calendar className="h-3 w-3 text-muted-foreground" />
        <span className="font-mono font-semibold text-foreground/85">{date}</span>
        {post.flexible_dates && (
          <span className="rounded-full bg-muted/60 px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            ±1d
          </span>
        )}
        <span className="ml-auto font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
          {age} ago
        </span>
      </div>

      {/* Equipment + capacity */}
      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        <span className="inline-flex items-center gap-1 rounded-md border border-border bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
          <Truck className="h-3 w-3" /> {post.equipment}
        </span>
        <span className="inline-flex items-center gap-1 rounded-md border border-border bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground font-mono">{post.weight_capacity_t}t</span>
        {post.is_zimra_ready && (
          <span className="inline-flex items-center gap-1 rounded-md border border-[color:var(--success)]/20 bg-[color-mix(in_oklab,var(--success)_10%,transparent)] px-1.5 py-0.5 text-[10px] font-medium text-[color:var(--success)]">
            <ShieldCheck className="h-3 w-3" /> ZIMRA
          </span>
        )}
      </div>

      {/* Rate */}
      {post.rate_usd_per_km && (
        <div className="mt-3">
          <span className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
            Asking rate
          </span>
          <div className="mt-0.5 font-display text-2xl font-bold leading-none tracking-[-0.035em] text-foreground">
            ${post.rate_usd_per_km.toFixed(2)}
            <span className="ml-0.5 font-mono text-xs font-medium text-muted-foreground">/km</span>
          </div>
        </div>
      )}

      {/* Carrier identity */}
      <div className="mt-4 flex items-center gap-2 border-t border-border pt-3">
        <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/10 font-display text-xs font-bold text-primary">
          {post.carrierName
            .split(" ")
            .map((s) => s[0])
            .slice(0, 2)
            .join("")
            .toUpperCase()}
        </span>
        <div className="min-w-0 flex-1">
          <div className="truncate font-display text-sm font-bold tracking-tight text-foreground">
            {post.carrierName}
          </div>
          <div className="mt-0.5 flex items-center gap-1.5">
            <RatingStars agg={agg} size="sm" />
            <VerifiedBadge agg={agg} />
          </div>
        </div>
      </div>

      {/* Notes */}
      {post.notes && (
        <p className="mt-3 line-clamp-2 text-xs text-muted-foreground">{post.notes}</p>
      )}

      {/* Actions */}
      <div className="mt-4 flex gap-2">
        {post.carrierWhatsapp && (
          <Button
            asChild
            size="sm"
            variant="outline"
            className="flex-1 rounded-full border-[color:var(--success)]/40 text-[color:var(--success)] hover:bg-[color:var(--success)]/10"
          >
            <a
              href={`https://wa.me/${post.carrierWhatsapp.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(`Hi ${post.carrierName.split(" ")[0]}, I have a load that matches your ${post.origin} → ${post.destination} run.`)}`}
              target="_blank"
              rel="noreferrer"
            >
              <MessageCircle className="mr-1 h-3.5 w-3.5" /> WhatsApp
            </a>
          </Button>
        )}
        <Button
          size="sm"
          className={cn(
            "flex-1 bg-secondary font-semibold text-secondary-foreground hover:bg-secondary/90",
            !post.carrierWhatsapp && "w-full",
          )}
        >
          <Phone className="mr-1 h-3.5 w-3.5" /> Book truck
        </Button>
      </div>
    </div>
  );
}
