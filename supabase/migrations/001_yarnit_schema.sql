-- =============================================================================
-- Yarn It! database schema
-- =============================================================================
-- HOW TO RUN: Supabase Dashboard → SQL Editor → paste this ENTIRE file contents
--             (do not paste the file path).
--
-- AUTH (one admin only, no customer accounts):
--   • Create exactly ONE user: Dashboard → Authentication → Users → Add user
--   • Turn OFF public sign-ups (Authentication → Providers → Email)
--   • That user is the shop admin; admin.html signs in with email + password
--   • Customers browse index.html without logging in
--
-- RLS summary:
--   • anon + authenticated: SELECT active products, SELECT shop_settings
--   • authenticated only: INSERT/UPDATE/DELETE products, write settings, upload images
-- =============================================================================

create table if not exists public.products (
  id bigint generated always as identity primary key,
  name text not null,
  price integer not null check (price > 0),
  cat text not null check (cat in ('bags', 'tops', 'hats', 'winter', 'custom')),
  colours text not null default '',
  badge text not null default '',
  image_url text not null default '',
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.shop_settings (
  id integer primary key default 1 check (id = 1),
  whatsapp_number text not null default '27000000000',
  instagram_url text not null default '',
  tiktok_url text not null default '',
  facebook_url text not null default '',
  updated_at timestamptz not null default now()
);

insert into public.shop_settings (id, whatsapp_number)
values (1, '27000000000')
on conflict (id) do nothing;

insert into public.products (name, price, cat, colours, badge, image_url, sort_order)
select v.name, v.price, v.cat, v.colours, v.badge, v.image_url, v.sort_order
from (values
  ('Pink Crochet Chain Bag', 250, 'bags', 'Pink, Green, Cream', 'Best Seller', '', 1),
  ('Rose Crochet Handbag', 350, 'bags', 'Rose Gold, Cream Gold', 'New In', '', 2),
  ('Green Chunky Crochet Bag', 220, 'bags', 'Green, Blue', '', '', 3),
  ('Blue Flower Crochet Top', 180, 'tops', 'Royal Blue, Crimson', 'Fan Favourite', '', 4),
  ('Cowrie Shell Crochet Top', 200, 'tops', 'Natural, Red', '', '', 5),
  ('Crochet Bucket Hat', 160, 'hats', 'Tan, Black, Lavender, Blue, Pink, Cream', '6 Colours', '', 6),
  ('Pearl Pin Beanie', 140, 'winter', 'Yellow, Blue, Green, Brown', '4 Colours', '', 7)
) as v(name, price, cat, colours, badge, image_url, sort_order)
where not exists (select 1 from public.products limit 1);

alter table public.products enable row level security;
alter table public.shop_settings enable row level security;

-- Public shop: anyone can read active products (no login)
drop policy if exists "products_public_read" on public.products;
create policy "products_public_read"
  on public.products for select
  to anon, authenticated
  using (is_active = true);

-- Admin only: signed-in Supabase Auth user may manage products
drop policy if exists "products_admin_all" on public.products;
create policy "products_admin_all"
  on public.products for all
  to authenticated
  using (true)
  with check (true);

-- Public shop: read WhatsApp / social settings
drop policy if exists "settings_public_read" on public.shop_settings;
create policy "settings_public_read"
  on public.shop_settings for select
  to anon, authenticated
  using (true);

-- Admin only: update shop settings
drop policy if exists "settings_admin_write" on public.shop_settings;
create policy "settings_admin_write"
  on public.shop_settings for all
  to authenticated
  using (true)
  with check (true);

insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do update set public = true;

-- Anyone can view product images on the public shop
drop policy if exists "product_images_public_read" on storage.objects;
create policy "product_images_public_read"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'product-images');

-- Admin only: upload / replace / delete product images
drop policy if exists "product_images_auth_insert" on storage.objects;
create policy "product_images_auth_insert"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'product-images');

drop policy if exists "product_images_auth_update" on storage.objects;
create policy "product_images_auth_update"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'product-images');

drop policy if exists "product_images_auth_delete" on storage.objects;
create policy "product_images_auth_delete"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'product-images');
