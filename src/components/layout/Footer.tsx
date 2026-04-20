import { Link } from "@tanstack/react-router";
import { Truck } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border bg-[var(--bg-secondary)] mt-0">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 md:grid-cols-4 md:px-6">
        <div>
          <div className="flex items-center gap-2">
            <Truck className="h-6 w-6 text-secondary" strokeWidth={2.5} />
            <span className="font-display text-xl font-extrabold tracking-tighter text-foreground">ZimFreight</span>
          </div>
          <p className="mt-3 max-w-xs text-sm text-muted-foreground">
            Zimbabwe's smartest load board. Built by truckers, for truckers.
          </p>
        </div>
        <div>
          <h4 className="font-display text-sm font-bold uppercase tracking-wider text-foreground">Platform</h4>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li><Link to="/board" search={{}} className="hover:text-foreground">Find Loads</Link></li>
            <li><Link to="/post" className="hover:text-foreground">Post a Load</Link></li>
            <li><Link to="/pricing" className="hover:text-foreground">Pricing</Link></li>
            <li><Link to="/ai-agent" className="hover:text-foreground">AI Agent</Link></li>
            <li><span className="hover:text-foreground cursor-pointer">ZIMRA Guide</span></li>
            <li><span className="hover:text-foreground cursor-pointer">Contact</span></li>
          </ul>
        </div>
        <div>
          <h4 className="font-display text-sm font-bold uppercase tracking-wider text-foreground">Community</h4>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li><span className="cursor-pointer hover:text-foreground">WhatsApp Group</span></li>
            <li><span className="cursor-pointer hover:text-foreground">Facebook</span></li>
            <li><span className="cursor-pointer hover:text-foreground">Twitter / X</span></li>
          </ul>
        </div>
        <div>
          <h4 className="font-display text-sm font-bold uppercase tracking-wider text-foreground">Legal</h4>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li><span className="cursor-pointer hover:text-foreground">Privacy Policy</span></li>
            <li><span className="cursor-pointer hover:text-foreground">Terms of Service</span></li>
          </ul>
        </div>
      </div>
      <div className="zim-flag-strip" />
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2 px-4 py-4 text-xs text-muted-foreground md:px-6">
        <span>Made with ❤️ for Zimbabwe 🇿🇼 · Registered in Zimbabwe</span>
        <span className="font-mono">© {new Date().getFullYear()} ZimFreight · BETA</span>
      </div>
    </footer>
  );
}
