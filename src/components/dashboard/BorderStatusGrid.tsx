import { formatDistanceToNow } from "date-fns";
import type { BorderStatus } from "@/types";

export function BorderStatusGrid({ borders }: { borders: BorderStatus[] }) {
  if (borders.length === 0) {
    return (
      <div className="rounded-md border border-dashed border-border bg-card/50 p-6 text-center text-xs text-muted-foreground">
        No live border data yet.
      </div>
    );
  }
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {borders.map((b) => {
        const tone =
          b.status === "open" && b.wait_hours < 2 ? "text-[color:var(--success)]"
          : b.wait_hours < 4 ? "text-[color:var(--warning,theme(colors.amber.500))]" : "text-destructive";
        return (
          <div key={b.id} className="rounded-md border border-border bg-card p-4">
            <div className="font-display text-sm font-bold uppercase tracking-wide">{b.border_name}</div>
            <div className="mt-1 text-[11px] text-muted-foreground">{b.country_from} → {b.country_to}</div>
            <div className={`mt-3 font-mono-num text-2xl font-black ${tone}`}>{Number(b.wait_hours).toFixed(1)}h</div>
            <div className="mt-1 text-[11px] uppercase tracking-widest text-muted-foreground">
              {b.status} · updated {formatDistanceToNow(new Date(b.updated_at), { addSuffix: true })}
            </div>
          </div>
        );
      })}
    </div>
  );
}