import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/hooks/useAuth";
import { db } from "@/lib/db";
import { ZIM_CITIES } from "@/types";
import { toast } from "sonner";
import { Loader2, Truck, Package, MessageCircle, MapPin, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { UserRole } from "@/types";

export const Route = createFileRoute("/onboarding")({
  head: () => ({ meta: [{ title: "Welcome — ZimFreight" }, { name: "description", content: "Set up your ZimFreight profile in 2 minutes." }] }),
  component: OnboardingPage,
});

const EQUIPMENT = ["Flatbed 30T", "Rigid 10T", "Rigid 5T", "Tanker (Fuel)", "Tanker (Water)", "Refrigerated", "Lowbed", "Livestock Truck", "Side Tipper"];
const SECTORS = ["Agriculture", "Mining", "Construction", "FMCG", "Government", "Retail", "Export"];
const FLEET_SIZES = ["Just Me", "2-5 Trucks", "6-20", "20+"];
const MONTHLY_LOADS = ["1-10", "10-50", "50-200", "200+"];
const POPULAR_ROUTES = ["Harare → Bulawayo", "Beitbridge → Harare", "Harare → Mutare", "Harare → Chirundu", "Bulawayo → Beitbridge"];

const STEPS = ["Welcome", "Operation", "WhatsApp", "Routes", "Plan"] as const;

function OnboardingPage() {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);

  // Step 1: role
  const [role, setRole] = useState<UserRole>(profile?.role ?? "carrier");

  // Step 2: operation
  const [fleetSize, setFleetSize] = useState<string>("Just Me");
  const [equipment, setEquipment] = useState<string[]>([]);
  const [city, setCity] = useState<string>(profile?.city ?? "Harare");
  const [crossBorder, setCrossBorder] = useState(false);
  const [companyName, setCompanyName] = useState(profile?.company_name ?? "");
  const [sectors, setSectors] = useState<string[]>([]);
  const [monthlyLoads, setMonthlyLoads] = useState("1-10");

  // Step 3: whatsapp
  const [waNumber, setWaNumber] = useState(profile?.phone_whatsapp ?? "+263 ");
  const [alerts, setAlerts] = useState({ loads: true, prices: true, borders: true, payments: true });

  // Step 4: routes
  const [routes, setRoutes] = useState<string[]>([]);

  // Submitting
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setRole(profile.role);
      setCity(profile.city ?? "Harare");
      setCompanyName(profile.company_name ?? "");
      setWaNumber(profile.phone_whatsapp ?? "+263 ");
    }
  }, [profile]);

  const progress = useMemo(() => Math.round(((step + 1) / STEPS.length) * 100), [step]);

  if (loading) return <Centered><div className="text-muted-foreground">Loading…</div></Centered>;
  if (!user) return (
    <Centered>
      <h1 className="font-display text-3xl font-black uppercase">Sign in first</h1>
      <Button asChild className="mt-6 bg-primary text-primary-foreground"><Link to="/">Back home</Link></Button>
    </Centered>
  );

  const toggleArr = (val: string, arr: string[], set: (a: string[]) => void) => {
    set(arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val]);
  };

  const finish = async (chosenPlan: "free" | "basic" | "pro") => {
    setSaving(true);
    try {
      // Update profile
      const { error: pErr } = await db.from("profiles").update({
        full_name: profile?.full_name || user.email || "",
        role,
        city,
        company_name: companyName || null,
        phone_whatsapp: waNumber,
      }).eq("user_id", user.id);
      if (pErr) throw pErr;

      // Update subscription if upgrading
      if (chosenPlan !== "free") {
        const { error: sErr } = await db.from("subscriptions").insert({
          user_id: user.id,
          plan: chosenPlan,
          status: "pending",
        });
        if (sErr) throw sErr;
        toast.success(`${chosenPlan.toUpperCase()} requested — pay via EcoCash to activate`);
      } else {
        toast.success("You're all set!");
      }
      navigate({ to: "/dashboard" });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to save");
    } finally { setSaving(false); }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 md:px-6 md:py-14">
      {/* Progress */}
      <div className="mb-8">
        <div className="flex items-center justify-between text-xs">
          <span className="font-mono uppercase tracking-widest text-primary">Step {step + 1} of {STEPS.length} · {STEPS[step]}</span>
          <span className="font-mono text-muted-foreground">{progress}%</span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-secondary">
          <div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6 md:p-10">
        {/* STEP 1 */}
        {step === 0 && (
          <div className="space-y-6 text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-primary to-zim-yellow text-primary-foreground shadow-lg">
              <Truck className="h-10 w-10" />
            </div>
            <div>
              <h1 className="font-display text-4xl font-black uppercase tracking-tight md:text-5xl">Welcome to ZimFreight 🇿🇼</h1>
              <p className="mt-2 text-muted-foreground">Let's set up your profile in 2 minutes.</p>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <RoleCard active={role === "carrier"} onClick={() => setRole("carrier")} icon={<Truck className="h-6 w-6" />} title="I move freight" subtitle="Carrier, driver, fleet owner" />
              <RoleCard active={role === "broker"} onClick={() => setRole("broker")} icon={<Package className="h-6 w-6" />} title="I need freight moved" subtitle="Broker, shipper, company" />
            </div>
            <Button onClick={() => setStep(1)} className="w-full bg-primary text-primary-foreground hover:bg-primary/90 md:w-auto md:px-10">Get started →</Button>
          </div>
        )}

        {/* STEP 2 */}
        {step === 1 && (
          <div className="space-y-5">
            <h2 className="font-display text-3xl font-black uppercase tracking-tight">Tell us about your operation</h2>

            {role === "carrier" ? (
              <>
                <div>
                  <Label className="text-xs uppercase tracking-widest text-muted-foreground">Fleet size</Label>
                  <div className="mt-2 grid grid-cols-2 gap-2 md:grid-cols-4">
                    {FLEET_SIZES.map((f) => (
                      <Chip key={f} active={fleetSize === f} onClick={() => setFleetSize(f)}>{f}</Chip>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="text-xs uppercase tracking-widest text-muted-foreground">Equipment (multi-select)</Label>
                  <div className="mt-2 grid grid-cols-2 gap-2 md:grid-cols-3">
                    {EQUIPMENT.map((e) => (
                      <label key={e} className={cn("flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm", equipment.includes(e) ? "border-primary bg-primary/10" : "border-border bg-background/40 hover:border-primary/40")}>
                        <Checkbox checked={equipment.includes(e)} onCheckedChange={() => toggleArr(e, equipment, setEquipment)} />
                        <span>{e}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label>Home city</Label>
                    <Select value={city} onValueChange={setCity}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{ZIM_CITIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <label className="mt-6 flex cursor-pointer items-center justify-between rounded-md border border-border bg-background/40 px-3 py-2.5 md:mt-0 md:self-end">
                    <span className="text-sm">Cross-border?</span>
                    <Switch checked={crossBorder} onCheckedChange={setCrossBorder} />
                  </label>
                </div>
              </>
            ) : (
              <>
                <div className="space-y-1.5">
                  <Label>Company name</Label>
                  <Input value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="Acme Logistics" />
                </div>
                <div>
                  <Label className="text-xs uppercase tracking-widest text-muted-foreground">Industry sector (multi-select)</Label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {SECTORS.map((s) => (
                      <Chip key={s} active={sectors.includes(s)} onClick={() => toggleArr(s, sectors, setSectors)}>{s}</Chip>
                    ))}
                  </div>
                </div>
                <div>
                  <Label className="text-xs uppercase tracking-widest text-muted-foreground">Monthly loads</Label>
                  <div className="mt-2 grid grid-cols-2 gap-2 md:grid-cols-4">
                    {MONTHLY_LOADS.map((m) => (
                      <Chip key={m} active={monthlyLoads === m} onClick={() => setMonthlyLoads(m)}>{m}</Chip>
                    ))}
                  </div>
                </div>
              </>
            )}

            <NavRow onBack={() => setStep(0)} onNext={() => setStep(2)} />
          </div>
        )}

        {/* STEP 3 */}
        {step === 2 && (
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-success/15 text-success shadow-[0_0_20px_color-mix(in_oklab,var(--success)_30%,transparent)]">
                <MessageCircle className="h-6 w-6" />
              </div>
              <div>
                <h2 className="font-display text-2xl font-black uppercase tracking-tight">Set up WhatsApp</h2>
                <p className="text-sm text-muted-foreground">Get load alerts the way Zimbabwe does business.</p>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>WhatsApp number</Label>
              <Input value={waNumber} onChange={(e) => setWaNumber(e.target.value)} placeholder="+263 77 123 4567" />
            </div>

            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-widest text-muted-foreground">Alert preferences</Label>
              {[
                { k: "loads", l: "New loads on my routes" },
                { k: "prices", l: "Price changes on my corridors" },
                { k: "borders", l: "Border crossing status alerts" },
                { k: "payments", l: "Payment reminders" },
              ].map(({ k, l }) => (
                <label key={k} className="flex cursor-pointer items-center justify-between rounded-md border border-border bg-background/40 px-3 py-2.5">
                  <span className="text-sm">{l}</span>
                  <Switch checked={alerts[k as keyof typeof alerts]} onCheckedChange={(v) => setAlerts({ ...alerts, [k]: v })} />
                </label>
              ))}
            </div>

            <a href="https://wa.me/263000000000" target="_blank" rel="noreferrer" className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-success px-4 py-2.5 text-sm font-semibold text-background hover:bg-success/90">
              <MessageCircle className="h-4 w-4" /> Connect WhatsApp →
            </a>

            <NavRow onBack={() => setStep(1)} onNext={() => setStep(3)} skipLabel="Skip — you'll miss 3× more loads" onSkip={() => setStep(3)} />
          </div>
        )}

        {/* STEP 4 */}
        {step === 3 && (
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/15 text-primary"><MapPin className="h-6 w-6" /></div>
              <div>
                <h2 className="font-display text-2xl font-black uppercase tracking-tight">Your preferred routes</h2>
                <p className="text-sm text-muted-foreground">Add up to 8 routes you regularly run.</p>
              </div>
            </div>

            <div className="rounded-md border border-dashed border-border bg-background/30 p-4">
              <p className="text-xs uppercase tracking-widest text-muted-foreground">Most popular — tap to add</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {POPULAR_ROUTES.map((r) => (
                  <button key={r} type="button" onClick={() => routes.length < 8 && !routes.includes(r) && setRoutes([...routes, r])} className="rounded-full border border-border bg-background/40 px-3 py-1 text-xs hover:border-primary/50">
                    + {r}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs uppercase tracking-widest text-muted-foreground">Selected routes ({routes.length}/8)</p>
              <div className="mt-2 flex min-h-[60px] flex-wrap gap-2 rounded-md border border-border bg-background/30 p-3">
                {routes.length === 0 && <p className="text-xs text-muted-foreground">No routes selected yet.</p>}
                {routes.map((r) => (
                  <span key={r} className="inline-flex items-center gap-1.5 rounded-full bg-primary/15 px-3 py-1 text-xs text-primary">
                    {r}
                    <button type="button" onClick={() => setRoutes(routes.filter((x) => x !== r))} aria-label={`Remove ${r}`}><X className="h-3 w-3" /></button>
                  </span>
                ))}
              </div>
            </div>

            <NavRow onBack={() => setStep(2)} onNext={() => setStep(4)} />
          </div>
        )}

        {/* STEP 5 — plan */}
        {step === 4 && (
          <div className="space-y-5">
            <div>
              <h2 className="font-display text-3xl font-black uppercase tracking-tight">Choose your plan</h2>
              <p className="text-sm text-muted-foreground">Start free, upgrade anytime. 14-day money-back guarantee.</p>
            </div>

            <div className="grid gap-3 md:grid-cols-3">
              <PlanCard
                tier="free" name="Free" price="$0" sub="/mo"
                features={["5 loads visible per day", "Broker contacts hidden", "No WhatsApp AI"]}
                cta="Start free →" onClick={() => finish("free")} disabled={saving}
              />
              <PlanCard
                tier="basic" name="Basic" price="$19" sub="/mo" badge="Most popular" highlight wasPrice="$25"
                features={["50 loads per day", "All broker contacts + WhatsApp", "Post up to 10 loads/mo", "WhatsApp load alerts", "Rate analytics", "ZIMRA document checklist"]}
                cta="Start Basic — $19/mo →" onClick={() => finish("basic")} disabled={saving}
              />
              <PlanCard
                tier="pro" name="Pro" price="$49" sub="/mo"
                features={["Everything in Basic", "Unlimited loads", "WhatsApp AI Dispatch", "Priority listing", "Rate forecasting", "50 load posts/mo"]}
                cta="Start Pro →" onClick={() => finish("pro")} disabled={saving}
              />
            </div>

            <p className="text-center text-[11px] text-muted-foreground">🔒 Secure payment · 14-day money back · Cancel anytime · No setup fee</p>

            <div className="rounded-md border border-success/30 bg-success/5 p-4 text-sm">
              <p className="font-semibold text-success">💚 Pay with EcoCash</p>
              <p className="mt-1 font-mono text-xs text-foreground">Send $19 to *151*4*ZimFreight*BASIC#</p>
              <p className="mt-1 text-xs text-muted-foreground">We'll activate your plan within 1 hour.</p>
            </div>

            <button onClick={() => setStep(3)} className="text-xs text-muted-foreground hover:text-foreground">← Back</button>
          </div>
        )}
      </div>
    </div>
  );
}

function Centered({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto max-w-2xl px-4 py-20 text-center">{children}</div>;
}

function RoleCard({ active, onClick, icon, title, subtitle }: { active: boolean; onClick: () => void; icon: React.ReactNode; title: string; subtitle: string }) {
  return (
    <button type="button" onClick={onClick} className={cn(
      "flex flex-col items-start gap-2 rounded-lg border p-5 text-left transition-all",
      active ? "border-primary bg-primary/10 shadow-[0_0_0_1px_var(--primary)]" : "border-border bg-background/40 hover:border-primary/40"
    )}>
      <span className={cn("flex h-10 w-10 items-center justify-center rounded-md", active ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground")}>{icon}</span>
      <span className="font-display text-lg font-black uppercase tracking-tight">{title}</span>
      <span className="text-xs text-muted-foreground">{subtitle}</span>
    </button>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick} className={cn(
      "rounded-md border px-3 py-2 text-sm transition-colors",
      active ? "border-primary bg-primary/15 text-foreground" : "border-border bg-background/40 text-muted-foreground hover:border-primary/40 hover:text-foreground"
    )}>{children}</button>
  );
}

function NavRow({ onBack, onNext, skipLabel, onSkip }: { onBack: () => void; onNext: () => void; skipLabel?: string; onSkip?: () => void }) {
  return (
    <div className="flex items-center justify-between pt-2">
      <Button variant="ghost" onClick={onBack}>← Back</Button>
      <div className="flex items-center gap-3">
        {skipLabel && onSkip && <button type="button" onClick={onSkip} className="text-xs text-muted-foreground hover:text-foreground">{skipLabel}</button>}
        <Button onClick={onNext} className="bg-primary text-primary-foreground hover:bg-primary/90">Continue →</Button>
      </div>
    </div>
  );
}

function PlanCard({ name, price, sub, features, cta, onClick, disabled, highlight, badge, wasPrice }: { tier: string; name: string; price: string; sub: string; features: string[]; cta: string; onClick: () => void; disabled?: boolean; highlight?: boolean; badge?: string; wasPrice?: string }) {
  return (
    <div className={cn("relative flex flex-col rounded-xl border p-5", highlight ? "border-primary bg-gradient-to-b from-primary/15 to-card shadow-[0_0_0_1px_var(--primary)]" : "border-border bg-background/40")}>
      {badge && <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-primary-foreground">{badge}</span>}
      <h3 className="font-display text-xl font-black uppercase tracking-tight">{name}</h3>
      <div className="mt-2 flex items-baseline gap-1">
        <span className="font-display text-4xl font-black">{price}</span>
        <span className="text-xs text-muted-foreground">{sub}</span>
        {wasPrice && <span className="ml-2 text-xs text-muted-foreground line-through">{wasPrice}</span>}
      </div>
      <ul className="mt-3 flex-1 space-y-1.5 text-sm">
        {features.map((f) => <li key={f} className="flex gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" /><span>{f}</span></li>)}
      </ul>
      <Button onClick={onClick} disabled={disabled} className={cn("mt-4 w-full", highlight ? "bg-primary text-primary-foreground hover:bg-primary/90" : "bg-secondary text-foreground hover:bg-secondary/80")}>
        {disabled && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {cta}
      </Button>
    </div>
  );
}