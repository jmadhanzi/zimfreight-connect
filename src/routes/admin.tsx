import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { db } from "@/lib/db";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { cn, formatUSD } from "@/lib/utils";
import {
  ShieldCheck, Users, DollarSign, TrendingUp, Clock, Check, X,
  ShieldAlert, Loader2, Activity, RefreshCw, Search, UserCog,
} from "lucide-react";
import type { PlanTier } from "@/types";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin — ZimFreight" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminPage,
});

/* Plan prices (USD/mo) — keep in sync with /pricing */
const PLAN_PRICE: Record<PlanTier, number> = { free: 0, basic: 19, pro: 49, fleet: 99 };

function AdminPage() {
  const { user, loading } = useAuth();

  // Admin check
  const { data: isAdmin, isLoading: roleLoading } = useQuery({
    queryKey: ["admin", "is-admin", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await db
        .from("user_roles")
        .select("role")
        .eq("user_id", user!.id)
        .eq("role", "admin")
        .maybeSingle();
      if (error) throw error;
      return !!data;
    },
  });

  if (loading || roleLoading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-10">
        <Skeleton className="h-8 w-64" />
        <div className="mt-6 grid gap-4 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24" />)}
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <Gate
        icon={<ShieldAlert className="h-6 w-6" />}
        title="Sign in required"
        body="The admin panel is only available to ZimFreight staff."
        cta={<Button asChild className="bg-primary text-primary-foreground"><Link to="/">Back to home</Link></Button>}
      />
    );
  }

  if (!isAdmin) {
    return (
      <Gate
        icon={<ShieldAlert className="h-6 w-6 text-destructive" />}
        title="403 — Admins only"
        body="Your account doesn't have admin privileges. If this is a mistake, contact the team."
        cta={<Button asChild variant="outline"><Link to="/dashboard">Go to dashboard</Link></Button>}
      />
    );
  }

  return <AdminDashboard />;
}

function Gate({ icon, title, body, cta }: { icon: React.ReactNode; title: string; body: string; cta: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-md px-4 py-20 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">{icon}</div>
      <h1 className="mt-4 font-display text-3xl font-black uppercase tracking-tight">{title}</h1>
      <p className="mt-2 text-sm text-muted-foreground">{body}</p>
      <div className="mt-6">{cta}</div>
    </div>
  );
}

/* --------------------------- Dashboard --------------------------- */

function AdminDashboard() {
  const qc = useQueryClient();
  const [tab, setTab] = useState<"overview" | "users">("overview");

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-6 md:py-10">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <span className="font-mono text-xs uppercase tracking-widest text-primary">
            <ShieldCheck className="mr-1 inline h-3.5 w-3.5" /> Admin
          </span>
          <h1 className="mt-1 font-display text-3xl font-black uppercase tracking-tight md:text-4xl">Operations</h1>
          <p className="mt-1 text-sm text-muted-foreground">MRR, daily activity, and EcoCash payment approvals.</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => qc.invalidateQueries()}>
          <RefreshCw className="mr-1.5 h-3.5 w-3.5" /> Refresh
        </Button>
      </div>

      <div className="mt-6 inline-flex rounded-lg border border-border bg-card p-1">
        {([
          { id: "overview", label: "Overview", icon: <Activity className="h-3.5 w-3.5" /> },
          { id: "users", label: "Users", icon: <UserCog className="h-3.5 w-3.5" /> },
        ] as const).map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 font-mono text-[11px] uppercase tracking-widest transition-colors",
              tab === t.id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {tab === "overview" ? (
        <>
          <KpiRow />
          <div className="mt-6 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
            <DauChart />
            <PlanBreakdown />
          </div>
          <ApprovalQueue />
        </>
      ) : (
        <UsersTab />
      )}
    </div>
  );
}

/* --------------------------- KPIs --------------------------- */

