import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useEffect, useMemo, useRef, useState } from "react";
import { db } from "@/lib/db";
import { useAuth } from "@/hooks/useAuth";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { ZIM_CITIES, ALL_DEST_CITIES, CROSS_BORDER_CITIES } from "@/types";
import { cn, formatUSD } from "@/lib/utils";
import { format, addDays } from "date-fns";
import { toast } from "sonner";
import {
  saveDraft as idbSaveDraft,
  loadDraft as idbLoadDraft,
  clearDraft as idbClearDraft,
  enqueuePost,
} from "@/lib/offlineDb";
import {
  ArrowLeft,
  ArrowRight,
  CalendarIcon,
  ChevronsUpDown,
  Check,
  Loader2,
  Lock,
  Truck,
  Flame,
  Sparkles,
  AlertTriangle,
  ShieldCheck,
  Fuel,
  Clock,
  Save,
  PartyPopper,
  Share2,
  Copy,
} from "lucide-react";

export const Route = createFileRoute("/post")({
  head: () => ({
    meta: [
      { title: "Post a Load — ZimFreight" },
      {
        name: "description",
        content:
          "Post your freight load to Zimbabwe's largest carrier network. Live market rates, instant distribution.",
      },
      { property: "og:title", content: "Post a Load — ZimFreight" },
      {
        property: "og:description",
        content: "Reach 850+ verified Zimbabwe carriers in seconds with live market rate guidance.",
      },
    ],
  }),
  component: PostLoadPage,
});

/* ----------------------------- Domain data ----------------------------- */

const LOAD_TYPES_RICH: { value: string; icon: string; label: string }[] = [
  { value: "General Cargo", icon: "📦", label: "General Cargo" },
  { value: "Maize/Grain", icon: "🌽", label: "Maize/Grain" },
  { value: "Tobacco", icon: "🚬", label: "Tobacco" },
  { value: "Livestock", icon: "🐄", label: "Livestock" },
  { value: "Fuel/Tanker", icon: "⛽", label: "Fuel/Tanker" },
  { value: "Building Materials", icon: "🏗", label: "Building" },
  { value: "Mining/Ore", icon: "⛏", label: "Mining" },
  { value: "Refrigerated", icon: "🧊", label: "Refrigerated" },
  { value: "Cotton/Textile", icon: "👕", label: "Cotton" },
  { value: "Machinery", icon: "⚙️", label: "Machinery" },
  { value: "FMCG/Retail", icon: "🛒", label: "FMCG" },
  { value: "Other", icon: "📦", label: "Other" },
];

const EQUIPMENT_RICH: { value: string; icon: string; label: string }[] = [
  { value: "Flatbed 30T", icon: "🚛", label: "Flatbed 30T" },
  { value: "Rigid 10T", icon: "🚚", label: "Rigid 10T" },
  { value: "Rigid 5T", icon: "🚐", label: "Rigid 5T" },
  { value: "Tanker (Fuel)", icon: "⛽", label: "Tanker (Fuel)" },
  { value: "Tanker (Water)", icon: "💧", label: "Tanker (Water)" },
  { value: "Refrigerated", icon: "🧊", label: "Refrigerated" },
  { value: "Lowbed", icon: "🛻", label: "Lowbed" },
  { value: "Side Tipper", icon: "🪣", label: "Side Tipper" },
  { value: "Livestock Truck", icon: "🐄", label: "Livestock" },
];

const PAYMENT_OPTIONS: { value: string; icon: string; label: string }[] = [
  { value: "EcoCash on Delivery", icon: "💰", label: "EcoCash on Delivery" },
  { value: "InnBucks on Delivery", icon: "📱", label: "InnBucks on Delivery" },
  { value: "EFT 7 days", icon: "🏦", label: "EFT 7 days" },
  { value: "EFT 14 days", icon: "🏦", label: "EFT 14 days" },
  { value: "EFT 30 days", icon: "🏦", label: "EFT 30 days" },
  { value: "Cash on Delivery", icon: "💵", label: "Cash on Delivery" },
  { value: "Prepayment", icon: "📋", label: "Prepayment" },
];

const ROUTE_INTEL: Record<
  string,
  { distance: number; highway: string; avg: number; low: number; high: number }
> = {
  "Harare|Bulawayo": { distance: 440, highway: "A5", avg: 1200, low: 950, high: 1480 },
  "Bulawayo|Harare": { distance: 440, highway: "A5", avg: 1180, low: 920, high: 1450 },
  "Harare|Mutare": { distance: 263, highway: "A3", avg: 820, low: 680, high: 980 },
  "Mutare|Harare": { distance: 263, highway: "A3", avg: 800, low: 660, high: 940 },
  "Harare|Beitbridge": { distance: 580, highway: "A4", avg: 1500, low: 1250, high: 1820 },
  "Beitbridge|Harare": { distance: 580, highway: "A4", avg: 1750, low: 1500, high: 2100 },
  "Harare|Chirundu": { distance: 350, highway: "A1", avg: 1100, low: 900, high: 1320 },
  "Harare|Victoria Falls": { distance: 879, highway: "A8", avg: 2500, low: 2100, high: 2900 },
  "Bulawayo|Victoria Falls": { distance: 440, highway: "A8", avg: 1280, low: 1000, high: 1550 },
  "Hwange|Beitbridge": { distance: 720, highway: "A8", avg: 2680, low: 2300, high: 3050 },
  "Harare|Johannesburg": { distance: 1120, highway: "A4 → N1", avg: 3200, low: 2800, high: 3700 },
  "Harare|Lusaka": { distance: 480, highway: "A1", avg: 1450, low: 1200, high: 1700 },
  "Bulawayo|Johannesburg": { distance: 880, highway: "A6 → N1", avg: 2600, low: 2200, high: 3000 },
};

function intelFor(o?: string, d?: string) {
  if (!o || !d) return null;
  const key = `${o}|${d}`;
  if (ROUTE_INTEL[key]) return ROUTE_INTEL[key];
  // fallback estimate
  const km = 400;
  return {
    distance: km,
    highway: "—",
    avg: Math.round(km * 2.85),
    low: Math.round(km * 2.3),
    high: Math.round(km * 3.4),
  };
}

function isCrossBorder(o?: string, d?: string) {
  if (!o || !d) return false;
  return CROSS_BORDER_CITIES.includes(o) || CROSS_BORDER_CITIES.includes(d);
}

/* ----------------------------- Schema ----------------------------- */

const todayISO = () => new Date().toISOString().slice(0, 10);

