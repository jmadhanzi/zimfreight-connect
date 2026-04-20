import { Star, Check, X, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { db } from "@/lib/db";
import { toast } from "sonner";
import type { BookingRow } from "@/hooks/useDashboard";

type BidRow = BookingRow & { carrier_profile?: { full_name: string; rating: number; phone_whatsapp: string | null } };

export function IncomingBids({ bids, onChange }: { bids: BidRow[]; onChange: () => void }) {
  const respond = async (id: string, status: "confirmed" | "cancelled") => {
    const { error } = await db.from("bookings").update({ status }).eq("id", id);
    if (error) toast.error(error.message); else { toast.success(status === "confirmed" ? "Booking accepted" : "Bid declined"); onChange(); }
  };

  if (bids.length === 0) {
    return <div className="rounded-md border border-dashed border-border bg-card/50 p-6 text-center text-xs text-muted-foreground">No pending bids right now.</div>;
  }

  return (
    <ul className="divide-y divide-border rounded-md border border-border bg-card">
      {bids.map((b) => {
        const wa = b.carrier_profile?.phone_whatsapp?.replace(/[^0-9]/g, "");
        return (
          <li key={b.id} className="flex flex-wrap items-center gap-3 p-3">
            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold text-foreground">{b.carrier_profile?.full_name ?? "Unknown carrier"}</div>
              <div className="mt-0.5 flex items-center gap-2 text-[11px] text-muted-foreground">
                <span className="inline-flex items-center"><Star className="mr-0.5 h-3 w-3 fill-primary text-primary" />{Number(b.carrier_profile?.rating ?? 0).toFixed(1)}</span>
                <span>·</span>
                <span>{b.loads?.origin} → {b.loads?.destination}</span>
                <span>·</span>
                <span className="font-mono-num text-primary">${Number(b.rate_usd ?? 0).toLocaleString()}</span>
              </div>
            </div>
            <div className="flex shrink-0 gap-1">
              <Button size="sm" className="bg-[color:var(--success,hsl(142_70%_45%))] text-white" onClick={() => respond(b.id, "confirmed")}>
                <Check className="mr-1 h-3.5 w-3.5" /> Accept
              </Button>
              <Button size="sm" variant="outline" onClick={() => respond(b.id, "cancelled")}>
                <X className="mr-1 h-3.5 w-3.5" /> Decline
              </Button>
              {wa && (
                <Button size="sm" variant="ghost" asChild>
                  <a href={`https://wa.me/${wa}`} target="_blank" rel="noreferrer"><MessageCircle className="mr-1 h-3.5 w-3.5" /> WhatsApp</a>
                </Button>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}