import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const VISIT_KEY = "zf_pwa_visits";
const DISMISS_KEY = "zf_pwa_dismissed_at";
const DISMISS_DAYS = 14;

type BIPEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: "accepted" | "dismissed" }> };

export function InstallBanner() {
  const [deferred, setDeferred] = useState<BIPEvent | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    // Bump visit counter
    const v = Number(localStorage.getItem(VISIT_KEY) ?? "0") + 1;
    localStorage.setItem(VISIT_KEY, String(v));

    const dismissedAt = Number(localStorage.getItem(DISMISS_KEY) ?? "0");
    const dismissedRecently = dismissedAt && Date.now() - dismissedAt < DISMISS_DAYS * 86400_000;
    const standalone = window.matchMedia("(display-mode: standalone)").matches || (navigator as Navigator & { standalone?: boolean }).standalone === true;
    if (standalone || dismissedRecently) return;

    const onPrompt = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BIPEvent);
      const showSoon = v >= 3;
      if (showSoon) setVisible(true);
      else setTimeout(() => setVisible(true), 30_000);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    return () => window.removeEventListener("beforeinstallprompt", onPrompt);
  }, []);

  if (!visible || !deferred) return null;

  const install = async () => {
    await deferred.prompt();
    const { outcome } = await deferred.userChoice;
    if (outcome === "accepted") setVisible(false);
    else dismiss();
  };
  const dismiss = () => {
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
    setVisible(false);
  };

  return (
    <div className="fixed inset-x-3 bottom-3 z-[60] mx-auto max-w-md rounded-lg border border-primary/30 bg-card/95 p-3 shadow-2xl backdrop-blur md:left-auto md:right-4">
      <div className="flex items-start gap-3">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-primary/10 text-primary">📱</div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-foreground">Install ZimFreight</p>
          <p className="mt-0.5 text-xs text-muted-foreground">Works offline in rural areas. One tap from your home screen.</p>
          <div className="mt-2 flex gap-2">
            <Button size="sm" onClick={install} className="h-8"><Download className="mr-1 h-3.5 w-3.5" /> Install App</Button>
            <Button size="sm" variant="ghost" onClick={dismiss} className="h-8">Not now</Button>
          </div>
        </div>
        <button onClick={dismiss} aria-label="Dismiss" className="text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
      </div>
    </div>
  );
}
