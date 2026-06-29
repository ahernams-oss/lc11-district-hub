
ALTER TABLE public.events
  ADD COLUMN IF NOT EXISTS place_info text,
  ADD COLUMN IF NOT EXISTS host_club text,
  ADD COLUMN IF NOT EXISTS organizer text,
  ADD COLUMN IF NOT EXISTS gallery_urls text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS latitude double precision,
  ADD COLUMN IF NOT EXISTS longitude double precision,
  ADD COLUMN IF NOT EXISTS lodging_tips text,
  ADD COLUMN IF NOT EXISTS food_tips text,
  ADD COLUMN IF NOT EXISTS tourism_tips text;
