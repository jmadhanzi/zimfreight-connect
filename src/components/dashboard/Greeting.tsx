import { Link } from "@tanstack/react-router";
import type { Profile, Subscription } from "@/types";

export function Greeting({ profile, subscription }: { profile: Profile | null; subscription: Subscription | null }) {
  const hour = new Date().getHours();
  const part = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const first = profile?.full_name?.split(" ")[0] || "driver";
  const today = new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" });
  const plan = (subscription?.plan ?? "free").toUpperCase();
  const renews = subscription?.expires_at
    ? new Date(subscription.expires_at).toLocaleDateString("en-GB", { day: "numeric", month: "short" })
    : null;

  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="font-display text-3xl font-black uppercase tracking-tight md:text-4xl">
          {part}, {first} <span className="ml-1">👋</span>
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {today}{profile?.city ? ` · ${profile.city}` : ""}
        </p>
      </div>
      <div className="flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-xs">
        <span className="font-mono uppercase tracking-widest text-primary">{plan} plan</span>
        {renews && <span className="text-muted-foreground">· Renews {renews}</span>}
        <Link to="/pricing" className="ml-1 font-semibold text-primary hover:underline">
          Upgrade →
        </Link>
      </div>
    </div>
  );
}