const schema = z
  .object({
    // Step 1
    origin: z.string().min(1, "Origin required"),
    destination: z.string().min(1, "Destination required"),
    pickup_address: z.string().trim().max(200).optional().or(z.literal("")),
    pickup_date: z.string().min(1, "Pickup date required"),
    delivery_deadline: z.string().optional().or(z.literal("")),
    flexible_dates: z.boolean().default(false),
    // Step 2
    load_type: z.string().min(1, "Load type required"),
    equipment_required: z.string().min(1, "Equipment required"),
    weight_tonnes: z.coerce.number().min(0.5, "Min 0.5T").max(60, "Max 60T"),
    num_loads: z.coerce.number().int().min(1).max(50).default(1),
    commodity_value: z.coerce.number().min(0).max(10_000_000).optional(),
    rate_usd: z.coerce.number().min(50, "Min $50").max(100_000, "Max $100k"),
    payment_terms: z.string().min(1, "Choose payment terms"),
    is_urgent: z.boolean().default(false),
    notes: z.string().trim().max(500).optional().or(z.literal("")),
    // Step 3
    company_name: z.string().trim().min(2, "Company required").max(120),
    contact_person: z.string().trim().min(2, "Name required").max(120),
    whatsapp: z
      .string()
      .trim()
      .regex(/^\+263\s?7\d(\s?\d){7}$/, "Format: +263 7X XXX XXXX"),
    alt_contact: z.string().trim().max(120).optional().or(z.literal("")),
    company_address: z.string().trim().max(200).optional().or(z.literal("")),
    share_to_zf: z.boolean().default(true),
    share_harare: z.boolean().default(false),
    share_bulawayo: z.boolean().default(false),
    share_zha: z.boolean().default(false),
    share_email_network: z.boolean().default(false),
    is_private: z.boolean().default(false),
  })
  .refine((d) => d.origin !== d.destination, {
    message: "Origin and destination must differ",
    path: ["destination"],
  })
  .refine((d) => !d.delivery_deadline || d.delivery_deadline >= d.pickup_date, {
    message: "Must be on/after pickup",
    path: ["delivery_deadline"],
  })
  .refine((d) => d.pickup_date >= todayISO(), { message: "No past dates", path: ["pickup_date"] });

type FormValues = z.input<typeof schema>;
type ParsedValues = z.output<typeof schema>;

const DRAFT_KEY = "zf:post_draft_v1";
const STEP_FIELDS: (keyof FormValues)[][] = [
  // Step 0 — Route
  ["origin", "destination", "pickup_address"],
  // Step 1 — Cargo
  ["load_type", "equipment_required", "weight_tonnes", "num_loads", "commodity_value"],
  // Step 2 — Rate & Date
  [
    "rate_usd",
    "payment_terms",
    "pickup_date",
    "delivery_deadline",
    "flexible_dates",
    "is_urgent",
    "notes",
  ],
  // Step 3 — Review (contact + distribution)
  [
    "company_name",
    "contact_person",
    "whatsapp",
    "alt_contact",
    "company_address",
    "share_to_zf",
    "share_harare",
    "share_bulawayo",
    "share_zha",
    "share_email_network",
    "is_private",
  ],
];

/* ----------------------------- Page ----------------------------- */

