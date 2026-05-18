import { Link, useNavigate } from "@tanstack/react-router";
import { Menu, X, ShieldCheck, Truck } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { db } from "@/lib/db";
import { useAuthStore } from "@/stores/authStore";
import { NotificationBell } from "@/components/dashboard/NotificationsPanel";
import { cn } from "@/lib/utils";

export function Header({ onLogin }: { onLogin: () => void }) {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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
    { to: "/board", label: "Loads" },
    { to: "/trucks", label: "Trucks" },
    { to: "/map", label: "Map" },
    { to: "/fuel", label: "Fuel" },
    { to: "/post", label: "Post Load" },
    { to: "/ai-agent", label: "AI Agent" },
    { to: "/dashboard", label: "Dashboard" },
    { to: "/pricing", label: "Pricing" },
  ] as const;

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-40 transition-all duration-300",
          scrolled
            ? "border-b border-border/50 bg-background/92 shadow-[0_1px_0_color-mix(in_oklab,var(--foreground)_5%,transparent)] backdrop-blur-2xl"
            : "border-b border-transparent bg-background/70 backdrop-blur-xl",
        )}
      >
        <div className="mx-auto flex h-[60px] max-w-7xl items-center justify-between px-4 md:px-6">
          {/* ── Logo ── */}
          <Link to="/" className="group flex items-center gap-2.5">
            <span
              className="relative flex h-8 w-8 items-center justify-center overflow-hidden rounded-[10px]"
              style={{
                background: "linear-gradient(145deg, var(--primary) 0%, color-mix(in oklab, var(--primary) 75%, black) 100%)",
                boxShadow: "0 2px 0 color-mix(in oklab, var(--primary) 55%, black), inset 0 1px 0 oklch(1 0 0 / 0.18)",
              }}
            >
              <Truck className="h-4 w-4 text-primary-foreground" strokeWidth={2.2} />
              <span
                aria-hidden
                className="absolute inset-x-1 bottom-0.5 h-px rounded-full"
                style={{ background: "linear-gradient(90deg, transparent, var(--secondary), transparent)" }}
              />
            </span>
            <span className="font-display text-[1.1rem] font-extrabold tracking-[-0.03em] text-foreground">
              Zim<span className="text-secondary">Freight</span>
            </span>
          </Link>

          {/* ── Desktop Nav ── */}
          <nav className="hidden items-center gap-0.5 md:flex">
            {navLinks.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className="group relative rounded-lg px-3 py-2 text-[0.8125rem] font-medium text-muted-foreground transition-colors duration-150 hover:text-foreground"
                activeProps={{
                  className:
                    "group relative rounded-lg px-3 py-2 text-[0.8125rem] font-semibold text-foreground [&>span]:opacity-100",
                }}
              >
                {l.label}
                {/* Active underline — copper-to-gold gradient */}
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-x-3 -bottom-px h-[2px] rounded-full opacity-0 transition-opacity duration-200"
                  style={{ background: "linear-gradient(90deg, var(--secondary), var(--primary))" }}
                />
              </Link>
            ))}
            {isAdmin && (
              <Link
                to="/admin"
                className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-[0.8125rem] font-semibold text-primary transition-colors hover:bg-primary/8"
                activeProps={{
                  className:
                    "inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-[0.8125rem] font-bold bg-primary/10 text-primary",
                }}
              >
                <ShieldCheck className="h-3.5 w-3.5" />
                Admin
              </Link>
            )}
          </nav>

          {/* ── Desktop Auth ── */}
          <div className="hidden items-center gap-2.5 md:flex">
            {user ? (
              <>
                <NotificationBell />
                <div
                  className="flex items-center gap-2 rounded-full border border-border/80 bg-card px-3 py-1.5"
                  style={{ boxShadow: "inset 0 1px 0 oklch(1 0 0 / 0.5)" }}
                >
                  <div
                    className="flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold text-primary-foreground"
                    style={{
                      background: "linear-gradient(145deg, var(--primary), color-mix(in oklab, var(--primary) 70%, black))",
                    }}
                  >
                    {(profile?.full_name || user.email || "U")[0].toUpperCase()}
                  </div>
                  <span className="max-w-[120px] truncate text-[0.8125rem] font-medium text-foreground">
                    {profile?.full_name || user.email}
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={signOut}
                  className="rounded-full border-border/70 text-[0.8125rem] font-medium hover:border-border"
                >
                  Sign out
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onLogin}
                  className="rounded-full text-[0.8125rem] font-medium text-muted-foreground hover:text-foreground"
                >
                  Sign in
                </Button>
                <Button
                  size="sm"
                  onClick={onLogin}
                  className="rounded-full px-5 text-[0.8125rem] font-bold text-secondary-foreground btn-amber-glow"
                  style={{ background: "linear-gradient(145deg, var(--secondary), color-mix(in oklab, var(--secondary) 80%, var(--primary)))" }}
                >
                  Get Started
                </Button>
              </>
            )}
          </div>

          {/* ── Mobile menu toggle ── */}
          <button
            className="flex h-9 w-9 items-center justify-center rounded-lg text-foreground transition-colors hover:bg-muted md:hidden"
            onClick={() => setOpen(!open)}
            aria-label={open ? "Close menu" : "Open menu"}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* ── Mobile Menu ── */}
        {open && (
          <div
            className="border-t border-border/60 bg-background/98 backdrop-blur-2xl md:hidden"
            style={{ boxShadow: "0 16px 40px -8px color-mix(in oklab, var(--foreground) 12%, transparent)" }}
          >
            <div className="mx-auto flex max-w-7xl flex-col gap-0.5 px-4 py-3">
              {navLinks.map((l) => (
                <Link
                  key={l.to}
                  to={l.to}
                  className="rounded-xl px-3.5 py-2.5 text-[0.9rem] font-medium text-foreground/80 transition-colors hover:bg-muted/70 hover:text-foreground"
                  onClick={() => setOpen(false)}
                >
                  {l.label}
                </Link>
              ))}
              {isAdmin && (
                <Link
                  to="/admin"
                  className="inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2.5 text-[0.9rem] font-semibold text-primary"
                  onClick={() => setOpen(false)}
                >
                  <ShieldCheck className="h-4 w-4" />
                  Admin
                </Link>
              )}
              <div className="mt-3 border-t border-border/60 pt-3">
                {user ? (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full rounded-full font-medium"
                    onClick={signOut}
                  >
                    Sign out
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    className="w-full rounded-full font-bold text-secondary-foreground btn-amber-glow"
                    style={{ background: "linear-gradient(145deg, var(--secondary), color-mix(in oklab, var(--secondary) 80%, var(--primary)))" }}
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
