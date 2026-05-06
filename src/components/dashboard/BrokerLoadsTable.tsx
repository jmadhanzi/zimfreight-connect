import { useState } from "react";
import { Eye, MessageSquare, Trash2, Edit3, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { db } from "@/lib/db";
import { toast } from "sonner";
import type { Load } from "@/types";
import { formatDistanceToNow } from "date-fns";

type Row = Load & { bid_count: number; view_count: number };

export function BrokerLoadsTable({ loads, onChange }: { loads: Row[]; onChange: () => void }) {
  const [busy, setBusy] = useState<string | null>(null);

  const setStatus = async (id: string, status: string) => {
    setBusy(id);
    const { error } = await db.from("loads").update({ status }).eq("id", id);
    setBusy(null);
    if (error) toast.error(error.message);
    else {
      toast.success("Updated");
      onChange();
    }
  };

  const repost = async (l: Row) => {
    setBusy(l.id);
    const { id, created_at, updated_at, views, ...rest } = l as unknown as Record<string, unknown>;
    void id;
    void created_at;
    void updated_at;
    void views;
    const { error } = await db.from("loads").insert({ ...rest, status: "available" });
    setBusy(null);
    if (error) toast.error(error.message);
    else {
      toast.success("Reposted");
      onChange();
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this load?")) return;
    setBusy(id);
    const { error } = await db.from("loads").delete().eq("id", id);
    setBusy(null);
    if (error) toast.error(error.message);
    else {
      toast.success("Deleted");
      onChange();
    }
  };

  if (loads.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-card/50 p-10 text-center">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
          No posted loads yet
        </p>
        <p className="mt-1 text-sm text-foreground/70">
          Post a load to start receiving carrier bids.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border/70 bg-card shadow-[0_1px_0_color-mix(in_oklab,var(--foreground)_5%,transparent)]">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-[color:var(--bg-secondary)]">
            <tr className="border-b border-border text-left">
              <th className="px-3 py-3 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                ID
              </th>
              <th className="px-3 py-3 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Route
              </th>
              <th className="px-3 py-3 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Type
              </th>
              <th className="px-3 py-3 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Rate
              </th>
              <th className="px-3 py-3 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Posted
              </th>
              <th className="px-3 py-3 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Views
              </th>
              <th className="px-3 py-3 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Bids
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
            {loads.map((l) => (
              <tr key={l.id} className="transition-colors hover:bg-muted/30">
                <td className="px-3 py-3 font-mono text-[11px] font-semibold text-muted-foreground">
                  ZF-{l.id.slice(0, 4).toUpperCase()}
                </td>
                <td className="px-3 py-3 font-display text-sm font-bold tracking-tight text-foreground">
                  {l.origin} → {l.destination}
                </td>
                <td className="px-3 py-3 text-muted-foreground">{l.load_type}</td>
                <td className="px-3 py-3 font-mono-num font-bold text-foreground">
                  ${Number(l.rate_usd).toLocaleString()}
                </td>
                <td className="px-3 py-3 font-mono text-[11px] text-muted-foreground">
                  {formatDistanceToNow(new Date(l.created_at), { addSuffix: true })}
                </td>
                <td className="px-3 py-3 font-mono-num">
                  <Eye className="mr-1 inline h-3 w-3 text-muted-foreground" />
                  {l.view_count}
                </td>
                <td className="px-3 py-3 font-mono-num">
                  <MessageSquare className="mr-1 inline h-3 w-3 text-muted-foreground" />
                  {l.bid_count}
                </td>
                <td className="px-3 py-3">
                  <span className="glass-chip uppercase">{l.status}</span>
                </td>
                <td className="px-3 py-3">
                  <div className="flex justify-end gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      disabled={busy === l.id}
                      onClick={() => setStatus(l.id, "booked")}
                      title="Mark booked"
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      disabled={busy === l.id}
                      onClick={() => repost(l)}
                      title="Repost"
                    >
                      <RefreshCw className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      disabled={busy === l.id}
                      className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                      onClick={() => remove(l.id)}
                      title="Delete"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
