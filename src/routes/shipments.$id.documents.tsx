import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  FileText,
  Upload,
  Check,
  AlertCircle,
  ShieldCheck,
  Trash2,
  Eye,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from "@/hooks/useAuth";
import {
  getShipmentDocs,
  saveDoc,
  deleteDoc,
  DOC_META,
  REQUIRED_CROSS_BORDER_DOCS,
  type ShipmentDoc,
  type DocKind,
} from "@/lib/operational";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/shipments/$id/documents")({
  head: ({ params }) => ({
    meta: [
      { title: `Shipment ${params.id} documents — ZimFreight` },
      {
        name: "description",
        content: "Upload and manage ZIMRA documents for this shipment in one workspace.",
      },
    ],
  }),
  component: ShipmentDocsPage,
});

function ShipmentDocsPage() {
  const { id } = useParams({ from: "/shipments/$id/documents" });
  const [docs, setDocs] = useState<ShipmentDoc[]>([]);
  const [uploadKind, setUploadKind] = useState<DocKind | null>(null);
  const [previewDoc, setPreviewDoc] = useState<ShipmentDoc | null>(null);

  useEffect(() => {
    const refresh = () => setDocs(getShipmentDocs(id));
    refresh();
    window.addEventListener("zf:docs-changed", refresh);
    return () => window.removeEventListener("zf:docs-changed", refresh);
  }, [id]);

  const docsByKind = useMemo(() => {
    const map = new Map<DocKind, ShipmentDoc>();
    for (const d of docs) map.set(d.kind, d);
    return map;
  }, [docs]);

  const requiredComplete = REQUIRED_CROSS_BORDER_DOCS.filter((k) => docsByKind.has(k)).length;
  const requiredTotal = REQUIRED_CROSS_BORDER_DOCS.length;
  const allRequired = requiredComplete === requiredTotal;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 md:px-6 md:py-10">
      <Link
        to="/dashboard"
        className="inline-flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3 w-3" /> Back to dashboard
      </Link>

      <div className="mt-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <span className="section-kicker">
            <ShieldCheck className="h-3 w-3" /> ZIMRA workspace
          </span>
          <h1 className="mt-3 font-display text-3xl font-black tracking-[-0.04em] md:text-4xl">
            Shipment <span className="text-secondary">documents</span>
          </h1>
          <p className="mt-2 max-w-xl text-muted-foreground">
            Upload all customs and shipping documents for this shipment in one place. Carriers and
            brokers see the same checklist.
          </p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mt-6 overflow-hidden rounded-2xl border border-border/70 bg-card p-5 pt-[18px]">
        <span
          aria-hidden
          className={cn(
            "absolute inset-x-0 top-0 h-[3px]",
            allRequired
              ? "bg-[color:var(--success)]"
              : "bg-gradient-to-r from-secondary via-primary to-secondary",
          )}
        />
        <div className="flex items-baseline justify-between">
          <span className="section-kicker">Progress</span>
          <span className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
            <span
              className={cn(
                "text-base font-display",
                allRequired ? "text-[color:var(--success)]" : "text-foreground",
              )}
            >
              {requiredComplete}
            </span>
            <span className="text-muted-foreground/60">/{requiredTotal}</span> required uploaded
          </span>
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-500",
              allRequired
                ? "bg-[color:var(--success)]"
                : "bg-gradient-to-r from-secondary to-primary",
            )}
            style={{ width: `${(requiredComplete / requiredTotal) * 100}%` }}
          />
        </div>
        {allRequired ? (
          <div className="mt-3 flex items-center gap-2 text-sm">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[color:var(--success)] text-white">
              <Check className="h-3 w-3" strokeWidth={3} />
            </span>
            <span className="font-display font-bold tracking-tight text-[color:var(--success)]">
              Ready for the border. Show this checklist to ZIMRA on arrival.
            </span>
          </div>
        ) : (
          <p className="mt-3 text-xs text-muted-foreground">
            Upload all required documents before you reach the border to avoid delays.
          </p>
        )}
      </div>

      {/* Document grid */}
      <div className="mt-6 space-y-3">
        <h2 className="font-display text-lg font-extrabold tracking-[-0.025em]">
          Required documents
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {REQUIRED_CROSS_BORDER_DOCS.map((kind) => (
            <DocRow
              key={kind}
              kind={kind}
              doc={docsByKind.get(kind)}
              required
              onUpload={() => setUploadKind(kind)}
              onPreview={(d) => setPreviewDoc(d)}
            />
          ))}
        </div>

        <h2 className="mt-6 font-display text-lg font-extrabold tracking-[-0.025em]">Optional</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {(Object.keys(DOC_META) as DocKind[])
            .filter((k) => !DOC_META[k].required_cross_border)
            .map((kind) => (
              <DocRow
                key={kind}
                kind={kind}
                doc={docsByKind.get(kind)}
                onUpload={() => setUploadKind(kind)}
                onPreview={(d) => setPreviewDoc(d)}
              />
            ))}
        </div>
      </div>

      <UploadDialog
        open={uploadKind !== null}
        onOpenChange={(b) => !b && setUploadKind(null)}
        kind={uploadKind}
        shipmentId={id}
      />

      {previewDoc && (
        <PreviewDialog
          open={!!previewDoc}
          onOpenChange={(b) => !b && setPreviewDoc(null)}
          doc={previewDoc}
        />
      )}
    </div>
  );
}

