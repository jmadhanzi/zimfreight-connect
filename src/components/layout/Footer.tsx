import { Link } from "@tanstack/react-router";
import { Truck } from "lucide-react";

const BOARD_SEARCH = {
  q: "", origin: "all", destination: "all", loadType: "all", equipment: "all",
  pickup: "", minRate: 0, maxDistance: 2000, border: false, zimra: false,
  urgent: false, minWeight: 0, maxWeight: 40, payment: "all",
  sort: "newest" as const, load: undefined as string | undefined,
};

export function Footer() {
  return (
    <footer
      className="relative mt-0"
      style={{
        background: "var(--color-bg-secondary)",
        borderTop: "1px solid var(--color-border)",
      }}
    >
      <div className="mx-auto grid max-w-7xl gap-12 px-4 py-16 md:grid-cols-4 md:px-6">
        {/* Brand column */}
        <div>
          <div className="flex items-center gap-2.5">
            <span
              className="relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-[10px]"
              style={{
                background: "linear-gradient(145deg, var(--primary) 0%, color-mix(in oklab, var(--primary) 72%, black) 100%)",
                boxShadow: "0 2px 0 color-mix(in oklab, var(--primary) 55%, black), inset 0 1px 0 oklch(1 0 0 / 0.18)",
              }}
            >
              <Truck className="h-4 w-4 text-primary-foreground" strokeWidth={2.2} />
              <span
                aria-hidden
                className="absolute inset-x-1 bottom-0.5 h-px rounded-full"
                style={{ background: "linear-gradient(90deg, transparent, var(--secondary), transparent)" }}
              />
            </span>
            <span className="font-display text-xl font-extrabold tracking-[-0.03em] text-foreground">
              Zim<span className="text-secondary">Freight</span>
            </span>
          </div>
          <p className="mt-4 max-w-[220px] text-[0.875rem] leading-relaxed text-muted-foreground">
            Zimbabwe&rsquo;s smartest load board. Built by truckers, for truckers.
          </p>
          <div className="mt-5 flex items-center gap-2">
            <span className="dot-live" />
            <span
              className="font-mono text-[0.6875rem] font-semibold uppercase tracking-[0.20em]"
              style={{ color: "var(--color-muted-foreground)" }}
            >
              Live network
            </span>
          </div>
          {/* Decorative warm line */}
          <div
            className="mt-6 h-px w-16 rounded-full"
            style={{ background: "linear-gradient(90deg, var(--secondary), transparent)" }}
          />
        </div>

        {/* Platform links */}
        <div>
          <h4
            className="font-mono text-[0.6875rem] font-bold uppercase tracking-[0.24em]"
            style={{ color: "var(--color-muted-foreground)" }}
          >
            Platform
          </h4>
          <ul className="mt-5 space-y-3">
            {[
              { label: "Find Loads", href: "/board", search: BOARD_SEARCH },
              { label: "Post a Load", href: "/post" },
              { label: "Pricing", href: "/pricing" },
              { label: "AI Agent", href: "/ai-agent" },
            ].map((item) => (
              <li key={item.label}>
                <Link
                  to={item.href as "/board"}
                  search={item.search as typeof BOARD_SEARCH}
                  className="group inline-flex items-center gap-1.5 text-[0.875rem] text-foreground/70 transition-colors hover:text-foreground"
                >
                  <span
                    className="h-px w-0 rounded-full transition-all duration-200 group-hover:w-3"
                    style={{ background: "var(--secondary)" }}
                  />
                  {item.label}
                </Link>
              </li>
            ))}
            {["ZIMRA Guide", "Contact"].map((label) => (
              <li key={label}>
                <span className="group inline-flex cursor-pointer items-center gap-1.5 text-[0.875rem] text-foreground/70 transition-colors hover:text-foreground">
                  <span
                    className="h-px w-0 rounded-full transition-all duration-200 group-hover:w-3"
                    style={{ background: "var(--secondary)" }}
                  />
                  {label}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Community links */}
        <div>
          <h4
            className="font-mono text-[0.6875rem] font-bold uppercase tracking-[0.24em]"
            style={{ color: "var(--color-muted-foreground)" }}
          >
            Community
          </h4>
          <ul className="mt-5 space-y-3">
            {["WhatsApp Group", "Facebook", "Twitter / X"].map((label) => (
              <li key={label}>
                <span className="group inline-flex cursor-pointer items-center gap-1.5 text-[0.875rem] text-foreground/70 transition-colors hover:text-foreground">
                  <span
                    className="h-px w-0 rounded-full transition-all duration-200 group-hover:w-3"
                    style={{ background: "var(--secondary)" }}
                  />
                  {label}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Legal links */}
        <div>
          <h4
            className="font-mono text-[0.6875rem] font-bold uppercase tracking-[0.24em]"
            style={{ color: "var(--color-muted-foreground)" }}
          >
            Legal
          </h4>
          <ul className="mt-5 space-y-3">
            {["Privacy Policy", "Terms of Service"].map((label) => (
              <li key={label}>
                <span className="group inline-flex cursor-pointer items-center gap-1.5 text-[0.875rem] text-foreground/70 transition-colors hover:text-foreground">
                  <span
                    className="h-px w-0 rounded-full transition-all duration-200 group-hover:w-3"
                    style={{ background: "var(--secondary)" }}
                  />
                  {label}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Zimbabwe flag strip */}
      <div className="zim-flag-strip" />

      {/* Bottom bar */}
      <div
        className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2 px-4 py-4 md:px-6"
        style={{ color: "var(--color-muted-foreground)" }}
      >
        <span className="text-[0.8125rem]">
          Made with{" "}
          <span style={{ color: "var(--zim-red)" }}>♥</span>{" "}
          for Zimbabwe 🇿🇼 &middot; Registered in Zimbabwe
        </span>
        <span className="font-mono text-[0.6875rem] uppercase tracking-[0.18em]">
          &copy; {new Date().getFullYear()} ZimFreight &middot; BETA
        </span>
      </div>
    </footer>
  );
}
