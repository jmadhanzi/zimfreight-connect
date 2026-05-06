import { Star, ShieldCheck, Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AggregateRating } from "@/lib/trust";
import { isVerified } from "@/lib/trust";

/** Star strip with optional count. Show 5 outlined stars with `agg.avg`/5 filled. */
export function RatingStars({
  agg,
  size = "sm",
  showCount = true,
  className,
}: {
  agg: AggregateRating;
  size?: "sm" | "md" | "lg";
  showCount?: boolean;
  className?: string;
}) {
  if (agg.count === 0) {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground",
          className,
        )}
      >
        <Star className="h-3 w-3" />
        New
      </span>
    );
  }
  const px = size === "lg" ? "h-4 w-4" : size === "md" ? "h-3.5 w-3.5" : "h-3 w-3";
  const filled = Math.round(agg.avg);
  return (
    <span className={cn("inline-flex items-center gap-1.5", className)}>
      <span className="inline-flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            className={cn(px, i <= filled ? "fill-secondary text-secondary" : "text-border")}
            strokeWidth={2}
          />
        ))}
      </span>
      <span className="font-display text-xs font-bold tracking-tight tabular-nums text-foreground">
        {agg.avg.toFixed(1)}
      </span>
      {showCount && (
        <span className="font-mono text-[10px] text-muted-foreground">({agg.count})</span>
      )}
    </span>
  );
}

/** Tinted "Verified" pill — only renders if `isVerified(agg)` returns true. */
export function VerifiedBadge({ agg, className }: { agg: AggregateRating; className?: string }) {
  if (!isVerified(agg)) return null;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full bg-[color:var(--success)]/15 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-[color:var(--success)]",
        className,
      )}
    >
      <ShieldCheck className="h-3 w-3" strokeWidth={2.5} />
      Verified
    </span>
  );
}

/** "Verified Payer" pill specifically for brokers. */
export function VerifiedPayerBadge({
  agg,
  className,
}: {
  agg: AggregateRating;
  className?: string;
}) {
  if (!isVerified(agg) || (agg.paidOnTimePct ?? 0) < 90) return null;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full bg-secondary/15 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-secondary",
        className,
      )}
    >
      <ShieldCheck className="h-3 w-3" strokeWidth={2.5} />
      Verified payer
    </span>
  );
}

/** "Preferred carrier" heart pill. */
export function PreferredBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full bg-destructive/12 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-destructive",
        className,
      )}
    >
      <Heart className="h-3 w-3 fill-current" strokeWidth={0} />
      Preferred
    </span>
  );
}