function DocRow({
  kind,
  doc,
  required,
  onUpload,
  onPreview,
}: {
  kind: DocKind;
  doc?: ShipmentDoc;
  required?: boolean;
  onUpload: () => void;
  onPreview: (d: ShipmentDoc) => void;
}) {
  const meta = DOC_META[kind];
  const has = !!doc;

  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-2xl border p-4 transition-colors",
        has
          ? "border-[color:var(--success)]/30 bg-[color-mix(in_oklab,var(--success)_4%,transparent)]"
          : required
            ? "border-secondary/30 bg-card"
            : "border-border/70 bg-card",
      )}
    >
      <span
        className={cn(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl",
          has
            ? "bg-[color:var(--success)]/15 text-[color:var(--success)]"
            : "bg-muted text-muted-foreground",
        )}
      >
        {has ? <Check className="h-4 w-4" strokeWidth={2.5} /> : <FileText className="h-4 w-4" />}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="font-display text-sm font-extrabold tracking-tight text-foreground">
            {meta.label}
          </span>
          {required && !has && (
            <span className="rounded-full bg-destructive/12 px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-[0.14em] text-destructive">
              Required
            </span>
          )}
        </div>
        {has ? (
          <div className="mt-0.5 truncate font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
            {doc.filename} · uploaded {new Date(doc.uploaded_at).toLocaleDateString()}
          </div>
        ) : (
          <div className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
            Not uploaded
          </div>
        )}
      </div>
      {has ? (
        <div className="flex gap-1">
          <button
            onClick={() => onPreview(doc)}
            className="flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Preview"
          >
            <Eye className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => {
              deleteDoc(doc.id);
              toast.success("Removed");
            }}
            className="flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
            aria-label="Remove"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : (
        <Button
          size="sm"
          onClick={onUpload}
          className="rounded-full bg-secondary font-bold text-secondary-foreground hover:bg-secondary/90"
        >
          <Upload className="mr-1 h-3.5 w-3.5" /> Upload
        </Button>
      )}
    </div>
  );
}

