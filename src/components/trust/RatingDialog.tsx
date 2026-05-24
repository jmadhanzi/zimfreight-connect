import { useState } from "react";
import { Star, Check, ThumbsUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from "@/hooks/useAuth";
import { saveRating } from "@/lib/trust";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function RatingDialog({
  open,
  onOpenChange,
  subjectId,
  subjectName,
  bookingId,
  /** Whether the rater is rating a broker (collect paidOnTime) or carrier (asDescribed). */
  subjectType,
}: {
  open: boolean;
  onOpenChange: (b: boolean) => void;
  subjectId: string;
  subjectName: string;
  bookingId?: string;
  subjectType: "broker" | "carrier";
}) {
  const { user } = useAuth();
  const [stars, setStars] = useState(5);
  const [hovered, setHovered] = useState<number | null>(null);
  const [paidOnTime, setPaidOnTime] = useState<boolean | null>(null);
  const [asDescribed, setAsDescribed] = useState<boolean | null>(null);
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = () => {
    if (!user?.id) {
      toast.error("Sign in to rate");
      return;
    }
    setSubmitting(true);
    try {
      saveRating({
        subjectId,
        raterId: user.id,
        bookingId,
        stars,
        note: note || undefined,
        paidOnTime: subjectType === "broker" ? (paidOnTime ?? undefined) : undefined,
        asDescribed: subjectType === "carrier" ? (asDescribed ?? undefined) : undefined,
      });
      toast.success(`Thanks — ${subjectName} rated ${stars}★`);
      // Reset and close
      setStars(5);
      setNote("");
      setPaidOnTime(null);
      setAsDescribed(null);
      onOpenChange(false);
    } finally {
      setSubmitting(false);
    }
  };

  const display = hovered ?? stars;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="overflow-hidden border-border/70 bg-card p-0 sm:max-w-md">
        <span
          aria-hidden
          className="absolute inset-x-0 top-0 z-10 h-[3px] bg-gradient-to-r from-secondary via-primary to-secondary"
        />
        <div className="p-6">
          <DialogHeader>
            <span className="section-kicker">
              <ThumbsUp className="h-3 w-3" /> Rate
            </span>
            <DialogTitle className="mt-2 font-display text-2xl font-bold tracking-[-0.035em]">
              How was <span className="text-secondary">{subjectName}</span>?
            </DialogTitle>
            <p className="mt-1 text-xs text-muted-foreground">
              Your rating helps {subjectType === "broker" ? "carriers" : "brokers"} pick partners
              they can trust.
            </p>
          </DialogHeader>

          {/* Star picker */}
          <div className="mt-6 flex items-center justify-center gap-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <button
                key={i}
                type="button"
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
                onClick={() => setStars(i)}
                className="transition-transform hover:scale-110"
                aria-label={`${i} star${i === 1 ? "" : "s"}`}
              >
                <Star
                  className={cn(
                    "h-9 w-9 transition-colors",
                    i <= display ? "fill-secondary text-secondary" : "text-border",
                  )}
                  strokeWidth={1.6}
                />
              </button>
            ))}
          </div>
          <div className="mt-2 text-center font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
            {display === 5
              ? "Excellent"
              : display === 4
                ? "Good"
                : display === 3
                  ? "OK"
                  : display === 2
                    ? "Below avg"
                    : "Poor"}
          </div>

          {/* Specific dimension */}
          {subjectType === "broker" && (
            <div className="mt-5 rounded-xl border border-border bg-[var(--bg-secondary)] p-4">
              <Label className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                Did they pay on time?
              </Label>
              <div className="mt-2 grid grid-cols-2 gap-2">
                <YesNoTile
                  active={paidOnTime === true}
                  onClick={() => setPaidOnTime(true)}
                  label="Yes"
                  tone="success"
                />
                <YesNoTile
                  active={paidOnTime === false}
                  onClick={() => setPaidOnTime(false)}
                  label="No"
                  tone="destructive"
                />
              </div>
            </div>
          )}
          {subjectType === "carrier" && (
            <div className="mt-5 rounded-xl border border-border bg-[var(--bg-secondary)] p-4">
              <Label className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                Was the load handled as described?
              </Label>
              <div className="mt-2 grid grid-cols-2 gap-2">
                <YesNoTile
                  active={asDescribed === true}
                  onClick={() => setAsDescribed(true)}
                  label="Yes"
                  tone="success"
                />
                <YesNoTile
                  active={asDescribed === false}
                  onClick={() => setAsDescribed(false)}
                  label="No"
                  tone="destructive"
                />
              </div>
            </div>
          )}

          {/* Note */}
          <div className="mt-4">
            <Label className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
              Note (optional)
            </Label>
            <Textarea
              rows={3}
              maxLength={200}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={
                subjectType === "broker"
                  ? "e.g. Paid in 3 days, easy to work with…"
                  : "e.g. Picked up on time, careful with the load…"
              }
              className="mt-1.5"
            />
          </div>

          <div className="mt-5 flex gap-2">
            <Button
              variant="outline"
              className="flex-1 rounded-full"
              onClick={() => onOpenChange(false)}
            >
              Skip
            </Button>
            <Button
              onClick={submit}
              disabled={submitting}
              className="flex-1 bg-secondary font-semibold text-secondary-foreground hover:bg-secondary/90"
            >
              <Check className="mr-1.5 h-3.5 w-3.5" /> Submit rating
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function YesNoTile({
  active,
  onClick,
  label,
  tone,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  tone: "success" | "destructive";
}) {
  const cls = tone === "success" ? "var(--success)" : "var(--destructive)";
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-lg border-2 px-4 py-2 font-display text-sm font-bold tracking-tight transition-all",
        active
          ? "border-current"
          : "border-border bg-card text-muted-foreground hover:border-foreground/15 hover:text-foreground",
      )}
      style={
        active ? { color: cls, background: `color-mix(in oklab, ${cls} 12%, transparent)` } : {}
      }
    >
      {label}
    </button>
  );
}
