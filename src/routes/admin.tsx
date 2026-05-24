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
  ShieldCheck,
  Users,
  DollarSign,
  TrendingUp,
  Clock,
  Check,
  X,
  ShieldAlert,
  Loader2,
  Activity,
  RefreshCw,
  Search,
  UserCog,
  ScrollText,
} from "lucide-react";
import type { PlanTier } from "@/types";
import { supabase } from "@/integrations/supabase/client";

/* Best-effort audit logger — never blocks the action it records. */
async function logAudit(
  action: string,
  targetUserId: string | null,
  details: Record<string, unknown> = {},
) {
  try {
    const {
      data: { user: actor },
    } = await supabase.auth.getUser();
    if (!actor?.id) return;
    await db.from("admin_audit_log").insert({
      actor_id: actor.id,
      target_user_id: targetUserId,
      action,
      details,
    });
  } catch (e) {
    console.warn("audit log failed", e);
  }
}

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [{ title: "Admin — ZimFreight" }, { name: "robots", content: "noindex, nofollow" }],
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
      // Dev bypass: skip the user_roles lookup entirely in `bun run dev`.
      if (import.meta.env.DEV) return true;
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
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
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
        cta={
          <Button asChild className="bg-primary text-primary-foreground">
            <Link to="/">Back to home</Link>
          </Button>
        }
      />
    );
  }

  if (!isAdmin) {
    return (
      <Gate
        icon={<ShieldAlert className="h-6 w-6 text-destructive" />}
        title="403 — Admins only"
        body="Your account doesn't have admin privileges. If this is a mistake, contact the team."
        cta={
          <Button asChild variant="outline">
            <Link to="/dashboard">Go to dashboard</Link>
          </Button>
        }
      />
    );
  }

  return <AdminDashboard />;
}

function Gate({
  icon,
  title,
  body,
  cta,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
  cta: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-md px-4 py-20 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
        {icon}
      </div>
      <span className="section-kicker mx-auto mt-5 justify-center">Restricted</span>
      <h1 className="mt-3 font-display text-3xl font-bold tracking-[-0.035em]">{title}</h1>
      <p className="mt-3 text-sm text-muted-foreground">{body}</p>
      <div className="mt-6">{cta}</div>
    </div>
  );
}

/* --------------------------- Dashboard --------------------------- */

