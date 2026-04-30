-- ============================================================
-- Migration: Add geo-coordinates to border_status table
-- and expand seed data for the Map View feature.
-- ============================================================

-- Add latitude / longitude columns (nullable for backward compat)
ALTER TABLE public.border_status
  ADD COLUMN IF NOT EXISTS lat  NUMERIC(9, 6),
  ADD COLUMN IF NOT EXISTS lng  NUMERIC(9, 6),
  ADD COLUMN IF NOT EXISTS notes TEXT;

-- Update existing rows with precise WGS-84 coordinates
UPDATE public.border_status SET lat = -22.216700, lng = 30.000000 WHERE border_name = 'Beitbridge';
UPDATE public.border_status SET lat = -16.033300, lng = 28.866700 WHERE border_name = 'Chirundu';
UPDATE public.border_status SET lat = -20.483300, lng = 27.833300 WHERE border_name = 'Plumtree';
UPDATE public.border_status SET lat = -18.983300, lng = 32.750000 WHERE border_name = 'Forbes';
UPDATE public.border_status SET lat = -17.783300, lng = 25.266700 WHERE border_name = 'Kazungula';
UPDATE public.border_status SET lat = -17.933300, lng = 25.833300 WHERE border_name = 'Victoria Falls';

-- Insert any missing crossings (upsert by border_name)
INSERT INTO public.border_status (border_name, country_from, country_to, wait_hours, status, lat, lng, notes)
VALUES
  ('Nyamapanda', 'Zimbabwe', 'Mozambique',  2.5, 'moderate', -16.983300, 32.866700, 'Tete corridor — Harare to Mozambique'),
  ('Sango',      'Zimbabwe', 'Mozambique',  1.0, 'normal',   -21.433300, 31.966700, 'Lowveld / Chiredzi corridor'),
  ('Pandamatenga','Zimbabwe','Botswana',    0.5, 'normal',   -18.533300, 25.666700, 'Hwange / Kasane corridor')
ON CONFLICT (border_name) DO UPDATE
  SET lat   = EXCLUDED.lat,
      lng   = EXCLUDED.lng,
      notes = EXCLUDED.notes;

-- Add a comment for documentation
COMMENT ON COLUMN public.border_status.lat   IS 'WGS-84 latitude for map marker placement';
COMMENT ON COLUMN public.border_status.lng   IS 'WGS-84 longitude for map marker placement';
COMMENT ON COLUMN public.border_status.notes IS 'Human-readable description of the crossing / corridor';
