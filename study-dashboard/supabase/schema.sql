-- NUS Study Dashboard — Postgres schema + Row Level Security
-- Run this once in the Supabase SQL Editor (Project -> SQL Editor -> New query)
-- for a fresh project. Safe to re-run: every statement is idempotent.

-- ============================================================
-- Extensions
-- ============================================================
create extension if not exists "pgcrypto";

-- ============================================================
-- Tables
-- ============================================================

create table if not exists public.courses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  color text not null default '#3b5f8a',
  format text not null check (format in ('chapter-based', 'class-based')),
  position integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.weeks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  course_id uuid not null references public.courses (id) on delete cascade,
  week_number integer not null,
  label text,
  position integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.chapters (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  week_id uuid not null references public.weeks (id) on delete cascade,
  title text not null,
  discussion_done boolean not null default false,
  self_study_questions_done boolean not null default false,
  full_self_study_session_done boolean not null default false,
  tested_knowledge boolean not null default false,
  confidence smallint not null default 1 check (confidence between 1 and 5),
  position integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  course_id uuid not null references public.courses (id) on delete cascade,
  date date not null default current_date,
  topic text not null default '',
  attended boolean not null default false,
  confidence smallint not null default 1 check (confidence between 1 and 5),
  notes text not null default '',
  position integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.deadlines (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  course_id uuid not null references public.courses (id) on delete cascade,
  title text not null,
  due_date date not null,
  kind text not null check (kind in ('project', 'soft')),
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- Indexes
-- ============================================================
create index if not exists weeks_course_id_idx on public.weeks (course_id);
create index if not exists chapters_week_id_idx on public.chapters (week_id);
create index if not exists sessions_course_id_idx on public.sessions (course_id);
create index if not exists deadlines_course_id_idx on public.deadlines (course_id);
create index if not exists courses_user_id_idx on public.courses (user_id);

-- ============================================================
-- updated_at auto-touch trigger
-- ============================================================
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_updated_at on public.courses;
create trigger set_updated_at before update on public.courses
  for each row execute function public.touch_updated_at();

drop trigger if exists set_updated_at on public.weeks;
create trigger set_updated_at before update on public.weeks
  for each row execute function public.touch_updated_at();

drop trigger if exists set_updated_at on public.chapters;
create trigger set_updated_at before update on public.chapters
  for each row execute function public.touch_updated_at();

drop trigger if exists set_updated_at on public.sessions;
create trigger set_updated_at before update on public.sessions
  for each row execute function public.touch_updated_at();

drop trigger if exists set_updated_at on public.deadlines;
create trigger set_updated_at before update on public.deadlines
  for each row execute function public.touch_updated_at();

-- ============================================================
-- Row Level Security — every row is scoped to the owning user
-- ============================================================
alter table public.courses enable row level security;
alter table public.weeks enable row level security;
alter table public.chapters enable row level security;
alter table public.sessions enable row level security;
alter table public.deadlines enable row level security;

drop policy if exists "courses_owner_all" on public.courses;
create policy "courses_owner_all" on public.courses
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "weeks_owner_all" on public.weeks;
create policy "weeks_owner_all" on public.weeks
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "chapters_owner_all" on public.chapters;
create policy "chapters_owner_all" on public.chapters
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "sessions_owner_all" on public.sessions;
create policy "sessions_owner_all" on public.sessions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "deadlines_owner_all" on public.deadlines;
create policy "deadlines_owner_all" on public.deadlines
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ============================================================
-- Realtime (optional, nice-to-have per spec) — broadcast row changes
-- so a second open tab/device picks up edits without a manual refresh.
-- Guarded so re-running this script doesn't error on "already a member".
-- ============================================================
do $$
declare
  t text;
begin
  foreach t in array array['courses', 'weeks', 'chapters', 'sessions', 'deadlines']
  loop
    if not exists (
      select 1 from pg_publication_tables
      where pubname = 'supabase_realtime'
        and schemaname = 'public'
        and tablename = t
    ) then
      execute format('alter publication supabase_realtime add table public.%I', t);
    end if;
  end loop;
end $$;
