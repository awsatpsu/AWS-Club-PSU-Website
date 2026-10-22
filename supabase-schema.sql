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

create policy "Public read events" on events for select using (true);
create policy "Public read team" on team_members for select using (true);
create policy "Public read albums" on gallery_albums for select using (true);
create policy "Public read photos" on gallery_photos for select using (true);

create policy "Auth write events" on events for all using (auth.role() = 'authenticated');
create policy "Auth write team" on team_members for all using (auth.role() = 'authenticated');
create policy "Auth write albums" on gallery_albums for all using (auth.role() = 'authenticated');
create policy "Auth write photos" on gallery_photos for all using (auth.role() = 'authenticated');

-- Storage buckets for uploaded images (public read; only signed-in admins can write)

insert into storage.buckets (id, name, public)
values ('gallery', 'gallery', true), ('team', 'team', true)
on conflict (id) do update set public = true;

drop policy if exists "Auth upload images" on storage.objects;
drop policy if exists "Auth update images" on storage.objects;
drop policy if exists "Auth delete images" on storage.objects;

create policy "Auth upload images" on storage.objects for insert to authenticated
  with check (bucket_id in ('gallery', 'team'));
create policy "Auth update images" on storage.objects for update to authenticated
  using (bucket_id in ('gallery', 'team'));
create policy "Auth delete images" on storage.objects for delete to authenticated
  using (bucket_id in ('gallery', 'team'));
-- Supabase's remove() also needs select on the objects being deleted.
drop policy if exists "Auth read images" on storage.objects;
create policy "Auth read images" on storage.objects for select to authenticated
  using (bucket_id in ('gallery', 'team'));
