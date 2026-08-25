-- Chambers Studio — initial schema
-- Apply with: supabase db push, or paste into the Supabase SQL editor.

-- profiles ------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  email text unique not null,
  avatar_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- documents -----------------------------------------------------------------
create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text default 'Untitled',
  template text default 'classic',
  data jsonb not null default '{}',
  is_public boolean default false,
  slug text unique,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- document_versions (audit & rollback) --------------------------------------
create table if not exists public.document_versions (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references public.documents(id) on delete cascade,
  data jsonb not null,
  created_at timestamptz default now()
);

-- audit_events (compliance: create/edit/export trail, no resume content) -----
create table if not exists public.audit_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  document_id uuid,
  action text not null check (action in ('document.create','document.update','document.delete','document.export','document.share')),
  detail jsonb not null default '{}',
  created_at timestamptz default now()
);

-- indexes -------------------------------------------------------------------
create index if not exists idx_documents_user_id on public.documents(user_id);
create index if not exists idx_document_versions_document_id on public.document_versions(document_id);
create index if not exists idx_documents_slug on public.documents(slug) where is_public = true;
create index if not exists idx_audit_events_user_id on public.audit_events(user_id, created_at desc);

-- updated_at trigger ---------------------------------------------------------
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists trg_documents_touch on public.documents;
create trigger trg_documents_touch before update on public.documents
  for each row execute function public.touch_updated_at();

drop trigger if exists trg_profiles_touch on public.profiles;
create trigger trg_profiles_touch before update on public.profiles
  for each row execute function public.touch_updated_at();

-- version snapshot on each data change ---------------------------------------
create or replace function public.snapshot_document_version()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if (tg_op = 'UPDATE' and new.data is distinct from old.data) then
    insert into public.document_versions (document_id, data) values (old.id, old.data);
  end if;
  return new;
end $$;

drop trigger if exists trg_documents_version on public.documents;
create trigger trg_documents_version before update on public.documents
  for each row execute function public.snapshot_document_version();

-- profile bootstrap on signup ------------------------------------------------
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, display_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1)))
  on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- row level security ---------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.documents enable row level security;
alter table public.document_versions enable row level security;
alter table public.audit_events enable row level security;

-- profiles: owner only
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);
drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

-- documents: owner CRUD
drop policy if exists "documents_select_own" on public.documents;
create policy "documents_select_own" on public.documents
  for select using (auth.uid() = user_id);
drop policy if exists "documents_insert_own" on public.documents;
create policy "documents_insert_own" on public.documents
  for insert with check (auth.uid() = user_id);
drop policy if exists "documents_update_own" on public.documents;
create policy "documents_update_own" on public.documents
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "documents_delete_own" on public.documents;
create policy "documents_delete_own" on public.documents
  for delete using (auth.uid() = user_id);

-- documents: public share read (anon + authenticated) when is_public
drop policy if exists "documents_select_public" on public.documents;
create policy "documents_select_public" on public.documents
  for select using (is_public = true and slug is not null);

-- document_versions: owner of parent document, read + insert
drop policy if exists "versions_select_own" on public.document_versions;
create policy "versions_select_own" on public.document_versions
  for select using (
    exists (select 1 from public.documents d where d.id = document_id and d.user_id = auth.uid())
  );
drop policy if exists "versions_insert_own" on public.document_versions;
create policy "versions_insert_own" on public.document_versions
  for insert with check (
    exists (select 1 from public.documents d where d.id = document_id and d.user_id = auth.uid())
  );

-- audit_events: owner can insert and read own trail; never update/delete
drop policy if exists "audit_select_own" on public.audit_events;
create policy "audit_select_own" on public.audit_events
  for select using (auth.uid() = user_id);
drop policy if exists "audit_insert_own" on public.audit_events;
create policy "audit_insert_own" on public.audit_events
  for insert with check (auth.uid() = user_id);
