import { Link } from "@tanstack/react-router";
import { ArrowRight, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Profile, Subscription } from "@/types";

export function Greeting({
  profile,
  subscription,
}: {
  profile: Profile | null;
  subscription: Subscription | null;
}) {
  const hour = new Date().getHours();
  const part = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const first = profile?.full_name?.split(" ")[0] || "there";
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
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div>
        <div className="text-xs font-medium text-muted-foreground">{today}</div>
        <h1 className="mt-1 font-display text-2xl font-bold tracking-tight md:text-3xl">
          {part}, {first}
        </h1>
        {profile?.city && (
          <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
            <span>{profile.city}</span>
          </div>
        )}
      </div>

      <Link
        to="/pricing"
        className={cn(
          "inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-xs font-medium transition-colors",
          isFree
            ? "border-border bg-muted text-muted-foreground hover:border-foreground/20 hover:text-foreground"
            : "border-border bg-card text-muted-foreground hover:border-foreground/20 hover:text-foreground",
        )}
      >
        {isFree && <Sparkles className="h-3 w-3" />}
        <span className="font-semibold">{plan}</span>
        {renews && (
          <>
            <span className="h-3 w-px bg-border" />
            <span>Renews {renews}</span>
          </>
        )}
        <ArrowRight className="h-3 w-3" />
      </Link>
    </div>
  );
}
