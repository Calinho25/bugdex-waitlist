create extension if not exists pgcrypto;

create table if not exists public.waitlist_signups (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  created_at timestamptz not null default now(),
  source text not null default 'landing-page',
  status text not null default 'waiting'
);

alter table public.waitlist_signups enable row level security;

-- This table is written through the server-side /api/waitlist endpoint using the
-- Supabase service-role key. Do not expose the service-role key in browser code.