function KpiRow() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "kpis"],
    queryFn: async () => {
      const since = new Date(Date.now() - 30 * 86400_000).toISOString();
      const [{ data: subs, error: e1 }, { count: usersCount, error: e2 }, { count: loadsCount, error: e3 }, { count: pending, error: e4 }] = await Promise.all([
        db.from("subscriptions").select("plan,status").eq("status", "active"),
        db.from("profiles").select("*", { count: "exact", head: true }),
        db.from("loads").select("*", { count: "exact", head: true }).gte("created_at", since),
        db.from("subscriptions").select("*", { count: "exact", head: true }).eq("status", "pending"),
      ]);
      if (e1 || e2 || e3 || e4) throw e1 ?? e2 ?? e3 ?? e4;
      const mrr = (subs ?? []).reduce((sum: number, s: { plan: string }) => sum + (PLAN_PRICE[s.plan as PlanTier] ?? 0), 0);
      const paying = (subs ?? []).filter((s: { plan: string }) => (PLAN_PRICE[s.plan as PlanTier] ?? 0) > 0).length;
      return { mrr, paying, totalUsers: usersCount ?? 0, loads30d: loadsCount ?? 0, pending: pending ?? 0 };
    },
  });

  return (
    <div className="mt-6 grid gap-3 md:grid-cols-4">
      <Kpi label="MRR" value={isLoading ? "—" : formatUSD(data?.mrr ?? 0)} sub={`${data?.paying ?? 0} paying`} icon={<DollarSign className="h-4 w-4" />} accent />
      <Kpi label="Total users" value={isLoading ? "—" : String(data?.totalUsers ?? 0)} sub="all-time signups" icon={<Users className="h-4 w-4" />} />
      <Kpi label="Loads (30d)" value={isLoading ? "—" : String(data?.loads30d ?? 0)} sub="posted last 30 days" icon={<TrendingUp className="h-4 w-4" />} />
      <Kpi label="Pending payments" value={isLoading ? "—" : String(data?.pending ?? 0)} sub="awaiting approval" icon={<Clock className="h-4 w-4" />} warn={!!data?.pending} />
    </div>
  );
}

function Kpi({ label, value, sub, icon, accent, warn }: { label: string; value: string; sub: string; icon: React.ReactNode; accent?: boolean; warn?: boolean }) {
  return (
    <div className={cn(
      "rounded-lg border bg-card p-4",
      accent && "border-primary/30 bg-gradient-to-b from-primary/10 to-card",
      warn && "border-[color:var(--zim-yellow)]/40 bg-[color:var(--zim-yellow)]/5",
    )}>
      <div className="flex items-center justify-between">
        <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{label}</span>
        <span className={cn("text-muted-foreground", accent && "text-primary", warn && "text-[color:var(--zim-yellow)]")}>{icon}</span>
      </div>
      <div className={cn("mt-1 font-display text-3xl font-black tabular-nums", accent && "text-primary")}>{value}</div>
      <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{sub}</div>
    </div>
  );
}

/* --------------------------- DAU chart --------------------------- */

