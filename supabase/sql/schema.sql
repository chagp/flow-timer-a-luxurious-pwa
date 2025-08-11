-- Run these statements in Supabase SQL editor
create extension if not exists pgcrypto;

create table if not exists public.user_settings (
  user_id uuid primary key references auth.users on delete cascade,
  theme text check (theme in ('light','dark')) default 'dark',
  settings jsonb not null default '{}',
  updated_at timestamptz not null default now()
);
alter table public.user_settings enable row level security;
create policy if not exists "user can manage own settings"
  on public.user_settings for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

create table if not exists public.timer_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  started_at timestamptz not null,
  duration_seconds integer not null check (duration_seconds >= 0),
  status text not null check (status in ('completed','cancelled')),
  preset jsonb,
  notes text,
  created_at timestamptz not null default now()
);
alter table public.timer_history enable row level security;
create policy if not exists "user can manage own history"
  on public.timer_history for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

create table if not exists public.timer_presets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  name text not null,
  config jsonb not null,
  updated_at timestamptz not null default now()
);
alter table public.timer_presets enable row level security;
create policy if not exists "user can manage own presets"
  on public.timer_presets for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Realtime hints (enable in dashboard): user_settings, timer_history, timer_presets

