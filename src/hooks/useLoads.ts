import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { db } from "@/lib/db";
import type { Load } from "@/types";
import { cacheLoads, getCachedLoads } from "@/lib/offlineDb";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";

export function useLoads() {
  const [loads, setLoads] = useState<Load[]>([]);
  const [loading, setLoading] = useState(true);
  const online = useNetworkStatus();

  useEffect(() => {
    let mounted = true;
    (async () => {
      // Hydrate from IndexedDB instantly (works offline too)
      const cached = await getCachedLoads();
      if (mounted && cached.length) { setLoads(cached); setLoading(false); }
      if (typeof navigator !== "undefined" && !navigator.onLine) { setLoading(false); return; }
      const { data } = await db.from("loads").select("*").eq("status", "available").order("created_at", { ascending: false }).limit(100);
      if (mounted && data) {
        setLoads(data as Load[]);
        setLoading(false);
        void cacheLoads(data as Load[]);
      } else if (mounted) {
        setLoading(false);
      }
    })();

    const channel = supabase
      .channel("loads-feed")
      .on("postgres_changes" as never, { event: "*", schema: "public", table: "loads" }, () => {
        db.from("loads").select("*").eq("status", "available").order("created_at", { ascending: false }).limit(100)
          .then(({ data }: { data: Load[] | null }) => {
            if (!mounted || !data) return;
            setLoads(data);
            void cacheLoads(data);
          });
      })
      .subscribe();

    return () => { mounted = false; supabase.removeChannel(channel); };
  }, [online]);

  return { loads, loading };
}
