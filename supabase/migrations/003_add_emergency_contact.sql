-- ============================================================
-- Migration 003: Add address & emergency contact fields to tenants
-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor)
-- ============================================================

alter table public.tenants
  add column if not exists address text,
  add column if not exists emergency_contact_name text,
  add column if not exists emergency_contact_phone text;
