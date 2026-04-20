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
    const arm = setTimeout(() => { armed = true; }, 8000); // wait 8s before arming

    const onLeave = (e: MouseEvent) => {
      if (!armed) return;
      if (e.clientY <= 0 && e.relatedTarget === null) {
        localStorage.setItem(KEY, String(Date.now()));
        setOpen(true);
        document.removeEventListener("mouseout", onLeave);
      }
    };
    document.addEventListener("mouseout", onLeave);
    return () => { clearTimeout(arm); document.removeEventListener("mouseout", onLeave); };
  }, []);

  const claim = async () => {
    try { await navigator.clipboard.writeText("ZIMFIRST"); } catch {}
    toast.success("Code ZIMFIRST copied — apply it at checkout");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="border-primary/40 bg-card sm:max-w-md">
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/15 text-primary">
            <Gift className="h-7 w-7" />
          </div>
          <h2 className="mt-4 font-display text-3xl font-black uppercase leading-tight tracking-tight">
            Before you go —
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Get your <span className="font-bold text-foreground">first month free</span> with code
          </p>
          <div className="mx-auto mt-4 inline-block rounded-md border-2 border-dashed border-primary bg-primary/10 px-6 py-3 font-mono text-2xl font-bold tracking-widest text-primary">
            ZIMFIRST
          </div>
          <div className="mt-6 flex flex-col gap-2">
            <Button onClick={claim} size="lg" className="bg-primary font-display text-base font-bold uppercase tracking-wide text-primary-foreground hover:bg-primary/90">
              Claim Offer
            </Button>
            <button onClick={() => setOpen(false)} className="text-xs text-muted-foreground hover:text-foreground">No thanks</button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}