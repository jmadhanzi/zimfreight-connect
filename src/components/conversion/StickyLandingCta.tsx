import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { ArrowRight, X } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

/** Renders only on the landing page; appears after 50% scroll. */
export function StickyLandingCta() {
  const { user } = useAuth();
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || user) return;
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const pct = max > 0 ? window.scrollY / max : 0;
      setVisible(pct > 0.5);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [user]);

  if (user || dismissed || !visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-secondary/30 bg-card/95 backdrop-blur-xl animate-fade-up md:bottom-0">
      {/* Top accent strip */}
      <span
        aria-hidden
        className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-secondary/60 to-transparent"
      />
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 md:px-6">
        <span className="dot-live hidden md:inline-block" />
        <p className="flex-1 text-sm font-medium text-foreground">
          <span className="font-display text-base font-extrabold tracking-tight text-secondary">
            847 loads
          </span>{" "}
          <span className="text-muted-foreground">live right now &mdash;</span>{" "}
          <span className="hidden sm:inline">start free</span>
        </p>
        <Button
          asChild
          size="sm"
          className="rounded-full bg-secondary font-bold tracking-wide text-secondary-foreground btn-amber-glow hover:bg-secondary/90"
        >
          <Link
            to="/board"
            search={{
              q: "",
              origin: "all",
              destination: "all",
              loadType: "all",
              equipment: "all",
              pickup: "",
              minRate: 0,
              maxDistance: 2000,
              border: false,
              zimra: false,
              urgent: false,
              minWeight: 0,
              maxWeight: 40,
              payment: "all",
              sort: "newest",
              load: undefined,
            }}
          >
            Join Free <ArrowRight className="ml-1 h-3.5 w-3.5" />
          </Link>
        </Button>
        <button
          onClick={() => setDismissed(true)}
          aria-label="Dismiss"
          className="rounded p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