function PostLoadPage() {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [postedId, setPostedId] = useState<string | null>(null);
  const [draftAge, setDraftAge] = useState<string | null>(null);
  const [showDraftPrompt, setShowDraftPrompt] = useState(false);
  const lastSavedRef = useRef<number>(0);

  const form = useForm<FormValues, unknown, ParsedValues>({
    resolver: zodResolver(schema),
    mode: "onTouched",
    defaultValues: {
      origin: "",
      destination: "",
      pickup_address: "",
      pickup_date: "",
      delivery_deadline: "",
      flexible_dates: false,
      load_type: "",
      equipment_required: "",
      weight_tonnes: 28,
      num_loads: 1,
      commodity_value: "" as unknown as number,
      rate_usd: "" as unknown as number,
      payment_terms: "",
      is_urgent: false,
      notes: "",
      company_name: "",
      contact_person: "",
      whatsapp: "",
      alt_contact: "",
      company_address: "",
      share_to_zf: true,
      share_harare: false,
      share_bulawayo: false,
      share_zha: false,
      share_email_network: false,
      is_private: false,
    },
  });

  // Pre-fill from profile when loaded
  useEffect(() => {
    if (!profile) return;
    if (!form.getValues("company_name") && profile.company_name)
      form.setValue("company_name", profile.company_name);
    if (!form.getValues("contact_person") && profile.full_name)
      form.setValue("contact_person", profile.full_name);
    if (!form.getValues("whatsapp") && profile.phone_whatsapp)
      form.setValue("whatsapp", profile.phone_whatsapp);
    if (!form.getValues("company_address") && profile.city)
      form.setValue("company_address", profile.city);
  }, [profile, form]);

  // Draft detection
  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = localStorage.getItem(DRAFT_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as { savedAt: number };
        const ageMs = Date.now() - parsed.savedAt;
        if (ageMs < 1000 * 60 * 60 * 24 * 14) {
          setDraftAge(humanAge(ageMs));
          setShowDraftPrompt(true);
          return;
        }
      } catch {
        /* ignore */
      }
    }
    // Fallback: check IndexedDB (e.g., if localStorage was cleared but IDB persists)
    void (async () => {
      const idb = await idbLoadDraft();
      if (!idb) return;
      const ageMs = Date.now() - idb.savedAt;
      if (ageMs < 1000 * 60 * 60 * 24 * 14) {
        setDraftAge(humanAge(ageMs));
        setShowDraftPrompt(true);
      }
    })();
  }, []);

  // Autosave every 30s
  useEffect(() => {
    const t = setInterval(() => saveDraft(form.getValues()), 30_000);
    return () => clearInterval(t);
  }, [form]);

  function saveDraft(values: FormValues) {
    if (typeof window === "undefined") return;
    localStorage.setItem(DRAFT_KEY, JSON.stringify({ savedAt: Date.now(), values }));
    void idbSaveDraft(values);
    lastSavedRef.current = Date.now();
  }

  function loadDraft() {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return;
    try {
      const { values } = JSON.parse(raw) as { values: FormValues };
      form.reset(values);
      toast.success("Draft restored");
    } catch {
      /* ignore */
    }
    setShowDraftPrompt(false);
  }
  function discardDraft() {
    localStorage.removeItem(DRAFT_KEY);
    void idbClearDraft();
    setShowDraftPrompt(false);
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center text-muted-foreground">Loading…</div>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <Lock className="h-5 w-5" />
        </div>
        <h1 className="mt-4 font-display text-3xl font-bold uppercase tracking-tight">
          Sign in to post loads
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Create a free account to post your first load.
        </p>
        <Button asChild className="mt-6">
          <Link to="/">Back to home</Link>
        </Button>
      </div>
    );
  }

  if (postedId) {
    return (
      <SuccessScreen
        loadId={postedId}
        values={form.getValues()}
        onPostAnother={() => {
          form.reset();
          setPostedId(null);
          setStep(0);
          discardDraft();
        }}
      />
    );
  }

  const next = async () => {
    const ok = await form.trigger(STEP_FIELDS[step] as never);
    if (!ok) {
      toast.error("Please fix the highlighted fields");
      return;
    }
    saveDraft(form.getValues());
    setStep((s) => Math.min(3, s + 1));
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const back = () => setStep((s) => Math.max(0, s - 1));

  const onSubmit = async (values: ParsedValues) => {
    setSubmitting(true);
    try {
      const intel = intelFor(values.origin, values.destination);
      const distance_km = intel?.distance ?? null;
      const rate_per_km = distance_km ? +(values.rate_usd / distance_km).toFixed(2) : null;
      const crossBorder = isCrossBorder(values.origin, values.destination);
      const payload = {
        poster_id: user.id,
        origin: values.origin,
        destination: values.destination,
        load_type: values.load_type,
        equipment_required: values.equipment_required,
        weight_tonnes: values.weight_tonnes,
        num_loads: values.num_loads,
        rate_usd: values.rate_usd,
        distance_km,
        rate_per_km,
        highway: intel?.highway ?? null,
        payment_terms: values.payment_terms,
        pickup_date: values.pickup_date,
        delivery_deadline: values.delivery_deadline || null,
        notes: values.notes || null,
        is_border_crossing: crossBorder,
        zimra_required: crossBorder,
        is_urgent: values.is_urgent,
        commodity_value: values.commodity_value ?? null,
        status: "available" as const,
      };
      // Offline → queue and report success; OfflineBanner drains the queue on reconnect.
      if (typeof navigator !== "undefined" && !navigator.onLine) {
        await enqueuePost(payload);
        toast.success("You're offline — your load will post when you reconnect");
        discardDraft();
        setPostedId("queued");
        return;
      }
      const { data, error } = await db.from("loads").insert(payload).select("id").single();
      if (error) throw error;
      discardDraft();
      setPostedId(data.id as string);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to post load");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 md:px-6 md:py-10 md:pb-10 pb-28">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <span className="section-kicker">New load</span>
          <h1 className="mt-2 font-display text-3xl font-bold tracking-[-0.04em] md:text-4xl">
            Post a load
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Reach 850+ verified Zimbabwean carriers in seconds.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => {
            saveDraft(form.getValues());
            toast.success("Draft saved");
          }}
        >
          <Save className="mr-1.5 h-3.5 w-3.5" /> Save draft
        </Button>
      </div>

      {/* Stepper */}
      <Stepper step={step} />

      {/* Draft prompt */}
      {showDraftPrompt && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-muted/30 px-4 py-3 text-sm">
          <span>
            You have an unsaved draft from{" "}
            <span className="font-bold text-foreground">{draftAge}</span>. Continue?
          </span>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={discardDraft} className="rounded-full">
              Start fresh
            </Button>
            <Button
              size="sm"
              className="bg-secondary text-secondary-foreground hover:bg-secondary/90"
              onClick={loadDraft}
            >
              Yes, continue
            </Button>
          </div>
        </div>
      )}

      <form onSubmit={form.handleSubmit(onSubmit)} className="mt-6">
        {step === 0 && <StepRoute form={form} />}
        {step === 1 && <StepCargo form={form} />}
        {step === 2 && <StepRateDate form={form} />}
        {step === 3 && <StepReview form={form} onEdit={setStep} />}

        {/* Nav */}
        <div className="mt-6 flex items-center justify-between gap-3 md:static fixed inset-x-0 bottom-16 z-30 border-t border-border bg-background/95 px-4 py-3 backdrop-blur md:border-0 md:bg-transparent md:p-0 md:backdrop-blur-none">
          {step > 0 ? (
            <Button type="button" variant="outline" onClick={back}>
              <ArrowLeft className="mr-1.5 h-4 w-4" /> Back
            </Button>
          ) : (
            <span />
          )}
          {step < 3 ? (
            <Button
              type="button"
              onClick={next}
              className="bg-secondary text-secondary-foreground hover:bg-secondary/90 font-semibold"
            >
              Continue <ArrowRight className="ml-1.5 h-4 w-4" />
            </Button>
          ) : (
            <Button
              type="submit"
              disabled={submitting}
              className="bg-secondary text-secondary-foreground hover:bg-secondary/90 font-semibold"
            >
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <Truck className="mr-2 h-4 w-4" /> Post load now
            </Button>
          )}
        </div>
        {step === 3 && (
          <p className="mt-2 text-right text-xs text-muted-foreground">
            Your load will be live within 60 seconds.
          </p>
        )}
      </form>
    </div>
  );
}

/* ----------------------------- Stepper ----------------------------- */

