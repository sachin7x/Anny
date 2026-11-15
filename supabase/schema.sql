-- ANY initial database schema.
-- Apply to a NEW Supabase project using the SQL Editor after reviewing it.
-- This is a schema bootstrap file, not an applied migration.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  display_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.workspaces (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 120),
  owner_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.workspace_members (
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'member' check (role in ('owner', 'admin', 'member')),
  created_at timestamptz not null default now(),
  primary key (workspace_id, user_id)
);

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  workspace_id uuid references public.workspaces(id) on delete cascade,
  stripe_customer_id text,
  stripe_subscription_id text not null unique,
  plan_key text not null,
  price_id text,
  status text not null,
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists subscriptions_user_created_idx
  on public.subscriptions(user_id, created_at desc);
create index if not exists subscriptions_customer_idx
  on public.subscriptions(stripe_customer_id);

create table if not exists public.usage_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  workspace_id uuid references public.workspaces(id) on delete set null,
  event_type text not null,
  units bigint not null default 1 check (units >= 0),
  request_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists usage_events_user_created_idx
  on public.usage_events(user_id, created_at desc);

create table if not exists public.user_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  locale text not null default 'en',
  writing_style text not null default 'natural',
  preferences jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.vocabulary_terms (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  term text not null check (char_length(term) between 1 and 120),
  replacement text,
  created_at timestamptz not null default now(),
  unique (user_id, term)
);

create table if not exists public.stripe_events (
  event_id text primary key,
  event_type text not null,
  processed_at timestamptz,
  created_at timestamptz not null default now()
);

-- RLS is enabled on every table in the exposed public schema.
alter table public.profiles enable row level security;
alter table public.workspaces enable row level security;
alter table public.workspace_members enable row level security;
alter table public.subscriptions enable row level security;
alter table public.usage_events enable row level security;
alter table public.user_preferences enable row level security;
alter table public.vocabulary_terms enable row level security;
alter table public.stripe_events enable row level security;

-- Profiles: users can only read and change their own profile.
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
  for select to authenticated using ((select auth.uid()) = id);
drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own" on public.profiles
  for insert to authenticated with check ((select auth.uid()) = id);
drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update to authenticated using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- Workspaces: owner-only access for the initial MVP.
drop policy if exists "workspaces_select_owner" on public.workspaces;
create policy "workspaces_select_owner" on public.workspaces
  for select to authenticated using ((select auth.uid()) = owner_id);
drop policy if exists "workspaces_insert_owner" on public.workspaces;
create policy "workspaces_insert_owner" on public.workspaces
  for insert to authenticated with check ((select auth.uid()) = owner_id);
drop policy if exists "workspaces_update_owner" on public.workspaces;
create policy "workspaces_update_owner" on public.workspaces
  for update to authenticated using ((select auth.uid()) = owner_id)
  with check ((select auth.uid()) = owner_id);
drop policy if exists "workspaces_delete_owner" on public.workspaces;
create policy "workspaces_delete_owner" on public.workspaces
  for delete to authenticated using ((select auth.uid()) = owner_id);

-- Workspace memberships: a user sees their own membership; owners manage members.
drop policy if exists "workspace_members_select_self_or_owner" on public.workspace_members;
create policy "workspace_members_select_self_or_owner" on public.workspace_members
  for select to authenticated using (
    (select auth.uid()) = user_id
    or exists (
      select 1 from public.workspaces w
      where w.id = workspace_id and w.owner_id = (select auth.uid())
    )
  );
drop policy if exists "workspace_members_insert_owner" on public.workspace_members;
create policy "workspace_members_insert_owner" on public.workspace_members
  for insert to authenticated with check (
    exists (
      select 1 from public.workspaces w
      where w.id = workspace_id and w.owner_id = (select auth.uid())
    )
    and (
      role in ('admin', 'member')
      or (role = 'owner' and user_id = (select auth.uid()))
    )
  );
drop policy if exists "workspace_members_delete_owner" on public.workspace_members;
create policy "workspace_members_delete_owner" on public.workspace_members
  for delete to authenticated using (
    exists (
      select 1 from public.workspaces w
      where w.id = workspace_id and w.owner_id = (select auth.uid())
    )
  );

-- Subscription state is read-only to end users; webhook code uses the server secret key.
drop policy if exists "subscriptions_select_own" on public.subscriptions;
create policy "subscriptions_select_own" on public.subscriptions
  for select to authenticated using ((select auth.uid()) = user_id);

-- Usage ledger is append-only from trusted server code; users can read their own usage.
drop policy if exists "usage_events_select_own" on public.usage_events;
create policy "usage_events_select_own" on public.usage_events
  for select to authenticated using ((select auth.uid()) = user_id);

-- Personal settings and vocabulary are owned by one user.
drop policy if exists "user_preferences_manage_own" on public.user_preferences;
create policy "user_preferences_manage_own" on public.user_preferences
  for all to authenticated using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
drop policy if exists "vocabulary_terms_manage_own" on public.vocabulary_terms;
create policy "vocabulary_terms_manage_own" on public.vocabulary_terms
  for all to authenticated using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

-- No anon/authenticated policies or grants for Stripe webhook idempotency records.
-- The service-only Supabase secret key bypasses RLS for webhook processing.

grant select, insert, update on public.profiles to authenticated;
grant select, insert, update, delete on public.workspaces to authenticated;
grant select, insert, delete on public.workspace_members to authenticated;
grant select on public.subscriptions to authenticated;
grant select on public.usage_events to authenticated;
grant select, insert, update, delete on public.user_preferences to authenticated;
grant select, insert, update, delete on public.vocabulary_terms to authenticated;
