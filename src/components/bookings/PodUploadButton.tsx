import { useEffect, useRef, useState } from "react";
import { Camera, Check, Upload, X, FileImage } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from "@/hooks/useAuth";
import { getPodForBooking, savePod, type PodUpload } from "@/lib/operational";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function PodUploadButton({ bookingId }: { bookingId: string }) {
  const [pod, setPod] = useState<PodUpload | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const refresh = () => setPod(getPodForBooking(bookingId));
    refresh();
    window.addEventListener("zf:pod-changed", refresh);
    return () => window.removeEventListener("zf:pod-changed", refresh);
  }, [bookingId]);

  if (pod) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-full border border-[color:var(--success)]/40 bg-[color:var(--success)]/10 px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-[color:var(--success)] transition-colors hover:bg-[color:var(--success)]/15"
      >
        <Check className="h-3 w-3" strokeWidth={3} />
        POD uploaded
        <PodPreviewDialog open={open} onOpenChange={setOpen} pod={pod} bookingId={bookingId} />
      </button>
    );
  }

  return (
    <>
      <Button
        size="sm"
        onClick={() => setOpen(true)}
        className="bg-secondary font-semibold text-secondary-foreground hover:bg-secondary/90"
      >
        <Camera className="mr-1.5 h-3.5 w-3.5" /> Upload POD
      </Button>
      <PodUploadDialog open={open} onOpenChange={setOpen} bookingId={bookingId} />
    </>
  );
}

function PodPreviewDialog({
  open,
  onOpenChange,
  pod,
  bookingId,
}: {
  open: boolean;
  onOpenChange: (b: boolean) => void;
  pod: PodUpload;
  bookingId: string;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="overflow-hidden border-border/70 bg-card p-0 sm:max-w-lg">
        <span
          aria-hidden
          className="absolute inset-x-0 top-0 z-10 h-[3px] bg-[color:var(--success)]"
        />
        <div className="p-6">
          <DialogHeader>
            <span className="section-kicker">
              <Check className="h-3 w-3" /> Delivered
            </span>
            <DialogTitle className="mt-2 font-display text-2xl font-bold tracking-[-0.035em]">
              Proof of delivery
            </DialogTitle>
          </DialogHeader>
          <div className="mt-4 overflow-hidden rounded-lg border border-border bg-[var(--bg-secondary)]">
            <img src={pod.imageDataUrl} alt="Proof of delivery" className="block h-auto w-full" />
          </div>
          {pod.notes && (
            <p className="mt-3 rounded-xl bg-muted/30 p-3 text-sm text-foreground/85">
              {pod.notes}
            </p>
          )}
          <div className="mt-3 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
            <span>Uploaded by {pod.uploadedByName ?? "driver"}</span>
            <span>{new Date(pod.uploaded_at).toLocaleString()}</span>
          </div>
          <div className="mt-5 flex gap-2">
            <Button
              variant="outline"
              className="flex-1 rounded-full"
              onClick={() => onOpenChange(false)}
            >
              Close
            </Button>
            <PodUploadButton bookingId={bookingId} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function PodUploadDialog({
  open,
  onOpenChange,
  bookingId,
}: {
  open: boolean;
  onOpenChange: (b: boolean) => void;
  bookingId: string;
}) {
  const { user, profile } = useAuth();
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const onFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image too large (max 5MB)");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const submit = () => {
    if (!preview) {
      toast.error("Choose a photo first");
      return;
    }
    setSubmitting(true);
    try {
      savePod({
        bookingId,
        imageDataUrl: preview,
        notes: notes || undefined,
        uploadedBy: user?.id ?? "anon",
        uploadedByName: profile?.full_name ?? "Driver",
      });
      toast.success("POD uploaded — payment release triggered");
      setPreview(null);
      setNotes("");
      onOpenChange(false);
    } finally {
      setSubmitting(false);
    }
  };

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
              <Camera className="h-3 w-3" /> POD
            </span>
            <DialogTitle className="mt-2 font-display text-2xl font-bold tracking-[-0.035em]">
              Upload proof of delivery
            </DialogTitle>
            <p className="mt-1 text-xs text-muted-foreground">
              Snap the signed delivery note. Payment is released to the carrier once the broker
              reviews and confirms.
            </p>
          </DialogHeader>

          <div className="mt-5">
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])}
            />
            {preview ? (
              <div className="relative overflow-hidden rounded-lg border border-border">
                <img src={preview} alt="POD preview" className="block h-auto w-full" />
                <button
                  onClick={() => setPreview(null)}
                  className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-sm transition-colors hover:bg-black/80"
                  aria-label="Remove"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className={cn(
                  "flex w-full flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed border-border bg-card/40 px-6 py-10 transition-all",
                  "hover:border-secondary/40 hover:bg-card",
                )}
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary/15 text-secondary">
                  <FileImage className="h-5 w-5" strokeWidth={2.4} />
                </span>
                <div className="text-center">
                  <span className="font-display text-base font-bold tracking-tight">
                    Choose photo
                  </span>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Take a photo of the signed delivery note
                  </p>
                </div>
              </button>
            )}
          </div>

          <Textarea
            rows={2}
            maxLength={200}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Notes (optional) — receiver name, time, condition…"
            className="mt-4"
          />

          <div className="mt-5 flex gap-2">
            <Button
              variant="outline"
              className="flex-1 rounded-full"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={submit}
              disabled={submitting || !preview}
              className="flex-1 bg-secondary font-semibold text-secondary-foreground hover:bg-secondary/90"
            >
              <Upload className="mr-1.5 h-3.5 w-3.5" /> Upload POD
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
