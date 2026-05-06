import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { ArrowRight, Truck, Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/hooks/useAuth";
import { ZIM_CITIES, ALL_DEST_CITIES } from "@/types";
import { saveTruckPost } from "@/lib/truckPosts";
import { toast } from "sonner";

export const Route = createFileRoute("/trucks/post")({
  head: () => ({
    meta: [
      { title: "Post my truck — ZimFreight" },
      {
        name: "description",
        content:
          "List your available truck capacity. Brokers will find you instead of you chasing loads.",
      },
    ],
  }),
  component: PostTruckPage,
});

const EQUIPMENT_OPTIONS = [
  "Flatbed 30T",
  "Rigid 10T",
  "Rigid 5T",
  "Tanker (Fuel)",
  "Tanker (Water)",
  "Refrigerated",
  "Lowbed",
  "Livestock Truck",
  "Side Tipper",
  "Box truck",
];

interface FormValues {
  carrierName: string;
  carrierWhatsapp: string;
  origin: string;
  destination: string;
  available_date: string;
  flexible_dates: boolean;
  equipment: string;
  weight_capacity_t: number;
  rate_usd_per_km: number | string;
  notes: string;
  is_zimra_ready: boolean;
}

function PostTruckPage() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<FormValues>({
    defaultValues: {
      carrierName: profile?.full_name ?? profile?.company_name ?? "",
      carrierWhatsapp: profile?.phone_whatsapp ?? "+263 ",
      origin: "",
      destination: "",
      available_date: new Date(Date.now() + 86400_000).toISOString().slice(0, 10),
      flexible_dates: false,
      equipment: "Flatbed 30T",
      weight_capacity_t: 30,
      rate_usd_per_km: "",
      notes: "",
      is_zimra_ready: false,
    },
  });

  const origin = form.watch("origin");
  const destination = form.watch("destination");
  const isCross =
    origin === "Beitbridge" ||
    destination === "Beitbridge" ||
    origin === "Chirundu" ||
    destination === "Chirundu" ||
    ["Johannesburg", "Lusaka", "Blantyre", "Maputo"].includes(destination);

  const onSubmit = async (v: FormValues) => {
    if (!v.origin || !v.destination) {
      toast.error("Pick origin and destination");
      return;
    }
    setSubmitting(true);
    try {
      const post = saveTruckPost({
        carrierId: user?.id ?? `u_${Date.now().toString(36)}`,
        carrierName: v.carrierName,
        carrierWhatsapp: v.carrierWhatsapp,
        origin: v.origin,
        destination: v.destination,
        available_date: v.available_date,
        flexible_dates: v.flexible_dates,
        equipment: v.equipment,
        weight_capacity_t: Number(v.weight_capacity_t),
        rate_usd_per_km: v.rate_usd_per_km !== "" ? Number(v.rate_usd_per_km) : null,
        notes: v.notes,
        is_cross_border: isCross,
        is_zimra_ready: v.is_zimra_ready,
      });
      toast.success("Truck posted — brokers can now find you");
      navigate({ to: "/trucks", search: { posted: post.id } as never });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to post truck");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 md:px-6 md:py-12">
      <Link
        to="/trucks"
        className="inline-flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3 w-3" /> Back to trucks
      </Link>

      <div className="mt-6">
        <span className="section-kicker">Truck post</span>
        <h1 className="mt-3 font-display text-3xl font-black tracking-[-0.04em] md:text-4xl">
          List your <span className="text-secondary">available truck</span>
        </h1>
        <p className="mt-3 text-muted-foreground">
          Tell us where your truck is going and when. Brokers running freight on that lane will see
          you and reach out directly.
        </p>
      </div>

      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="mt-8 space-y-5 rounded-2xl border border-border/70 bg-card p-6"
      >
        {/* Carrier identity */}
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Your name (or company)">
            <Input
              {...form.register("carrierName", { required: true })}
              placeholder="Tatenda Moyo"
            />
          </Field>
          <Field label="WhatsApp number">
            <Input
              {...form.register("carrierWhatsapp", { required: true })}
              placeholder="+263 77 123 4567"
            />
          </Field>
        </div>

        {/* Route */}
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Origin">
            <Controller
              control={form.control}
              name="origin"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pick origin" />
                  </SelectTrigger>
                  <SelectContent>
                    {ZIM_CITIES.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </Field>
          <Field label="Destination">
            <Controller
              control={form.control}
              name="destination"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pick destination" />
                  </SelectTrigger>
                  <SelectContent>
                    {ALL_DEST_CITIES.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </Field>
        </div>

        {/* Available date */}
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Available from">
            <Input type="date" {...form.register("available_date")} />
          </Field>
          <label className="flex cursor-pointer items-center justify-between rounded-xl border border-border bg-card px-4 py-2.5 md:mt-7">
            <span className="text-sm">
              <span className="font-semibold">Flexible dates</span>{" "}
              <span className="text-muted-foreground">(±1 day)</span>
            </span>
            <Controller
              control={form.control}
              name="flexible_dates"
              render={({ field }) => (
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              )}
            />
          </label>
        </div>

        {/* Equipment */}
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Equipment">
            <Controller
              control={form.control}
              name="equipment"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {EQUIPMENT_OPTIONS.map((e) => (
                      <SelectItem key={e} value={e}>
                        {e}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </Field>
          <Field label="Capacity (tonnes)">
            <Input
              type="number"
              step={0.5}
              min={0.5}
              max={60}
              {...form.register("weight_capacity_t", { valueAsNumber: true })}
            />
          </Field>
        </div>

        {/* Rate */}
        <Field label="Asking rate ($/km, optional)">
          <Input
            type="number"
            step={0.05}
            min={0}
            placeholder="e.g. 0.85"
            {...form.register("rate_usd_per_km")}
          />
        </Field>

        {/* ZIMRA */}
        <label className="flex cursor-pointer items-center justify-between rounded-xl border border-border bg-card px-4 py-3">
          <span className="text-sm">
            <span className="font-semibold text-foreground">ZIMRA-registered</span>
            <span className="block text-xs text-muted-foreground">
              Cleared for cross-border freight
            </span>
          </span>
          <Controller
            control={form.control}
            name="is_zimra_ready"
            render={({ field }) => (
              <Switch checked={field.value} onCheckedChange={field.onChange} />
            )}
          />
        </label>

        {/* Notes */}
        <Field label="Notes (optional)">
          <Textarea
            rows={3}
            maxLength={300}
            placeholder="Anything brokers should know — backhaul preferences, equipment quirks, who to ask for…"
            {...form.register("notes")}
          />
        </Field>

        <div className="flex items-center justify-between pt-2">
          <Button asChild variant="ghost" type="button" className="text-muted-foreground">
            <Link to="/trucks">Cancel</Link>
          </Button>
          <Button
            type="submit"
            disabled={submitting}
            className="rounded-full bg-secondary px-6 font-bold text-secondary-foreground btn-amber-glow hover:bg-secondary/90"
          >
            {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            <Truck className="mr-2 h-4 w-4" /> Post my truck
            <ArrowRight className="ml-1.5 h-4 w-4" />
          </Button>
        </div>
      </form>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <Label className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </Label>
      <div className="mt-1.5">{children}</div>
    </div>
  );
}
