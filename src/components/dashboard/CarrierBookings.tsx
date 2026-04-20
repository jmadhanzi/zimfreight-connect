import { useState } from "react";
import { Truck, CheckCircle2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { db } from "@/lib/db";
import { toast } from "sonner";
import type { BookingRow } from "@/hooks/useDashboard";

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

export function CarrierBookings({ bookings, onChange }: { bookings: BookingRow[]; onChange: () => void }) {
  const [busy, setBusy] = useState<string | null>(null);

  const update = async (id: string, status: string) => {
    setBusy(id);
    const patch: Record<string, unknown> = { status };
    if (status === "delivered") patch.delivered_at = new Date().toISOString();
    const { error } = await db.from("bookings").update(patch).eq("id", id);
    setBusy(null);
    if (error) toast.error(error.message); else { toast.success("Updated"); onChange(); }
  };

  if (bookings.length === 0) {
    return (
      <div className="rounded-md border border-dashed border-border bg-card/50 p-8 text-center text-sm text-muted-foreground">
        <Truck className="mx-auto mb-2 h-6 w-6 opacity-50" />
        You haven't booked any loads yet.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-md border border-border">
      <table className="w-full text-sm">
        <thead className="bg-card">
          <tr className="text-left text-[10px] uppercase tracking-widest text-muted-foreground">
            <th className="px-3 py-2 font-mono">Route</th>
            <th className="px-3 py-2 font-mono">Rate</th>
            <th className="px-3 py-2 font-mono">Pickup</th>
            <th className="px-3 py-2 font-mono">Status</th>
            <th className="px-3 py-2 font-mono text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border bg-background">
          {bookings.map((b) => (
            <tr key={b.id}>
              <td className="px-3 py-2 text-foreground">{b.loads?.origin} → {b.loads?.destination}</td>
              <td className="px-3 py-2 font-mono-num text-primary">${Number(b.rate_usd ?? 0).toLocaleString()}</td>
              <td className="px-3 py-2 text-muted-foreground">{b.loads?.pickup_date ?? "—"}</td>
              <td className="px-3 py-2">
                <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest ${STATUS_TONE[b.status] ?? "bg-muted text-muted-foreground"}`}>
                  {STATUS_LABEL[b.status] ?? b.status}
                </span>
              </td>
              <td className="px-3 py-2">
                <div className="flex justify-end gap-1">
                  {b.status !== "delivered" && b.status !== "paid" && (
                    <Button size="sm" variant="outline" disabled={busy === b.id} onClick={() => update(b.id, "delivered")}>
                      <CheckCircle2 className="mr-1 h-3.5 w-3.5" /> Mark delivered
                    </Button>
                  )}
                  <Button size="sm" variant="ghost" className="text-muted-foreground" onClick={() => update(b.id, "cancelled")} disabled={busy === b.id}>
                    <AlertTriangle className="mr-1 h-3.5 w-3.5" /> Issue
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}