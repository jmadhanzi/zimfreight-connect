import { useEffect, useState } from "react";
import { Truck, CheckCircle2, TrendingUp } from "lucide-react";

type Notice = { icon: React.ReactNode; text: string };

const NOTICES: Notice[] = [
  { icon: <Truck className="h-4 w-4 text-primary" />, text: "Tatenda from Harare just found a load 2 min ago" },
  { icon: <CheckCircle2 className="h-4 w-4 text-success" />, text: "Chamu from Bulawayo upgraded to Basic" },
  { icon: <TrendingUp className="h-4 w-4 text-primary" />, text: "3 new loads posted on Harare → Bulawayo" },
  { icon: <Truck className="h-4 w-4 text-primary" />, text: "Simba from Masvingo booked a Beitbridge run" },
  { icon: <CheckCircle2 className="h-4 w-4 text-success" />, text: "Rumbi from Mutare just joined ZimFreight" },
  { icon: <TrendingUp className="h-4 w-4 text-primary" />, text: "Beitbridge wait time dropped to 1.5h" },
  { icon: <Truck className="h-4 w-4 text-primary" />, text: "Munyaradzi posted 2 loads to Chirundu" },
  { icon: <CheckCircle2 className="h-4 w-4 text-success" />, text: "KHUMALO TRANSPORT upgraded to Pro" },
];

const DISMISS_KEY = "zf_social_dismissed";

export function SocialProofToasts() {
  const [idx, setIdx] = useState(-1);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem(DISMISS_KEY)) { setDismissed(true); return; }

    let i = 0;
    let visibleTimer: ReturnType<typeof setTimeout>;
    const showNext = () => {
      setIdx(i % NOTICES.length);
      i++;
      visibleTimer = setTimeout(() => setIdx(-1), 5000);
    };
    const initial = setTimeout(showNext, 12_000);
    const cycle = setInterval(showNext, 30_000);
    return () => { clearTimeout(initial); clearTimeout(visibleTimer); clearInterval(cycle); };
  }, []);

  const dismiss = () => {
    sessionStorage.setItem(DISMISS_KEY, "1");
    setDismissed(true);
  };

  if (dismissed || idx < 0) return null;
  const n = NOTICES[idx];
  return (
    <div className="pointer-events-auto fixed bottom-4 left-4 z-40 hidden max-w-xs animate-fade-up md:block">
      <div className="flex items-center gap-2.5 rounded-lg border border-border bg-card/95 px-3.5 py-2.5 shadow-2xl backdrop-blur">
        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-background">{n.icon}</span>
        <p className="flex-1 text-xs text-foreground">{n.text}</p>
        <button onClick={dismiss} aria-label="Dismiss" className="text-xs text-muted-foreground hover:text-foreground">×</button>
      </div>
    </div>
  );
}