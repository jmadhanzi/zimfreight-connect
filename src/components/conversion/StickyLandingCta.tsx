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
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-primary/40 bg-card/95 backdrop-blur-md animate-fade-up">
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 md:px-6">
        <span className="hidden h-2 w-2 animate-pulse rounded-full bg-success md:inline-block" />
        <p className="flex-1 text-sm font-medium text-foreground">
          <span className="font-display text-base font-black text-primary">847 loads</span> live right now — start free
        </p>
        <Button asChild size="sm" className="bg-primary font-display font-bold uppercase tracking-wide text-primary-foreground hover:bg-primary/90">
          <Link to="/board" search={(prev) => prev}>Join Free <ArrowRight className="ml-1 h-3.5 w-3.5" /></Link>
        </Button>
        <button onClick={() => setDismissed(true)} aria-label="Dismiss" className="text-muted-foreground hover:text-foreground">
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}