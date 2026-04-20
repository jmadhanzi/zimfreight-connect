import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Lock, Phone, MessageCircle, ArrowRight } from "lucide-react";
import { formatUSD } from "@/lib/utils";
import type { Load } from "@/types";
import { useAuth } from "@/hooks/useAuth";

export function LoadDetailDialog({ load, onClose, onRequestAuth }: { load: Load | null; onClose: () => void; onRequestAuth: () => void }) {
  const { user, subscription } = useAuth();
  const canSeeContacts = !!user && (subscription?.plan === "basic" || subscription?.plan === "pro" || subscription?.plan === "fleet");

  return (
    <Dialog open={!!load} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="border-border bg-card max-w-2xl">
        {load && (
          <>
            <DialogHeader>
              <DialogTitle className="font-display text-3xl font-black tracking-tight">
                {load.origin} <ArrowRight className="inline h-6 w-6 text-primary" /> {load.destination}
              </DialogTitle>
            </DialogHeader>

            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              <Stat label="Rate" value={formatUSD(load.rate_usd)} accent />
              {load.rate_per_km && <Stat label="$/km" value={`$${load.rate_per_km}`} />}
              {load.distance_km && <Stat label="Distance" value={`${load.distance_km} km`} />}
              {load.weight_tonnes && <Stat label="Weight" value={`${load.weight_tonnes} t`} />}
            </div>

            <div className="space-y-2 text-sm">
              <Row label="Load type" value={load.load_type} />
              {load.equipment_required && <Row label="Equipment" value={load.equipment_required} />}
              {load.payment_terms && <Row label="Payment" value={load.payment_terms} />}
              {load.pickup_date && <Row label="Pickup" value={load.pickup_date} />}
              {load.delivery_deadline && <Row label="Delivery by" value={load.delivery_deadline} />}
              <div className="flex flex-wrap gap-1.5 pt-2">
                {load.is_border_crossing && <Badge variant="outline">Border crossing</Badge>}
                {load.zimra_required && <Badge variant="outline">ZIMRA required</Badge>}
                {load.is_urgent && <Badge className="bg-destructive text-destructive-foreground">Urgent</Badge>}
              </div>
              {load.notes && <p className="rounded-md bg-background/40 p-3 text-muted-foreground">{load.notes}</p>}
            </div>

            <div className="rounded-lg border border-border bg-background/40 p-4">
              <h4 className="mb-3 font-display text-sm font-bold uppercase tracking-wider">Contact poster</h4>
              {canSeeContacts ? (
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" className="bg-primary text-primary-foreground"><Phone className="mr-2 h-4 w-4" /> Call</Button>
                  <Button size="sm" className="bg-[color:var(--success)] text-background hover:opacity-90"><MessageCircle className="mr-2 h-4 w-4" /> WhatsApp</Button>
                </div>
              ) : (
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-start gap-2">
                    <Lock className="mt-0.5 h-4 w-4 text-primary" />
                    <p className="text-sm text-muted-foreground">
                      {user ? "Upgrade to Basic to unlock direct phone & WhatsApp contacts." : "Sign in and subscribe to unlock contacts."}
                    </p>
                  </div>
                  <Button size="sm" onClick={() => { onClose(); if (!user) onRequestAuth(); }}
                    className="bg-primary text-primary-foreground">
                    {user ? "View plans" : "Sign in"}
                  </Button>
                </div>
              )}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="rounded-md border border-border bg-background/40 p-3">
      <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className={`font-display text-xl font-bold ${accent ? "text-primary" : "text-foreground"}`}>{value}</div>
    </div>
  );
}
function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between border-b border-border/60 py-1.5">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-foreground">{value}</span>
    </div>
  );
}
