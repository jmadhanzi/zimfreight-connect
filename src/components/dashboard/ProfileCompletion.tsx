import { Link } from "@tanstack/react-router";
import { CheckCircle2, ChevronRight, UserCircle2 } from "lucide-react";
import type { Profile } from "@/types";
import { profileCompletion } from "@/hooks/useDashboard";

export function ProfileCompletion({ profile }: { profile: Profile | null }) {
  const { pct, missing } = profileCompletion(profile);
  if (pct >= 80) return null;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-secondary/30 bg-gradient-to-br from-secondary/[0.06] via-card to-card p-6">
      <span
        aria-hidden
        className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-secondary via-primary to-secondary"
      />
      <span
        aria-hidden
        className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-secondary/15 blur-3xl"
      />

      <div className="relative flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary/15 text-secondary">
            <UserCircle2 className="h-5 w-5" strokeWidth={2.2} />
          </span>
          <div>
            <span className="section-kicker">Setup</span>
            <h3 className="mt-1 font-display text-lg font-extrabold tracking-[-0.02em]">
              Complete your profile
            </h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Get 3× more load opportunities when your profile is complete.
            </p>
          </div>
        </div>
        <div className="text-right">
          <span className="font-display text-3xl font-black leading-none tracking-[-0.035em] text-secondary">
            {pct}%
          </span>
          <div className="mt-1 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            complete
          </div>
        </div>
      </div>

      <div className="relative mt-5 h-1.5 w-full overflow-hidden rounded-full bg-border">
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-primary to-secondary transition-[width] duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>

      <ul className="relative mt-5 space-y-1.5 text-sm">
        {missing.map((m) => (
          <li key={m.key}>
            <Link
              to="/onboarding"
              className="group flex items-center gap-3 rounded-lg px-2 py-1.5 transition-colors hover:bg-card"
            >
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-border bg-card text-muted-foreground/40">
                <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40" />
              </span>
              <span className="flex-1 text-foreground/85">{m.label}</span>
              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-foreground" />
            </Link>
          </li>
        ))}
        {missing.length === 0 && (
          <li className="flex items-center gap-2 px-2 py-1.5 text-[color:var(--success)]">
            <CheckCircle2 className="h-4 w-4" /> Profile is complete
          </li>
        )}
      </ul>
    </div>
  );
}
