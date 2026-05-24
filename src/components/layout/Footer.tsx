import { Link } from "@tanstack/react-router";
import { Truck } from "lucide-react";

const FOOTER_LINKS = {
  Product: [
    { label: "Load Board", to: "/board" },
    { label: "Post a Load", to: "/post" },
    { label: "Trucks", to: "/trucks" },
    { label: "Map", to: "/map" },
    { label: "AI Agent", to: "/ai-agent" },
  ],
  Company: [
    { label: "Pricing", to: "/pricing" },
    { label: "Dashboard", to: "/dashboard" },
    { label: "Profile", to: "/profile" },
  ],
};

export function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto max-w-7xl px-4 py-12 md:px-6">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="col-span-2 md:col-span-2">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-foreground text-background">
                <Truck className="h-4 w-4" strokeWidth={2.5} />
              </div>
              <span className="font-display text-[15px] font-bold tracking-tight">ZimFreight</span>
            </Link>
            <p className="mt-3 max-w-xs text-sm text-muted-foreground leading-relaxed">
              Zimbabwe's premier freight marketplace. Connecting carriers, brokers, and shippers across SADC.
            </p>
            <div className="mt-4 flex items-center gap-1.5">
              <span className="inline-block h-2 w-2 rounded-full bg-[color:var(--success)]" />
              <span className="text-xs text-muted-foreground">All systems operational</span>
            </div>
          </div>

          {/* Links */}
          {Object.entries(FOOTER_LINKS).map(([section, links]) => (
            <div key={section}>
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-foreground">
                {section}
              </h3>
              <ul className="space-y-2">
                {links.map((l) => (
                  <li key={l.to}>
                    <Link
                      to={l.to}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-border pt-6 md:flex-row">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} ZimFreight. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <span className="text-xs text-muted-foreground">Zimbabwe · SADC Region</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
