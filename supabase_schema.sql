-- ============================================================
--  COSMIC COMPASS — Supabase Schema
--  Run this in: Supabase Dashboard > SQL Editor > New Query
-- ============================================================

-- ── 1. Email List ────────────────────────────────────────────
create table if not exists email_list (
    id          uuid primary key default gen_random_uuid(),
    email       text not null,
    source      text default 'standalone',  -- 'compass' | 'feedback' | 'standalone'
    created_at  timestamptz default now()
);

-- Prevent duplicate emails per source
create unique index if not exists email_list_unique
    on email_list (lower(email), source);

-- ── 2. Compass Calibrations ──────────────────────────────────
create table if not exists compass_calibrations (
    id              uuid primary key default gen_random_uuid(),
    name            text,
    email           text,
    subscribe       boolean default true,
    birth_date      text,          -- 'YYYY-MM-DD'
    birth_time      text,          -- 'HH:MM AM/PM'
    birth_location  text,
    birth_lat       numeric,
    birth_lng       numeric,
    sun_sign        text,
    moon_sign       text,
    rising_sign     text,
    hd_type         text,
    hd_profile      text,
    archetype_title text,
    z_node          text,
    serial_number   text,
    true_soul_time  text,
    created_at      timestamptz default now()
);

-- ── 3. Feedback ──────────────────────────────────────────────
create table if not exists feedback (
    id          uuid primary key default gen_random_uuid(),
    name        text,
    email       text,
    message     text,
    created_at  timestamptz default now()
);

-- ── Row Level Security (allow public inserts, no reads) ──────
alter table email_list           enable row level security;
alter table compass_calibrations enable row level security;
alter table feedback             enable row level security;

-- Drop existing policies first (safe to re-run)
drop policy if exists "public insert email_list"   on email_list;
drop policy if exists "public insert calibrations" on compass_calibrations;
drop policy if exists "public insert feedback"     on feedback;
drop policy if exists "auth read email_list"       on email_list;
drop policy if exists "auth read calibrations"     on compass_calibrations;
drop policy if exists "auth read feedback"         on feedback;

-- Allow anyone to insert (anon key is safe for write-only)
create policy "public insert email_list"
    on email_list for insert to anon with check (true);

create policy "public insert calibrations"
    on compass_calibrations for insert to anon with check (true);

create policy "public insert feedback"
    on feedback for insert to anon with check (true);

-- Only authenticated users (you) can read
create policy "auth read email_list"
    on email_list for select to authenticated using (true);

create policy "auth read calibrations"
    on compass_calibrations for select to authenticated using (true);

create policy "auth read feedback"
    on feedback for select to authenticated using (true);
