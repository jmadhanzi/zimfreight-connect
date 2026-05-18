import { Link, useLocation } from "@tanstack/react-router";
import { LayoutGrid, Plus, Bot, BarChart3, Map, User } from "lucide-react";
import { cn } from "@/lib/utils";

/** Sticky 6-tab bottom nav, mobile-only. Renders below md breakpoint. */
const TABS = [
  { to: "/board", label: "Board", icon: LayoutGrid, accent: false },
  { to: "/map", label: "Map", icon: Map, accent: false },
  { to: "/post", label: "Post", icon: Plus, accent: true },
  { to: "/ai-agent", label: "AI", icon: Bot, accent: false },
  { to: "/dashboard", label: "Dash", icon: BarChart3, accent: false },
  { to: "/profile", label: "Profile", icon: User, accent: false },
] as const;

export function MobileBottomNav() {
  const { pathname } = useLocation();
  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border/70 bg-background/95 backdrop-blur-xl md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className="mx-auto grid max-w-md grid-cols-6">
        {TABS.map(({ to, label, icon: Icon, accent }) => {
          const active = pathname === to || (to !== "/board" && pathname.startsWith(to));
          return (
            <li key={to} className="relative">
              <Link
                to={to}
                className={cn(
                  "relative flex flex-col items-center justify-center gap-1 px-1 py-2.5 text-[10px] font-semibold uppercase tracking-[0.1em] transition-colors",
                  active ? "text-primary" : "text-muted-foreground hover:text-foreground",
                )}
              >
                {/* active indicator pill — sits above the icon */}
                {active && (
                  <span
                    aria-hidden
                    className="absolute inset-x-5 top-0 h-[2px] rounded-full bg-gradient-to-r from-secondary to-primary"
                  />
                )}
                {accent ? (
                  <span
                    className={cn(
                      "relative -mt-3 mb-0.5 flex h-9 w-9 items-center justify-center rounded-2xl bg-secondary text-secondary-foreground shadow-[0_4px_12px_-2px_color-mix(in_oklab,var(--secondary)_60%,transparent),0_0_0_1px_color-mix(in_oklab,var(--secondary)_30%,transparent)]",
                    )}
                  >
                    <Icon className="h-4.5 w-4.5" strokeWidth={2.5} />
                  </span>
                ) : (
                  <Icon
                    className={cn(
                      "h-5 w-5",
                      active &&
                        "drop-shadow-[0_0_6px_color-mix(in_oklab,var(--primary)_55%,transparent)]",
                    )}
                    strokeWidth={active ? 2.5 : 2}
                  />
                )}
                <span>{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