function Stepper({ step }: { step: number }) {
  const steps = ["Route", "Cargo", "Rate & Date", "Review"];
  return (
    <div className="mt-6 overflow-hidden rounded-lg border border-border bg-card p-5">
      <div className="mb-4 flex items-center justify-between">
        <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          Step {step + 1} of {steps.length}
        </span>
        <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-foreground">
          {Math.round(((step + 1) / steps.length) * 100)}%
        </span>
      </div>
      {/* Continuous progress rail with chip nodes on top */}
      <div className="relative">
        <div className="absolute left-3 right-3 top-3.5 h-0.5 rounded-full bg-border" />
        <div
          className="absolute left-3 top-3.5 h-0.5 rounded-full bg-foreground transition-all duration-500"
          style={{
            width: `calc((${(step / (steps.length - 1)) * 100}%) - ${step === steps.length - 1 ? "1.5rem" : "0px"})`,
          }}
        />
        <div className="relative grid grid-cols-4 gap-2">
          {steps.map((s, i) => {
            const done = i < step;
            const active = i === step;
            return (
              <div key={s} className="flex flex-col items-center gap-2">
                <span
                  className={cn(
                    "relative flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-bold transition-all",
                    done &&
                      "bg-primary text-primary-foreground shadow-[0_0_0_4px_color-mix(in_oklab,var(--primary)_15%,transparent)]",
                    active &&
                      "bg-secondary text-secondary-foreground shadow-[0_0_0_4px_color-mix(in_oklab,var(--secondary)_22%,transparent)]",
                    !done && !active && "border border-border bg-background text-muted-foreground",
                  )}
                >
                  {done ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : i + 1}
                </span>
                <span
                  className={cn(
                    "font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-center leading-tight",
                    active
                      ? "text-foreground"
                      : done
                        ? "text-foreground/70"
                        : "text-muted-foreground",
                  )}
                >
                  {s}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ----------------------------- Step 1 — Route ----------------------------- */

type StepFormProps = { form: ReturnType<typeof useForm<FormValues, unknown, ParsedValues>> };

function StepRoute({ form }: StepFormProps) {
  const origin = form.watch("origin");
  const destination = form.watch("destination");
  const intel = useMemo(() => intelFor(origin, destination), [origin, destination]);
  const cross = useMemo(() => isCrossBorder(origin, destination), [origin, destination]);
  const errs = form.formState.errors;

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      {/* LEFT */}
      <div className="rounded-lg border border-border bg-card p-6">
        <span className="section-kicker">Where</span>
        <h2 className="mt-2 font-display text-xl font-bold tracking-[-0.025em]">
          Route &amp; pickup
        </h2>
        <p className="mt-1 text-xs text-muted-foreground">Tell us where the load needs to go.</p>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <Field label="Origin" error={errs.origin?.message}>
            <CityCombobox
              value={origin}
              onChange={(v) => form.setValue("origin", v, { shouldValidate: true })}
              placeholder="Select origin city"
              options={ZIM_CITIES}
            />
          </Field>
          <Field label="Destination" error={errs.destination?.message}>
            <CityCombobox
              value={destination}
              onChange={(v) => form.setValue("destination", v, { shouldValidate: true })}
              placeholder="Select destination city"
              options={ALL_DEST_CITIES}
            />
          </Field>
          <Field label="Pickup address (optional)" className="md:col-span-2">
            <Input
              maxLength={200}
              placeholder="e.g. Workington Industrial, Stand 24"
              {...form.register("pickup_address")}
            />
          </Field>
        </div>
      </div>

      {/* RIGHT — Live preview */}
      <aside className="relative space-y-3 overflow-hidden rounded-lg border border-border bg-card p-5">
        <span
          aria-hidden
          className="hidden"
        />
        <span
          aria-hidden
          className="hidden"
        />
        <div className="relative flex items-center gap-2">
          <span className="dot-live" />
          <span className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-foreground">
            Live route preview
          </span>
        </div>
        {intel ? (
          <div className="relative space-y-3">
            <div className="font-display text-2xl font-bold leading-tight tracking-[-0.025em]">
              {origin} <ArrowRight className="inline h-5 w-5 text-secondary" /> {destination}
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="inline-flex items-center gap-1 rounded-md border border-border bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground inline-flex items-center gap-1 rounded-md border border-border bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground-amber uppercase">via {intel.highway}</span>
              <span className="inline-flex items-center gap-1 rounded-md border border-border bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground uppercase">{intel.distance} km</span>
              <span className="inline-flex items-center gap-1 rounded-md border border-border bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground uppercase">
                <Clock className="h-3 w-3" /> ~{Math.round((intel.distance / 80) * 10) / 10}h
              </span>
            </div>
            <div className="rounded-md border border-border bg-muted/30 p-3">
              <div className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                Market rate
              </div>
              <div className="mt-1 font-display text-2xl font-bold tracking-[-0.03em] text-foreground">
                {formatUSD(intel.low)} <span className="text-muted-foreground">–</span>{" "}
                {formatUSD(intel.high)}
              </div>
              <div className="font-mono tabular-nums text-xs text-muted-foreground">
                ≈ ${(intel.avg / intel.distance).toFixed(2)}/km average
              </div>
            </div>
            <div className="rounded-md border border-border bg-muted/30 p-3">
              <div className="flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                <Fuel className="h-3 w-3" /> Fuel estimate
              </div>
              <div className="mt-1 font-mono tabular-nums text-sm font-semibold text-foreground">
                ~{Math.round(intel.distance * 0.1)}L diesel (~${Math.round(intel.distance * 0.16)})
              </div>
            </div>
            {cross && (
              <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-destructive">
                <div className="flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.16em]">
                  <AlertTriangle className="h-3.5 w-3.5" /> Cross-border
                </div>
                <div className="mt-1 text-xs">
                  ZIMRA documents required. Carriers must be ZIMRA-registered.
                </div>
              </div>
            )}
            {(origin === "Beitbridge" || destination === "Beitbridge") && (
              <div className="rounded-xl border border-[color:var(--warning)]/30 bg-[color:var(--warning)]/10 p-3">
                <div className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-[color-mix(in_oklab,var(--warning)_70%,var(--foreground))]">
                  Beit Bridge wait
                </div>
                <div className="mt-1 font-mono tabular-nums text-sm font-semibold text-foreground">
                  ~2.5 hours · last updated 2 min ago
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="relative rounded-xl border border-dashed border-border bg-background/30 p-6 text-center">
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
              Pick a route
            </p>
            <p className="mt-1 text-xs text-foreground/70">
              Choose origin and destination to see live route intelligence.
            </p>
          </div>
        )}
      </aside>
    </div>
  );
}

/* ----------------------------- Step 2 — Cargo ----------------------------- */

function StepCargo({ form }: StepFormProps) {
  const errs = form.formState.errors;
  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <div className="rounded-lg border border-border bg-card p-6">
        <span className="section-kicker">What</span>
        <h2 className="mt-2 font-display text-xl font-bold tracking-[-0.025em]">
          Cargo &amp; equipment
        </h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Pick the closest match so the right carriers find you.
        </p>
        <div className="mt-5 space-y-5">
          <div>
            <Label className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
              Load type
            </Label>
            <IconGrid
              value={form.watch("load_type")}
              onChange={(v) => form.setValue("load_type", v, { shouldValidate: true })}
              options={LOAD_TYPES_RICH}
            />
            {errs.load_type && (
              <p className="mt-1 text-xs text-destructive">{errs.load_type.message}</p>
            )}
          </div>
          <div>
            <Label className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
              Equipment required
            </Label>
            <IconGrid
              value={form.watch("equipment_required")}
              onChange={(v) => form.setValue("equipment_required", v, { shouldValidate: true })}
              options={EQUIPMENT_RICH}
            />
            {errs.equipment_required && (
              <p className="mt-1 text-xs text-destructive">{errs.equipment_required.message}</p>
            )}
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Weight (tonnes)" error={errs.weight_tonnes?.message}>
              <Controller
                control={form.control}
                name="weight_tonnes"
                render={({ field }) => (
                  <div className="space-y-2">
                    <Input
                      type="number"
                      step="0.5"
                      min={0.5}
                      max={60}
                      value={(field.value as number | string | undefined) ?? ""}
                      onChange={(e) =>
                        field.onChange(e.target.value === "" ? "" : Number(e.target.value))
                      }
                    />
                    <Slider
                      min={0.5}
                      max={60}
                      step={0.5}
                      value={[Number(field.value) || 0.5]}
                      onValueChange={([v]) => field.onChange(v)}
                    />
                  </div>
                )}
              />
            </Field>
            <Field label="Number of loads" error={errs.num_loads?.message}>
              <Controller
                control={form.control}
                name="num_loads"
                render={({ field }) => (
                  <Stepper2
                    value={Number(field.value) || 1}
                    onChange={field.onChange}
                    min={1}
                    max={50}
                  />
                )}
              />
            </Field>
            <Field label="Commodity value (USD, optional)" className="md:col-span-2">
              <Input
                type="number"
                min={0}
                placeholder="e.g. 24000"
                {...form.register("commodity_value")}
              />
            </Field>
          </div>
        </div>
      </div>
      <aside className="relative space-y-3 overflow-hidden rounded-lg border border-border bg-card p-5">
        <span
          aria-hidden
          className="hidden"
        />
        <div className="relative">
          <span className="section-kicker">Cargo tips</span>
        </div>
        <ul className="relative space-y-2.5 text-xs text-muted-foreground">
          <li className="flex items-start gap-2">
            <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-primary" />
            <span>Pick the closest match — carriers filter by load type and equipment.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-primary" />
            <span>
              Multi-load postings (2+) get a &ldquo;fleet&rdquo; badge and reach owner-operators
              with multiple trucks.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-primary" />
            <span>Commodity value is private. Used only for insurance estimates.</span>
          </li>
        </ul>
      </aside>
    </div>
  );
}

/* ----------------------------- Step 3 — Rate & Date ----------------------------- */

function StepRateDate({ form }: StepFormProps) {
  const origin = form.watch("origin");
  const destination = form.watch("destination");
  const pickup = form.watch("pickup_date");
  const intel = useMemo(() => intelFor(origin, destination), [origin, destination]);
  const rate = Number(form.watch("rate_usd")) || 0;
  const errs = form.formState.errors;

  const zone: "low" | "mid" | "high" =
    !intel || !rate ? "mid" : rate < intel.low ? "low" : rate > intel.high ? "high" : "mid";

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
      <div className="rounded-lg border border-border bg-card p-6">
        <span className="section-kicker">When &amp; how</span>
        <h2 className="mt-2 font-display text-xl font-bold tracking-[-0.025em]">
          Schedule &amp; payment
        </h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Set your dates and how you want to be paid.
        </p>
        <div className="mt-5 space-y-5">
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Pickup date" error={errs.pickup_date?.message}>
              <Controller
                control={form.control}
                name="pickup_date"
                render={({ field }) => (
                  <DateField value={field.value} onChange={field.onChange} minDate={new Date()} />
                )}
              />
            </Field>
            <Field label="Delivery deadline" error={errs.delivery_deadline?.message}>
              <Controller
                control={form.control}
                name="delivery_deadline"
                render={({ field }) => (
                  <DateField
                    value={field.value}
                    onChange={field.onChange}
                    minDate={pickup ? new Date(pickup) : new Date()}
                  />
                )}
              />
            </Field>
          </div>
          <label className="flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3 transition-colors hover:bg-muted/30">
            <span className="text-sm">
              <span className="font-semibold text-foreground">Flexible dates</span>{" "}
              <span className="text-muted-foreground">(±1 day)</span>
            </span>
            <Controller
              control={form.control}
              name="flexible_dates"
              render={({ field }) => (
                <Switch checked={!!field.value} onCheckedChange={field.onChange} />
              )}
            />
          </label>

          <div>
            <Label className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
              Payment terms
            </Label>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {PAYMENT_OPTIONS.map((p) => {
                const active = form.watch("payment_terms") === p.value;
                return (
                  <button
                    key={p.value}
                    type="button"
                    onClick={() =>
                      form.setValue("payment_terms", p.value, { shouldValidate: true })
                    }
                    className={cn(
                      "relative flex items-center gap-2 rounded-xl border px-3 py-2.5 text-left text-xs transition-all",
                      active
                        ? "border-secondary/50 bg-secondary/[0.06] text-foreground shadow-[0_0_0_1px_color-mix(in_oklab,var(--secondary)_30%,transparent)]"
                        : "border-border bg-card hover:border-foreground/15 hover:bg-muted/40",
                    )}
                  >
                    <span className="text-base leading-none">{p.icon}</span>
                    <span className="font-medium leading-tight">{p.label}</span>
                    {active && (
                      <span
                        aria-hidden
                        className="absolute right-2 top-2 flex h-3 w-3 items-center justify-center rounded-full bg-secondary text-secondary-foreground"
                      >
                        <Check className="h-2 w-2" strokeWidth={4} />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
            {errs.payment_terms && (
              <p className="mt-1 text-xs text-destructive">{errs.payment_terms.message}</p>
            )}
          </div>

          <label className="flex cursor-pointer items-start justify-between gap-3 rounded-md border border-destructive/20 bg-destructive/5 px-4 py-3">
            <span className="text-sm">
              <span className="flex items-center gap-1.5 font-display font-bold text-destructive">
                <Flame className="h-3.5 w-3.5" /> Mark as URGENT
              </span>
              <span className="mt-0.5 block text-xs text-muted-foreground">
                Boost visibility — $5 extra &middot; pinned to top
              </span>
            </span>
            <Controller
              control={form.control}
              name="is_urgent"
              render={({ field }) => (
                <Switch checked={!!field.value} onCheckedChange={field.onChange} />
              )}
            />
          </label>

          <Field label="Special notes">
            <Textarea
              rows={3}
              maxLength={500}
              placeholder="Any handling instructions, paperwork, or contact preferences"
              {...form.register("notes")}
            />
          </Field>
        </div>
      </div>

      <aside className="relative space-y-4 overflow-hidden rounded-lg border border-border bg-card p-5">
        <span
          aria-hidden
          className="hidden"
        />
        <span
          aria-hidden
          className="hidden"
        />

        <div className="relative">
          <span className="section-kicker">Set your rate</span>
          <div className="relative mt-3">
            <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 font-mono text-2xl font-bold text-muted-foreground">
              $
            </span>
            <Input
              type="number"
              step={50}
              min={50}
              placeholder="1200"
              className="h-16 pl-9 font-display !text-3xl font-bold tracking-[-0.025em] text-foreground"
              {...form.register("rate_usd")}
            />
          </div>
          {errs.rate_usd && (
            <p className="mt-1 text-xs text-destructive">{errs.rate_usd.message}</p>
          )}
        </div>

        {intel && (
          <div className="relative space-y-3">
            <MarketGauge zone={zone} />
            <div className="rounded-md border border-border bg-muted/30 p-3">
              <div className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                Market rates &middot; last 30 days
              </div>
              <div className="mt-2 grid grid-cols-3 gap-2 text-center">
                <Stat label="Low" value={formatUSD(intel.low)} />
                <Stat label="Avg" value={formatUSD(intel.avg)} accent />
                <Stat label="High" value={formatUSD(intel.high)} />
              </div>
              <RateBars low={intel.low} avg={intel.avg} high={intel.high} rate={rate} />
            </div>
            <div className="space-y-2">
              <button
                type="button"
                onClick={() =>
                  form.setValue("rate_usd", Math.round(intel.avg * 0.96), { shouldValidate: true })
                }
                className="flex w-full items-center justify-between rounded-xl border border-[color:var(--success)]/30 bg-[color:var(--success)]/[0.06] px-3 py-2.5 text-left text-sm transition-colors hover:bg-[color:var(--success)]/12"
              >
                <span className="flex items-center gap-1.5 font-medium">
                  <Sparkles className="h-3.5 w-3.5 text-[color:var(--success)]" />
                  Faster booking
                </span>
                <span className="font-display font-bold text-[color:var(--success)]">
                  {formatUSD(Math.round(intel.avg * 0.96))}
                </span>
              </button>
              <button
                type="button"
                onClick={() =>
                  form.setValue("rate_usd", Math.round(intel.high * 0.95), { shouldValidate: true })
                }
                className="flex w-full items-center justify-between rounded-xl border border-[color:var(--warning)]/30 bg-[color:var(--warning)]/[0.06] px-3 py-2.5 text-left text-sm transition-colors hover:bg-[color:var(--warning)]/12"
              >
                <span className="flex items-center gap-1.5 font-medium">
                  <Flame className="h-3.5 w-3.5 text-[color:var(--warning)]" />
                  Attract urgent bookings
                </span>
                <span className="font-display font-bold text-[color-mix(in_oklab,var(--warning)_70%,var(--foreground))]">
                  {formatUSD(Math.round(intel.high * 0.95))}
                </span>
              </button>
            </div>
          </div>
        )}
      </aside>
    </div>
  );
}

/* ----------------------------- Step 4 — Review ----------------------------- */

function StepReview({ form, onEdit }: StepFormProps & { onEdit: (step: number) => void }) {
  const v = form.watch();
  const intel = useMemo(() => intelFor(v.origin, v.destination), [v.origin, v.destination]);
  const errs = form.formState.errors;

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
      <div className="space-y-5">
        {/* Review summary */}
        <div className="relative overflow-hidden rounded-lg border border-border bg-card p-6">
          <span
            aria-hidden
            className="hidden"
          />
          <div className="relative flex items-center justify-between gap-3">
            <span className="section-kicker">Review</span>
            <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Tap any row to edit
            </span>
          </div>
          <h2 className="relative mt-2 font-display text-xl font-bold tracking-[-0.025em]">
            Final check before posting
          </h2>
          <div className="relative mt-5 space-y-2">
            <ReviewRow label="Route" onEdit={() => onEdit(0)}>
              <span className="font-display text-base font-bold tracking-tight">
                {v.origin || "—"} → {v.destination || "—"}
              </span>
              {intel?.distance && (
                <span className="ml-2 font-mono tabular-nums text-xs text-muted-foreground">
                  {intel.distance}km · {intel.highway}
                </span>
              )}
            </ReviewRow>
            <ReviewRow label="Cargo" onEdit={() => onEdit(1)}>
              <span className="font-medium">{v.load_type || "—"}</span>
              <span className="text-muted-foreground"> · {v.equipment_required || "—"}</span>
              <span className="text-muted-foreground">
                {" "}
                · {v.weight_tonnes ? `${v.weight_tonnes}T × ${v.num_loads}` : "—"}
              </span>
            </ReviewRow>
            <ReviewRow label="Rate" onEdit={() => onEdit(2)}>
              <span className="font-display text-base font-bold tracking-tight text-foreground">
                {v.rate_usd ? formatUSD(Number(v.rate_usd)) : "—"}
              </span>
              <span className="text-muted-foreground"> · {v.payment_terms || "—"}</span>
              {v.is_urgent && (
                <span className="inline-flex items-center gap-1 rounded-md border border-border bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground inline-flex items-center gap-1 rounded-md border border-border bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground-danger ml-2 uppercase">
                  <Flame className="h-3 w-3" /> Urgent
                </span>
              )}
            </ReviewRow>
            <ReviewRow label="Pickup" onEdit={() => onEdit(2)}>
              <span className="font-medium">{v.pickup_date || "—"}</span>
              {v.delivery_deadline && (
                <span className="text-muted-foreground"> → {v.delivery_deadline}</span>
              )}
              {v.flexible_dates && <span className="inline-flex items-center gap-1 rounded-md border border-border bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground ml-2 uppercase">Flex ±1d</span>}
            </ReviewRow>
          </div>
        </div>

        {/* Contact + distribution */}
        <div className="rounded-lg border border-border bg-card p-6">
          <span className="section-kicker">Reach</span>
          <h2 className="mt-2 font-display text-xl font-bold tracking-[-0.025em]">
            Contact &amp; distribution
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Where carriers will reach you, and how widely we share your post.
          </p>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <Field label="Company name" error={errs.company_name?.message}>
              <Input maxLength={120} {...form.register("company_name")} />
            </Field>
            <Field label="Contact person" error={errs.contact_person?.message}>
              <Input maxLength={120} {...form.register("contact_person")} />
            </Field>
            <Field label="WhatsApp number" error={errs.whatsapp?.message}>
              <Input placeholder="+263 7X XXX XXXX" maxLength={20} {...form.register("whatsapp")} />
            </Field>
            <Field label="Alt phone / email">
              <Input maxLength={120} placeholder="Optional" {...form.register("alt_contact")} />
            </Field>
            <Field label="Company address" className="md:col-span-2">
              <Input maxLength={200} placeholder="Optional" {...form.register("company_address")} />
            </Field>
          </div>

          <div className="mt-6 space-y-2">
            <Label className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
              Distribution
            </Label>
            <ShareRow
              form={form}
              name="share_to_zf"
              disabled
              label="Post on ZimFreight board"
              sub="Always on"
            />
            <ShareRow
              form={form}
              name="share_harare"
              label="Harare Truckers WhatsApp Group"
              sub="340 carriers"
            />
            <ShareRow
              form={form}
              name="share_bulawayo"
              label="Bulawayo Freight Network"
              sub="180 carriers"
            />
            <ShareRow
              form={form}
              name="share_zha"
              label="Zimbabwe Hauliers Association"
              sub="520 members"
            />
            <ShareRow
              form={form}
              name="share_email_network"
              label="Email my saved carrier network"
            />
            <ShareRow
              form={form}
              name="is_private"
              label="Private — only carriers I invite"
              sub="Hidden from public board"
            />
          </div>
        </div>
      </div>

      <aside className="relative space-y-3 overflow-hidden rounded-lg border border-border bg-card p-5">
        <span
          aria-hidden
          className="hidden"
        />
        <div className="relative">
          <span className="section-kicker">Preview</span>
          <p className="mt-1 text-[11px] text-muted-foreground">
            How carriers will see your load on the board.
          </p>
        </div>
        <div className="relative rounded-xl border border-border bg-background/60 p-4">
          <div className="flex items-center gap-1.5 font-display text-base font-bold leading-tight tracking-[-0.025em]">
            <span className="truncate">{v.origin || "—"}</span>
            <ArrowRight className="h-3.5 w-3.5 shrink-0 text-secondary" />
            <span className="truncate">{v.destination || "—"}</span>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            {intel?.highway && (
              <span className="rounded-full bg-card px-2 py-0.5 font-mono text-[10px] font-semibold tracking-[0.04em] text-foreground/70">
                {intel.highway}
              </span>
            )}
            {intel?.distance && (
              <span className="font-mono text-[10px] font-semibold text-muted-foreground">
                {intel.distance}km
              </span>
            )}
            {v.is_urgent && (
              <span className="inline-flex items-center gap-1 rounded-md border border-border bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground inline-flex items-center gap-1 rounded-md border border-border bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground-danger uppercase">
                <Flame className="h-3 w-3" /> Urgent
              </span>
            )}
            {isCrossBorder(v.origin, v.destination) && (
              <span className="inline-flex items-center gap-1 rounded-md border border-border bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground uppercase">Border</span>
            )}
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
            <Cell label="Load" value={v.load_type || "—"} />
            <Cell label="Equipment" value={v.equipment_required || "—"} />
            <Cell
              label="Weight"
              value={v.weight_tonnes ? `${v.weight_tonnes}T × ${v.num_loads}` : "—"}
            />
            <Cell label="Pickup" value={v.pickup_date || "—"} />
            <Cell label="Payment" value={v.payment_terms || "—"} />
            <Cell label="Rate" value={v.rate_usd ? formatUSD(Number(v.rate_usd)) : "—"} accent />
          </div>
        </div>
        <div className="relative rounded-xl border border-[color:var(--success)]/25 bg-[color:var(--success)]/[0.06] p-3 text-xs text-foreground">
          <ShieldCheck className="mr-1.5 inline h-3.5 w-3.5 text-[color:var(--success)]" />
          Your contact details are only revealed to verified Basic+ carriers.
        </div>
      </aside>
    </div>
  );
}

/* ----------------------------- Success ----------------------------- */

function SuccessScreen({
  loadId,
  values,
  onPostAnother,
}: {
  loadId: string;
  values: FormValues;
  onPostAnother: () => void;
}) {
  const code = `ZF-${new Date().getFullYear()}-${loadId.slice(0, 4).toUpperCase()}`;
  const [views, setViews] = useState(0);
  useEffect(() => {
    const target = 15;
    let i = 0;
    const t = setInterval(() => {
      i += 1;
      setViews(Math.min(target, i));
      if (i >= target) clearInterval(t);
    }, 200);
    return () => clearInterval(t);
  }, []);

  const waMsg = encodeURIComponent(
    `🚛 New load on ZimFreight: ${values.origin} → ${values.destination} · ${values.weight_tonnes}T · ${values.payment_terms}. View: https://zimfreight.app/board?load=${loadId}`,
  );
  const waHref = `https://wa.me/?text=${waMsg}`;

  return (
    <div className="mx-auto max-w-xl px-4 py-16 text-center md:py-20">
      <div className="relative mx-auto h-20 w-20">
        <span
          aria-hidden
          className="absolute inset-0 -z-10 animate-pulse rounded-full bg-[color:var(--success)]/20 blur-2xl"
        />
        <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-[color-mix(in_oklab,var(--success)_15%,transparent)] text-[color:var(--success)]">
          <Check className="h-9 w-9" strokeWidth={2.8} />
        </div>
      </div>
      <span className="section-kicker mx-auto mt-7 justify-center">Posted</span>
      <h1 className="mt-3 font-display text-4xl font-bold tracking-[-0.04em] md:text-5xl">
        Your load is <span className="text-secondary">live</span>
        <PartyPopper className="ml-2 inline h-7 w-7 text-[color:var(--warning)]" />
      </h1>
      <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
        Load ID <span className="text-foreground">{code}</span>
      </p>
      <div className="relative mt-7 overflow-hidden rounded-lg border border-border bg-card p-6">
        <span
          aria-hidden
          className="hidden"
        />
        <div className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
          Live impressions
        </div>
        <div className="mt-2 font-display text-5xl font-bold leading-none tracking-[-0.04em] tabular-nums text-foreground">
          {views}
        </div>
        <div className="mt-2 text-xs text-muted-foreground">carriers have seen your load</div>
      </div>
      <div className="mt-7 flex flex-wrap justify-center gap-2">
        <Button
          asChild
          className="rounded-full bg-[color:var(--success)] text-white hover:bg-[color-mix(in_oklab,var(--success)_85%,black)]"
        >
          <a href={waHref} target="_blank" rel="noreferrer">
            <Share2 className="mr-1.5 h-4 w-4" /> Share on WhatsApp
          </a>
        </Button>
        <Button
          variant="outline"
          className="rounded-full"
          onClick={() => {
            navigator.clipboard.writeText(code);
            toast.success("Load ID copied");
          }}
        >
          <Copy className="mr-1.5 h-4 w-4" /> Copy ID
        </Button>
      </div>
      <div className="mt-5 flex justify-center gap-5 font-mono text-[11px] font-semibold uppercase tracking-[0.16em]">
        <Link
          to="/board"
          search={{ load: loadId } as never}
          className="text-secondary transition-colors hover:text-secondary/80"
        >
          View your load →
        </Link>
        <button
          onClick={onPostAnother}
          className="text-secondary transition-colors hover:text-secondary/80"
        >
          Post another →
        </button>
      </div>
    </div>
  );
}

/* ----------------------------- Reusable bits ----------------------------- */

function Field({
  label,
  error,
  children,
  className,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <Label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
        {label}
      </Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

function CityCombobox({
  value,
  onChange,
  options,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
  placeholder: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          className={cn("w-full justify-between font-normal", !value && "text-muted-foreground")}
        >
          {value || placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[260px] p-0" align="start">
        <Command>
          <CommandInput placeholder="Search city…" />
          <CommandList>
            <CommandEmpty>No city found.</CommandEmpty>
            <CommandGroup>
              {options.map((c) => (
                <CommandItem
                  key={c}
                  value={c}
                  onSelect={() => {
                    onChange(c);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn("mr-2 h-4 w-4", value === c ? "opacity-100" : "opacity-0")}
                  />
                  {c}
                  {CROSS_BORDER_CITIES.includes(c) && (
                    <Badge variant="outline" className="ml-auto text-[10px]">
                      Cross-border
                    </Badge>
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

function DateField({
  value,
  onChange,
  minDate,
}: {
  value?: string;
  onChange: (v: string) => void;
  minDate?: Date;
}) {
  const date = value ? new Date(value) : undefined;
  const min = minDate ?? addDays(new Date(), -1);
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !value && "text-muted-foreground",
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "PPP") : "Pick a date"}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={(d) => onChange(d ? format(d, "yyyy-MM-dd") : "")}
          disabled={(d) => d < new Date(min.toDateString())}
          initialFocus
          className={cn("p-3 pointer-events-auto")}
        />
      </PopoverContent>
    </Popover>
  );
}

function IconGrid({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; icon: string; label: string }[];
}) {
  return (
    <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
      {options.map((o) => {
        const active = value === o.value;
        return (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            className={cn(
              "group relative flex flex-col items-center justify-center gap-1.5 overflow-hidden rounded-xl border p-3 text-center transition-all",
              active
                ? "border-secondary/50 bg-secondary/[0.06] shadow-[0_0_0_1px_color-mix(in_oklab,var(--secondary)_30%,transparent)]"
                : "border-border bg-card hover:border-foreground/15 hover:bg-muted/40",
            )}
          >
            {active && (
              <span
                aria-hidden
                className="absolute right-1.5 top-1.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-secondary text-secondary-foreground"
              >
                <Check className="h-2.5 w-2.5" strokeWidth={3.5} />
              </span>
            )}
            <span className="text-2xl leading-none">{o.icon}</span>
            <span
              className={cn(
                "font-display text-[11px] leading-tight tracking-tight",
                active ? "font-bold text-foreground" : "font-medium text-muted-foreground",
              )}
            >
              {o.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function Stepper2({
  value,
  onChange,
  min,
  max,
}: {
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
}) {
  return (
    <div className="inline-flex h-10 items-stretch overflow-hidden rounded-full border border-border bg-card">
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - 1))}
        className="flex w-10 items-center justify-center text-lg font-bold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      >
        −
      </button>
      <div className="flex w-14 items-center justify-center border-x border-border font-display text-lg font-bold tracking-tight text-foreground">
        {value}
      </div>
      <button
        type="button"
        onClick={() => onChange(Math.min(max, value + 1))}
        className="flex w-10 items-center justify-center text-lg font-bold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      >
        +
      </button>
    </div>
  );
}

function MarketGauge({ zone }: { zone: "low" | "mid" | "high" }) {
  const labels: Record<typeof zone, string> = {
    low: "Below market",
    mid: "At market",
    high: "Above market",
  };
  return (
    <div>
      <div className="flex h-2 overflow-hidden rounded-full">
        <div className={cn("flex-1 bg-destructive/60", zone === "low" && "bg-destructive")} />
        <div
          className={cn(
            "flex-1 bg-[color:var(--success)]/40",
            zone === "mid" && "bg-[color:var(--success)]",
          )}
        />
        <div
          className={cn(
            "flex-1 bg-[color:var(--warning)]/40",
            zone === "high" && "bg-[color:var(--warning)]",
          )}
        />
      </div>
      <div className="mt-1 flex justify-between font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
        <span className={cn(zone === "low" && "text-destructive")}>Low</span>
        <span
          className={cn(
            "font-bold",
            zone === "mid" && "text-[color:var(--success)]",
            zone === "high" && "text-[color:var(--warning)]",
            zone === "low" && "text-destructive",
          )}
        >
          {labels[zone]}
        </span>
        <span className={cn(zone === "high" && "text-[color:var(--warning)]")}>High</span>
      </div>
    </div>
  );
}

function RateBars({
  low,
  avg,
  high,
  rate,
}: {
  low: number;
  avg: number;
  high: number;
  rate: number;
}) {
  // simple distribution histogram around avg
  const buckets = [low, (low + avg) / 2, avg, (avg + high) / 2, high];
  const heights = [40, 70, 100, 75, 45];
  return (
    <div className="mt-3">
      <div className="flex h-16 items-end gap-1">
        {heights.map((h, i) => {
          const isCurrent =
            rate > 0 &&
            rate >= buckets[i] - (high - low) / 12 &&
            rate <= buckets[i] + (high - low) / 12;
          return (
            <div
              key={i}
              className={cn("flex-1 rounded-t-sm", isCurrent ? "bg-primary" : "bg-primary/25")}
              style={{ height: `${h}%` }}
            />
          );
        })}
      </div>
      <div className="mt-1 flex justify-between font-mono text-[10px] text-muted-foreground">
        {buckets.map((b, i) => (
          <span key={i}>${Math.round(b)}</span>
        ))}
      </div>
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div
      className={cn(
        "rounded-lg border border-border bg-card/60 p-2",
        accent && "border-secondary/35 bg-secondary/[0.06]",
      )}
    >
      <div className="font-mono text-[9px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </div>
      <div
        className={cn(
          "mt-0.5 font-display text-base font-bold tracking-tight",
          accent ? "text-secondary" : "text-foreground",
        )}
      >
        {value}
      </div>
    </div>
  );
}

function Cell({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="rounded-lg border border-border/60 bg-card/50 p-2.5">
      <div className="font-mono text-[9px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </div>
      <div
        className={cn(
          "mt-0.5 truncate text-sm",
          accent
            ? "font-display text-base font-bold tracking-tight text-foreground"
            : "text-foreground",
        )}
      >
        {value}
      </div>
    </div>
  );
}

function ShareRow({
  form,
  name,
  label,
  sub,
  disabled,
}: {
  form: StepFormProps["form"];
  name: keyof FormValues;
  label: string;
  sub?: string;
  disabled?: boolean;
}) {
  return (
    <label
      className={cn(
        "flex items-start gap-3 rounded-xl border border-border bg-card px-3.5 py-2.5 transition-colors",
        disabled ? "opacity-65" : "hover:bg-muted/40",
      )}
    >
      <Controller
        control={form.control}
        name={name}
        render={({ field }) => (
          <Checkbox
            checked={!!field.value}
            onCheckedChange={field.onChange}
            disabled={disabled}
            className="mt-0.5"
          />
        )}
      />
      <div className="flex-1 leading-tight">
        <div className="text-sm font-medium text-foreground">{label}</div>
        {sub && (
          <div className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
            {sub}
          </div>
        )}
      </div>
    </label>
  );
}

function humanAge(ms: number) {
  const m = Math.floor(ms / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m} minute${m === 1 ? "" : "s"} ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} hour${h === 1 ? "" : "s"} ago`;
  const d = Math.floor(h / 24);
  return `${d} day${d === 1 ? "" : "s"} ago`;
}

function ReviewRow({
  label,
  children,
  onEdit,
}: {
  label: string;
  children: React.ReactNode;
  onEdit: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onEdit}
      className="group flex w-full items-center justify-between gap-3 rounded-xl border border-border bg-card px-4 py-3 text-left transition-colors hover:border-foreground/15 hover:bg-muted/30"
    >
      <div className="min-w-0 flex-1">
        <div className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
          {label}
        </div>
        <div className="mt-1 text-sm">{children}</div>
      </div>
      <span className="inline-flex items-center gap-1 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-secondary opacity-0 transition-opacity group-hover:opacity-100">
        Edit <ArrowRight className="h-3 w-3" />
      </span>
    </button>
  );
}
