import { useState } from "react";
import { Link, useLocation } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useAuthStore } from "@/stores/authStore";
import { cn } from "@/lib/utils";
import {
  Truck,
  Menu,
  X,
  ShieldCheck,
  ChevronDown,
} from "lucide-react";

const NAV_LINKS = [
  { to: "/board", label: "Load Board" },
  { to: "/trucks", label: "Trucks" },
  { to: "/map", label: "Map" },
  { to: "/pricing", label: "Pricing" },
] as const;

interface HeaderProps {
  onLogin: () => void;
}

export function Header({ onLogin }: HeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, profile } = useAuth();
  const { pathname } = useLocation();
  const isAdmin = profile?.role === "admin" || profile?.role === "owner";

  const signOut = async () => {
    await supabase.auth.signOut();
    useAuthStore.getState().reset();
    setMobileOpen(false);
  };

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/95 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 md:px-6">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2.5 transition-opacity hover:opacity-80"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-foreground text-background">
              <Truck className="h-4 w-4" strokeWidth={2.5} />
            </div>
            <span className="font-display text-[15px] font-bold tracking-tight text-foreground">
              ZimFreight
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden items-center gap-1 md:flex">
            {NAV_LINKS.map((l) => {
              const active = pathname === l.to || (l.to !== "/" && pathname.startsWith(l.to));
              return (
                <Link
                  key={l.to}
                  to={l.to}
                  className={cn(
                    "relative rounded-md px-3 py-1.5 text-[13px] font-medium transition-colors duration-150",
                    active
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent",
                  )}
                >
                  {active && (
                    <span
                      aria-hidden
                      className="absolute inset-x-3 -bottom-[9px] h-px rounded-full bg-foreground"
                    />
                  )}
                  {l.label}
                </Link>
              );
            })}
            {isAdmin && (
              <Link
                to="/admin"
                className={cn(
                  "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[13px] font-medium transition-colors",
                  pathname === "/admin"
                    ? "bg-accent text-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent",
                )}
              >
                <ShieldCheck className="h-3.5 w-3.5" />
                Admin
              </Link>
            )}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden items-center gap-2 md:flex">
            {user ? (
              <div className="flex items-center gap-2">
                <Link to="/dashboard">
                  <Button variant="ghost" size="sm" className="text-[13px]">
                    Dashboard
                  </Button>
                </Link>
                <Link to="/profile">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-foreground text-background text-xs font-semibold">
                    {profile?.full_name?.[0]?.toUpperCase() ?? user.email?.[0]?.toUpperCase() ?? "U"}
                  </div>
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-[13px]"
                  onClick={onLogin}
                >
                  Sign in
                </Button>
                <Button
                  size="sm"
                  className="text-[13px]"
                  onClick={onLogin}
                >
                  Get started
                </Button>
              </div>
            )}
          </div>

          {/* Mobile menu toggle */}
          <button
            className="flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground transition-colors md:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="border-t border-border bg-background md:hidden">
            <div className="mx-auto flex max-w-7xl flex-col px-4 py-3 gap-0.5">
              {NAV_LINKS.map((l) => {
                const active = pathname === l.to || (l.to !== "/" && pathname.startsWith(l.to));
                return (
                  <Link
                    key={l.to}
                    to={l.to}
                    className={cn(
                      "rounded-md px-3 py-2 text-sm font-medium transition-colors",
                      active
                        ? "bg-accent text-foreground"
                        : "text-muted-foreground hover:bg-accent hover:text-foreground",
                    )}
                    onClick={() => setMobileOpen(false)}
                  >
                    {l.label}
                  </Link>
                );
              })}
              {user && (
                <Link
                  to="/dashboard"
                  className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                  onClick={() => setMobileOpen(false)}
                >
                  Dashboard
                </Link>
              )}
              {isAdmin && (
                <Link
                  to="/admin"
                  className="flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-semibold text-foreground"
                  onClick={() => setMobileOpen(false)}
                >
                  <ShieldCheck className="h-4 w-4" />
                  Admin
                </Link>
              )}
              <div className="mt-2 border-t border-border pt-2">
                {user ? (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={signOut}
                  >
                    Sign out
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => { setMobileOpen(false); onLogin(); }}
                    >
                      Sign in
                    </Button>
                    <Button
                      size="sm"
                      className="flex-1"
                      onClick={() => { setMobileOpen(false); onLogin(); }}
                    >
                      Get started
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </header>
    </>
  );
}
