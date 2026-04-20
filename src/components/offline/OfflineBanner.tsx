import { useEffect, useRef, useState } from "react";
import { WifiOff } from "lucide-react";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";
import { getMeta, listQueuedPosts, removeQueuedPost } from "@/lib/offlineDb";
import { db } from "@/lib/db";
import { toast } from "sonner";

/** Persistent orange banner when offline + green toast on reconnect.
 * Also drains the post_queue once back online. */
export function OfflineBanner() {
  const online = useNetworkStatus();
  const [cachedAge, setCachedAge] = useState<string>("recently");
  const wasOffline = useRef(false);

  useEffect(() => {
    if (online) return;
    (async () => {
      const ts = (await getMeta("loads_updated_at")) as number | null;
      setCachedAge(ts ? humanAge(Date.now() - Number(ts)) : "recently");
    })();
  }, [online]);

  useEffect(() => {
    if (!online) { wasOffline.current = true; return; }
    if (!wasOffline.current) return;
    wasOffline.current = false;
    void drainQueue();
  }, [online]);

  if (online) return null;

  return (
    <div className="sticky top-0 z-50 flex items-center justify-center gap-2 border-b border-orange-500/40 bg-orange-500/95 px-4 py-2 text-center text-sm font-medium text-white shadow-md">
      <WifiOff className="h-4 w-4" />
      <span>You're offline — showing cached loads from {cachedAge} ago</span>
    </div>
  );
}

async function drainQueue() {
  const queued = await listQueuedPosts();
  if (queued.length === 0) {
    toast.success("Back online — syncing latest loads...");
    return;
  }
  toast.success(`Back online — posting ${queued.length} queued load${queued.length > 1 ? "s" : ""}...`);
  let posted = 0;
  for (const item of queued) {
    try {
      const { error } = await db.from("loads").insert(item.payload);
      if (!error) {
        await removeQueuedPost(item.id);
        posted++;
      }
    } catch { /* keep in queue */ }
  }
  if (posted > 0) toast.success(`✅ ${posted} queued load${posted > 1 ? "s" : ""} posted successfully`);
}

function humanAge(ms: number): string {
  const m = Math.floor(ms / 60_000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}