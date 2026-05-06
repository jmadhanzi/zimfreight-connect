import { Link } from "@tanstack/react-router";

const BOARD_SEARCH = {
  q: "", origin: "all", destination: "all", loadType: "all", equipment: "all",
  pickup: "", minRate: 0, maxDistance: 2000, border: false, zimra: false,
  urgent: false, minWeight: 0, maxWeight: 40, payment: "all",
  sort: "newest" as const, load: undefined as string | undefined,
};

export function Footer() {
  return (
    <footer className="relative mt-0 border-t border-border bg-[var(--bg-secondary)]">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 md:grid-cols-4 md:px-6">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-primary via-primary to-[color-mix(in_oklab,var(--primary)_70%,black)] shadow-[0_2px_0_color-mix(in_oklab,var(--primary)_60%,black),inset_0_1px_0_color-mix(in_oklab,white_25%,transparent)]">
              <svg viewBox="0 0 24 24" className="h-4.5 w-4.5 text-primary-foreground" fill="none" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 6 H19 L7 18 H19" stroke="currentColor" />
                <circle cx="19" cy="6" r="1.4" fill="var(--secondary)" stroke="none" />
              </svg>
              <span className="absolute inset-x-1.5 bottom-1 h-px bg-gradient-to-r from-transparent via-secondary/70 to-transparent" />
            </span>
            <span className="font-display text-xl font-extrabold tracking-tight text-foreground">
              Zim<span className="text-secondary">Freight</span>
            </span>
          </div>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
            Zimbabwe&rsquo;s smartest load board. Built by truckers, for truckers.
          </p>
          <div className="mt-5 flex items-center gap-2 text-xs">
            <span className="dot-live" />
            <span className="font-mono uppercase tracking-[0.18em] text-muted-foreground">Live network</span>
          </div>
        </div>

        <div>
          <h4 className="font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">Platform</h4>
          <ul className="mt-4 space-y-2.5 text-sm text-foreground/80">
            <li><Link to="/board" search={BOARD_SEARCH} className="transition-colors hover:text-foreground">Find Loads</Link></li>
            <li><Link to="/post" className="transition-colors hover:text-foreground">Post a Load</Link></li>
            <li><Link to="/pricing" className="transition-colors hover:text-foreground">Pricing</Link></li>
            <li><Link to="/ai-agent" className="transition-colors hover:text-foreground">AI Agent</Link></li>
            <li><span className="cursor-pointer transition-colors hover:text-foreground">ZIMRA Guide</span></li>
            <li><span className="cursor-pointer transition-colors hover:text-foreground">Contact</span></li>
          </ul>
        </div>

        <div>
          <h4 className="font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">Community</h4>
          <ul className="mt-4 space-y-2.5 text-sm text-foreground/80">
            <li><span className="cursor-pointer transition-colors hover:text-foreground">WhatsApp Group</span></li>
            <li><span className="cursor-pointer transition-colors hover:text-foreground">Facebook</span></li>
            <li><span className="cursor-pointer transition-colors hover:text-foreground">Twitter / X</span></li>
          </ul>
        </div>

        <div>
          <h4 className="font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">Legal</h4>
          <ul className="mt-4 space-y-2.5 text-sm text-foreground/80">
            <li><span className="cursor-pointer transition-colors hover:text-foreground">Privacy Policy</span></li>
            <li><span className="cursor-pointer transition-colors hover:text-foreground">Terms of Service</span></li>
          </ul>
        </div>
      </div>
      <div className="zim-flag-strip" />
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2 px-4 py-4 text-xs text-muted-foreground md:px-6">
        <span>
          Made with <span className="text-destructive">❤</span> for Zimbabwe 🇿🇼 &middot; Registered in Zimbabwe
        </span>
        <span className="font-mono uppercase tracking-[0.18em]">© {new Date().getFullYear()} ZimFreight &middot; BETA</span>
      </div>
    </footer>
  );
}
