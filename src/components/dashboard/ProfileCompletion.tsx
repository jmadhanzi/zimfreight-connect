import { Link } from "@tanstack/react-router";
import { CheckCircle2, Circle } from "lucide-react";
import type { Profile } from "@/types";
import { profileCompletion } from "@/hooks/useDashboard";

export function ProfileCompletion({ profile }: { profile: Profile | null }) {
  const { pct, missing } = profileCompletion(profile);
  if (pct >= 80) return null;

  return (
    <div className="rounded-lg border border-primary/30 bg-primary/5 p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-display text-lg font-bold uppercase tracking-tight">Complete your profile</h3>
          <p className="text-xs text-muted-foreground">Get 3× more load opportunities when your profile is complete.</p>
        </div>
        <span className="font-mono-num text-2xl font-black text-primary">{pct}%</span>
      </div>

      <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-muted">
        <div className="h-full bg-primary transition-[width]" style={{ width: `${pct}%` }} />
      </div>

      <ul className="mt-4 space-y-1.5 text-sm">
        {missing.map((m) => (
          <li key={m.key}>
            <Link to="/onboarding" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
              <Circle className="h-4 w-4 text-muted-foreground/60" />
              <span>{m.label}</span>
            </Link>
          </li>
        ))}
        {missing.length === 0 && (
          <li className="flex items-center gap-2 text-[color:var(--success)]"><CheckCircle2 className="h-4 w-4" /> Profile is complete</li>
        )}
      </ul>
    </div>
  );
}