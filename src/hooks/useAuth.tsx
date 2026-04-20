import { useEffect } from "react";
import { db } from "@/lib/db";
import { useAuthStore } from "@/stores/authStore";
import type { Profile, Subscription } from "@/types";

export function useAuthBootstrap() {
  const { setAuth, setProfile, setSubscription, setLoading, reset } = useAuthStore();

  useEffect(() => {
    // Set up listener FIRST
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuth(session, session?.user ?? null);
      if (session?.user) {
        // defer to avoid deadlock
        setTimeout(() => loadProfile(session.user.id), 0);
      } else {
        reset();
      }
    });

    // Then check existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setAuth(session, session?.user ?? null);
      if (session?.user) loadProfile(session.user.id);
      else setLoading(false);
    });

    async function loadProfile(userId: string) {
      const [{ data: profile }, { data: subscription }] = await Promise.all([
        db.from("profiles").select("*").eq("user_id", userId).maybeSingle(),
        db.from("subscriptions").select("*").eq("user_id", userId).order("created_at", { ascending: false }).limit(1).maybeSingle(),
      ]);
      setProfile(profile as Profile | null);
      setSubscription(subscription as Subscription | null);
      setLoading(false);
    }

    return () => sub.subscription.unsubscribe();
  }, [setAuth, setProfile, setSubscription, setLoading, reset]);
}

export function useAuth() {
  return useAuthStore();
}
