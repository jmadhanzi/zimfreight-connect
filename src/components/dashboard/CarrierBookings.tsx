import { useState } from "react";
import { Truck, CheckCircle2, AlertTriangle, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { db } from "@/lib/db";
import { toast } from "sonner";
import type { BookingRow } from "@/hooks/useDashboard";
import { PodUploadButton } from "@/components/bookings/PodUploadButton";
import { RatingDialog } from "@/components/trust/RatingDialog";

const STATUS_LABEL: Record<string, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  en_route: "En route",
  delivered: "Delivered",
  payment_pending: "Payment pending",
  paid: "Paid",
  cancelled: "Cancelled",
};

const STATUS_TONE: Record<string, string> = {
  pending: "bg-muted text-muted-foreground",
  confirmed: "bg-[color:var(--info,#3b82f6)]/15 text-[color:var(--info,#3b82f6)]",
  en_route: "bg-primary/15 text-primary",
  delivered: "bg-[color:var(--success)]/15 text-[color:var(--success)]",
  payment_pending: "bg-amber-500/15 text-amber-500",
  paid: "bg-emerald-500/15 text-emerald-500",
  cancelled: "bg-destructive/15 text-destructive",
};

export function CarrierBookings({
  bookings,
  onChange,
}: {
  bookings: BookingRow[];
  onChange: () => void;
}) {
  const [busy, setBusy] = useState<string | null>(null);
  const [rateBooking, setRateBooking] = useState<BookingRow | null>(null);

  const update = async (id: string, status: string) => {
    setBusy(id);
    const patch: Record<string, unknown> = { status };
    if (status === "delivered") patch.delivered_at = new Date().toISOString();
    const { error } = await db.from("bookings").update(patch).eq("id", id);
    setBusy(null);
    if (error) toast.error(error.message);
    else {
      toast.success("Updated");
      onChange();
    }
  };

  if (bookings.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-card/50 p-10 text-center">
        <Truck className="mx-auto h-5 w-5 text-muted-foreground/60" />
        <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
          No bookings yet
        </p>
        <p className="mt-1 text-sm text-foreground/70">
          Book a load from the board to start tracking it here.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-border/70 bg-card shadow-[0_1px_0_color-mix(in_oklab,var(--foreground)_5%,transparent)]">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/30">
            <tr className="border-b border-border text-left">
              <th className="px-3 py-3 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Route
              </th>
              <th className="px-3 py-3 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Rate
              </th>
              <th className="px-3 py-3 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Pickup
              </th>
              <th className="px-3 py-3 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Status
              </th>
              <th className="px-3 py-3 text-right font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {bookings.map((b) => (
              <tr key={b.id} className="transition-colors hover:bg-muted/30">
                <td className="px-3 py-3 font-display text-sm font-bold tracking-tight text-foreground">
                  {b.loads?.origin} → {b.loads?.destination}
                </td>
                <td className="px-3 py-3 font-mono tabular-nums font-bold text-foreground">
                  ${Number(b.rate_usd ?? 0).toLocaleString()}
                </td>
                <td className="px-3 py-3 font-mono text-[11px] text-muted-foreground">
                  {b.loads?.pickup_date ?? "—"}
                </td>
                <td className="px-3 py-3">
                  <span
                    className={`inline-flex rounded-full px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.16em] ${STATUS_TONE[b.status] ?? "bg-muted text-muted-foreground"}`}
                  >
                    {STATUS_LABEL[b.status] ?? b.status}
                  </span>
                </td>
                <td className="px-3 py-3">
                  <div className="flex flex-wrap justify-end gap-1.5">
                    {(b.status === "paid" || b.status === "delivered") && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setRateBooking(b)}
                        className="rounded-full border-secondary/40 text-secondary hover:bg-secondary/10"
                      >
                        <Star className="mr-1 h-3.5 w-3.5" /> Rate broker
                      </Button>
                    )}
                    {(b.status === "en_route" ||
                      b.status === "delivered" ||
                      b.status === "payment_pending" ||
                      b.status === "paid") && <PodUploadButton bookingId={b.id} />}
                    {b.status !== "delivered" && b.status !== "paid" && (
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={busy === b.id}
                        onClick={() => update(b.id, "delivered")}
                        className="rounded-full"
                      >
                        <CheckCircle2 className="mr-1 h-3.5 w-3.5" /> Delivered
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      className="rounded-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                      onClick={() => update(b.id, "cancelled")}
                      disabled={busy === b.id}
                    >
                      <AlertTriangle className="mr-1 h-3.5 w-3.5" /> Issue
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {rateBooking && (
        <RatingDialog
          open={!!rateBooking}
          onOpenChange={(b) => !b && setRateBooking(null)}
          subjectId={
            (rateBooking.loads as { poster_id?: string } | undefined)?.poster_id ??
            `broker_${rateBooking.load_id}`
          }
          subjectName={
            (rateBooking.loads as { poster?: { full_name?: string } } | undefined)?.poster
              ?.full_name ?? "Broker"
          }
          bookingId={rateBooking.id}
          subjectType="broker"
        />
      )}
    </div>
  );
}
