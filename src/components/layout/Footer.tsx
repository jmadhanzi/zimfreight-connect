import { Link } from "@tanstack/react-router";
import { Truck } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border bg-[var(--bg-secondary)] mt-20">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 md:grid-cols-4 md:px-6">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Truck className="h-4 w-4" strokeWidth={2.5} />
            </div>
            <span className="font-display text-xl font-black">ZIM<span className="text-primary">FREIGHT</span></span>
          </div>
          <p className="mt-3 max-w-xs text-sm text-muted-foreground">
            Zimbabwe's premier digital load board. Connecting carriers, brokers, and shippers across SADC.
          </p>
        </div>
        <div>
          <h4 className="font-display text-sm font-bold uppercase tracking-wider text-foreground">Platform</h4>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li><Link to="/board" className="hover:text-foreground">Load Board</Link></li>
            <li><Link to="/post" className="hover:text-foreground">Post a Load</Link></li>
            <li><Link to="/pricing" className="hover:text-foreground">Pricing</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-display text-sm font-bold uppercase tracking-wider text-foreground">Company</h4>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>About</li><li>Contact</li><li>Careers</li>
          </ul>
        </div>
        <div>
          <h4 className="font-display text-sm font-bold uppercase tracking-wider text-foreground">Legal</h4>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>Terms of Service</li><li>Privacy Policy</li><li>ZIMRA Compliance</li>
          </ul>
        </div>
      </div>
      <div className="zim-flag-strip" />
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 text-xs text-muted-foreground md:px-6">
        <span>© {new Date().getFullYear()} ZimFreight. Made in Harare.</span>
        <span className="font-mono">v0.1.0 · BETA</span>
      </div>
    </footer>
  );
}
