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
    if (error) toast.error(error.message); else { toast.success("Updated"); onChange(); }
  };

  const repost = async (l: Row) => {
    setBusy(l.id);
    const { id, created_at, updated_at, views, ...rest } = l as unknown as Record<string, unknown>;
    void id; void created_at; void updated_at; void views;
    const { error } = await db.from("loads").insert({ ...rest, status: "available" });
    setBusy(null);
    if (error) toast.error(error.message); else { toast.success("Reposted"); onChange(); }
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this load?")) return;
    setBusy(id);
    const { error } = await db.from("loads").delete().eq("id", id);
    setBusy(null);
    if (error) toast.error(error.message); else { toast.success("Deleted"); onChange(); }
  };

  if (loads.length === 0) {
    return <div className="rounded-md border border-dashed border-border bg-card/50 p-8 text-center text-sm text-muted-foreground">You haven't posted any loads yet.</div>;
  }

  return (
    <div className="overflow-x-auto rounded-md border border-border">
      <table className="w-full text-sm">
        <thead className="bg-card">
          <tr className="text-left text-[10px] uppercase tracking-widest text-muted-foreground">
            <th className="px-3 py-2 font-mono">ID</th>
            <th className="px-3 py-2 font-mono">Route</th>
            <th className="px-3 py-2 font-mono">Type</th>
            <th className="px-3 py-2 font-mono">Rate</th>
            <th className="px-3 py-2 font-mono">Posted</th>
            <th className="px-3 py-2 font-mono">Views</th>
            <th className="px-3 py-2 font-mono">Bids</th>
            <th className="px-3 py-2 font-mono">Status</th>
            <th className="px-3 py-2 font-mono text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border bg-background">
          {loads.map((l) => (
            <tr key={l.id}>
              <td className="px-3 py-2 font-mono text-[11px] text-muted-foreground">ZF-{l.id.slice(0, 4).toUpperCase()}</td>
              <td className="px-3 py-2 text-foreground">{l.origin} → {l.destination}</td>
              <td className="px-3 py-2 text-muted-foreground">{l.load_type}</td>
              <td className="px-3 py-2 font-mono-num text-primary">${Number(l.rate_usd).toLocaleString()}</td>
              <td className="px-3 py-2 text-[11px] text-muted-foreground">{formatDistanceToNow(new Date(l.created_at), { addSuffix: true })}</td>
              <td className="px-3 py-2 font-mono-num"><Eye className="mr-1 inline h-3 w-3 text-muted-foreground" />{l.view_count}</td>
              <td className="px-3 py-2 font-mono-num"><MessageSquare className="mr-1 inline h-3 w-3 text-muted-foreground" />{l.bid_count}</td>
              <td className="px-3 py-2 text-[11px] uppercase tracking-widest text-muted-foreground">{l.status}</td>
              <td className="px-3 py-2">
                <div className="flex justify-end gap-1">
                  <Button size="sm" variant="ghost" disabled={busy === l.id} onClick={() => setStatus(l.id, "booked")} title="Mark booked"><Edit3 className="h-3.5 w-3.5" /></Button>
                  <Button size="sm" variant="ghost" disabled={busy === l.id} onClick={() => repost(l)} title="Repost"><RefreshCw className="h-3.5 w-3.5" /></Button>
                  <Button size="sm" variant="ghost" disabled={busy === l.id} className="text-destructive" onClick={() => remove(l.id)} title="Delete"><Trash2 className="h-3.5 w-3.5" /></Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}