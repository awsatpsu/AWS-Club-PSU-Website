-- Run once in the Supabase SQL Editor: adds admin/member accounts.
-- Anyone can sign up at /admin, but a new account can't change anything until the
-- admin approves it in /admin → Accounts. Approved members can do everything the
-- admin can except approve accounts. The original (oldest) account becomes the admin.

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  role text not null default 'member' check (role in ('admin', 'member')),
  approved boolean not null default false,
  created_at timestamptz default now()
);

-- Every new sign-up gets an unapproved member profile.
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

-- Profiles for accounts that already exist.
insert into profiles (id, email, created_at)
select id, email, created_at from auth.users
on conflict (id) do nothing;

update profiles set role = 'admin', approved = true
where id = (select id from auth.users order by created_at limit 1);

-- security definer so policies on profiles can call these without recursing.
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

-- Members see only themselves; the admin sees everyone. Only the admin can
-- approve or change roles, so nobody can approve their own account.
create policy "Read own profile" on profiles for select to authenticated
  using (id = auth.uid() or is_admin());
create policy "Admin update profiles" on profiles for update to authenticated
  using (is_admin()) with check (is_admin());

-- Content writes now require an approved account, not just any signed-in one.
drop policy if exists "Auth write events" on events;
drop policy if exists "Auth write team" on team_members;
drop policy if exists "Auth write albums" on gallery_albums;
drop policy if exists "Auth write photos" on gallery_photos;
drop policy if exists "Approved write events" on events;
drop policy if exists "Approved write team" on team_members;
drop policy if exists "Approved write albums" on gallery_albums;
drop policy if exists "Approved write photos" on gallery_photos;

create policy "Approved write events" on events for all to authenticated
  using (is_approved()) with check (is_approved());
create policy "Approved write team" on team_members for all to authenticated
  using (is_approved()) with check (is_approved());
create policy "Approved write albums" on gallery_albums for all to authenticated
  using (is_approved()) with check (is_approved());
create policy "Approved write photos" on gallery_photos for all to authenticated
  using (is_approved()) with check (is_approved());

drop policy if exists "Auth upload images" on storage.objects;
drop policy if exists "Auth update images" on storage.objects;
drop policy if exists "Auth delete images" on storage.objects;

create policy "Auth upload images" on storage.objects for insert to authenticated
  with check (bucket_id in ('gallery', 'team') and is_approved());
create policy "Auth update images" on storage.objects for update to authenticated
  using (bucket_id in ('gallery', 'team') and is_approved());
create policy "Auth delete images" on storage.objects for delete to authenticated
  using (bucket_id in ('gallery', 'team') and is_approved());
