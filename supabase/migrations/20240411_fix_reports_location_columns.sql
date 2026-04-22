-- Migration: Fix reports location columns
-- Removes the unused `county` column and adds msa_code / msa_name
-- Run this in the Supabase SQL Editor

-- Remove the county column (was NOT NULL but never populated — caused insert failures)
ALTER TABLE reports DROP COLUMN IF EXISTS county;

-- Add MSA columns used by the application
ALTER TABLE reports ADD COLUMN IF NOT EXISTS msa_code TEXT;
ALTER TABLE reports ADD COLUMN IF NOT EXISTS msa_name TEXT;
