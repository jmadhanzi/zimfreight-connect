import { Link, useNavigate } from "@tanstack/react-router";
import { Menu, X, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { db } from "@/lib/db";
import { useAuthStore } from "@/stores/authStore";
import { NotificationBell } from "@/components/dashboard/NotificationsPanel";

export function Header({ onLogin }: { onLogin: () => void }) {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    let cancelled = false;
    if (!user?.id) {
      setIsAdmin(false);
      return;
    }
    db.from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle()
      .then(({ data }: { data: unknown }) => {
        if (!cancelled) setIsAdmin(!!data);
      });
    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  const signOut = async () => {
    await supabase.auth.signOut();
    useAuthStore.getState().reset();
    navigate({ to: "/" });
  };

  const navLinks = [
    { to: "/board", label: "Load Board" },
    { to: "/map", label: "Map" },
    { to: "/post", label: "Post Load" },
    { to: "/ai-agent", label: "AI Agent" },
    { to: "/dashboard", label: "Dashboard" },
    { to: "/pricing", label: "Pricing" },
  ] as const;

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-6">
          <Link to="/" className="group flex items-center gap-2.5">
            <span className="relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-primary via-primary to-[color-mix(in_oklab,var(--primary)_70%,black)] shadow-[0_2px_0_color-mix(in_oklab,var(--primary)_60%,black),inset_0_1px_0_color-mix(in_oklab,white_25%,transparent)]">
              {/* Stylized "Z" + horizon line */}
              <svg
                viewBox="0 0 24 24"
                className="h-4.5 w-4.5 text-primary-foreground"
                fill="none"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M5 6 H19 L7 18 H19" stroke="currentColor" />
                <circle cx="19" cy="6" r="1.4" fill="var(--secondary)" stroke="none" />
              </svg>
              <span className="absolute inset-x-1.5 bottom-1 h-px bg-gradient-to-r from-transparent via-secondary/70 to-transparent" />
            </span>
            <span className="font-display text-xl font-extrabold tracking-tight text-foreground">
              Zim<span className="text-secondary">Freight</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-0.5 md:flex">
            {navLinks.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className="group relative rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                activeProps={{
                  className:
                    "group relative rounded-lg px-3 py-2 text-sm font-bold text-foreground [&>span]:opacity-100",
                }}
              >
                {l.label}
                <span className="pointer-events-none absolute inset-x-3 -bottom-px h-[2px] rounded-full bg-gradient-to-r from-secondary via-secondary to-primary opacity-0 transition-opacity duration-200" />
              </Link>
            ))}
            {isAdmin && (
              <Link
                to="/admin"
                className="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-semibold text-primary hover:bg-primary/10"
                activeProps={{
                  className:
                    "inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-bold bg-primary/10 text-primary",
                }}
              >
                <ShieldCheck className="h-3.5 w-3.5" /> Admin
              </Link>
            )}
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            {user ? (
              <>
                <NotificationBell />
                <div className="flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/15 text-[10px] font-bold text-primary">
                    {(profile?.full_name || user.email || "U")[0].toUpperCase()}
                  </div>
                  <span className="max-w-[120px] truncate text-sm text-foreground">
                    {profile?.full_name || user.email}
                  </span>
                </div>
                <Button variant="outline" size="sm" onClick={signOut} className="rounded-full">
                  Sign out
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" size="sm" onClick={onLogin} className="rounded-full">
                  Sign in
                </Button>
                <Button
                  size="sm"
                  onClick={onLogin}
                  className="rounded-full bg-secondary px-6 font-bold text-secondary-foreground btn-amber-glow hover:bg-secondary/90"
                >
                  Get Started
                </Button>
              </>
            )}
          </div>

          <button
            className="md:hidden text-foreground"
            onClick={() => setOpen(!open)}
            aria-label="Menu"
          >
            {open ? <X /> : <Menu />}
          </button>
        </div>

        {open && (
          <div className="border-t border-border bg-background md:hidden">
            <div className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-3">
              {navLinks.map((l) => (
                <Link
                  key={l.to}
                  to={l.to}
                  className="rounded-md px-3 py-2 text-sm text-foreground hover:bg-muted"
                  onClick={() => setOpen(false)}
                >
                  {l.label}
                </Link>
              ))}
              {isAdmin && (
                <Link
                  to="/admin"
                  className="inline-flex items-center gap-1 rounded-md px-3 py-2 text-sm font-semibold text-primary"
                  onClick={() => setOpen(false)}
                >
                  <ShieldCheck className="h-3.5 w-3.5" /> Admin
                </Link>
              )}
              <div className="mt-2 border-t border-border pt-2">
                {user ? (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full rounded-full"
                    onClick={signOut}
                  >
                    Sign out
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    className="w-full rounded-full bg-secondary font-bold text-secondary-foreground"
                    onClick={() => {
                      setOpen(false);
                      onLogin();
                    }}
                  >
                    Sign in / Sign up
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </header>
    </>
  );
}
