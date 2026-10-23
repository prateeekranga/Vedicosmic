-- VediCosmic: restrict blog writes to an admin allowlist.
--
-- Run once in the Supabase dashboard → SQL editor, after replacing the email below.
-- Safe to re-run. It changes who can WRITE posts and blog images; public reading of
-- visible posts keeps working exactly as before.
--
-- Also do this in the dashboard: Authentication → Sign In / Providers → Email →
-- turn OFF "Allow new users to sign up", so nobody can create an account at all.

begin;

-- 1. The allowlist. Emails live only in the database, never in the site's code.
create table if not exists public.admins (
  email text primary key
);
alter table public.admins enable row level security;
-- No policies on purpose: nobody can read or change this table through the API.

insert into public.admins (email)
values ('REPLACE-WITH-YOUR-ADMIN-EMAIL@example.com')   -- one row per admin
on conflict (email) do nothing;

do $$
begin
  if exists (select 1 from public.admins where email like 'REPLACE-WITH-%') then
    raise exception 'Replace the placeholder admin email in policies.sql, then run it again.';
  end if;
end $$;

-- 2. is_admin(): true when the signed-in user's email is on the allowlist.
--    The site calls this to decide whether to open the dashboard, and every write policy uses it.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.admins
    where lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;
revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

-- 3. posts: replace every existing policy with read-for-all (visible rows) + write-for-admins.
do $$
declare r record;
begin
  for r in select policyname from pg_policies where schemaname = 'public' and tablename = 'posts' loop
    execute format('drop policy %I on public.posts', r.policyname);
  end loop;
end $$;

alter table public.posts enable row level security;

create policy "Anyone can read visible posts" on public.posts
  for select to anon, authenticated using (hidden = false);
create policy "Admins can read all posts" on public.posts
  for select to authenticated using (public.is_admin());
create policy "Admins can add posts" on public.posts
  for insert to authenticated with check (public.is_admin());
create policy "Admins can edit posts" on public.posts
  for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "Admins can delete posts" on public.posts
  for delete to authenticated using (public.is_admin());

-- 4. blog-images storage bucket: only admins may upload, replace or delete files.
--    (Public reading of the images is unchanged.)
do $$
declare r record;
begin
  for r in
    select policyname from pg_policies
    where schemaname = 'storage' and tablename = 'objects' and cmd in ('INSERT', 'UPDATE', 'DELETE')
      and (coalesce(qual, '') like '%blog-images%' or coalesce(with_check, '') like '%blog-images%')
  loop
    execute format('drop policy %I on storage.objects', r.policyname);
  end loop;
end $$;

create policy "Admins can upload blog images" on storage.objects
  for insert to authenticated with check (bucket_id = 'blog-images' and public.is_admin());
create policy "Admins can replace blog images" on storage.objects
  for update to authenticated using (bucket_id = 'blog-images' and public.is_admin())
  with check (bucket_id = 'blog-images' and public.is_admin());
create policy "Admins can delete blog images" on storage.objects
  for delete to authenticated using (bucket_id = 'blog-images' and public.is_admin());

commit;

-- 5. Check the result: every row should mention is_admin() except the public read policy.
select tablename, policyname, cmd from pg_policies
where (schemaname = 'public' and tablename = 'posts')
   or (schemaname = 'storage' and tablename = 'objects' and policyname ilike '%blog images%')
order by tablename, cmd;
