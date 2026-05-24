import { Link, useLocation } from "@tanstack/react-router";
import { LayoutGrid, Plus, Bot, BarChart3, Map, User } from "lucide-react";
import { cn } from "@/lib/utils";

const TABS = [
  { to: "/board", label: "Board", icon: LayoutGrid },
  { to: "/map", label: "Map", icon: Map },
  { to: "/post", label: "Post", icon: Plus, primary: true },
  { to: "/ai-agent", label: "AI", icon: Bot },
  { to: "/dashboard", label: "Dash", icon: BarChart3 },
  { to: "/profile", label: "Profile", icon: User },
] as const;

export function MobileBottomNav() {
  const { pathname } = useLocation();

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 backdrop-blur-xl md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className="mx-auto grid max-w-md grid-cols-6">
        {TABS.map(({ to, label, icon: Icon, primary }) => {
          const active = pathname === to || (to !== "/board" && pathname.startsWith(to));
          return (
            <li key={to}>
              <Link
                to={to}
                className={cn(
                  "relative flex flex-col items-center justify-center gap-1 py-2.5 px-1 text-[10px] font-medium tracking-wide transition-colors",
                  active
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {primary ? (
                  <span className="flex h-8 w-8 -mt-2 mb-0.5 items-center justify-center rounded-lg bg-foreground text-background shadow-sm">
                    <Icon className="h-4 w-4" strokeWidth={2.5} />
                  </span>
                ) : (
                  <Icon
                    className={cn("h-5 w-5", active && "opacity-100")}
                    strokeWidth={active ? 2.5 : 2}
                  />
                )}
                <span className={cn(active && !primary && "font-semibold")}>{label}</span>
                {active && !primary && (
                  <span className="absolute bottom-0 left-1/2 h-0.5 w-4 -translate-x-1/2 rounded-full bg-foreground" />
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
