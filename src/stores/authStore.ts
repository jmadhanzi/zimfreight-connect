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
  reset: () => set({ session: null, user: null, profile: null, subscription: null }),
  currentPlan: () => (get().subscription?.plan as PlanTier) ?? "free",
  hasPlan: (min: PlanTier) => {
    const plan: PlanTier = (get().subscription?.plan as PlanTier) ?? "free";
    return PLAN_LEVEL[plan] >= PLAN_LEVEL[min];
  },
}));
