import { useState } from "react";
import { X, Sparkles } from "lucide-react";

export function AnnouncementBar() {
  const [open, setOpen] = useState(true);
  if (!open) return null;
  return (
    <div className="relative overflow-hidden bg-primary text-primary-foreground">
      {/* subtle amber wash on the right */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 right-0 w-2/3"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, color-mix(in oklab, var(--secondary) 18%, transparent) 100%)",
        }}
      />
      <div className="relative mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-1.5 text-[12px] font-medium md:px-6">
        <span className="flex items-center gap-2 truncate">
          <Sparkles className="h-3.5 w-3.5 shrink-0 text-secondary" />
          <span className="truncate">
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-secondary/90">
              Live
            </span>
            <span className="mx-2 text-primary-foreground/40">·</span>
            Zimbabwe&rsquo;s first AI-powered load board &mdash; join{" "}
            <span className="font-bold text-secondary">2,400+ carriers</span>
          </span>
        </span>
        <button
          onClick={() => setOpen(false)}
          aria-label="Dismiss"
          className="shrink-0 rounded p-0.5 text-primary-foreground/70 transition-colors hover:bg-white/10 hover:text-primary-foreground"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
