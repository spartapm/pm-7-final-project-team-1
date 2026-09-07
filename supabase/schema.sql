-- ONE&BEAUTY schema (run as postgres)
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
  next_n int;
begin
  update public.nickname_seq set n = n + 1 where id = 1 returning n into next_n;
  return 'beautyuser' || next_n;
end;
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  provider text not null check (provider in ('kakao', 'google')),
  nickname text not null unique,
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
    set nickname = '탈퇴한 회원의 리뷰 입니다',
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

insert into public.reviews (id, product_id, nickname, skin_type, concerns, rating, body, photos, purchased, created_at)
values
  ('11111111-1111-1111-1111-111111111111', 'c1', 'yamyami:)', '복합성', array['트러블/진정'], 4,
   '가볍게 쓰기 좋은 제품이에요. 크림이다보니 보습에 도움되고 재구매 의향 있어요. 저녁에 얇게 펴발라두면 다음날 당김이 덜해서 계속 쓰고 있습니다. 향도 부담 없고 화장 전에 써도 밀리지 않아서 아침 루틴에 넣었어요.',
   array['/aestura-thumb.png'], true, '2026-09-01T12:00:00+09:00'),
  ('22222222-2222-2222-2222-222222222222', 'c1', '젤라도리', '복합성', array['수분/보습'], 5,
   '피부 자극 없이 매일 쓰기 좋았어요.', '{}', false, '2026-08-31T12:00:00+09:00'),
  ('33333333-3333-3333-3333-333333333333', 'c1', 'beautyuser1004', '지성', array['트러블/진정'], 3,
   '제 피부엔 조금 무거웠어요. 겨울엔 좋을 것 같아요.', '{}', false, '2026-08-20T12:00:00+09:00'),
  ('44444444-4444-4444-4444-444444444444', 'c6', 'yamyami:)', '복합성', array['트러블/진정'], 4,
   '잔여감 없이 흡수가 빨라서 좋음', '{}', false, '2026-08-28T12:00:00+09:00'),
  ('55555555-5555-5555-5555-555555555555', 'c2', '수분요정', '건성', array['수분/보습'], 5,
   '건조한 날에 듬뿍 바르면 하루 종일 촉촉해요.', '{}', false, '2026-08-15T12:00:00+09:00')
on conflict (id) do nothing;
