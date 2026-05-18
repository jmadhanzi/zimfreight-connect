import { useState } from "react";
import { X, Zap } from "lucide-react";

export function AnnouncementBar() {
  const [open, setOpen] = useState(true);
  if (!open) return null;
  return (
    <div
      className="relative overflow-hidden"
      style={{
        background: "linear-gradient(100deg, oklch(0.26 0.072 38) 0%, oklch(0.30 0.080 42) 45%, oklch(0.28 0.068 50) 100%)",
      }}
    >
      {/* Warm shimmer on the right */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 right-0 w-1/2"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, color-mix(in oklab, var(--secondary) 14%, transparent) 100%)",
        }}
      />
      {/* Left accent line */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-0 w-[3px]"
        style={{ background: "linear-gradient(180deg, var(--secondary), var(--primary))" }}
      />
      <div className="relative mx-auto flex max-w-7xl items-center justify-between gap-3 px-5 py-[7px] text-[0.75rem] font-medium md:px-6">
        <span className="flex items-center gap-2.5 truncate">
          <span
            className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full"
            style={{ background: "color-mix(in oklab, var(--secondary) 22%, transparent)", border: "1px solid color-mix(in oklab, var(--secondary) 35%, transparent)" }}
          >
            <Zap className="h-3 w-3 text-secondary" />
          </span>
          <span className="truncate text-white/90">
            <span
              className="font-mono text-[0.6875rem] font-bold uppercase tracking-[0.22em]"
              style={{ color: "var(--secondary)" }}
            >
              Live
            </span>
            <span className="mx-2 text-white/30">·</span>
            Zimbabwe&rsquo;s first AI-powered load board &mdash; join{" "}
            <span className="font-bold" style={{ color: "var(--secondary)" }}>
              2,400+ carriers
            </span>
          </span>
        </span>
        <button
          onClick={() => setOpen(false)}
          aria-label="Dismiss"
          className="shrink-0 rounded-md p-1 text-white/50 transition-colors hover:bg-white/10 hover:text-white/90"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
