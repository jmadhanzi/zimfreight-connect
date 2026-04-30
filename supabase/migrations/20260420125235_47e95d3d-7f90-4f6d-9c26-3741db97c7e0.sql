-- Migration: extended schema with updated_at columns and additional tables.
-- Uses IF NOT EXISTS / CREATE OR REPLACE / DROP ... IF EXISTS guards so this
-- migration is safe to run even when the initial migration (zimfreight_init)
-- has already created the base tables.

-- Enum types (only create if they don't already exist)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
    CREATE TYPE public.user_role AS ENUM ('carrier', 'broker', 'owner');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'load_status') THEN
    CREATE TYPE public.load_status AS ENUM ('available', 'booked', 'completed', 'expired');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'plan_tier') THEN
    CREATE TYPE public.plan_tier AS ENUM ('free', 'basic', 'pro', 'fleet');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'subscription_status') THEN
    CREATE TYPE public.subscription_status AS ENUM ('active', 'pending', 'cancelled', 'expired');
  END IF;
END $$;

-- Updated-at helper (idempotent)
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

-- ======== profiles ========
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL DEFAULT '',
  company_name TEXT,
  phone_whatsapp TEXT,
  city TEXT,
  role public.user_role NOT NULL DEFAULT 'carrier',
  zimra_registered BOOLEAN NOT NULL DEFAULT false,
  verified BOOLEAN NOT NULL DEFAULT false,
  rating NUMERIC(3,2) NOT NULL DEFAULT 0,
  total_loads INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Profiles are viewable by everyone') THEN
    CREATE POLICY "Profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users insert own profile') THEN
    CREATE POLICY "Users insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users update own profile') THEN
    CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
  END IF;
END $$;
DROP TRIGGER IF EXISTS trg_profiles_updated ON public.profiles;
CREATE TRIGGER trg_profiles_updated BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ======== subscriptions ========
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan public.plan_tier NOT NULL DEFAULT 'free',
  status public.subscription_status NOT NULL DEFAULT 'active',
  stripe_subscription_id TEXT,
  ecocash_ref TEXT,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user ON public.subscriptions(user_id, created_at DESC);
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'subscriptions' AND policyname = 'Users view own subscription') THEN
    CREATE POLICY "Users view own subscription" ON public.subscriptions FOR SELECT USING (auth.uid() = user_id);
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'subscriptions' AND policyname = 'Users insert own subscription') THEN
    CREATE POLICY "Users insert own subscription" ON public.subscriptions FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'subscriptions' AND policyname = 'Users update own subscription') THEN
    CREATE POLICY "Users update own subscription" ON public.subscriptions FOR UPDATE USING (auth.uid() = user_id);
  END IF;
END $$;
DROP TRIGGER IF EXISTS trg_subscriptions_updated ON public.subscriptions;
CREATE TRIGGER trg_subscriptions_updated BEFORE UPDATE ON public.subscriptions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ======== loads ========
CREATE TABLE IF NOT EXISTS public.loads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  poster_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  origin TEXT NOT NULL,
  destination TEXT NOT NULL,
  highway TEXT,
  distance_km INTEGER,
  load_type TEXT NOT NULL,
  equipment_required TEXT,
  weight_tonnes NUMERIC(6,2),
  num_loads INTEGER NOT NULL DEFAULT 1,
  rate_usd NUMERIC(10,2) NOT NULL,
  rate_per_km NUMERIC(6,2),
  payment_terms TEXT,
  pickup_date DATE,
  delivery_deadline DATE,
  notes TEXT,
  status public.load_status NOT NULL DEFAULT 'available',
  is_border_crossing BOOLEAN NOT NULL DEFAULT false,
  zimra_required BOOLEAN NOT NULL DEFAULT false,
  commodity_value NUMERIC(12,2),
  is_urgent BOOLEAN NOT NULL DEFAULT false,
  views INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_loads_status_created ON public.loads(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_loads_poster ON public.loads(poster_id);
ALTER TABLE public.loads ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'loads' AND policyname = 'Loads viewable by everyone') THEN
    CREATE POLICY "Loads viewable by everyone" ON public.loads FOR SELECT USING (true);
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'loads' AND policyname = 'Authenticated users post loads') THEN
    CREATE POLICY "Authenticated users post loads" ON public.loads FOR INSERT WITH CHECK (auth.uid() = poster_id);
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'loads' AND policyname = 'Posters update own loads') THEN
    CREATE POLICY "Posters update own loads" ON public.loads FOR UPDATE USING (auth.uid() = poster_id);
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'loads' AND policyname = 'Posters delete own loads') THEN
    CREATE POLICY "Posters delete own loads" ON public.loads FOR DELETE USING (auth.uid() = poster_id);
  END IF;
END $$;
DROP TRIGGER IF EXISTS trg_loads_updated ON public.loads;
CREATE TRIGGER trg_loads_updated BEFORE UPDATE ON public.loads FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ======== bookings ========
CREATE TABLE IF NOT EXISTS public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  load_id UUID NOT NULL REFERENCES public.loads(id) ON DELETE CASCADE,
  carrier_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending',
  message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'bookings' AND policyname = 'Carriers view own bookings') THEN
    CREATE POLICY "Carriers view own bookings" ON public.bookings FOR SELECT USING (auth.uid() = carrier_id OR auth.uid() IN (SELECT poster_id FROM public.loads WHERE id = bookings.load_id));
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'bookings' AND policyname = 'Carriers create bookings') THEN
    CREATE POLICY "Carriers create bookings" ON public.bookings FOR INSERT WITH CHECK (auth.uid() = carrier_id);
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'bookings' AND policyname = 'Carriers update own bookings') THEN
    CREATE POLICY "Carriers update own bookings" ON public.bookings FOR UPDATE USING (auth.uid() = carrier_id);
  END IF;
END $$;
DROP TRIGGER IF EXISTS trg_bookings_updated ON public.bookings;
CREATE TRIGGER trg_bookings_updated BEFORE UPDATE ON public.bookings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ======== route_rates (public) ========
CREATE TABLE IF NOT EXISTS public.route_rates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  origin TEXT NOT NULL,
  destination TEXT NOT NULL,
  avg_rate_per_km NUMERIC(6,2) NOT NULL,
  weekly_loads INTEGER NOT NULL DEFAULT 0,
  last_updated TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(origin, destination)
);
ALTER TABLE public.route_rates ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'route_rates' AND policyname = 'Route rates viewable by everyone') THEN
    CREATE POLICY "Route rates viewable by everyone" ON public.route_rates FOR SELECT USING (true);
  END IF;
END $$;

-- ======== border_status (public) ========
CREATE TABLE IF NOT EXISTS public.border_status (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  border_name TEXT NOT NULL UNIQUE,
  country_from TEXT NOT NULL,
  country_to TEXT NOT NULL,
  wait_hours NUMERIC(4,1) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'open',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.border_status ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'border_status' AND policyname = 'Border status viewable by everyone') THEN
    CREATE POLICY "Border status viewable by everyone" ON public.border_status FOR SELECT USING (true);
  END IF;
END $$;

-- ======== handle_new_user trigger: auto-create profile + free subscription ========
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email, ''),
    COALESCE((NEW.raw_user_meta_data->>'role')::public.user_role, 'carrier')
  )
  ON CONFLICT (user_id) DO NOTHING;

  INSERT INTO public.subscriptions (user_id, plan, status)
  VALUES (NEW.id, 'free', 'active');

  RETURN NEW;
END;
$$;

-- Drop and recreate the trigger to ensure the latest function version is used.
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
