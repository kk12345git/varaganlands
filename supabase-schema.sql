-- ============================================================
-- VARAGAM REAL ESTATE — Supabase Schema
-- Run this in Supabase SQL Editor (Dashboard > SQL Editor)
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";
create extension if not exists "postgis";  -- for geo queries (optional)

-- ─── PROFILES ────────────────────────────────────────────────────────────────
create table public.profiles (
  id          uuid references auth.users on delete cascade primary key,
  full_name   text,
  phone       text,
  role        text not null default 'seller' check (role in ('seller','admin','buyer')),
  avatar_url  text,
  whatsapp    text,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- Auto-create profile on signup
create or replace function handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, full_name, phone, role)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'phone',
    coalesce(new.raw_user_meta_data->>'role', 'seller')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- ─── LISTINGS ────────────────────────────────────────────────────────────────
create table public.listings (
  id              uuid default uuid_generate_v4() primary key,
  seller_id       uuid references public.profiles(id) on delete cascade not null,

  -- Basic info
  title           text not null,
  description     text,
  land_type       text not null check (land_type in ('agricultural','residential','commercial','industrial','plantation')),

  -- Location
  district        text not null,
  taluk           text,
  village         text,
  address         text,
  latitude        double precision,
  longitude       double precision,
  survey_number   text,

  -- Area
  area_value      numeric not null,
  area_unit       text not null default 'cent' check (area_unit in ('cent','acre','sqft','ground','guntha')),

  -- Pricing
  price           numeric not null,
  price_per_unit  numeric,
  price_negotiable boolean default false,

  -- Status
  status          text not null default 'pending' check (status in ('pending','approved','rejected','sold')),
  rejection_reason text,
  featured        boolean default false,

  -- Media
  images          text[] default '{}',
  documents       text[] default '{}',

  -- Extras
  road_access     boolean default false,
  water_source    text,
  electricity     boolean default false,
  patta_available boolean default false,

  -- Admin
  reviewed_by     uuid references public.profiles(id),
  reviewed_at     timestamptz,
  admin_notes     text,

  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

-- ─── INQUIRIES ───────────────────────────────────────────────────────────────
create table public.inquiries (
  id          uuid default uuid_generate_v4() primary key,
  listing_id  uuid references public.listings(id) on delete cascade not null,
  buyer_name  text not null,
  buyer_phone text not null,
  buyer_email text,
  message     text,
  status      text default 'new' check (status in ('new','contacted','closed')),
  created_at  timestamptz default now()
);

-- ─── NOTIFICATIONS ───────────────────────────────────────────────────────────
create table public.notifications (
  id          uuid default uuid_generate_v4() primary key,
  user_id     uuid references public.profiles(id) on delete cascade,
  type        text not null,
  title       text not null,
  body        text,
  read        boolean default false,
  metadata    jsonb default '{}',
  created_at  timestamptz default now()
);

-- ─── INDEXES ─────────────────────────────────────────────────────────────────
create index idx_listings_status      on public.listings(status);
create index idx_listings_district    on public.listings(district);
create index idx_listings_land_type   on public.listings(land_type);
create index idx_listings_seller_id   on public.listings(seller_id);
create index idx_listings_created_at  on public.listings(created_at desc);
create index idx_inquiries_listing_id on public.inquiries(listing_id);
create index idx_notifications_user   on public.notifications(user_id, read);

-- ─── UPDATED_AT TRIGGER ──────────────────────────────────────────────────────
create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

create trigger listings_updated_at  before update on public.listings  for each row execute procedure update_updated_at();
create trigger profiles_updated_at  before update on public.profiles  for each row execute procedure update_updated_at();

-- ─── ROW LEVEL SECURITY ──────────────────────────────────────────────────────
alter table public.profiles    enable row level security;
alter table public.listings    enable row level security;
alter table public.inquiries   enable row level security;
alter table public.notifications enable row level security;

-- Profiles
create policy "Public profiles viewable" on public.profiles for select using (true);
create policy "Users update own profile" on public.profiles for update using (auth.uid() = id);

-- Listings – buyers see only approved
create policy "Buyers see approved" on public.listings for select
  using (status = 'approved' or auth.uid() = seller_id or
         exists (select 1 from profiles where id = auth.uid() and role = 'admin'));

create policy "Sellers insert own" on public.listings for insert
  with check (auth.uid() = seller_id);

create policy "Sellers update own pending" on public.listings for update
  using (auth.uid() = seller_id and status = 'pending');

create policy "Admins full access" on public.listings for all
  using (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));

-- Inquiries
create policy "Anyone can inquire" on public.inquiries for insert with check (true);
create policy "Sellers see own listing inquiries" on public.inquiries for select
  using (exists (select 1 from listings where id = listing_id and seller_id = auth.uid())
         or exists (select 1 from profiles where id = auth.uid() and role = 'admin'));

-- Notifications
create policy "Users see own notifications" on public.notifications for select using (auth.uid() = user_id);
create policy "Users update own notifications" on public.notifications for update using (auth.uid() = user_id);

-- ─── STORAGE BUCKET ──────────────────────────────────────────────────────────
insert into storage.buckets (id, name, public) values ('listing-images', 'listing-images', true);

create policy "Authenticated upload" on storage.objects for insert
  with check (bucket_id = 'listing-images' and auth.role() = 'authenticated');

create policy "Public read" on storage.objects for select
  using (bucket_id = 'listing-images');

create policy "Owner delete" on storage.objects for delete
  using (bucket_id = 'listing-images' and auth.uid()::text = (storage.foldername(name))[1]);

-- ─── MAKE FIRST USER ADMIN ───────────────────────────────────────────────────
-- After signup, run this to make yourself admin:
-- update public.profiles set role = 'admin' where id = '<your-user-uuid>';
