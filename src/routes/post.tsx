import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { db } from "@/lib/db";
import { useAuth } from "@/hooks/useAuth";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ZIM_CITIES, LOAD_TYPES, EQUIPMENT_TYPES } from "@/types";
import { toast } from "sonner";
import { useState } from "react";
import { Loader2, Lock } from "lucide-react";

export const Route = createFileRoute("/post")({
  head: () => ({
    meta: [
      { title: "Post a Load — ZimFreight" },
      { name: "description", content: "Post your freight load to Zimbabwe's largest carrier network." },
      { property: "og:title", content: "Post a Load — ZimFreight" },
      { property: "og:description", content: "Reach 850+ verified carriers across Zimbabwe and SADC." },
    ],
  }),
  component: PostLoadPage,
});

const schema = z.object({
  origin: z.string().min(1, "Origin required"),
  destination: z.string().min(1, "Destination required"),
  load_type: z.string().min(1, "Load type required"),
  equipment_required: z.string().optional(),
  weight_tonnes: z.coerce.number().min(0).max(100).optional(),
  num_loads: z.coerce.number().int().min(1).max(50).default(1),
  rate_usd: z.coerce.number().min(1, "Rate required").max(100000),
  distance_km: z.coerce.number().int().min(1).max(5000).optional(),
  payment_terms: z.string().max(120).optional(),
  pickup_date: z.string().optional(),
  delivery_deadline: z.string().optional(),
  notes: z.string().max(500).optional(),
  is_border_crossing: z.boolean(),
  zimra_required: z.boolean(),
  is_urgent: z.boolean(),
}).refine((d) => d.origin !== d.destination, { message: "Origin and destination must differ", path: ["destination"] });

type FormValues = z.input<typeof schema>;
type ParsedValues = z.output<typeof schema>;

function PostLoadPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const form = useForm<FormValues, unknown, ParsedValues>({
    resolver: zodResolver(schema),
    defaultValues: { num_loads: 1, is_border_crossing: false, zimra_required: false, is_urgent: false },
  });

  if (loading) {
    return <div className="mx-auto max-w-2xl px-4 py-20 text-center text-muted-foreground">Loading…</div>;
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/15 text-primary">
          <Lock className="h-5 w-5" />
        </div>
        <h1 className="mt-4 font-display text-3xl font-black uppercase tracking-tight">Sign in to post loads</h1>
        <p className="mt-2 text-sm text-muted-foreground">Create a free account to post your first load.</p>
        <Button asChild className="mt-6 bg-primary text-primary-foreground"><Link to="/">Back to home</Link></Button>
      </div>
    );
  }

  const onSubmit = async (values: ParsedValues) => {
    setSubmitting(true);
    try {
      const rate_per_km = values.distance_km ? +(values.rate_usd / values.distance_km).toFixed(2) : null;
      const { error } = await db.from("loads").insert({
        poster_id: user.id,
        origin: values.origin,
        destination: values.destination,
        load_type: values.load_type,
        equipment_required: values.equipment_required ?? null,
        weight_tonnes: values.weight_tonnes ?? null,
        num_loads: values.num_loads,
        rate_usd: values.rate_usd,
        distance_km: values.distance_km ?? null,
        rate_per_km,
        payment_terms: values.payment_terms ?? null,
        pickup_date: values.pickup_date || null,
        delivery_deadline: values.delivery_deadline || null,
        notes: values.notes ?? null,
        is_border_crossing: values.is_border_crossing,
        zimra_required: values.zimra_required,
        is_urgent: values.is_urgent,
        status: "available",
      });
      if (error) throw error;
      toast.success("Load posted to the board");
      navigate({ to: "/board" });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to post load");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 md:px-6">
      <span className="font-mono text-xs uppercase tracking-widest text-primary">New load</span>
      <h1 className="mt-1 font-display text-4xl font-black uppercase tracking-tight md:text-5xl">Post a load</h1>
      <p className="mt-2 text-muted-foreground">Reach 850+ verified Zimbabwean carriers in seconds.</p>

      <form onSubmit={form.handleSubmit(onSubmit)} className="mt-8 space-y-6 rounded-lg border border-border bg-card p-6">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Origin" error={form.formState.errors.origin?.message}>
            <Select onValueChange={(v) => form.setValue("origin", v)}>
              <SelectTrigger><SelectValue placeholder="Select origin city" /></SelectTrigger>
              <SelectContent>{ZIM_CITIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
            </Select>
          </Field>
          <Field label="Destination" error={form.formState.errors.destination?.message}>
            <Select onValueChange={(v) => form.setValue("destination", v)}>
              <SelectTrigger><SelectValue placeholder="Select destination city" /></SelectTrigger>
              <SelectContent>{ZIM_CITIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
            </Select>
          </Field>
          <Field label="Load type" error={form.formState.errors.load_type?.message}>
            <Select onValueChange={(v) => form.setValue("load_type", v)}>
              <SelectTrigger><SelectValue placeholder="Commodity / cargo" /></SelectTrigger>
              <SelectContent>{LOAD_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
            </Select>
          </Field>
          <Field label="Equipment (optional)">
            <Select onValueChange={(v) => form.setValue("equipment_required", v)}>
              <SelectTrigger><SelectValue placeholder="Truck type" /></SelectTrigger>
              <SelectContent>{EQUIPMENT_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
            </Select>
          </Field>
          <Field label="Rate (USD)" error={form.formState.errors.rate_usd?.message}>
            <Input type="number" step="50" placeholder="1500" {...form.register("rate_usd")} />
          </Field>
          <Field label="Distance (km)">
            <Input type="number" placeholder="580" {...form.register("distance_km")} />
          </Field>
          <Field label="Weight (tonnes)">
            <Input type="number" step="0.1" placeholder="28" {...form.register("weight_tonnes")} />
          </Field>
          <Field label="Number of loads">
            <Input type="number" min={1} {...form.register("num_loads")} />
          </Field>
          <Field label="Pickup date">
            <Input type="date" {...form.register("pickup_date")} />
          </Field>
          <Field label="Delivery deadline">
            <Input type="date" {...form.register("delivery_deadline")} />
          </Field>
        </div>

        <Field label="Payment terms">
          <Input placeholder="50% advance, balance on delivery" {...form.register("payment_terms")} />
        </Field>
        <Field label="Notes">
          <Textarea rows={3} placeholder="Any special handling, paperwork or contact instructions" {...form.register("notes")} />
        </Field>

        <div className="grid gap-3 md:grid-cols-3">
          <Toggle label="Border crossing" checked={form.watch("is_border_crossing")} onChange={(v) => form.setValue("is_border_crossing", v)} />
          <Toggle label="ZIMRA required" checked={form.watch("zimra_required")} onChange={(v) => form.setValue("zimra_required", v)} />
          <Toggle label="Mark as urgent" checked={form.watch("is_urgent")} onChange={(v) => form.setValue("is_urgent", v)} />
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={() => form.reset()}>Reset</Button>
          <Button type="submit" disabled={submitting} className="bg-primary text-primary-foreground hover:bg-primary/90">
            {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Post to board
          </Button>
        </div>
      </form>
    </div>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs uppercase tracking-wider text-muted-foreground">{label}</Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex cursor-pointer items-center justify-between rounded-md border border-border bg-background/40 px-3 py-2.5">
      <span className="text-sm">{label}</span>
      <Switch checked={checked} onCheckedChange={onChange} />
    </label>
  );
}
