
-- ============================================================
-- 1. load_views (broker analytics)
-- ============================================================
CREATE TABLE public.load_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  load_id UUID NOT NULL REFERENCES public.loads(id) ON DELETE CASCADE,
  viewer_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_load_views_load ON public.load_views(load_id);
CREATE INDEX idx_load_views_viewer ON public.load_views(viewer_id);
ALTER TABLE public.load_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users insert own views"
  ON public.load_views FOR INSERT
  WITH CHECK (auth.uid() = viewer_id);

CREATE POLICY "Posters see views on own loads"
  ON public.load_views FOR SELECT
  USING (
    auth.uid() = viewer_id
    OR EXISTS (SELECT 1 FROM public.loads l WHERE l.id = load_views.load_id AND l.poster_id = auth.uid())
  );

-- ============================================================
-- 2. saved_loads (carrier bookmarks)
-- ============================================================
CREATE TABLE public.saved_loads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  load_id UUID NOT NULL REFERENCES public.loads(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, load_id)
);
CREATE INDEX idx_saved_loads_user ON public.saved_loads(user_id);
ALTER TABLE public.saved_loads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own saved loads"
  ON public.saved_loads FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- 3. saved_routes (rate-alert subscriptions)
-- ============================================================
CREATE TABLE public.saved_routes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  origin TEXT NOT NULL,
  destination TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, origin, destination)
);
CREATE INDEX idx_saved_routes_user ON public.saved_routes(user_id);
CREATE INDEX idx_saved_routes_pair ON public.saved_routes(origin, destination);
ALTER TABLE public.saved_routes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own saved routes"
  ON public.saved_routes FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- 4. notifications
-- ============================================================
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  type TEXT NOT NULL,            -- 'new_bid' | 'load_match' | 'rate_alert' | 'border' | 'plan' | 'booking_status'
  title TEXT NOT NULL,
  body TEXT,
  link TEXT,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_notifications_user_unread ON public.notifications(user_id, read_at NULLS FIRST, created_at DESC);
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own notifications"
  ON public.notifications FOR SELECT
  USING (auth.uid() = user_id);
CREATE POLICY "Users update own notifications"
  ON public.notifications FOR UPDATE
  USING (auth.uid() = user_id);
CREATE POLICY "Users delete own notifications"
  ON public.notifications FOR DELETE
  USING (auth.uid() = user_id);
-- Inserts only happen via SECURITY DEFINER triggers; no INSERT policy = blocked from clients.

-- ============================================================
-- 5. extend bookings with revenue + km tracking
-- ============================================================
ALTER TABLE public.bookings
  ADD COLUMN rate_usd NUMERIC,
  ADD COLUMN distance_km INTEGER,
  ADD COLUMN delivered_at TIMESTAMPTZ,
  ADD COLUMN paid_at TIMESTAMPTZ;

-- Backfill from the linked load so existing rows have data
UPDATE public.bookings b
SET rate_usd = l.rate_usd,
    distance_km = l.distance_km
FROM public.loads l
WHERE b.load_id = l.id AND b.rate_usd IS NULL;

-- Auto-populate on insert
CREATE OR REPLACE FUNCTION public.bookings_fill_load_data()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.rate_usd IS NULL OR NEW.distance_km IS NULL THEN
    SELECT
      COALESCE(NEW.rate_usd, l.rate_usd),
      COALESCE(NEW.distance_km, l.distance_km)
    INTO NEW.rate_usd, NEW.distance_km
    FROM public.loads l WHERE l.id = NEW.load_id;
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER trg_bookings_fill_load
  BEFORE INSERT ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.bookings_fill_load_data();

-- ============================================================
-- 6. Notification triggers
-- ============================================================

-- New booking → notify the load poster
CREATE OR REPLACE FUNCTION public.notify_new_booking()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_poster UUID;
  v_route TEXT;
BEGIN
  SELECT poster_id, origin || ' → ' || destination
  INTO v_poster, v_route
  FROM public.loads WHERE id = NEW.load_id;

  IF v_poster IS NOT NULL AND v_poster <> NEW.carrier_id THEN
    INSERT INTO public.notifications (user_id, type, title, body, link)
    VALUES (
      v_poster,
      'new_bid',
      'New bid on ' || v_route,
      'A carrier wants this load. Tap to review.',
      '/dashboard'
    );
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER trg_notify_new_booking
  AFTER INSERT ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.notify_new_booking();

