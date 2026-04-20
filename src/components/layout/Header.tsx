import { Link, useNavigate } from "@tanstack/react-router";
import { Truck, Menu, X, ShieldCheck } from "lucide-react";
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
    if (!user?.id) { setIsAdmin(false); return; }
    db.from("user_roles").select("role").eq("user_id", user.id).eq("role", "admin").maybeSingle()
      .then(({ data }: { data: unknown }) => { if (!cancelled) setIsAdmin(!!data); });
    return () => { cancelled = true; };
  }, [user?.id]);

  const signOut = async () => {
    await supabase.auth.signOut();
    useAuthStore.getState().reset();
    navigate({ to: "/" });
  };

  const navLinks = [
    { to: "/board", label: "Load Board" },
    { to: "/post", label: "Post Load" },
    { to: "/ai-agent", label: "AI Agent" },
    { to: "/dashboard", label: "Dashboard" },
    { to: "/pricing", label: "Pricing" },
  ] as const;

  return (
    <>
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl shadow-[0_1px_0_0_rgba(0,0,0,0.04)]">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-6">
          <Link to="/" className="flex items-center gap-2">
            <Truck className="h-7 w-7 text-secondary" strokeWidth={2.5} />
            <span className="font-display text-2xl font-extrabold tracking-tighter text-foreground">
              ZimFreight
            </span>
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            {navLinks.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-secondary"
                activeProps={{ className: "text-sm font-bold text-secondary border-b-2 border-secondary pb-1" }}
              >
                {l.label}
              </Link>
            ))}
            {isAdmin && (
              <Link
                to="/admin"
                className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:text-secondary"
                activeProps={{ className: "inline-flex items-center gap-1 text-sm font-bold text-secondary border-b-2 border-secondary pb-1" }}
              >
                <ShieldCheck className="h-3.5 w-3.5" /> Admin
              </Link>
            )}
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            {user ? (
              <>
                <span className="text-sm text-muted-foreground">
                  {profile?.full_name || user.email}
                </span>
                <NotificationBell />
                <Button variant="outline" size="sm" onClick={signOut} className="rounded-full">Sign out</Button>
              </>
            ) : (
              <>
                <Button variant="ghost" size="sm" onClick={onLogin} className="rounded-full">Sign in</Button>
                <Button size="sm" onClick={onLogin} className="rounded-full bg-secondary px-6 font-bold text-secondary-foreground hover:bg-secondary/90">
                  Get Started
                </Button>
              </>
            )}
          </div>

          <button className="md:hidden text-foreground" onClick={() => setOpen(!open)} aria-label="Menu">
            {open ? <X /> : <Menu />}
          </button>
        </div>

        {open && (
          <div className="border-t border-border bg-background md:hidden">
            <div className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-3">
              {navLinks.map((l) => (
                <Link key={l.to} to={l.to} className="rounded-md px-3 py-2 text-sm text-foreground hover:bg-muted" onClick={() => setOpen(false)}>
                  {l.label}
                </Link>
              ))}
              {isAdmin && (
                <Link to="/admin" className="inline-flex items-center gap-1 rounded-md px-3 py-2 text-sm font-semibold text-primary" onClick={() => setOpen(false)}>
                  <ShieldCheck className="h-3.5 w-3.5" /> Admin
                </Link>
              )}
              <div className="mt-2 border-t border-border pt-2">
                {user ? (
                  <Button variant="outline" size="sm" className="w-full rounded-full" onClick={signOut}>Sign out</Button>
                ) : (
                  <Button size="sm" className="w-full rounded-full bg-secondary font-bold text-secondary-foreground" onClick={() => { setOpen(false); onLogin(); }}>
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
