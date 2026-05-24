import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuthStore } from "@/stores/authStore";
import {
  User,
  Mail,
  Phone,
  Building2,
  MapPin,
  ShieldCheck,
  LogOut,
  Crown,
  Settings,
  Bookmark,
  BarChart3,
  ChevronRight,
  Sparkles,
} from "lucide-react";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Profile — ZimFreight" },
      { name: "description", content: "Manage your ZimFreight account, plan and preferences." },
    ],
  }),
  component: ProfilePage,
});

const BOARD_SEARCH = {
  q: "",
  origin: "all",
  destination: "all",
  loadType: "all",
  equipment: "all",
  pickup: "",
  minRate: 0,
  maxDistance: 2000,
  border: false,
  zimra: false,
  urgent: false,
  minWeight: 0,
  maxWeight: 40,
  payment: "all",
  sort: "newest" as const,
  load: undefined as string | undefined,
};

function ProfilePage() {
  const { user, profile, subscription, loading } = useAuth();
  const navigate = useNavigate();

  const signOut = async () => {
    await supabase.auth.signOut();
    useAuthStore.getState().reset();
    navigate({ to: "/" });
  };

  if (loading) {
    return <div className="p-6 text-center text-muted-foreground">Loading…</div>;
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-muted text-muted-foreground">
          <User className="h-6 w-6" />
        </div>
        <h1 className="mt-5 font-display text-3xl font-bold tracking-[-0.035em]">
          Sign in to view your profile
        </h1>
        <Button asChild className="mt-6 rounded-full bg-primary text-primary-foreground">
          <Link to="/">Back home</Link>
        </Button>
      </div>
    );
  }

  const plan = subscription?.plan ?? "free";
  const planUpper = plan.toUpperCase();
  const isFree = plan === "free";
  const initial = (profile?.full_name || user.email || "U")[0].toUpperCase();

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 md:py-12">
      <span className="section-kicker">Account</span>
      <h1 className="mt-3 font-display text-3xl font-bold tracking-[-0.035em] md:text-4xl">
        Profile
      </h1>

      {/* Identity card */}
      <div className="relative mt-6 overflow-hidden rounded-lg border border-border/70 bg-card p-6">
        <span
          aria-hidden
          className="hidden"
        />
        <div className="flex items-center gap-4">
          <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-foreground font-display text-xl font-bold text-background">
            {initial}
            {profile?.verified && (
              <span
                aria-hidden
                className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-[color:var(--success)] text-white shadow-[0_2px_8px_-2px_color-mix(in_oklab,var(--success)_60%,transparent)]"
              >
                <ShieldCheck className="h-3.5 w-3.5" strokeWidth={2.5} />
              </span>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate font-display text-xl font-bold tracking-tight text-foreground">
              {profile?.full_name || user.email}
            </div>
            <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
              <span className="inline-flex items-center gap-1 rounded-md border border-border bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground inline-flex items-center gap-1 rounded-md border border-border bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground-navy uppercase">
                {profile?.role ?? "carrier"}
              </span>
              <span className={`inline-flex items-center gap-1 rounded-md border border-border bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground uppercase ${isFree ? "" : "inline-flex items-center gap-1 rounded-md border border-border bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground-amber"}`}>
                <Crown className="h-3 w-3" /> {planUpper}
              </span>
              {profile?.verified && (
                <span className="inline-flex items-center gap-1 rounded-md border border-[color:var(--success)]/20 bg-[color-mix(in_oklab,var(--success)_10%,transparent)] px-1.5 py-0.5 text-[10px] font-medium text-[color:var(--success)] uppercase">
                  <ShieldCheck className="h-3 w-3" /> Verified
                </span>
              )}
            </div>
          </div>
        </div>

        <dl className="mt-6 grid gap-3 border-t border-border pt-5 sm:grid-cols-2">
          <Row icon={Mail} label="Email" value={user.email ?? "—"} />
          <Row icon={Phone} label="WhatsApp" value={profile?.phone_whatsapp ?? "—"} />
          <Row icon={Building2} label="Company" value={profile?.company_name ?? "—"} />
          <Row icon={MapPin} label="City" value={profile?.city ?? "—"} />
        </dl>
      </div>

      {/* Upgrade banner — only when free */}
      {isFree && (
        <Link
          to="/pricing"
          className=" mt-4 flex items-center gap-3 overflow-hidden rounded-lg border border-border bg-muted/30 p-4 transition-colors hover:border-foreground/20"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-secondary text-secondary-foreground shadow-[0_4px_12px_-2px_color-mix(in_oklab,var(--secondary)_60%,transparent)]">
            <Sparkles className="h-4 w-4" strokeWidth={2.5} />
          </span>
          <div className="min-w-0 flex-1">
            <div className="font-display text-sm font-bold tracking-tight text-foreground">
              Unlock broker contacts
            </div>
            <div className="text-[11px] text-muted-foreground">
              Upgrade to Basic for $19/mo and see all WhatsApp numbers.
            </div>
          </div>
          <ChevronRight className="h-4 w-4 text-secondary" />
        </Link>
      )}

      {/* Nav links */}
      <nav className="mt-4 grid gap-2">
        <ProfileLink
          kind="dashboard"
          icon={BarChart3}
          label="Dashboard"
          desc="Loads, bookings and rates"
        />
        <ProfileLink
          kind="board"
          icon={Bookmark}
          label="Saved loads"
          desc="Your bookmarked corridors"
        />
        <ProfileLink
          kind="pricing"
          icon={Crown}
          label={`Plan · ${planUpper}`}
          desc={isFree ? "Upgrade to unlock contacts" : "Manage billing"}
          accent
        />
        <ProfileLink
          kind="onboarding"
          icon={Settings}
          label="Edit profile"
          desc="Update routes and preferences"
        />
      </nav>

      <Button variant="outline" className="mt-6 w-full rounded-full" onClick={signOut}>
        <LogOut className="mr-2 h-4 w-4" /> Sign out
      </Button>
    </div>
  );
}

function Row({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
      <div className="min-w-0">
        <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          {label}
        </div>
        <div className="mt-0.5 truncate text-sm text-foreground">{value}</div>
      </div>
    </div>
  );
}

type LinkKind = "dashboard" | "pricing" | "onboarding" | "board";

function ProfileLink({
  kind,
  icon: Icon,
  label,
  desc,
  accent,
}: {
  kind: LinkKind;
  icon: React.ElementType;
  label: string;
  desc?: string;
  accent?: boolean;
}) {
  const inner = (
    <>
      <span
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
          accent ? "bg-secondary/15 text-secondary" : "bg-primary/10 text-primary"
        }`}
      >
        <Icon className="h-4 w-4" strokeWidth={2.4} />
      </span>
      <div className="min-w-0 flex-1">
        <div className="font-display text-sm font-bold tracking-tight text-foreground">{label}</div>
        {desc && <div className="text-[11px] text-muted-foreground">{desc}</div>}
      </div>
      <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-foreground" />
    </>
  );

  const className = ` group flex items-center gap-3 rounded-lg border border-border/70 bg-card p-3.5 transition-colors hover:border-foreground/15`;

  if (kind === "board") {
    return (
      <Link to="/board" search={BOARD_SEARCH} className={className}>
        {inner}
      </Link>
    );
  }
  if (kind === "dashboard")
    return (
      <Link to="/dashboard" className={className}>
        {inner}
      </Link>
    );
  if (kind === "pricing")
    return (
      <Link to="/pricing" className={className}>
        {inner}
      </Link>
    );
  return (
    <Link to="/onboarding" className={className}>
      {inner}
    </Link>
  );
}
