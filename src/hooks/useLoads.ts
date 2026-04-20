import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { db } from "@/lib/db";
import type { Load } from "@/types";

export function useLoads() {
  const [loads, setLoads] = useState<Load[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data } = await db.from("loads").select("*").eq("status", "available").order("created_at", { ascending: false }).limit(100);
      if (mounted) { setLoads((data ?? []) as Load[]); setLoading(false); }
    })();

    const channel = supabase
      .channel("loads-feed")
      .on("postgres_changes" as never, { event: "*", schema: "public", table: "loads" }, () => {
        db.from("loads").select("*").eq("status", "available").order("created_at", { ascending: false }).limit(100)
          .then(({ data }: { data: Load[] | null }) => mounted && setLoads((data ?? []) as Load[]));
      })
      .subscribe();

    return () => { mounted = false; supabase.removeChannel(channel); };
  }, []);

  return { loads, loading };
}