function DauChart() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "dau"],
    queryFn: async () => {
      const since = new Date(Date.now() - 30 * 86400_000).toISOString();
      // Use load_views as an activity proxy (per-user per-day)
      const { data: rows, error } = await db
        .from("load_views")
        .select("viewer_id,created_at")
        .gte("created_at", since)
        .limit(5000);
      if (error) throw error;
      const byDay = new Map<string, Set<string>>();
      const start = new Date(); start.setHours(0, 0, 0, 0);
      for (let i = 29; i >= 0; i--) {
        const d = new Date(start.getTime() - i * 86400_000);
        byDay.set(d.toISOString().slice(0, 10), new Set());
      }
      for (const r of rows ?? []) {
        const day = (r.created_at as string).slice(0, 10);
        const set = byDay.get(day);
        if (set) set.add(r.viewer_id as string);
      }
      return Array.from(byDay.entries()).map(([day, users]) => ({ day, dau: users.size }));
    },
  });

  const max = Math.max(1, ...(data?.map(d => d.dau) ?? [1]));
  const today = data?.[data.length - 1]?.dau ?? 0;
  const prev = data?.[data.length - 2]?.dau ?? 0;
  const delta = today - prev;

  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <div className="flex items-end justify-between gap-3">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            <Activity className="mr-1 inline h-3 w-3" /> Daily active users · last 30 days
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="font-display text-3xl font-black tabular-nums">{today}</span>
            <span className={cn("font-mono text-xs", delta >= 0 ? "text-[color:var(--success)]" : "text-destructive")}>
              {delta >= 0 ? "+" : ""}{delta} vs yesterday
            </span>
          </div>
        </div>
      </div>
      {isLoading ? (
        <Skeleton className="mt-4 h-32 w-full" />
      ) : (
        <div className="mt-4 flex h-32 items-end gap-[3px]">
          {data?.map((d, i) => (
            <div key={d.day} className="group relative flex-1">
              <div
                className={cn(
                  "w-full rounded-t-sm transition-colors",
                  i === data.length - 1 ? "bg-primary" : "bg-primary/35 hover:bg-primary/60",
                )}
                style={{ height: `${(d.dau / max) * 100}%`, minHeight: d.dau > 0 ? 2 : 0 }}
                title={`${d.day}: ${d.dau} DAU`}
              />
            </div>
          ))}
        </div>
      )}
      <div className="mt-2 flex justify-between font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
        <span>{data?.[0]?.day.slice(5)}</span>
        <span>Today</span>
      </div>
    </div>
  );
}

/* --------------------------- Plan breakdown --------------------------- */

