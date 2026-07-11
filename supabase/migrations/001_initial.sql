-- ============================================================
-- Boarding House Manager — Initial Schema Migration
-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor)
-- ============================================================

-- 1. Tenants table
create table if not exists public.tenants (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid references auth.users(id) on delete set null,
  name text not null,
  room text not null,
  rent_amount numeric(10,2) not null,
  due_day integer not null check (due_day between 1 and 31),
  created_at timestamptz default now()
);

-- 2. Payments table
create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references public.tenants(id) on delete cascade not null,
  month date not null, -- stored as first day of the month e.g. 2025-07-01
  amount numeric(10,2) not null,
  ref_number text not null,
  receipt_url text,
  status text not null default 'pending' check (status in ('pending','confirmed','rejected')),
  submitted_at timestamptz default now(),
  confirmed_at timestamptz,
  admin_note text
);

-- 3. Settings table (enforced single row)
create table if not exists public.settings (
  id integer primary key default 1 check (id = 1),
  gcash_name text,
  gcash_number text,
  qr_image_url text,
  updated_at timestamptz default now()
);
-- Seed the single row
insert into public.settings (id) values (1)
  on conflict (id) do nothing;

-- ============================================================
-- Row Level Security
-- ============================================================

alter table public.tenants enable row level security;
alter table public.payments enable row level security;
alter table public.settings enable row level security;

-- Drop existing policies if re-running
drop policy if exists "admin_all_tenants" on public.tenants;
drop policy if exists "tenant_own_row" on public.tenants;
drop policy if exists "admin_all_payments" on public.payments;
drop policy if exists "tenant_own_payments" on public.payments;
drop policy if exists "tenant_insert_payment" on public.payments;
drop policy if exists "read_settings" on public.settings;
drop policy if exists "admin_write_settings" on public.settings;

-- Tenants: admin sees/edits all; tenant sees only own row
create policy "admin_all_tenants" on public.tenants
  for all
  using ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin')
  with check ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');

create policy "tenant_own_row" on public.tenants
  for select
  using (auth_user_id = auth.uid());

-- Payments: admin all; tenant read own + insert own
create policy "admin_all_payments" on public.payments
  for all
  using ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin')
  with check ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');

create policy "tenant_own_payments" on public.payments
  for select
  using (
    tenant_id in (
      select id from public.tenants where auth_user_id = auth.uid()
    )
  );

create policy "tenant_insert_payment" on public.payments
  for insert
  with check (
    tenant_id in (
      select id from public.tenants where auth_user_id = auth.uid()
    )
  );

-- Settings: all authenticated users can read; only admin can update
create policy "read_settings" on public.settings
  for select
  using (auth.uid() is not null);

create policy "admin_write_settings" on public.settings
  for update
  using ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin')
  with check ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');

-- ============================================================
-- Storage Buckets
-- (Run AFTER creating buckets in Storage → New Bucket)
-- Bucket names: qr-codes (public), receipts (private)
-- ============================================================

-- Receipts: tenants can upload their own; admin can view all
insert into storage.buckets (id, name, public) values ('receipts', 'receipts', false)
  on conflict (id) do nothing;

insert into storage.buckets (id, name, public) values ('qr-codes', 'qr-codes', true)
  on conflict (id) do nothing;

-- RLS on storage objects
drop policy if exists "tenant_upload_receipt" on storage.objects;
drop policy if exists "tenant_read_own_receipt" on storage.objects;
drop policy if exists "admin_all_receipts" on storage.objects;
drop policy if exists "admin_upload_qr" on storage.objects;
drop policy if exists "public_read_qr" on storage.objects;

create policy "tenant_upload_receipt" on storage.objects
  for insert
  with check (
    bucket_id = 'receipts'
    and auth.uid() is not null
  );

create policy "tenant_read_own_receipt" on storage.objects
  for select
  using (
    bucket_id = 'receipts'
    and (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
  );

create policy "admin_all_receipts" on storage.objects
  for all
  using (
    bucket_id = 'receipts'
    and (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
  );

create policy "admin_upload_qr" on storage.objects
  for insert
  with check (
    bucket_id = 'qr-codes'
    and (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
  );

create policy "public_read_qr" on storage.objects
  for select
  using (bucket_id = 'qr-codes');
