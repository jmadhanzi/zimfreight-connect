import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import { db } from "@/lib/db";
import { ZIM_CITIES } from "@/types";
import { toast } from "sonner";
import { useState } from "react";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/onboarding")({
  head: () => ({ meta: [{ title: "Welcome — ZimFreight" }, { name: "description", content: "Complete your profile." }] }),
  component: OnboardingPage,
});

const schema = z.object({
  full_name: z.string().min(2).max(80),
  company_name: z.string().max(120).optional(),
  phone_whatsapp: z.string().min(7).max(20),
  city: z.string().min(1),
  role: z.enum(["carrier", "broker", "owner"]),
  zimra_registered: z.boolean(),
});
type Values = z.infer<typeof schema>;

function OnboardingPage() {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const form = useForm<Values>({
    resolver: zodResolver(schema),
    values: profile ? {
      full_name: profile.full_name,
      company_name: profile.company_name ?? "",
      phone_whatsapp: profile.phone_whatsapp ?? "",
      city: profile.city ?? "Harare",
      role: profile.role,
      zimra_registered: profile.zimra_registered,
    } : undefined,
    defaultValues: { full_name: "", company_name: "", phone_whatsapp: "", city: "Harare", role: "carrier", zimra_registered: false },
  });

  if (loading) return <div className="mx-auto max-w-2xl px-4 py-20 text-center text-muted-foreground">Loading…</div>;
  if (!user) return (
    <div className="mx-auto max-w-2xl px-4 py-20 text-center">
      <h1 className="font-display text-3xl font-black uppercase">Sign in first</h1>
      <Button asChild className="mt-6 bg-primary text-primary-foreground"><Link to="/">Back home</Link></Button>
    </div>
  );

  const onSubmit = async (v: Values) => {
    setSaving(true);
    try {
      const { error } = await db.from("profiles").update({
        full_name: v.full_name,
        company_name: v.company_name || null,
        phone_whatsapp: v.phone_whatsapp,
        city: v.city,
        role: v.role,
        zimra_registered: v.zimra_registered,
      }).eq("user_id", user.id);
      if (error) throw error;
      toast.success("Profile saved");
      navigate({ to: "/dashboard" });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to save");
    } finally { setSaving(false); }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 md:px-6">
      <span className="font-mono text-xs uppercase tracking-widest text-primary">Step 1 of 1</span>
      <h1 className="mt-1 font-display text-4xl font-black uppercase tracking-tight md:text-5xl">Tell us about you</h1>
      <p className="mt-2 text-muted-foreground">A few details so carriers and brokers can reach you fast.</p>

      <form onSubmit={form.handleSubmit(onSubmit)} className="mt-8 space-y-4 rounded-lg border border-border bg-card p-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1.5">
            <Label>Full name</Label>
            <Input {...form.register("full_name")} />
          </div>
          <div className="space-y-1.5">
            <Label>Company (optional)</Label>
            <Input {...form.register("company_name")} />
          </div>
          <div className="space-y-1.5">
            <Label>WhatsApp number</Label>
            <Input placeholder="+263 77 123 4567" {...form.register("phone_whatsapp")} />
          </div>
          <div className="space-y-1.5">
            <Label>Base city</Label>
            <Select defaultValue={form.getValues("city")} onValueChange={(v) => form.setValue("city", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{ZIM_CITIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5 md:col-span-2">
            <Label>I am a…</Label>
            <Select defaultValue={form.getValues("role")} onValueChange={(v) => form.setValue("role", v as Values["role"])}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="carrier">Carrier (I move loads)</SelectItem>
                <SelectItem value="broker">Broker (I match loads to carriers)</SelectItem>
                <SelectItem value="owner">Cargo owner / shipper</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <label className="flex cursor-pointer items-center justify-between rounded-md border border-border bg-background/40 px-3 py-2.5">
          <span className="text-sm">I'm ZIMRA-registered</span>
          <Switch checked={form.watch("zimra_registered")} onCheckedChange={(v) => form.setValue("zimra_registered", v)} />
        </label>
        <div className="flex justify-end">
          <Button type="submit" disabled={saving} className="bg-primary text-primary-foreground hover:bg-primary/90">
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save and continue
          </Button>
        </div>
      </form>
    </div>
  );
}
