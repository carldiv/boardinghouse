-- Migration: Add move_in_date to tenants
-- Run this in: Supabase Dashboard → SQL Editor
-- This is a non-destructive change; existing tenants will have move_in_date = NULL
-- and the app will fall back to created_at for them automatically.

ALTER TABLE public.tenants
  ADD COLUMN IF NOT EXISTS move_in_date date;
