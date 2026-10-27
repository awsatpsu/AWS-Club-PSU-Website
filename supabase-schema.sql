-- Run this in the Supabase SQL editor (supabase.com → your project → SQL Editor)

create table if not exists events (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text default '',
  date date,
  time text default '',
  location text default '',
  capacity text default '',
  tag text default '',
  is_past boolean default false,
  rsvp_url text default '',
  sort_order int default 0,
  created_at timestamptz default now()
);

create table if not exists team_members (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  title text not null,
  linkedin text default '',
  photo_url text,
  sort_order int default 0,
  created_at timestamptz default now()
);

create table if not exists gallery_albums (
  id uuid default gen_random_uuid() primary key,
  event_id uuid unique references events(id) on delete set null,
  label text not null,
  date date,
  cover_image_url text,
  sort_order int default 0,
  created_at timestamptz default now()
);

create table if not exists gallery_photos (
  id uuid default gen_random_uuid() primary key,
  album_id uuid references gallery_albums(id) on delete cascade not null,
  image_url text not null,
  caption text default '',
  sort_order int default 0,
  created_at timestamptz default now()
);

-- Accounts: the first account is the admin; later sign-ups are members that the
-- admin must approve before they can change anything (see 006_member_accounts.sql).

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  role text not null default 'member' check (role in ('admin', 'member')),
  approved boolean not null default false,
  created_at timestamptz default now()
);

create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email) values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

insert into profiles (id, email, created_at)
select id, email, created_at from auth.users
on conflict (id) do nothing;

update profiles set role = 'admin', approved = true
where id = (select id from auth.users order by created_at limit 1);

create or replace function public.is_approved() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from profiles where id = auth.uid() and approved);
$$;

create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from profiles where id = auth.uid() and approved and role = 'admin');
$$;

alter table profiles enable row level security;

drop policy if exists "Read own profile" on profiles;
drop policy if exists "Admin update profiles" on profiles;

create policy "Read own profile" on profiles for select to authenticated
  using (id = auth.uid() or is_admin());
create policy "Admin update profiles" on profiles for update to authenticated
  using (is_admin()) with check (is_admin());

alter table events enable row level security;
alter table team_members enable row level security;
alter table gallery_albums enable row level security;
alter table gallery_photos enable row level security;

drop policy if exists "Public read events" on events;
drop policy if exists "Public read team" on team_members;
drop policy if exists "Public read albums" on gallery_albums;
drop policy if exists "Public read photos" on gallery_photos;
drop policy if exists "Auth write events" on events;
drop policy if exists "Auth write team" on team_members;
drop policy if exists "Auth write albums" on gallery_albums;
drop policy if exists "Auth write photos" on gallery_photos;
drop policy if exists "Approved write events" on events;
drop policy if exists "Approved write team" on team_members;
drop policy if exists "Approved write albums" on gallery_albums;
drop policy if exists "Approved write photos" on gallery_photos;

create policy "Public read events" on events for select using (true);
create policy "Public read team" on team_members for select using (true);
create policy "Public read albums" on gallery_albums for select using (true);
create policy "Public read photos" on gallery_photos for select using (true);

create policy "Approved write events" on events for all to authenticated
  using (is_approved()) with check (is_approved());
create policy "Approved write team" on team_members for all to authenticated
  using (is_approved()) with check (is_approved());
create policy "Approved write albums" on gallery_albums for all to authenticated
  using (is_approved()) with check (is_approved());
create policy "Approved write photos" on gallery_photos for all to authenticated
  using (is_approved()) with check (is_approved());

-- Storage buckets for uploaded images (public read; only approved accounts can write)

insert into storage.buckets (id, name, public)
values ('gallery', 'gallery', true), ('team', 'team', true)
on conflict (id) do update set public = true;

drop policy if exists "Auth upload images" on storage.objects;
drop policy if exists "Auth update images" on storage.objects;
drop policy if exists "Auth delete images" on storage.objects;

create policy "Auth upload images" on storage.objects for insert to authenticated
  with check (bucket_id in ('gallery', 'team') and is_approved());
create policy "Auth update images" on storage.objects for update to authenticated
  using (bucket_id in ('gallery', 'team') and is_approved());
create policy "Auth delete images" on storage.objects for delete to authenticated
  using (bucket_id in ('gallery', 'team') and is_approved());
-- Supabase's remove() also needs select on the objects being deleted.
drop policy if exists "Auth read images" on storage.objects;
create policy "Auth read images" on storage.objects for select to authenticated
  using (bucket_id in ('gallery', 'team'));
