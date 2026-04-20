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
        <button className="relative inline-flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground" aria-label="Notifications">
          <Bell className="h-5 w-5" />
          {unread > 0 && (
            <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[9px] font-bold text-primary-foreground">
              {unread > 9 ? "9+" : unread}
            </span>
          )}
        </button>
      </SheetTrigger>
      <SheetContent className="w-full max-w-md">
        <SheetHeader>
          <div className="flex items-center justify-between">
            <SheetTitle className="font-display text-xl uppercase tracking-tight">Notifications</SheetTitle>
            {unread > 0 && (
              <Button variant="ghost" size="sm" className="text-xs" onClick={markAllRead}>Mark all as read</Button>
            )}
          </div>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="mt-10 text-center text-sm text-muted-foreground">You're all caught up.</div>
        ) : (
          <ul className="mt-4 divide-y divide-border">
            {items.map((n) => {
              const Icon = ICON[n.type] ?? Bell;
              const unreadFlag = !n.read_at;
              return (
                <li key={n.id}>
                  <button onClick={() => open(n)} className={`flex w-full gap-3 px-1 py-3 text-left transition-colors hover:bg-secondary/40 ${unreadFlag ? "" : "opacity-70"}`}>
                    <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${unreadFlag ? "bg-primary/15 text-primary" : "bg-secondary text-muted-foreground"}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-foreground">{n.title}</span>
                        {unreadFlag && <span className="h-1.5 w-1.5 rounded-full bg-primary" />}
                      </div>
                      {n.body && <div className="mt-0.5 truncate text-xs text-muted-foreground">{n.body}</div>}
                      <div className="mt-1 text-[10px] uppercase tracking-widest text-muted-foreground">
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