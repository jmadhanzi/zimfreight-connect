import { ArrowRight, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * CorridorBar — DAT-style horizontal quick-filter chips for Zimbabwe's
 * most-trafficked freight corridors. Clicking a chip pre-fills the
 * origin/destination filters on the board.
 */

export interface Corridor {
  id: string;
  origin: string;
  destination: string;
  label?: string;
  flag?: string;
}

export const ZIM_CORRIDORS: Corridor[] = [
  { id: "all", origin: "all", destination: "all", label: "All Routes", flag: "🇿🇼" },
  { id: "hre-bul", origin: "Harare", destination: "Bulawayo", label: "Hre → Bul", flag: "🏙" },
  { id: "hre-beit", origin: "Harare", destination: "Beitbridge", label: "Hre → Beit", flag: "🌉" },
  {
    id: "bul-beit",
    origin: "Bulawayo",
    destination: "Beitbridge",
    label: "Bul → Beit",
    flag: "🛣",
  },
  { id: "hre-mut", origin: "Harare", destination: "Mutare", label: "Hre → Mut", flag: "⛰" },
  { id: "hre-kwe", origin: "Harare", destination: "Kwekwe", label: "Hre → Kwe", flag: "⚙" },
  {
    id: "beit-jnb",
    origin: "Beitbridge",
    destination: "Johannesburg",
    label: "Beit → JNB",
    flag: "🇿🇦",
  },
  { id: "hre-lun", origin: "Harare", destination: "Lusaka", label: "Hre → Lusaka", flag: "🇿🇲" },
  { id: "hre-blr", origin: "Harare", destination: "Blantyre", label: "Hre → Blantyre", flag: "🇲🇼" },
];

interface CorridorBarProps {
  active: string;
  onSelect: (c: Corridor) => void;
  resultCount?: number;
  loading?: boolean;
}

export function CorridorBar({ active, onSelect, resultCount, loading }: CorridorBarProps) {
  return (
    <div className="border-b border-border bg-background">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <div className="flex items-center gap-2 overflow-x-auto py-2.5 scrollbar-none">
          {ZIM_CORRIDORS.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => onSelect(c)}
              className={cn("corridor-chip shrink-0", active === c.id && "active")}
            >
              {c.flag && <span className="text-[13px]">{c.flag}</span>}
              {c.id === "all" ? (
                <span>{c.label}</span>
              ) : (
                <span className="flex items-center gap-1">
                  {c.origin}
                  <ArrowRight className="h-3 w-3 opacity-50" />
                  {c.destination}
                </span>
              )}
            </button>
          ))}

          {/* Result count + loading indicator */}
          <div className="ml-auto flex shrink-0 items-center gap-2 pl-4">
            {loading && <RefreshCw className="h-3 w-3 animate-spin text-muted-foreground" />}
            {resultCount !== undefined && (
              <span className="font-mono text-[11px] font-bold uppercase tracking-[0.16em] tabular-nums text-muted-foreground">
                <span className="text-foreground">{resultCount.toLocaleString()}</span> load
                {resultCount === 1 ? "" : "s"}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
