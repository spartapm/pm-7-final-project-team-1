-- VION schema (run as postgres)
-- Also turn OFF Authentication → Providers → Email → Confirm email.

create or replace function public.auto_confirm_auth_user()
returns trigger
language plpgsql
security definer
set search_path = auth, public
as $$
begin
  new.email_confirmed_at = coalesce(new.email_confirmed_at, now());
  return new;
end;
$$;

drop trigger if exists on_auth_user_auto_confirm on auth.users;
create trigger on_auth_user_auto_confirm
before insert on auth.users
for each row execute function public.auto_confirm_auth_user();

update auth.users set email_confirmed_at = coalesce(email_confirmed_at, now()) where email_confirmed_at is null;

-- tables below

create table if not exists public.nickname_seq (
  id int primary key default 1,
  n int not null default 1000,
  constraint one_row check (id = 1)
);

insert into public.nickname_seq (id, n)
values (1, 1000)
on conflict (id) do nothing;

create or replace function public.next_nickname()
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  adj text[] := array['용감한','활발한','조용한','엉뚱한','소심한','차분한','상냥한','씩씩한','포근한','밝은','느긋한','재빠른','다정한','즐거운','신비한','따뜻한','총명한','부드러운','당찬','귀여운'];
  animal text[] := array['거북이','사자','고양이','강아지','토끼','여우','판다','호랑이','코알라','다람쥐','부엉이','고슴도치','수달','펭귄','알파카','오리','병아리','고래','문어','나비','벌새','곰돌이','라쿤','하마','기린','얼룩말','두더지','앵무새','해달','물개'];
  candidate text;
begin
  loop
    candidate := adj[1 + floor(random() * array_length(adj, 1))::int]
      || animal[1 + floor(random() * array_length(animal, 1))::int]
      || lpad((1000 + floor(random() * 9000))::int::text, 4, '0');
    exit when not exists (select 1 from public.profiles where nickname = candidate);
  end loop;
  return candidate;
end;
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  provider text not null check (provider in ('kakao', 'google')),
  nickname text not null unique,
  gender text,
  birth_year int,
  skin_type text,
  concerns text[] not null default '{}',
  onboarding_done boolean not null default false,
  terms_agreed boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  product_id text not null,
  user_id uuid references auth.users (id) on delete set null,
  nickname text not null,
  skin_type text not null,
  concerns text[] not null default '{}',
  rating int not null check (rating between 1 and 5),
  body text not null default '',
  photos text[] not null default '{}',
  tags text[] not null default '{}',
  purchased boolean not null default false,
  withdrawn boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.wishlist (
  user_id uuid not null references auth.users (id) on delete cascade,
  product_id text not null,
  saved_at timestamptz not null default now(),
  primary key (user_id, product_id)
);

create table if not exists public.cart (
  user_id uuid not null references auth.users (id) on delete cascade,
  product_id text not null,
  qty int not null check (qty between 1 and 10),
  added_at timestamptz not null default now(),
  primary key (user_id, product_id)
);

create table if not exists public.viewed (
  user_id uuid not null references auth.users (id) on delete cascade,
  product_id text not null,
  viewed_at timestamptz not null default now(),
  primary key (user_id, product_id)
);

create table if not exists public.product_wish_stats (
  product_id text primary key,
  wish_count int not null default 0
);

create or replace function public.bump_wish_stat()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    insert into public.product_wish_stats (product_id, wish_count)
    values (new.product_id, 1)
    on conflict (product_id) do update set wish_count = public.product_wish_stats.wish_count + 1;
    return new;
  elsif tg_op = 'DELETE' then
    update public.product_wish_stats
      set wish_count = greatest(wish_count - 1, 0)
      where product_id = old.product_id;
    return old;
  end if;
  return null;
end;
$$;

drop trigger if exists wishlist_stats_ins on public.wishlist;
create trigger wishlist_stats_ins
after insert on public.wishlist
for each row execute function public.bump_wish_stat();

drop trigger if exists wishlist_stats_del on public.wishlist;
create trigger wishlist_stats_del
after delete on public.wishlist
for each row execute function public.bump_wish_stat();

create or replace function public.withdraw_me()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
begin
  if uid is null then
    raise exception 'not authenticated';
  end if;
  update public.reviews
    set nickname = '탈퇴한 회원의 리뷰입니다',
        withdrawn = true,
        user_id = null
    where user_id = uid;
  delete from public.wishlist where user_id = uid;
  delete from public.cart where user_id = uid;
  delete from public.viewed where user_id = uid;
  delete from public.profiles where id = uid;
  delete from auth.users where id = uid;
end;
$$;

alter table public.profiles enable row level security;
alter table public.reviews enable row level security;
alter table public.wishlist enable row level security;
alter table public.cart enable row level security;
alter table public.viewed enable row level security;
alter table public.product_wish_stats enable row level security;
alter table public.nickname_seq enable row level security;

drop policy if exists profiles_select on public.profiles;
create policy profiles_select on public.profiles for select using (true);
drop policy if exists profiles_insert on public.profiles;
create policy profiles_insert on public.profiles for insert with check (auth.uid() = id);
drop policy if exists profiles_update on public.profiles;
create policy profiles_update on public.profiles for update using (auth.uid() = id);

drop policy if exists reviews_select on public.reviews;
create policy reviews_select on public.reviews for select using (true);
drop policy if exists reviews_insert on public.reviews;
create policy reviews_insert on public.reviews for insert with check (auth.uid() = user_id);
drop policy if exists reviews_update on public.reviews;
create policy reviews_update on public.reviews for update using (auth.uid() = user_id);

drop policy if exists wishlist_all on public.wishlist;
create policy wishlist_all on public.wishlist for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists cart_all on public.cart;
create policy cart_all on public.cart for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists viewed_all on public.viewed;
create policy viewed_all on public.viewed for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists wish_stats_select on public.product_wish_stats;
create policy wish_stats_select on public.product_wish_stats for select using (true);

grant execute on function public.next_nickname() to authenticated;
grant execute on function public.withdraw_me() to authenticated;

alter table public.profiles add column if not exists gender text;
alter table public.profiles add column if not exists birth_year int;
alter table public.reviews add column if not exists tags text[] default '{}';

create unique index if not exists reviews_one_per_user_product
  on public.reviews (user_id, product_id)
  where user_id is not null;

create or replace function public.wish_counts_by_age(p_age text)
returns table(product_id text, n int)
language sql
stable
security definer
set search_path = public
as $$
  select w.product_id, count(*)::int as n
  from public.wishlist w
  join public.profiles p on p.id = w.user_id
  where (
    case
      when p.birth_year is null then '20대'
      when extract(year from now())::int - p.birth_year >= 40 then '40대 이상'
      when extract(year from now())::int - p.birth_year >= 30 then '30대'
      when extract(year from now())::int - p.birth_year >= 20 then '20대'
      else '10대'
    end
  ) = p_age
  group by w.product_id;
$$;

grant execute on function public.wish_counts_by_age(text) to authenticated;
grant execute on function public.wish_counts_by_age(text) to anon;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'review-photos',
  'review-photos',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists review_photos_public_read on storage.objects;
create policy review_photos_public_read
  on storage.objects for select
  using (bucket_id = 'review-photos');

drop policy if exists review_photos_auth_insert on storage.objects;
create policy review_photos_auth_insert
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'review-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists review_photos_auth_update on storage.objects;
create policy review_photos_auth_update
  on storage.objects for update to authenticated
  using (
    bucket_id = 'review-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists review_photos_auth_delete on storage.objects;
create policy review_photos_auth_delete
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'review-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
