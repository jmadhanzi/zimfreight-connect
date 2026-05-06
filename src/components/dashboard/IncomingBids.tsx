import { Star, Check, X, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { db } from "@/lib/db";
import { toast } from "sonner";
import type { BookingRow } from "@/hooks/useDashboard";

type BidRow = BookingRow & {
  carrier_profile?: { full_name: string; rating: number; phone_whatsapp: string | null };
};

export function IncomingBids({ bids, onChange }: { bids: BidRow[]; onChange: () => void }) {
  const respond = async (id: string, status: "confirmed" | "cancelled") => {
    const { error } = await db.from("bookings").update({ status }).eq("id", id);
    if (error) toast.error(error.message);
    else {
      toast.success(status === "confirmed" ? "Booking accepted" : "Bid declined");
      onChange();
    }
  };

  if (bids.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-card/50 p-8 text-center">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
          No pending bids
        </p>
        <p className="mt-1 text-sm text-foreground/70">
          When carriers bid on your loads, they&rsquo;ll appear here.
        </p>
      </div>
    );
  }

  return (
    <ul className="divide-y divide-border rounded-2xl border border-border/70 bg-card overflow-hidden">
      {bids.map((b) => {
        const wa = b.carrier_profile?.phone_whatsapp?.replace(/[^0-9]/g, "");
        return (
          <li
            key={b.id}
            className="flex flex-wrap items-center gap-3 p-3.5 transition-colors hover:bg-muted/30"
          >
            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold text-foreground">
                {b.carrier_profile?.full_name ?? "Unknown carrier"}
              </div>
              <div className="mt-0.5 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
                <span className="inline-flex items-center">
                  <Star className="mr-0.5 h-3 w-3 fill-secondary text-secondary" />
                  {Number(b.carrier_profile?.rating ?? 0).toFixed(1)}
                </span>
                <span className="text-border">·</span>
                <span>
                  {b.loads?.origin} → {b.loads?.destination}
                </span>
                <span className="text-border">·</span>
                <span className="font-mono-num font-semibold text-foreground">
                  ${Number(b.rate_usd ?? 0).toLocaleString()}
                </span>
              </div>
            </div>
            <div className="flex shrink-0 gap-1.5">
              <Button
                size="sm"
                className="bg-[color:var(--success)] text-white hover:bg-[color-mix(in_oklab,var(--success)_85%,black)]"
                onClick={() => respond(b.id, "confirmed")}
              >
                <Check className="mr-1 h-3.5 w-3.5" /> Accept
              </Button>
              <Button size="sm" variant="outline" onClick={() => respond(b.id, "cancelled")}>
                <X className="mr-1 h-3.5 w-3.5" /> Decline
              </Button>
              {wa && (
                <Button size="sm" variant="ghost" asChild>
                  <a href={`https://wa.me/${wa}`} target="_blank" rel="noreferrer">
                    <MessageCircle className="mr-1 h-3.5 w-3.5" /> WhatsApp
                  </a>
                </Button>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
