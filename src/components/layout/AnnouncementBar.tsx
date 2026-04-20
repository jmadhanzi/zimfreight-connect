import { useState } from "react";
import { X } from "lucide-react";

export function AnnouncementBar() {
  const [open, setOpen] = useState(true);
  if (!open) return null;
  return (
    <div className="bg-primary text-primary-foreground">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-1.5 text-[12px] font-medium md:px-6">
        <span className="truncate">
          🇿🇼 Zimbabwe's first AI-powered load board is live — Join 2,400+ carriers
        </span>
        <button onClick={() => setOpen(false)} aria-label="Dismiss" className="shrink-0 rounded p-0.5 hover:bg-black/10">
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}