function UploadDialog({
  open,
  onOpenChange,
  kind,
  shipmentId,
}: {
  open: boolean;
  onOpenChange: (b: boolean) => void;
  kind: DocKind | null;
  shipmentId: string;
}) {
  const { user } = useAuth();
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<{ data: string; name: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) setPreview(null);
  }, [open]);

  const onFile = (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File too large (max 5MB)");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setPreview({ data: reader.result as string, name: file.name });
    reader.readAsDataURL(file);
  };

  const submit = () => {
    if (!preview || !kind) {
      toast.error("Choose a file");
      return;
    }
    setSubmitting(true);
    try {
      saveDoc({
        shipmentId,
        kind,
        filename: preview.name,
        fileData: preview.data,
        status: "uploaded",
        uploaded_by: user?.id,
      });
      toast.success(`${DOC_META[kind].label} uploaded`);
      onOpenChange(false);
    } finally {
      setSubmitting(false);
    }
  };

  if (!kind) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="overflow-hidden border-border/70 bg-card p-0 sm:max-w-md">
        <span
          aria-hidden
          className="absolute inset-x-0 top-0 z-10 h-[3px] bg-gradient-to-r from-secondary via-primary to-secondary"
        />
        <div className="p-6">
          <DialogHeader>
            <span className="section-kicker">Upload</span>
            <DialogTitle className="mt-2 font-display text-2xl font-black tracking-[-0.035em]">
              {DOC_META[kind].label}
            </DialogTitle>
          </DialogHeader>
          <div className="mt-5">
            <input
              ref={inputRef}
              type="file"
              accept="image/*,application/pdf"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])}
            />
            {preview ? (
              <div className="relative overflow-hidden rounded-xl border border-border bg-[var(--bg-secondary)] p-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary/15 text-secondary">
                    <FileText className="h-5 w-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-display font-bold tracking-tight">
                      {preview.name}
                    </div>
                    <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                      Ready
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="flex w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border bg-card/40 px-4 py-10 transition-all hover:border-secondary/40 hover:bg-card"
              >
                <Upload className="h-6 w-6 text-muted-foreground" />
                <span className="font-display text-sm font-extrabold tracking-tight">
                  Choose file
                </span>
                <span className="text-xs text-muted-foreground">PDF or image · max 5MB</span>
              </button>
            )}
          </div>
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
              className="flex-1 rounded-full bg-secondary font-bold text-secondary-foreground btn-amber-glow hover:bg-secondary/90"
            >
              <Upload className="mr-1.5 h-3.5 w-3.5" /> Upload
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function PreviewDialog({
  open,
  onOpenChange,
  doc,
}: {
  open: boolean;
  onOpenChange: (b: boolean) => void;
  doc: ShipmentDoc;
}) {
  const isImage = doc.fileData?.startsWith("data:image");
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="overflow-hidden border-border/70 bg-card p-0 sm:max-w-2xl">
        <span
          aria-hidden
          className="absolute inset-x-0 top-0 z-10 h-[3px] bg-[color:var(--success)]"
        />
        <div className="p-6">
          <DialogHeader>
            <span className="section-kicker">Document</span>
            <DialogTitle className="mt-2 font-display text-2xl font-black tracking-[-0.035em]">
              {DOC_META[doc.kind].label}
            </DialogTitle>
            <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
              {doc.filename} · {new Date(doc.uploaded_at).toLocaleString()}
            </p>
          </DialogHeader>
          <div className="mt-4 max-h-[60vh] overflow-auto rounded-xl border border-border bg-[var(--bg-secondary)]">
            {isImage && doc.fileData ? (
              <img src={doc.fileData} alt={doc.filename} className="block h-auto w-full" />
            ) : (
              <div className="p-12 text-center">
                <FileText className="mx-auto h-8 w-8 text-muted-foreground" />
                <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                  PDF preview unavailable
                </p>
                <p className="mt-1 text-sm text-foreground/70">Download to view</p>
              </div>
            )}
          </div>
          <div className="mt-4 flex gap-2">
            <Button
              variant="outline"
              className="flex-1 rounded-full"
              onClick={() => onOpenChange(false)}
            >
              Close
            </Button>
            {doc.fileData && (
              <a href={doc.fileData} download={doc.filename} className="flex-1">
                <Button className="w-full rounded-full bg-secondary font-bold text-secondary-foreground btn-amber-glow hover:bg-secondary/90">
                  <Download className="mr-1.5 h-3.5 w-3.5" /> Download
                </Button>
              </a>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

void AlertCircle; // keep import for future error states