-- Booking status change → notify the carrier
CREATE OR REPLACE FUNCTION public.notify_booking_status()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_route TEXT;
BEGIN
  IF NEW.status IS DISTINCT FROM OLD.status THEN
    SELECT origin || ' → ' || destination INTO v_route
    FROM public.loads WHERE id = NEW.load_id;

    INSERT INTO public.notifications (user_id, type, title, body, link)
    VALUES (
      NEW.carrier_id,
      'booking_status',
      'Booking ' || NEW.status,
      v_route,
      '/dashboard'
    );
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER trg_notify_booking_status
  AFTER UPDATE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.notify_booking_status();

-- New load matching saved_routes → notify subscribers
CREATE OR REPLACE FUNCTION public.notify_load_match()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.notifications (user_id, type, title, body, link)
  SELECT
    sr.user_id,
    'load_match',
    'New load: ' || NEW.origin || ' → ' || NEW.destination,
    '$' || NEW.rate_usd::text || ' · ' || COALESCE(NEW.load_type, ''),
    '/board'
  FROM public.saved_routes sr
  WHERE sr.origin = NEW.origin
    AND sr.destination = NEW.destination
    AND sr.user_id <> NEW.poster_id;
  RETURN NEW;
END;
$$;
CREATE TRIGGER trg_notify_load_match
  AFTER INSERT ON public.loads
  FOR EACH ROW EXECUTE FUNCTION public.notify_load_match();

-- ============================================================
-- 7. Helper: aggregate stats functions (security definer keeps RLS clean)
-- ============================================================
CREATE OR REPLACE FUNCTION public.carrier_dashboard_stats(_user_id UUID)
RETURNS TABLE (
  loads_booked INTEGER,
  est_revenue NUMERIC,
  km_driven INTEGER,
  avg_rate_per_km NUMERIC
) LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT
    COUNT(*)::int AS loads_booked,
    COALESCE(SUM(rate_usd), 0) AS est_revenue,
    COALESCE(SUM(distance_km), 0)::int AS km_driven,
    CASE WHEN COALESCE(SUM(distance_km),0) > 0
      THEN ROUND(SUM(rate_usd)::numeric / SUM(distance_km)::numeric, 2)
      ELSE 0 END AS avg_rate_per_km
  FROM public.bookings
  WHERE carrier_id = _user_id
    AND created_at > now() - interval '30 days';
$$;

CREATE OR REPLACE FUNCTION public.broker_dashboard_stats(_user_id UUID)
RETURNS TABLE (
  active_loads INTEGER,
  bids_received INTEGER,
  loads_filled INTEGER,
  fill_rate NUMERIC,
  avg_hours_to_fill NUMERIC
) LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  WITH my_loads AS (
    SELECT id, status, created_at FROM public.loads WHERE poster_id = _user_id
  ),
  my_bookings AS (
    SELECT b.* FROM public.bookings b
    JOIN my_loads l ON l.id = b.load_id
  ),
  filled AS (
    SELECT l.id,
      EXTRACT(EPOCH FROM (MIN(b.created_at) - l.created_at))/3600 AS hours
    FROM my_loads l
    JOIN public.bookings b ON b.load_id = l.id AND b.status IN ('confirmed','delivered','paid')
    GROUP BY l.id, l.created_at
  )
  SELECT
    (SELECT COUNT(*) FROM my_loads WHERE status = 'available')::int,
    (SELECT COUNT(*) FROM my_bookings WHERE created_at > now() - interval '30 days')::int,
    (SELECT COUNT(*) FROM filled)::int,
    CASE WHEN (SELECT COUNT(*) FROM my_loads) > 0
      THEN ROUND((SELECT COUNT(*) FROM filled)::numeric * 100 / (SELECT COUNT(*) FROM my_loads)::numeric, 0)
      ELSE 0 END,
    COALESCE(ROUND((SELECT AVG(hours) FROM filled)::numeric, 1), 0);
$$;

-- ============================================================
-- 8. Realtime channels for notifications
-- ============================================================
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
