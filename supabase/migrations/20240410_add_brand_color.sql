-- Migration: Add brand_color column to advisor_profiles
-- Run this in the Supabase SQL Editor

ALTER TABLE advisor_profiles
  ADD COLUMN IF NOT EXISTS brand_color TEXT DEFAULT '#1a3de8';
