import { create } from "zustand";
import type { Session, User } from "@supabase/supabase-js";
import type { Profile, Subscription } from "@/types";

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
}

export const useAuthStore = create<AuthState>((set) => ({
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
}));