function PlanBreakdown() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "plans"],
    queryFn: async () => {
      const { data: rows, error } = await db
        .from("subscriptions")
        .select("plan,status")
        .eq("status", "active");
      if (error) throw error;
      const counts: Record<PlanTier, number> = { free: 0, basic: 0, pro: 0, fleet: 0 };
      for (const r of rows ?? []) counts[r.plan as PlanTier] = (counts[r.plan as PlanTier] ?? 0) + 1;
      return counts;
    },
  });
  const total = useMemo(() => Object.values(data ?? {}).reduce((a, b) => a + b, 0) || 1, [data]);

  const tiers: { tier: PlanTier; color: string; label: string }[] = [
    { tier: "free", color: "bg-muted-foreground/40", label: "Free" },
    { tier: "basic", color: "bg-primary/60", label: "Basic" },
    { tier: "pro", color: "bg-primary", label: "Pro" },
    { tier: "fleet", color: "bg-[color:var(--zim-yellow)]", label: "Fleet" },
  ];

  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Active plans</div>
      {isLoading ? (
        <Skeleton className="mt-4 h-32 w-full" />
      ) : (
        <div className="mt-4 space-y-3">
          {tiers.map(({ tier, color, label }) => {
            const n = data?.[tier] ?? 0;
            const pct = (n / total) * 100;
            return (
              <div key={tier}>
                <div className="flex items-center justify-between text-sm">
                  <span>{label}</span>
                  <span className="font-mono-num text-muted-foreground">{n} <span className="text-[10px]">({pct.toFixed(0)}%)</span></span>
                </div>
                <div className="mt-1 h-2 overflow-hidden rounded-full bg-muted/40">
                  <div className={cn("h-full transition-all", color)} style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* --------------------------- EcoCash approval queue --------------------------- */

type PendingRow = {
  id: string;
  user_id: string;
  plan: PlanTier;
  ecocash_ref: string | null;
  created_at: string;
  profile: { full_name: string; company_name: string | null; phone_whatsapp: string | null } | null;
};

function ApprovalQueue() {
  const qc = useQueryClient();
  const [busyId, setBusyId] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "pending-subs"],
    queryFn: async () => {
      const { data: subs, error } = await db
        .from("subscriptions")
        .select("id,user_id,plan,ecocash_ref,created_at")
        .eq("status", "pending")
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      const ids = (subs ?? []).map((s: { user_id: string }) => s.user_id);
      let profilesById = new Map<string, PendingRow["profile"]>();
      if (ids.length) {
        const { data: profs } = await db
          .from("profiles")
          .select("user_id,full_name,company_name,phone_whatsapp")
          .in("user_id", ids);
        profilesById = new Map((profs ?? []).map((p: { user_id: string; full_name: string; company_name: string | null; phone_whatsapp: string | null }) => [p.user_id, {
          full_name: p.full_name as string,
          company_name: (p.company_name as string | null) ?? null,
          phone_whatsapp: (p.phone_whatsapp as string | null) ?? null,
        }]));
      }
      return (subs ?? []).map((s: { id: string; user_id: string; plan: string; ecocash_ref: string | null; created_at: string }) => ({ ...s, profile: profilesById.get(s.user_id) ?? null })) as PendingRow[];
    },
  });

  const approve = useMutation({
    mutationFn: async ({ id, plan }: { id: string; plan: PlanTier }) => {
      const expires = new Date(Date.now() + 30 * 86400_000).toISOString();
      const { error } = await db.from("subscriptions").update({
        status: "active", expires_at: expires, plan,
      }).eq("id", id);
      if (error) throw error;
    },
    onMutate: ({ id }) => setBusyId(id),
    onSettled: () => setBusyId(null),
    onSuccess: () => {
      toast.success("Payment approved");
      qc.invalidateQueries({ queryKey: ["admin"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Approval failed"),
  });

  const reject = useMutation({
    mutationFn: async ({ id }: { id: string }) => {
      const { error } = await db.from("subscriptions").update({ status: "expired" }).eq("id", id);
      if (error) throw error;
    },
    onMutate: ({ id }) => setBusyId(id),
    onSettled: () => setBusyId(null),
    onSuccess: () => {
      toast.success("Payment rejected");
      qc.invalidateQueries({ queryKey: ["admin"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Reject failed"),
  });

  // Realtime: refresh queue when a new pending sub arrives
  useEffect(() => {
    const ch = db.channel("admin-subs")
      .on("postgres_changes", { event: "*", schema: "public", table: "subscriptions" }, () => {
        qc.invalidateQueries({ queryKey: ["admin"] });
      })
      .subscribe();
    return () => { void db.removeChannel(ch); };
  }, [qc]);

  return (
    <div className="mt-6 rounded-lg border border-border bg-card">
      <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-4">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">EcoCash approvals</div>
          <div className="font-display text-lg font-black uppercase tracking-tight">Pending payments {data?.length ? <Badge className="ml-2 border-0 bg-[color:var(--zim-yellow)] text-background">{data.length}</Badge> : null}</div>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-2 p-5">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16" />)}
        </div>
      ) : !data || data.length === 0 ? (
        <div className="px-5 py-12 text-center text-sm text-muted-foreground">
          <Check className="mx-auto mb-2 h-6 w-6 text-[color:var(--success)]" />
          All caught up — no pending payments.
        </div>
      ) : (
        <ul className="divide-y divide-border">
          {data.map(row => {
            const price = PLAN_PRICE[row.plan] ?? 0;
            const ageMin = Math.floor((Date.now() - new Date(row.created_at).getTime()) / 60000);
            const age = ageMin < 60 ? `${ageMin}m` : ageMin < 1440 ? `${Math.floor(ageMin / 60)}h` : `${Math.floor(ageMin / 1440)}d`;
            const busy = busyId === row.id;
            return (
              <li key={row.id} className="flex flex-wrap items-center gap-4 px-5 py-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-display text-base font-bold">{row.profile?.full_name || "Unknown user"}</span>
                    <Badge variant="outline" className="text-[10px] uppercase">{row.plan}</Badge>
                    <span className="font-mono text-[10px] text-muted-foreground">{age} ago</span>
                  </div>
                  <div className="mt-0.5 truncate text-xs text-muted-foreground">
                    {row.profile?.company_name ?? "—"}{row.profile?.phone_whatsapp ? ` · ${row.profile.phone_whatsapp}` : ""}
                  </div>
                  <div className="mt-1 font-mono text-xs">
                    Ref: <span className="text-foreground">{row.ecocash_ref || <span className="text-destructive">missing</span>}</span>
                  </div>
                </div>
                <div className="font-display text-xl font-black text-primary">{formatUSD(price)}</div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" disabled={busy} onClick={() => reject.mutate({ id: row.id })}>
                    {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <X className="h-3.5 w-3.5" />}
                    <span className="ml-1">Reject</span>
                  </Button>
                  <Button size="sm" disabled={busy} className="bg-[color:var(--success)] text-background hover:bg-[color:var(--success)]/90"
                    onClick={() => approve.mutate({ id: row.id, plan: row.plan })}>
                    {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                    <span className="ml-1">Approve</span>
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

/* --------------------------- Users tab --------------------------- */

type AppRole = "admin" | "moderator" | "user";

type UserRow = {
  user_id: string;
  full_name: string;
  company_name: string | null;
  city: string | null;
  phone_whatsapp: string | null;
  created_at: string;
  plan: PlanTier;
  sub_status: string;
  roles: AppRole[];
};

function UsersTab() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [busy, setBusy] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "users"],
    queryFn: async () => {
      const [{ data: profiles, error: e1 }, { data: subs, error: e2 }, { data: roles, error: e3 }] = await Promise.all([
        db.from("profiles").select("user_id,full_name,company_name,city,phone_whatsapp,created_at").order("created_at", { ascending: false }).limit(500),
        db.from("subscriptions").select("user_id,plan,status,created_at").order("created_at", { ascending: false }),
        db.from("user_roles").select("user_id,role"),
      ]);
      if (e1 || e2 || e3) throw e1 ?? e2 ?? e3;
      const subByUser = new Map<string, { plan: PlanTier; status: string }>();
      for (const s of subs ?? []) {
        if (!subByUser.has(s.user_id)) subByUser.set(s.user_id, { plan: s.plan as PlanTier, status: s.status as string });
      }
      const rolesByUser = new Map<string, AppRole[]>();
      for (const r of roles ?? []) {
        const arr = rolesByUser.get(r.user_id) ?? [];
        arr.push(r.role as AppRole);
        rolesByUser.set(r.user_id, arr);
      }
      return (profiles ?? []).map((p: { user_id: string; full_name: string; company_name: string | null; city: string | null; phone_whatsapp: string | null; created_at: string }) => ({
        user_id: p.user_id,
        full_name: p.full_name,
        company_name: p.company_name,
        city: p.city,
        phone_whatsapp: p.phone_whatsapp,
        created_at: p.created_at,
        plan: subByUser.get(p.user_id)?.plan ?? "free",
        sub_status: subByUser.get(p.user_id)?.status ?? "—",
        roles: rolesByUser.get(p.user_id) ?? [],
      })) as UserRow[];
    },
  });

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return data ?? [];
    return (data ?? []).filter(u =>
      u.full_name?.toLowerCase().includes(q) ||
      u.company_name?.toLowerCase().includes(q) ||
      u.city?.toLowerCase().includes(q) ||
      u.phone_whatsapp?.toLowerCase().includes(q) ||
      u.user_id.toLowerCase().includes(q)
    );
  }, [data, search]);

  const toggleRole = useMutation({
    mutationFn: async ({ userId, role, hasRole }: { userId: string; role: AppRole; hasRole: boolean }) => {
      if (hasRole) {
        const { error } = await db.from("user_roles").delete().eq("user_id", userId).eq("role", role);
        if (error) throw error;
      } else {
        const { error } = await db.from("user_roles").insert({ user_id: userId, role });
        if (error) throw error;
      }
    },
    onMutate: ({ userId, role }) => setBusy(`${userId}:${role}`),
    onSettled: () => setBusy(null),
    onSuccess: (_d, vars) => {
      toast.success(vars.hasRole ? `Revoked ${vars.role}` : `Granted ${vars.role}`);
      qc.invalidateQueries({ queryKey: ["admin", "users"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Role update failed"),
  });

  const planClass = (plan: PlanTier) =>
    plan === "fleet" ? "bg-[color:var(--zim-yellow)]/15 text-[color:var(--zim-yellow)] border-[color:var(--zim-yellow)]/30"
    : plan === "pro" ? "bg-primary/15 text-primary border-primary/30"
    : plan === "basic" ? "bg-primary/10 text-primary/80 border-primary/20"
    : "bg-muted text-muted-foreground border-border";

  return (
    <div className="mt-6 rounded-lg border border-border bg-card">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-4">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Users</div>
          <div className="font-display text-lg font-black uppercase tracking-tight">
            Manage roles {data?.length ? <span className="ml-2 font-mono text-xs text-muted-foreground">{filtered.length}/{data.length}</span> : null}
          </div>
        </div>
        <div className="relative w-full max-w-xs">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search name, company, city, phone…"
            className="h-9 w-full rounded-md border border-border bg-background pl-8 pr-3 text-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-2 p-5">
          {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-14" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="px-5 py-12 text-center text-sm text-muted-foreground">No users match your search.</div>
      ) : (
        <ul className="divide-y divide-border">
          {filtered.map(u => {
            const isAdmin = u.roles.includes("admin");
            const isMod = u.roles.includes("moderator");
            const adminBusy = busy === `${u.user_id}:admin`;
            const modBusy = busy === `${u.user_id}:moderator`;
            return (
              <li key={u.user_id} className="flex flex-wrap items-center gap-4 px-5 py-3.5">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-display text-sm font-bold">{u.full_name || "Unnamed"}</span>
                    <Badge variant="outline" className={cn("text-[10px] uppercase", planClass(u.plan))}>{u.plan}</Badge>
                    {u.sub_status === "pending" && <Badge variant="outline" className="border-[color:var(--zim-yellow)]/40 text-[10px] uppercase text-[color:var(--zim-yellow)]">pending</Badge>}
                    {isAdmin && <Badge className="border-0 bg-primary text-[10px] uppercase text-primary-foreground"><ShieldCheck className="mr-0.5 h-2.5 w-2.5" />admin</Badge>}
                    {isMod && <Badge className="border-0 bg-secondary text-[10px] uppercase">mod</Badge>}
                  </div>
                  <div className="mt-0.5 truncate text-xs text-muted-foreground">
                    {u.company_name ?? "—"}{u.city ? ` · ${u.city}` : ""}{u.phone_whatsapp ? ` · ${u.phone_whatsapp}` : ""}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant={isMod ? "default" : "outline"}
                    disabled={modBusy}
                    onClick={() => toggleRole.mutate({ userId: u.user_id, role: "moderator", hasRole: isMod })}
                  >
                    {modBusy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <UserCog className="h-3.5 w-3.5" />}
                    <span className="ml-1">{isMod ? "Revoke mod" : "Grant mod"}</span>
                  </Button>
                  <Button
                    size="sm"
                    variant={isAdmin ? "default" : "outline"}
                    disabled={adminBusy}
                    className={isAdmin ? "bg-primary text-primary-foreground hover:bg-primary/90" : ""}
                    onClick={() => toggleRole.mutate({ userId: u.user_id, role: "admin", hasRole: isAdmin })}
                  >
                    {adminBusy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ShieldCheck className="h-3.5 w-3.5" />}
                    <span className="ml-1">{isAdmin ? "Revoke admin" : "Grant admin"}</span>
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}