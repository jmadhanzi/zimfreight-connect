import { Bell, Check, MessageSquare, MapPin, AlertTriangle, CreditCard, Truck } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useNotifications } from "@/hooks/useDashboard";
import type { NotificationRow } from "@/hooks/useDashboard";
import { useNavigate } from "@tanstack/react-router";

const ICON: Record<string, React.ComponentType<{ className?: string }>> = {
  new_bid: MessageSquare,
  load_match: Truck,
  rate_alert: MapPin,
  border: AlertTriangle,
  plan: CreditCard,
  booking_status: Check,
};

export function NotificationBell() {
  const { items, unread, markAllRead, markRead } = useNotifications();
  const navigate = useNavigate();

  const open = (n: NotificationRow) => {
    markRead(n.id);
    if (n.link) navigate({ to: n.link });
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <button
          className="relative inline-flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          aria-label="Notifications"
        >
          <Bell className="h-4.5 w-4.5" strokeWidth={2.2} />
          {unread > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-secondary px-1 font-mono text-[9px] font-bold text-secondary-foreground shadow-[0_0_0_2px_var(--background)]">
              {unread > 9 ? "9+" : unread}
            </span>
          )}
        </button>
      </SheetTrigger>
      <SheetContent className="w-full max-w-md p-0">
        <span
          aria-hidden
          className="block h-1 w-full bg-gradient-to-r from-secondary via-primary to-secondary"
        />
        <SheetHeader className="border-b border-border p-5">
          <div className="flex items-center justify-between">
            <div>
              <span className="section-kicker">Updates</span>
              <SheetTitle className="mt-2 font-display text-2xl font-extrabold tracking-[-0.03em]">
                Notifications
              </SheetTitle>
            </div>
            {unread > 0 && (
              <Button variant="ghost" size="sm" className="text-xs" onClick={markAllRead}>
                Mark all read
              </Button>
            )}
          </div>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              All caught up
            </p>
            <p className="mt-1 text-sm text-foreground/70">No new notifications.</p>
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {items.map((n) => {
              const Icon = ICON[n.type] ?? Bell;
              const unreadFlag = !n.read_at;
              return (
                <li key={n.id}>
                  <button
                    onClick={() => open(n)}
                    className={`group flex w-full gap-3 px-5 py-3.5 text-left transition-colors hover:bg-muted/40 ${unreadFlag ? "" : "opacity-65"}`}
                  >
                    <div
                      className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-colors ${
                        unreadFlag
                          ? "bg-secondary/15 text-secondary"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-display text-sm font-bold tracking-tight text-foreground">
                          {n.title}
                        </span>
                        {unreadFlag && <span className="h-1.5 w-1.5 rounded-full bg-secondary" />}
                      </div>
                      {n.body && (
                        <div className="mt-0.5 truncate text-xs text-muted-foreground">
                          {n.body}
                        </div>
                      )}
                      <div className="mt-1 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground/70">
                        {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                      </div>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </SheetContent>
    </Sheet>
  );
}
