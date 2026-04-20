import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuthStore } from "@/stores/authStore";
import { User, Mail, Phone, Building2, MapPin, ShieldCheck, LogOut, Crown, Settings, Bookmark, BarChart3 } from "lucide-react";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Profile — ZimFreight" },
      { name: "description", content: "Manage your ZimFreight account, plan and preferences." },
    ],
  }),
  component: ProfilePage,
});

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
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/15 text-primary">
          <User className="h-5 w-5" />
        </div>
        <h1 className="mt-4 font-display text-2xl font-black uppercase">Sign in to view your profile</h1>
        <Button asChild className="mt-6 bg-primary text-primary-foreground"><Link to="/">Back home</Link></Button>
      </div>
    );
  }

  const plan = subscription?.plan ?? "free";

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 md:py-10">
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/15 text-primary">
            <User className="h-7 w-7" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate font-display text-xl font-bold">{profile?.full_name || user.email}</div>
            <div className="mt-0.5 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
              <Badge variant="outline" className="capitalize">{profile?.role ?? "carrier"}</Badge>
              <Badge className="bg-primary/15 text-primary border-0 capitalize"><Crown className="mr-1 h-3 w-3" />{plan}</Badge>
              {profile?.verified && <Badge variant="outline" className="text-[color:var(--success)]"><ShieldCheck className="mr-1 h-3 w-3" />Verified</Badge>}
            </div>
          </div>
        </div>

        <dl className="mt-5 space-y-3 text-sm">
          <Row icon={Mail} label="Email" value={user.email ?? "—"} />
          <Row icon={Phone} label="WhatsApp" value={profile?.phone_whatsapp ?? "—"} />
          <Row icon={Building2} label="Company" value={profile?.company_name ?? "—"} />
          <Row icon={MapPin} label="City" value={profile?.city ?? "—"} />
        </dl>
      </div>

      <div className="mt-4 grid gap-2">
        <ProfileLink to="/dashboard" icon={BarChart3} label="Dashboard" />
        <ProfileLink to="/dashboard" icon={Bookmark} label="Saved loads" />
        <ProfileLink to="/pricing" icon={Crown} label={`Plan · ${plan}`} accent />
        <ProfileLink to="/onboarding" icon={Settings} label="Edit profile" />
      </div>

      <Button variant="outline" className="mt-6 w-full" onClick={signOut}>
        <LogOut className="mr-2 h-4 w-4" /> Sign out
      </Button>
    </div>
  );
}

function Row({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3">
      <Icon className="h-4 w-4 text-muted-foreground" />
      <span className="w-24 text-xs uppercase tracking-wider text-muted-foreground">{label}</span>
      <span className="flex-1 truncate text-foreground">{value}</span>
    </div>
  );
}

function ProfileLink({ to, icon: Icon, label, accent }: { to: "/dashboard" | "/pricing" | "/onboarding"; icon: React.ElementType; label: string; accent?: boolean }) {
  return (
    <Link
      to={to}
      className={`flex items-center justify-between rounded-lg border px-4 py-3 text-sm font-medium transition-colors ${accent ? "border-primary/30 bg-primary/5 text-primary hover:bg-primary/10" : "border-border bg-card hover:border-primary/40"}`}
    >
      <span className="inline-flex items-center gap-3"><Icon className="h-4 w-4" />{label}</span>
      <span>›</span>
    </Link>
  );
}