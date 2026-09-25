-- ============================================
-- INDSCRIPT COMMUNITY — Database Schema
-- ============================================

-- 1. PROFILES (linked to auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('admin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. EVENTS
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  poster_url TEXT,
  event_date DATE NOT NULL,
  event_time TIME NOT NULL,
  location TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'ongoing', 'completed', 'closed')),
  registration_open BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_events_status ON events(status);
CREATE INDEX idx_events_event_date ON events(event_date);
CREATE INDEX idx_events_slug ON events(slug);

-- 3. EVENT REGISTRATIONS
CREATE TABLE event_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  institution TEXT,
  registered_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  checked_in BOOLEAN NOT NULL DEFAULT false,
  checked_in_at TIMESTAMPTZ
);

CREATE INDEX idx_registrations_event_id ON event_registrations(event_id);

-- 4. MEMBERS
CREATE TABLE members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  domicile TEXT NOT NULL,
  occupation TEXT NOT NULL,
  interest TEXT NOT NULL,
  reason TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. COLLABORATIONS
CREATE TABLE collaborations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  organization TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  collaboration_type TEXT NOT NULL,
  description TEXT NOT NULL,
  proposal_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'accepted', 'rejected')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. SPONSORSHIPS
CREATE TABLE sponsorships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pic_name TEXT NOT NULL,
  company TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  sponsorship_type TEXT NOT NULL,
  message TEXT,
  proposal_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'accepted', 'rejected')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- HELPER FUNCTION: Check if user is admin
-- ============================================
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = (select auth.uid())
    AND role = 'admin'
  );
$$ LANGUAGE sql STABLE;

-- ============================================
-- AUTO-UPDATE updated_at TRIGGER
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER events_updated_at
  BEFORE UPDATE ON events
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE collaborations ENABLE ROW LEVEL SECURITY;
ALTER TABLE sponsorships ENABLE ROW LEVEL SECURITY;

-- PROFILES: only admin can read own profile
CREATE POLICY "Admin can read own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (id = (select auth.uid()));

-- EVENTS: public can read, admin can CRUD
CREATE POLICY "Public can view events"
  ON events FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Admin can insert events"
  ON events FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

CREATE POLICY "Admin can update events"
  ON events FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Admin can delete events"
  ON events FOR DELETE
  TO authenticated
  USING (is_admin());

-- EVENT REGISTRATIONS: public can insert, admin can read/update
CREATE POLICY "Public can register for events"
  ON event_registrations FOR INSERT
  TO anon, authenticated
  WITH CHECK ((select auth.role()) IN ('anon', 'authenticated'));

CREATE POLICY "Admin can view registrations"
  ON event_registrations FOR SELECT
  TO authenticated
  USING (is_admin());

CREATE POLICY "Admin can update registrations"
  ON event_registrations FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- MEMBERS: public can insert, admin can read/update
CREATE POLICY "Public can submit membership"
  ON members FOR INSERT
  TO anon, authenticated
  WITH CHECK ((select auth.role()) IN ('anon', 'authenticated'));

CREATE POLICY "Admin can view members"
  ON members FOR SELECT
  TO authenticated
  USING (is_admin());

CREATE POLICY "Admin can update members"
  ON members FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- COLLABORATIONS: public can insert, admin can read
CREATE POLICY "Public can submit collaboration"
  ON collaborations FOR INSERT
  TO anon, authenticated
  WITH CHECK ((select auth.role()) IN ('anon', 'authenticated'));

CREATE POLICY "Admin can view collaborations"
  ON collaborations FOR SELECT
  TO authenticated
  USING (is_admin());

CREATE POLICY "Admin can update collaborations"
  ON collaborations FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- SPONSORSHIPS: public can insert, admin can read
CREATE POLICY "Public can submit sponsorship"
  ON sponsorships FOR INSERT
  TO anon, authenticated
  WITH CHECK ((select auth.role()) IN ('anon', 'authenticated'));

CREATE POLICY "Admin can view sponsorships"
  ON sponsorships FOR SELECT
  TO authenticated
  USING (is_admin());

CREATE POLICY "Admin can update sponsorships"
  ON sponsorships FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- ============================================
-- PUBLIC AGGREGATE VIEW for event stats
-- (so public can see counts without accessing raw registration data)
-- ============================================
DROP VIEW IF EXISTS public_event_stats;

CREATE OR REPLACE FUNCTION get_event_stats(p_slug TEXT DEFAULT NULL)
RETURNS TABLE (
  event_id UUID,
  slug TEXT,
  registered_count BIGINT,
  checked_in_count BIGINT
)
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    e.id AS event_id,
    e.slug,
    COUNT(er.id)::BIGINT AS registered_count,
    COUNT(er.id) FILTER (WHERE er.checked_in = true)::BIGINT AS checked_in_count
  FROM events e
  LEFT JOIN event_registrations er ON er.event_id = e.id
  WHERE (p_slug IS NULL OR e.slug = p_slug)
  GROUP BY e.id, e.slug;
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================
-- STORAGE BUCKET SETUP (run in Supabase dashboard)
-- ============================================
-- Create bucket: community-assets
-- Folders: event-posters/, event-gallery/, community/, documents/
-- Public access: event-posters/ and event-gallery/ can be public
-- Private access: documents/ must be private (admin only)