function AdminDashboard() {
  const qc = useQueryClient();
  const [tab, setTab] = useState<"overview" | "users" | "audit">("overview");

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-6 md:py-10">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <span className="section-kicker">
            <ShieldCheck className="h-3 w-3" /> Admin
          </span>
          <h1 className="mt-3 font-display text-3xl font-bold tracking-[-0.04em] md:text-4xl">
            Operations
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            MRR, daily activity, and EcoCash payment approvals.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => qc.invalidateQueries()}
          className="rounded-full"
        >
          <RefreshCw className="mr-1.5 h-3.5 w-3.5" /> Refresh
        </Button>
      </div>

      <div className="mt-6 inline-flex rounded-full border border-border/70 bg-muted/50 p-1">
        {(
          [
            { id: "overview", label: "Overview", icon: <Activity className="h-3.5 w-3.5" /> },
            { id: "users", label: "Users", icon: <UserCog className="h-3.5 w-3.5" /> },
            { id: "audit", label: "Audit log", icon: <ScrollText className="h-3.5 w-3.5" /> },
          ] as const
        ).map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.16em] transition-all",
              tab === t.id
                ? "bg-card text-foreground shadow-[0_1px_0_color-mix(in_oklab,var(--foreground)_8%,transparent),0_2px_4px_-1px_color-mix(in_oklab,var(--foreground)_10%,transparent)]"
                : "text-muted-foreground hover:text-foreground",
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
      ) : tab === "users" ? (
        <UsersTab />
      ) : (
        <AuditLogTab />
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
      const [
        { data: subs, error: e1 },
        { count: usersCount, error: e2 },
        { count: loadsCount, error: e3 },
        { count: pending, error: e4 },
      ] = await Promise.all([
        db.from("subscriptions").select("plan,status").eq("status", "active"),
        db.from("profiles").select("*", { count: "exact", head: true }),
        db.from("loads").select("*", { count: "exact", head: true }).gte("created_at", since),
        db
          .from("subscriptions")
          .select("*", { count: "exact", head: true })
          .eq("status", "pending"),
      ]);
      if (e1 || e2 || e3 || e4) throw e1 ?? e2 ?? e3 ?? e4;
      const mrr = (subs ?? []).reduce(
        (sum: number, s: { plan: string }) => sum + (PLAN_PRICE[s.plan as PlanTier] ?? 0),
        0,
      );
      const paying = (subs ?? []).filter(
        (s: { plan: string }) => (PLAN_PRICE[s.plan as PlanTier] ?? 0) > 0,
      ).length;
      return {
        mrr,
        paying,
        totalUsers: usersCount ?? 0,
        loads30d: loadsCount ?? 0,
        pending: pending ?? 0,
      };
    },
  });

  return (
    <div className="mt-6 grid gap-3 md:grid-cols-4">
      <Kpi
        label="MRR"
        value={isLoading ? "—" : formatUSD(data?.mrr ?? 0)}
        sub={`${data?.paying ?? 0} paying`}
        icon={<DollarSign className="h-4 w-4" />}
        accent
      />
      <Kpi
        label="Total users"
        value={isLoading ? "—" : String(data?.totalUsers ?? 0)}
        sub="all-time signups"
        icon={<Users className="h-4 w-4" />}
      />
      <Kpi
        label="Loads (30d)"
        value={isLoading ? "—" : String(data?.loads30d ?? 0)}
        sub="posted last 30 days"
        icon={<TrendingUp className="h-4 w-4" />}
      />
      <Kpi
        label="Pending payments"
        value={isLoading ? "—" : String(data?.pending ?? 0)}
        sub="awaiting approval"
        icon={<Clock className="h-4 w-4" />}
        warn={!!data?.pending}
      />
    </div>
  );
}

