import { useEffect, useState } from "react";
import { MapPin, Send, RefreshCw, Clock, Wifi } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { savePing, getLatestPingByDriver, type LocationPing } from "@/lib/operational";
import { toast } from "sonner";

export function LocationShareWidget() {
  const { user, profile } = useAuth();
  const [latest, setLatest] = useState<LocationPing | null>(null);
  const [busy, setBusy] = useState(false);
  const [autoShare, setAutoShare] = useState(false);

  useEffect(() => {
    if (!user?.id) return;
    const refresh = () => setLatest(getLatestPingByDriver(user.id));
    refresh();
    window.addEventListener("zf:ping-changed", refresh);
    return () => window.removeEventListener("zf:ping-changed", refresh);
  }, [user?.id]);

  // Auto-share every hour
  useEffect(() => {
    if (!autoShare || !user?.id) return;
    const interval = setInterval(() => sharePing(false), 60 * 60_000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoShare, user?.id]);

  const sharePing = async (showToast = true) => {
    if (!user?.id) return;
    setBusy(true);
    try {
      if (typeof navigator === "undefined" || !navigator.geolocation) {
        toast.error("Geolocation not supported");
        return;
      }
      await new Promise<void>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            savePing({
              driverId: user.id,
              driverName: profile?.full_name ?? "Driver",
              lat: pos.coords.latitude,
              lng: pos.coords.longitude,
              speed: pos.coords.speed ?? undefined,
            });
            if (showToast) toast.success("Location shared with broker");
            resolve();
          },
          (err) => {
            toast.error(`Couldn't get location: ${err.message}`);
            reject(err);
          },
          { enableHighAccuracy: false, timeout: 8000, maximumAge: 60000 },
        );
      });
    } catch {
      /* handled in callback */
    } finally {
      setBusy(false);
    }
  };

  const ageMin = latest
    ? Math.floor((Date.now() - new Date(latest.ping_at).getTime()) / 60000)
    : null;
  const ageLabel =
    ageMin === null
      ? "—"
      : ageMin < 1
        ? "just now"
        : ageMin < 60
          ? `${ageMin}m ago`
          : `${Math.floor(ageMin / 60)}h ago`;

  return (
    <div className="rounded-lg border border-border/70 bg-card p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <span className="section-kicker">
            <MapPin className="h-3 w-3" /> Tracking
          </span>
          <h2 className="mt-2 font-display text-lg font-bold tracking-[-0.025em]">
            Share your location
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Brokers see where you are mid-transit. Builds trust without an app install.
          </p>
        </div>
        {latest && (
          <span className="inline-flex items-center gap-1 rounded-full bg-[color:var(--success)]/12 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-[color:var(--success)]">
            <span className="dot-live" /> Live
          </span>
        )}
      </div>

      {latest ? (
        <div className="mt-4 rounded-xl border border-border bg-[var(--bg-secondary)] p-4">
          <div className="flex items-baseline justify-between gap-3">
            <div>
              <div className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                Last ping
              </div>
              <div className="mt-1 font-display text-base font-bold tracking-[-0.02em] tabular-nums">
                {latest.lat.toFixed(4)}°, {latest.lng.toFixed(4)}°
              </div>
              {latest.label && (
                <div className="mt-0.5 text-xs text-muted-foreground">{latest.label}</div>
              )}
            </div>
            <div className="text-right">
              <div className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
                <Clock className="mr-0.5 inline h-2.5 w-2.5" /> {ageLabel}
              </div>
              {latest.speed !== undefined && (
                <div className="mt-1 font-mono tabular-nums text-sm font-bold tabular-nums text-foreground">
                  {Math.round((latest.speed ?? 0) * 3.6)}
                  <span className="ml-0.5 font-mono text-[10px] text-muted-foreground">km/h</span>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-4 rounded-xl border border-dashed border-border bg-card/50 p-5 text-center">
          <MapPin className="mx-auto h-5 w-5 text-muted-foreground/60" />
          <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            No pings yet
          </p>
        </div>
      )}

      <div className="mt-4 flex gap-2">
        <Button
          onClick={() => sharePing()}
          disabled={busy}
          className="flex-1 bg-secondary font-semibold text-secondary-foreground hover:bg-secondary/90"
        >
          {busy ? (
            <RefreshCw className="mr-1.5 h-3.5 w-3.5 animate-spin" />
          ) : (
            <Send className="mr-1.5 h-3.5 w-3.5" />
          )}
          Share location now
        </Button>
        <button
          onClick={() => {
            setAutoShare(!autoShare);
            toast.success(autoShare ? "Auto-share off" : "Auto-share on (every hour)");
          }}
          className={`inline-flex items-center gap-1 rounded-full border px-3 py-2 font-mono text-[10px] font-bold uppercase tracking-[0.14em] transition-colors ${
            autoShare
              ? "border-secondary/40 bg-secondary/[0.08] text-secondary"
              : "border-border bg-card text-muted-foreground hover:border-foreground/15 hover:text-foreground"
          }`}
        >
          <Wifi className="h-3 w-3" /> Auto {autoShare ? "on" : "off"}
        </button>
      </div>
    </div>
  );
}
