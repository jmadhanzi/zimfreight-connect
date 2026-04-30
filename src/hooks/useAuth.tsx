import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { db } from "@/lib/db";
import { useAuthStore } from "@/stores/authStore";
import type { Profile, Subscription } from "@/types";
import type { Session } from "@supabase/supabase-js";

// Dev-only bypass: in `bun run dev`, treat every signed-in user as a Fleet
// subscriber so paywalls/upgrade gates don't block exploration. Has zero
// effect in production builds (import.meta.env.DEV is false).
const DEV_BYPASS = import.meta.env.DEV;

export function useAuthBootstrap() {
  const { setAuth, setProfile, setSubscription, setLoading, reset } = useAuthStore();

  useEffect(() => {
    // Bug fix: renamed to `authListener` to avoid shadowing the inner `sub`
    // variable inside loadProfile, which previously caused a runtime error
    // when the cleanup function tried to call sub.subscription.unsubscribe().
    const { data: authListener } = supabase.auth.onAuthStateChange((_event: string, session: Session | null) => {
      setAuth(session, session?.user ?? null);
      if (session?.user) setTimeout(() => loadProfile(session.user.id), 0);
      else reset();
    });

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
      // Bug fix: renamed from `sub` to `currentSub` to avoid shadowing the
      // outer `authListener` variable and breaking the cleanup function.
      const currentSub = subscription as Subscription | null;
      if (DEV_BYPASS) {
        // Force Fleet tier in dev so every paywall passes.
        setSubscription({
          ...(currentSub ?? {
            id: "dev-bypass",
            user_id: userId,
            status: "active",
            ecocash_ref: null,
            stripe_subscription_id: null,
            expires_at: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }),
          plan: "fleet",
          status: "active",
        } as Subscription);
      } else {
        setSubscription(currentSub);
      }
      setLoading(false);
    }

    return () => authListener.subscription.unsubscribe();
  }, [setAuth, setProfile, setSubscription, setLoading, reset]);
}

export function useAuth() {
  return useAuthStore();
}
