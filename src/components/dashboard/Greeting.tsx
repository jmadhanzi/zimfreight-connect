import { Link } from "@tanstack/react-router";
import type { Profile, Subscription } from "@/types";
import { ArrowRight, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export function Greeting({
  profile,
  subscription,
}: {
  profile: Profile | null;
  subscription: Subscription | null;
}) {
  const hour = new Date().getHours();
  const part = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const first = profile?.full_name?.split(" ")[0] || "driver";
  const today = new Date().toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
  const plan = (subscription?.plan ?? "free").toUpperCase();
  const renews = subscription?.expires_at
    ? new Date(subscription.expires_at).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
      })
    : null;
  const isFree = plan === "FREE";

  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <span className="section-kicker">{today}</span>
        <h1 className="mt-2 font-display text-3xl font-black tracking-[-0.04em] md:text-[2.5rem] md:leading-[1.05]">
          {part},{" "}
          <span className="bg-gradient-to-r from-foreground to-[color-mix(in_oklab,var(--foreground)_70%,var(--secondary))] bg-clip-text text-transparent">
            {first}
          </span>
        </h1>
        {profile?.city && (
          <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
            {profile.city}
          </p>
        )}
      </div>
      <Link
        to="/pricing"
        className={cn(
          "group inline-flex items-center gap-2.5 rounded-full border bg-card px-3 py-1.5 text-xs transition-colors",
          isFree
            ? "border-secondary/30 hover:border-secondary/60"
            : "border-border hover:border-foreground/15",
        )}
      >
        {isFree && <Sparkles className="h-3 w-3 text-secondary" />}
        <span className="flex items-center gap-2">
          <span className="font-mono font-semibold uppercase tracking-[0.18em] text-foreground">
            {plan}
          </span>
          {renews && (
            <>
              <span className="h-3 w-px bg-border" />
              <span className="text-muted-foreground">Renews {renews}</span>
            </>
          )}
        </span>
        <span className="inline-flex items-center gap-1 font-bold text-secondary">
          {isFree ? "Upgrade" : "Manage"}
          <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
        </span>
      </Link>
    </div>
  );
}
