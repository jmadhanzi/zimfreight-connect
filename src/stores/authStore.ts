import { create } from "zustand";
import type { Session, User } from "@supabase/supabase-js";
import type { PlanTier, Profile, Subscription } from "@/types";
import { PLAN_LEVEL } from "@/types";

interface AuthState {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  subscription: Subscription | null;
  loading: boolean;
  setAuth: (session: Session | null, user: User | null) => void;
  setProfile: (p: Profile | null) => void;
  setSubscription: (s: Subscription | null) => void;
  setLoading: (l: boolean) => void;
  reset: () => void;
  hasPlan: (min: PlanTier) => boolean;
  currentPlan: () => PlanTier;
}

/** Returns true only when the subscription is active and not expired. */
function isSubscriptionActive(sub: Subscription | null): boolean {
  if (!sub) return false;
  if (sub.status !== "active") return false;
  if (sub.expires_at && new Date(sub.expires_at) < new Date()) return false;
  return true;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  session: null,
  user: null,
  profile: null,
  subscription: null,
  loading: true,
  setAuth: (session, user) => set({ session, user }),
  setProfile: (profile) => set({ profile }),
  setSubscription: (subscription) => set({ subscription }),
  setLoading: (loading) => set({ loading }),
  // Bug fix: also reset `loading` to false so the app never hangs after sign-out.
  reset: () => set({ session: null, user: null, profile: null, subscription: null, loading: false }),
  currentPlan: () => {
    const sub = get().subscription;
    if (!isSubscriptionActive(sub)) return "free";
    return (sub?.plan as PlanTier) ?? "free";
  },
  hasPlan: (min: PlanTier) => {
    const sub = get().subscription;
    // Bug fix: treat pending/cancelled/expired subscriptions as free tier.
    const plan: PlanTier = isSubscriptionActive(sub) ? ((sub?.plan as PlanTier) ?? "free") : "free";
    return PLAN_LEVEL[plan] >= PLAN_LEVEL[min];
  },
}));
