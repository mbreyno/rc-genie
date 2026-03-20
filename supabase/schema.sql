-- ============================================================
-- RC Genie — Supabase Schema
-- Run this in the Supabase SQL Editor to set up your database
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── ADVISOR PROFILES ────────────────────────────────────────────────────────
-- One profile per registered advisor (linked to Supabase Auth user)

CREATE TABLE IF NOT EXISTS advisor_profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  firm_name     TEXT NOT NULL DEFAULT '',
  advisor_name  TEXT NOT NULL DEFAULT '',
  advisor_email TEXT,
  logo_url      TEXT,          -- Supabase Storage public URL
  logo_path     TEXT,          -- Storage path for deletion
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $func$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$func$ LANGUAGE plpgsql;

CREATE TRIGGER advisor_profiles_updated_at
  BEFORE UPDATE ON advisor_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ─── REPORTS ─────────────────────────────────────────────────────────────────
-- One row per generated report

CREATE TABLE IF NOT EXISTS reports (
  id                   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  advisor_id           UUID NOT NULL REFERENCES advisor_profiles(id) ON DELETE CASCADE,

  -- Client information
  client_first_name    TEXT NOT NULL,
  client_last_name     TEXT NOT NULL,
  company_name         TEXT NOT NULL,

  -- Location
  state_name           TEXT NOT NULL,
  state_fips           TEXT NOT NULL,
  county               TEXT NOT NULL,

  -- Work parameters
  hours_worked         INTEGER NOT NULL DEFAULT 2080,
  report_year          INTEGER NOT NULL DEFAULT EXTRACT(YEAR FROM NOW())::INTEGER,
  industry_id          TEXT NOT NULL,
  industry_label       TEXT NOT NULL,

  -- Time allocations (JSON) — { marketing: 17, finance: 3, hr: 5, management: 20, myBusiness: 55 }
  category_allocations JSONB NOT NULL DEFAULT '{}',

  -- Selected tasks (JSON array per category)
  -- Each task: { categoryId, occupationId, title, soc, proficiency, pctOfCategory, pctOfTotal, hoursPerYear, hourlyWage, annualWage, description }
  tasks                JSONB NOT NULL DEFAULT '[]',

  -- Calculated result
  total_compensation   NUMERIC(12, 2) NOT NULL DEFAULT 0,

  -- Timestamps
  created_at           TIMESTAMPTZ DEFAULT NOW(),
  updated_at           TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER reports_updated_at
  BEFORE UPDATE ON reports
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Index for fast advisor report lookups
CREATE INDEX IF NOT EXISTS reports_advisor_id_idx ON reports(advisor_id);
CREATE INDEX IF NOT EXISTS reports_created_at_idx ON reports(created_at DESC);

-- ─── ROW LEVEL SECURITY ───────────────────────────────────────────────────────
-- Advisors can only access their own data

ALTER TABLE advisor_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports           ENABLE ROW LEVEL SECURITY;

-- Advisor profile policies
CREATE POLICY "Advisors can view own profile"
  ON advisor_profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Advisors can insert own profile"
  ON advisor_profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Advisors can update own profile"
  ON advisor_profiles FOR UPDATE
  USING (auth.uid() = id);

-- Report policies
CREATE POLICY "Advisors can view own reports"
  ON reports FOR SELECT
  USING (auth.uid() = advisor_id);

CREATE POLICY "Advisors can create reports"
  ON reports FOR INSERT
  WITH CHECK (auth.uid() = advisor_id);

CREATE POLICY "Advisors can update own reports"
  ON reports FOR UPDATE
  USING (auth.uid() = advisor_id);

CREATE POLICY "Advisors can delete own reports"
  ON reports FOR DELETE
  USING (auth.uid() = advisor_id);

-- ─── STORAGE BUCKET ───────────────────────────────────────────────────────────
-- Create a storage bucket for advisor logos in the Supabase Dashboard:
--   Storage > New Bucket > Name: "advisor-logos" > Public: ON
--   (Or run via Supabase CLI / API)
--
-- Then add this storage policy in Dashboard > Storage > advisor-logos > Policies:
--   Allow authenticated users to upload to their own folder:
--     USING (auth.uid()::text = (storage.foldername(name))[1])
