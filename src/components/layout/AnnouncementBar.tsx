import { useState } from "react";
import { X, ArrowRight } from "lucide-react";
import { Link } from "@tanstack/react-router";

export function AnnouncementBar() {
  const [open, setOpen] = useState(true);
  if (!open) return null;

  return (
    <div className="relative border-b border-border bg-foreground text-background">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-2 md:px-6">
        <div className="flex flex-1 items-center justify-center gap-2 text-xs font-medium">
          <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-background/20 text-[10px] font-bold">
            ✦
          </span>
          <span className="text-background/80">
            Zimbabwe's first AI-powered load board —{" "}
            <Link
              to="/board"
              search={{ q: "", origin: "all", destination: "all", loadType: "all", equipment: "all", pickup: "", minRate: 0, maxDistance: 2000, border: false, zimra: false, urgent: false, minWeight: 0, maxWeight: 40, payment: "all", sort: "newest", load: undefined }}
              className="inline-flex items-center gap-1 font-semibold text-background underline-offset-2 hover:underline"
            >
              Browse 800+ loads today
              <ArrowRight className="h-3 w-3" />
            </Link>
          </span>
        </div>
        <button
          onClick={() => setOpen(false)}
          aria-label="Dismiss"
          className="shrink-0 rounded p-1 text-background/50 transition-colors hover:bg-background/10 hover:text-background/90"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
