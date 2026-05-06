import { useEffect, useMemo, useState } from "react";
import { Heart, Phone, MessageCircle, Trash2, Search } from "lucide-react";
import {
  getPreferredCarriers,
  removePreferredCarrier,
  getRatings,
  aggregateRatings,
  type PreferredCarrier,
} from "@/lib/trust";
import { RatingStars, VerifiedPayerBadge } from "@/components/trust/Badges";
import { Input } from "@/components/ui/input";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";

export function SavedCarriersWidget() {
  const [carriers, setCarriers] = useState<PreferredCarrier[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const refresh = () => setCarriers(getPreferredCarriers());
    refresh();
    window.addEventListener("zf:preferred-changed", refresh);
    return () => window.removeEventListener("zf:preferred-changed", refresh);
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return carriers;
    return carriers.filter(
      (c) => c.name.toLowerCase().includes(q) || c.notes?.toLowerCase().includes(q),
    );
  }, [carriers, search]);

  const ratings = useMemo(() => getRatings(), []);

  return (
    <div className="rounded-2xl border border-border/70 bg-card p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <span className="section-kicker">
            <Heart className="h-3 w-3" /> Network
          </span>
          <h2 className="mt-2 font-display text-lg font-extrabold tracking-[-0.025em]">
            Preferred carriers
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Brokers and carriers you&rsquo;ve worked with before. They&rsquo;ll see your loads
            first.
          </p>
        </div>
        {carriers.length > 0 && (
          <span className="rounded-full bg-destructive/12 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-destructive">
            {carriers.length}
          </span>
        )}
      </div>

      {carriers.length > 4 && (
        <div className="relative mt-4">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search your network..."
            className="h-9 pl-9 text-xs"
          />
        </div>
      )}

      {carriers.length === 0 ? (
        <div className="mt-4 rounded-xl border border-dashed border-border bg-card/50 p-6 text-center">
          <Heart className="mx-auto h-5 w-5 text-muted-foreground/60" />
          <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            No saved carriers yet
          </p>
          <p className="mt-1 text-xs text-foreground/70">
            Tap the heart on any broker / carrier card to add them.
          </p>
          <Link
            to="/board"
            className="mt-3 inline-flex items-center gap-1 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-secondary hover:underline"
          >
            Browse loads →
          </Link>
        </div>
      ) : (
        <ul className="mt-4 divide-y divide-border">
          {filtered.slice(0, 6).map((c) => {
            const agg = aggregateRatings(c.carrierId, ratings);
            return (
              <li key={c.carrierId} className="flex items-center gap-3 py-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-primary/10 font-display text-sm font-bold text-primary">
                  {c.name
                    .split(" ")
                    .map((s) => s[0])
                    .slice(0, 2)
                    .join("")
                    .toUpperCase()}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="truncate font-display text-sm font-extrabold tracking-tight text-foreground">
                    {c.name}
                  </div>
                  <div className="mt-0.5 flex flex-wrap items-center gap-1.5">
                    <RatingStars agg={agg} size="sm" showCount={false} />
                    <VerifiedPayerBadge agg={agg} />
                  </div>
                </div>
                {c.whatsapp && (
                  <a
                    href={`https://wa.me/${c.whatsapp.replace(/[^0-9]/g, "")}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex h-7 w-7 items-center justify-center rounded-full bg-[color:var(--success)]/12 text-[color:var(--success)] transition-colors hover:bg-[color:var(--success)]/20"
                    aria-label="WhatsApp"
                  >
                    <MessageCircle className="h-3.5 w-3.5" />
                  </a>
                )}
                {c.whatsapp && (
                  <a
                    href={`tel:${c.whatsapp.replace(/[^+0-9]/g, "")}`}
                    className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary transition-colors hover:bg-primary/20"
                    aria-label="Call"
                  >
                    <Phone className="h-3.5 w-3.5" />
                  </a>
                )}
                <button
                  onClick={() => {
                    removePreferredCarrier(c.carrierId);
                    toast.success("Removed from preferred");
                  }}
                  className="flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                  aria-label="Remove"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {carriers.length > 6 && (
        <button className="mt-3 w-full font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-secondary hover:underline">
          See all {carriers.length} →
        </button>
      )}
    </div>
  );
}
