import { Link, useNavigate } from "@tanstack/react-router";
import { Truck, Menu, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useAuthStore } from "@/stores/authStore";

export function Header({ onLogin }: { onLogin: () => void }) {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const signOut = async () => {
    await supabase.auth.signOut();
    useAuthStore.getState().reset();
    navigate({ to: "/" });
  };

  const navLinks = [
    { to: "/board", label: "Load Board" },
    { to: "/post", label: "Post Load" },
    { to: "/dashboard", label: "Dashboard" },
    { to: "/pricing", label: "Pricing" },
  ] as const;

  return (
    <>
      <div className="zim-flag-strip" />
      <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-6">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Truck className="h-5 w-5" strokeWidth={2.5} />
            </div>
            <div className="flex flex-col leading-none">
              <span className="font-display text-2xl font-black tracking-tight text-foreground">
                ZIM<span className="text-primary">FREIGHT</span>
              </span>
              <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                Load Board · Zimbabwe
              </span>
            </div>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {navLinks.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                activeProps={{ className: "rounded-md px-3 py-2 text-sm font-semibold text-primary bg-secondary" }}
              >
                {l.label}
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-2 md:flex">
            {user ? (
              <>
                <span className="text-sm text-muted-foreground">
                  {profile?.full_name || user.email}
                </span>
                <Button variant="outline" size="sm" onClick={signOut}>Sign out</Button>
              </>
            ) : (
              <>
                <Button variant="ghost" size="sm" onClick={onLogin}>Sign in</Button>
                <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90" onClick={onLogin}>
                  Get started
                </Button>
              </>
            )}
          </div>

          <button className="md:hidden text-foreground" onClick={() => setOpen(!open)} aria-label="Menu">
            {open ? <X /> : <Menu />}
          </button>
        </div>

        {open && (
          <div className="border-t border-border md:hidden">
            <div className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-3">
              {navLinks.map((l) => (
                <Link key={l.to} to={l.to} className="rounded-md px-3 py-2 text-sm text-foreground hover:bg-secondary" onClick={() => setOpen(false)}>
                  {l.label}
                </Link>
              ))}
              <div className="mt-2 border-t border-border pt-2">
                {user ? (
                  <Button variant="outline" size="sm" className="w-full" onClick={signOut}>Sign out</Button>
                ) : (
                  <Button size="sm" className="w-full bg-primary text-primary-foreground" onClick={() => { setOpen(false); onLogin(); }}>
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
