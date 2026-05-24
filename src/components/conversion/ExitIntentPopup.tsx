import { useEffect, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Gift } from "lucide-react";
import { toast } from "sonner";

const KEY = "zf_exit_shown_at";
const COOLDOWN_MS = 1000 * 60 * 60 * 24 * 7; // 7 days

export function ExitIntentPopup() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    // Desktop only
    if (window.matchMedia("(max-width: 768px)").matches) return;
    const last = Number(localStorage.getItem(KEY) ?? "0");
    if (Date.now() - last < COOLDOWN_MS) return;

    let armed = false;
    const arm = setTimeout(() => {
      armed = true;
    }, 8000); // wait 8s before arming

    const onLeave = (e: MouseEvent) => {
      if (!armed) return;
      if (e.clientY <= 0 && e.relatedTarget === null) {
        localStorage.setItem(KEY, String(Date.now()));
        setOpen(true);
        document.removeEventListener("mouseout", onLeave);
      }
    };
    document.addEventListener("mouseout", onLeave);
    return () => {
      clearTimeout(arm);
      document.removeEventListener("mouseout", onLeave);
    };
  }, []);

  const claim = async () => {
    try {
      await navigator.clipboard.writeText("ZIMFIRST");
    } catch {
      /* clipboard unavailable */
    }
    toast.success("Code ZIMFIRST copied — apply it at checkout");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="overflow-hidden border-secondary/30 bg-card p-0 sm:max-w-md">
        <span
          aria-hidden
          className="absolute inset-x-0 top-0 z-10 h-[3px] bg-gradient-to-r from-secondary via-primary to-secondary"
        />
        <span
          aria-hidden
          className="hidden"
        />
        <div className="relative p-7 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary/15 text-secondary">
            <Gift className="h-6 w-6" />
          </div>
          <span className="section-kicker mx-auto mt-5 justify-center">Wait!</span>
          <h2 className="mt-3 font-display text-3xl font-bold leading-[1.05] tracking-[-0.04em]">
            Before you go &mdash;
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Get your <span className="font-bold text-foreground">first month free</span> with code
          </p>
          <div className="mx-auto mt-5 inline-flex items-center gap-2 rounded-xl border-2 border-dashed border-secondary bg-secondary/8 px-6 py-3.5 font-mono text-2xl font-bold tracking-[0.2em] text-secondary">
            ZIMFIRST
          </div>
          <div className="mt-7 flex flex-col gap-2">
            <Button
              onClick={claim}
              size="lg"
              className="bg-secondary font-semibold text-secondary-foreground hover:bg-secondary/90"
            >
              Claim offer
            </Button>
            <button
              onClick={() => setOpen(false)}
              className="text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              No thanks
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