function Kpi({
  label,
  value,
  sub,
  icon,
  accent,
  warn,
}: {
  label: string;
  value: string;
  sub: string;
  icon: React.ReactNode;
  accent?: boolean;
  warn?: boolean;
}) {
  const stripClass = accent
    ? "bg-foreground"
    : warn
      ? "bg-foreground"
      : "bg-border";
  return (
    <div className=" relative overflow-hidden rounded-lg border border-border/70 bg-card p-5 pt-[18px]">
      <span aria-hidden className={cn("absolute inset-x-0 top-0 h-[3px]", stripClass)} />
      <div className="flex items-center justify-between">
        <span className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
          {label}
        </span>
        <span
          className={cn(
            "flex h-7 w-7 items-center justify-center rounded-md",
            accent
              ? "bg-secondary/15 text-secondary"
              : warn
                ? "bg-[color-mix(in_oklab,var(--warning)_18%,transparent)] text-[color-mix(in_oklab,var(--warning)_70%,var(--foreground))]"
                : "bg-primary/10 text-primary",
          )}
        >
          {icon}
        </span>
      </div>
      <div
        className={cn(
          "mt-3 font-display text-3xl font-bold leading-none tracking-[-0.035em] tabular-nums",
          accent
            ? "text-secondary"
            : warn
              ? "text-[color-mix(in_oklab,var(--warning)_70%,var(--foreground))]"
              : "text-foreground",
        )}
      >
        {value}
      </div>
      <div className="mt-2 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
        {sub}
      </div>
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
      const start = new Date();
      start.setHours(0, 0, 0, 0);
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

  const max = Math.max(1, ...(data?.map((d) => d.dau) ?? [1]));
  const today = data?.[data.length - 1]?.dau ?? 0;
  const prev = data?.[data.length - 2]?.dau ?? 0;
  const delta = today - prev;

  return (
    <div className="rounded-lg border border-border/70 bg-card p-6">
      <div className="flex items-end justify-between gap-3">
        <div>
          <span className="section-kicker">
            <Activity className="h-3 w-3" /> DAU
          </span>
          <h2 className="mt-2 font-display text-base font-bold tracking-[-0.02em] text-foreground">
            Daily active users{" "}
            <span className="font-normal text-muted-foreground">· last 30 days</span>
          </h2>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-display text-4xl font-bold leading-none tracking-[-0.04em] tabular-nums text-foreground">
              {today}
            </span>
            <span
              className={cn(
                "inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 font-mono text-[10px] font-bold tabular-nums",
                delta >= 0
                  ? "bg-[color-mix(in_oklab,var(--success)_12%,transparent)] text-[color:var(--success)]"
                  : "bg-destructive/12 text-destructive",
              )}
            >
              {delta >= 0 ? "+" : ""}
              {delta} vs yest.
            </span>
          </div>
        </div>
      </div>
      {isLoading ? (
        <Skeleton className="mt-5 h-32 w-full rounded-xl" />
      ) : (
        <div className="mt-5 flex h-32 items-end gap-[3px]">
          {data?.map((d, i) => (
            <div key={d.day} className="group relative flex-1">
              <div
                className={cn(
                  "w-full rounded-t-md transition-all",
                  i === data.length - 1
                    ? "bg-foreground"
                    : "bg-primary/30 group-hover:bg-primary/55",
                )}
                style={{ height: `${(d.dau / max) * 100}%`, minHeight: d.dau > 0 ? 2 : 0 }}
                title={`${d.day}: ${d.dau} DAU`}
              />
            </div>
          ))}
        </div>
      )}
      <div className="mt-3 flex justify-between font-mono text-[9px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
        <span>{data?.[0]?.day.slice(5)}</span>
        <span className="text-foreground">Today</span>
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
      for (const r of rows ?? [])
        counts[r.plan as PlanTier] = (counts[r.plan as PlanTier] ?? 0) + 1;
      return counts;
    },
  });
  const total = useMemo(() => Object.values(data ?? {}).reduce((a, b) => a + b, 0) || 1, [data]);

  const tiers: { tier: PlanTier; color: string; label: string }[] = [
    { tier: "free", color: "bg-muted-foreground/40", label: "Free" },
    { tier: "basic", color: "bg-primary/60", label: "Basic" },
    { tier: "pro", color: "bg-secondary/80", label: "Pro" },
    { tier: "fleet", color: "bg-secondary", label: "Fleet" },
  ];

  return (
    <div className="rounded-lg border border-border/70 bg-card p-6">
      <span className="section-kicker">Plans</span>
      <h2 className="mt-2 font-display text-base font-bold tracking-[-0.02em] text-foreground">
        Active subscriptions
      </h2>
      {isLoading ? (
        <Skeleton className="mt-5 h-32 w-full rounded-xl" />
      ) : (
        <div className="mt-5 space-y-3.5">
          {tiers.map(({ tier, color, label }) => {
            const n = data?.[tier] ?? 0;
            const pct = (n / total) * 100;
            return (
              <div key={tier}>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-display font-bold tracking-tight">{label}</span>
                  <span className="font-mono tabular-nums font-bold tabular-nums text-foreground">
                    {n}{" "}
                    <span className="font-medium text-muted-foreground">({pct.toFixed(0)}%)</span>
                  </span>
                </div>
                <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-border">
                  <div
                    className={cn("h-full rounded-full transition-all duration-500", color)}
                    style={{ width: `${pct}%` }}
                  />
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
        profilesById = new Map(
          (profs ?? []).map(
            (p: {
              user_id: string;
              full_name: string;
              company_name: string | null;
              phone_whatsapp: string | null;
            }) => [
              p.user_id,
              {
                full_name: p.full_name as string,
                company_name: (p.company_name as string | null) ?? null,
                phone_whatsapp: (p.phone_whatsapp as string | null) ?? null,
              },
            ],
          ),
        );
      }
      return (subs ?? []).map(
        (s: {
          id: string;
          user_id: string;
          plan: string;
          ecocash_ref: string | null;
          created_at: string;
        }) => ({ ...s, profile: profilesById.get(s.user_id) ?? null }),
      ) as PendingRow[];
    },
  });

  const approve = useMutation({
    mutationFn: async ({ id, plan }: { id: string; plan: PlanTier }) => {
      const expires = new Date(Date.now() + 30 * 86400_000).toISOString();
      const { data: row } = await db
        .from("subscriptions")
        .select("user_id,ecocash_ref")
        .eq("id", id)
        .maybeSingle();
      const { error } = await db
        .from("subscriptions")
        .update({
          status: "active",
          expires_at: expires,
          plan,
        })
        .eq("id", id);
      if (error) throw error;
      await logAudit("subscription.approve", row?.user_id ?? null, {
        subscription_id: id,
        plan,
        ecocash_ref: row?.ecocash_ref ?? null,
      });
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
      const { data: row } = await db
        .from("subscriptions")
        .select("user_id,plan,ecocash_ref")
        .eq("id", id)
        .maybeSingle();
      const { error } = await db.from("subscriptions").update({ status: "expired" }).eq("id", id);
      if (error) throw error;
      await logAudit("subscription.reject", row?.user_id ?? null, {
        subscription_id: id,
        plan: row?.plan ?? null,
        ecocash_ref: row?.ecocash_ref ?? null,
      });
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
    const ch = db
      .channel("admin-subs")
      .on("postgres_changes", { event: "*", schema: "public", table: "subscriptions" }, () => {
        qc.invalidateQueries({ queryKey: ["admin"] });
      })
      .subscribe();
    return () => {
      void db.removeChannel(ch);
    };
  }, [qc]);

  return (
    <div className="mt-6 overflow-hidden rounded-lg border border-border/70 bg-card">
      <div className="flex items-center justify-between gap-3 border-b border-border px-6 py-4">
        <div>
          <span className="section-kicker">EcoCash approvals</span>
          <div className="mt-2 flex items-center gap-2 font-display text-lg font-bold tracking-[-0.025em]">
            Pending payments
            {data?.length ? (
              <span className="inline-flex items-center justify-center rounded-full bg-secondary/20 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-secondary">
                {data.length}
              </span>
            ) : null}
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-2 p-5">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-16 rounded-xl" />
          ))}
        </div>
      ) : !data || data.length === 0 ? (
        <div className="px-5 py-14 text-center">
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-lg bg-[color-mix(in_oklab,var(--success)_12%,transparent)] text-[color:var(--success)]">
            <Check className="h-5 w-5" strokeWidth={2.5} />
          </div>
          <p className="mt-4 font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
            All caught up
          </p>
          <p className="mt-1 text-sm text-foreground/70">No pending payments awaiting approval.</p>
        </div>
      ) : (
        <ul className="divide-y divide-border">
          {data.map((row) => {
            const price = PLAN_PRICE[row.plan] ?? 0;
            const ageMin = Math.floor((Date.now() - new Date(row.created_at).getTime()) / 60000);
            const age =
              ageMin < 60
                ? `${ageMin}m`
                : ageMin < 1440
                  ? `${Math.floor(ageMin / 60)}h`
                  : `${Math.floor(ageMin / 1440)}d`;
            const busy = busyId === row.id;
            return (
              <li
                key={row.id}
                className="flex flex-wrap items-center gap-4 px-6 py-4 transition-colors hover:bg-muted/30"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-display text-base font-bold tracking-tight text-foreground">
                      {row.profile?.full_name || "Unknown user"}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-md border border-border bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground inline-flex items-center gap-1 rounded-md border border-border bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground-amber uppercase">{row.plan}</span>
                    <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                      {age} ago
                    </span>
                  </div>
                  <div className="mt-1 truncate text-xs text-muted-foreground">
                    {row.profile?.company_name ?? "—"}
                    {row.profile?.phone_whatsapp ? ` · ${row.profile.phone_whatsapp}` : ""}
                  </div>
                  <div className="mt-1.5 font-mono text-xs">
                    <span className="text-muted-foreground">Ref: </span>
                    <span className="font-bold text-foreground">
                      {row.ecocash_ref || <span className="text-destructive">missing</span>}
                    </span>
                  </div>
                </div>
                <div className="font-display text-2xl font-bold tracking-[-0.025em] text-foreground">
                  {formatUSD(price)}
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={busy}
                    onClick={() => reject.mutate({ id: row.id })}
                    className="rounded-full"
                  >
                    {busy ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <X className="h-3.5 w-3.5" />
                    )}
                    <span className="ml-1">Reject</span>
                  </Button>
                  <Button
                    size="sm"
                    disabled={busy}
                    className="rounded-full bg-[color:var(--success)] text-white hover:bg-[color-mix(in_oklab,var(--success)_85%,black)]"
                    onClick={() => approve.mutate({ id: row.id, plan: row.plan })}
                  >
                    {busy ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Check className="h-3.5 w-3.5" />
                    )}
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

/* --------------------------- Audit log tab --------------------------- */

type AuditRow = {
  id: string;
  actor_id: string;
  target_user_id: string | null;
  action: string;
  details: Record<string, unknown>;
  created_at: string;
};

function AuditLogTab() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "audit-log"],
    queryFn: async () => {
      const { data: rows, error } = await db
        .from("admin_audit_log")
        .select("id,actor_id,target_user_id,action,details,created_at")
        .order("created_at", { ascending: false })
        .limit(200);
      if (error) throw error;
      const ids = Array.from(
        new Set(
          (rows ?? []).flatMap(
            (r: AuditRow) => [r.actor_id, r.target_user_id].filter(Boolean) as string[],
          ),
        ),
      );
      const nameById = new Map<string, string>();
      if (ids.length) {
        const { data: profs } = await db
          .from("profiles")
          .select("user_id,full_name")
          .in("user_id", ids);
        for (const p of (profs ?? []) as { user_id: string; full_name: string }[])
          nameById.set(p.user_id, p.full_name || p.user_id.slice(0, 8));
      }
      return { rows: (rows ?? []) as AuditRow[], nameById };
    },
  });

  const actionStyle = (action: string) => {
    if (action.startsWith("subscription.approve"))
      return "bg-[color:var(--success)]/15 text-[color:var(--success)] border-[color:var(--success)]/30";
    if (action.startsWith("subscription.reject"))
      return "bg-destructive/15 text-destructive border-destructive/30";
    if (action === "role.grant") return "bg-primary/15 text-primary border-primary/30";
    if (action === "role.revoke") return "bg-muted text-muted-foreground border-border";
    return "bg-muted text-muted-foreground border-border";
  };

  const fmtTime = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
  };

  return (
    <div className="mt-6 overflow-hidden rounded-lg border border-border/70 bg-card">
      <div className="flex items-center justify-between gap-3 border-b border-border px-6 py-4">
        <div>
          <span className="section-kicker">Audit log</span>
          <div className="mt-2 flex items-center gap-2 font-display text-lg font-bold tracking-[-0.025em]">
            Recent admin actions
            {data?.rows.length ? (
              <span className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
                {data.rows.length}
              </span>
            ) : null}
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-2 p-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 rounded-xl" />
          ))}
        </div>
      ) : !data || data.rows.length === 0 ? (
        <div className="px-5 py-14 text-center">
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-muted-foreground">
            <ScrollText className="h-5 w-5" />
          </div>
          <p className="mt-4 font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
            No actions yet
          </p>
          <p className="mt-1 text-sm text-foreground/70">
            Admin operations will appear here as they happen.
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-border">
          {data.rows.map((r) => {
            const actor = data.nameById.get(r.actor_id) ?? r.actor_id.slice(0, 8);
            const target = r.target_user_id
              ? (data.nameById.get(r.target_user_id) ?? r.target_user_id.slice(0, 8))
              : null;
            const detailStr = Object.keys(r.details ?? {}).length
              ? Object.entries(r.details)
                  .map(([k, v]) => `${k}=${typeof v === "string" ? v : JSON.stringify(v)}`)
                  .join(" · ")
              : "";
            return (
              <li
                key={r.id}
                className="flex flex-wrap items-center gap-3 px-6 py-3 transition-colors hover:bg-muted/30"
              >
                <span className="w-36 shrink-0 font-mono text-[10px] font-semibold tracking-tight text-muted-foreground">
                  {fmtTime(r.created_at)}
                </span>
                <span
                  className={cn(
                    "inline-flex items-center rounded-full border px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.14em]",
                    actionStyle(r.action),
                  )}
                >
                  {r.action}
                </span>
                <span className="text-sm">
                  <span className="font-display font-bold tracking-tight">{actor}</span>
                  {target && (
                    <>
                      {" "}
                      <span className="text-muted-foreground">→</span>{" "}
                      <span className="font-display font-bold tracking-tight">{target}</span>
                    </>
                  )}
                </span>
                {detailStr && (
                  <span className="ml-auto truncate font-mono text-[11px] text-muted-foreground">
                    {detailStr}
                  </span>
                )}
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
      const [{ data: profiles, error: e1 }, { data: subs, error: e2 }, { data: roles, error: e3 }] =
        await Promise.all([
          db
            .from("profiles")
            .select("user_id,full_name,company_name,city,phone_whatsapp,created_at")
            .order("created_at", { ascending: false })
            .limit(500),
          db
            .from("subscriptions")
            .select("user_id,plan,status,created_at")
            .order("created_at", { ascending: false }),
          db.from("user_roles").select("user_id,role"),
        ]);
      if (e1 || e2 || e3) throw e1 ?? e2 ?? e3;
      const subByUser = new Map<string, { plan: PlanTier; status: string }>();
      for (const s of subs ?? []) {
        if (!subByUser.has(s.user_id))
          subByUser.set(s.user_id, { plan: s.plan as PlanTier, status: s.status as string });
      }
      const rolesByUser = new Map<string, AppRole[]>();
      for (const r of roles ?? []) {
        const arr = rolesByUser.get(r.user_id) ?? [];
        arr.push(r.role as AppRole);
        rolesByUser.set(r.user_id, arr);
      }
      return (profiles ?? []).map(
        (p: {
          user_id: string;
          full_name: string;
          company_name: string | null;
          city: string | null;
          phone_whatsapp: string | null;
          created_at: string;
        }) => ({
          user_id: p.user_id,
          full_name: p.full_name,
          company_name: p.company_name,
          city: p.city,
          phone_whatsapp: p.phone_whatsapp,
          created_at: p.created_at,
          plan: subByUser.get(p.user_id)?.plan ?? "free",
          sub_status: subByUser.get(p.user_id)?.status ?? "—",
          roles: rolesByUser.get(p.user_id) ?? [],
        }),
      ) as UserRow[];
    },
  });

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return data ?? [];
    return (data ?? []).filter(
      (u) =>
        u.full_name?.toLowerCase().includes(q) ||
        u.company_name?.toLowerCase().includes(q) ||
        u.city?.toLowerCase().includes(q) ||
        u.phone_whatsapp?.toLowerCase().includes(q) ||
        u.user_id.toLowerCase().includes(q),
    );
  }, [data, search]);

  const toggleRole = useMutation({
    mutationFn: async ({
      userId,
      role,
      hasRole,
    }: {
      userId: string;
      role: AppRole;
      hasRole: boolean;
    }) => {
      if (hasRole) {
        const { error } = await db
          .from("user_roles")
          .delete()
          .eq("user_id", userId)
          .eq("role", role);
        if (error) throw error;
        await logAudit("role.revoke", userId, { role });
      } else {
        const { error } = await db.from("user_roles").insert({ user_id: userId, role });
        if (error) throw error;
        await logAudit("role.grant", userId, { role });
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
    plan === "fleet"
      ? "bg-secondary/15 text-secondary border-secondary/30"
      : plan === "pro"
        ? "bg-secondary/10 text-secondary/90 border-secondary/25"
        : plan === "basic"
          ? "bg-primary/10 text-primary/90 border-primary/20"
          : "bg-muted text-muted-foreground border-border";

  return (
    <div className="mt-6 overflow-hidden rounded-lg border border-border/70 bg-card">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-6 py-4">
        <div>
          <span className="section-kicker">Users</span>
          <div className="mt-2 flex items-center gap-2 font-display text-lg font-bold tracking-[-0.025em]">
            Manage roles
            {data?.length ? (
              <span className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
                {filtered.length}
                <span className="text-muted-foreground/50">/</span>
                {data.length}
              </span>
            ) : null}
          </div>
        </div>
        <div className="relative w-full max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, company, city, phone…"
            className="h-10 w-full rounded-lg border border-border bg-card pl-9 pr-3 text-sm transition-all placeholder:text-muted-foreground/70 hover:border-foreground/15 focus:border-secondary/50 focus:outline-none focus:ring-2 focus:ring-secondary/30"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-2 p-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-14 rounded-xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="px-5 py-14 text-center">
          <p className="font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
            No matches
          </p>
          <p className="mt-1 text-sm text-foreground/70">Try a different search term.</p>
        </div>
      ) : (
        <ul className="divide-y divide-border">
          {filtered.map((u) => {
            const isAdmin = u.roles.includes("admin");
            const isMod = u.roles.includes("moderator");
            const adminBusy = busy === `${u.user_id}:admin`;
            const modBusy = busy === `${u.user_id}:moderator`;
            return (
              <li
                key={u.user_id}
                className="flex flex-wrap items-center gap-4 px-6 py-4 transition-colors hover:bg-muted/30"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-display text-sm font-bold tracking-tight text-foreground">
                      {u.full_name || "Unnamed"}
                    </span>
                    <span
                      className={cn(
                        "inline-flex items-center rounded-full border px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.14em]",
                        planClass(u.plan),
                      )}
                    >
                      {u.plan}
                    </span>
                    {u.sub_status === "pending" && (
                      <span className="inline-flex items-center rounded-full border border-secondary/40 bg-secondary/10 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-secondary">
                        pending
                      </span>
                    )}
                    {isAdmin && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-primary/15 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-primary">
                        <ShieldCheck className="h-2.5 w-2.5" />
                        admin
                      </span>
                    )}
                    {isMod && (
                      <span className="inline-flex items-center rounded-full bg-secondary/15 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-secondary">
                        mod
                      </span>
                    )}
                  </div>
                  <div className="mt-1 truncate text-xs text-muted-foreground">
                    {u.company_name ?? "—"}
                    {u.city ? ` · ${u.city}` : ""}
                    {u.phone_whatsapp ? ` · ${u.phone_whatsapp}` : ""}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant={isMod ? "default" : "outline"}
                    disabled={modBusy}
                    className="rounded-full"
                    onClick={() =>
                      toggleRole.mutate({ userId: u.user_id, role: "moderator", hasRole: isMod })
                    }
                  >
                    {modBusy ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <UserCog className="h-3.5 w-3.5" />
                    )}
                    <span className="ml-1">{isMod ? "Revoke mod" : "Grant mod"}</span>
                  </Button>
                  <Button
                    size="sm"
                    variant={isAdmin ? "default" : "outline"}
                    disabled={adminBusy}
                    className={cn(
                      "rounded-full",
                      isAdmin && "bg-primary text-primary-foreground hover:bg-primary/90",
                    )}
                    onClick={() =>
                      toggleRole.mutate({ userId: u.user_id, role: "admin", hasRole: isAdmin })
                    }
                  >
                    {adminBusy ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <ShieldCheck className="h-3.5 w-3.5" />
                    )}
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
