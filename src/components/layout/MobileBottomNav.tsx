import { Link, useLocation } from "@tanstack/react-router";
import { LayoutGrid, Plus, Bot, BarChart3, Map, User } from "lucide-react";
import { cn } from "@/lib/utils";

/** Sticky 6-tab bottom nav, mobile-only. Renders below md breakpoint. */
const TABS = [
  { to: "/board",     label: "Board",   icon: LayoutGrid },
  { to: "/map",       label: "Map",     icon: Map },
  { to: "/post",      label: "Post",    icon: Plus },
  { to: "/ai-agent",  label: "AI",      icon: Bot },
  { to: "/dashboard", label: "Dash",    icon: BarChart3 },
  { to: "/profile",   label: "Profile", icon: User },
] as const;

export function MobileBottomNav() {
  const { pathname } = useLocation();
  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 backdrop-blur md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className="mx-auto grid max-w-md grid-cols-6">
        {TABS.map(({ to, label, icon: Icon }) => {
          const active = pathname === to || (to !== "/board" && pathname.startsWith(to));
          return (
            <li key={to}>
              <Link
                to={to}
                className={cn(
                  "flex flex-col items-center justify-center gap-0.5 px-1 py-2 text-[10px] font-medium uppercase tracking-wider transition-colors",
                  active ? "text-primary" : "text-muted-foreground hover:text-foreground",
                )}
              >
                <Icon
                  className={cn("h-5 w-5", active && "drop-shadow-[0_0_6px_color-mix(in_oklab,var(--primary)_60%,transparent)]")}
                  strokeWidth={active ? 2.5 : 2}
                />
                <span>{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
