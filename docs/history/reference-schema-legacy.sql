-- BuildNest proposed PostgreSQL schema for a NEW Supabase project.
-- DO NOT run on an existing database without a migration diff and RLS tests.
-- Pending real provider integration; no privilege should be implied by this script.
create extension if not exists pgcrypto;

create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default '',
  locale text not null default 'en' check (locale in ('th','en')),
  created_at timestamptz not null default now()
);
create table if not exists public.admin_members (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null check(role in ('owner','admin','support')),
  created_at timestamptz not null default now()
);
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  label_th text not null,
  label_en text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references public.categories(id),
  slug text not null unique,
  product_type text not null check (product_type in ('desktop_app','source_code','automation_actor','hosted_tool','api_credits','template','course','other')),
  status text not null default 'draft' check(status in ('draft','review','published','archived')),
  featured boolean not null default false,
  platform text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists public.product_localizations (
  product_id uuid not null references public.products(id) on delete cascade,
  locale text not null check(locale in ('th','en')),
  name text not null,
  summary text not null,
  description_md text not null default '',
  seo_title text,
  seo_description text,
  primary key(product_id,locale)
);
create table if not exists public.product_prices (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  currency text not null check(currency in ('THB','USD')),
  amount_minor bigint not null check (amount_minor >= 0),
  license_tier text not null default 'personal',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  unique(product_id,currency,license_tier)
);
create table if not exists public.product_versions (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  version text not null,
  status text not null default 'draft' check(status in ('draft','released','retired')),
  changelog_md text not null default '',
  released_at timestamptz,
  unique(product_id,version)
);
create table if not exists public.artifacts (
  id uuid primary key default gen_random_uuid(),
  version_id uuid not null references public.product_versions(id) on delete cascade,
  filename text not null,
  r2_object_key text not null unique,
  byte_length bigint not null check(byte_length >= 0),
  sha256 char(64) not null,
  platform text not null default 'any',
  uploaded_at timestamptz not null default now()
);
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id),
  status text not null default 'pending_payment' check(status in ('pending_payment','paid','fulfilled','failed','canceled','refunded','disputed')),
  currency text not null check(currency in ('THB','USD')),
  amount_minor bigint not null check(amount_minor >= 0),
  idempotency_key text not null unique,
  stripe_checkout_session_id text unique,
  stripe_payment_intent_id text unique,
  created_at timestamptz not null default now(),
  paid_at timestamptz
);
create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid not null references public.products(id),
  price_id uuid references public.product_prices(id),
  description_snapshot text not null,
  license_tier text not null,
  unit_amount_minor bigint not null check(unit_amount_minor >= 0),
  quantity integer not null default 1 check(quantity > 0),
  currency text not null check(currency in ('THB','USD'))
);
create table if not exists public.payment_events (
  id uuid primary key default gen_random_uuid(),
  provider text not null default 'stripe',
  event_id text not null,
  event_type text not null,
  order_id uuid references public.orders(id),
  processed_at timestamptz,
  status text not null default 'received' check(status in ('received','processed','failed')),
  created_at timestamptz not null default now(),
  unique(provider,event_id)
);
create table if not exists public.entitlements (
  id uuid primary key default gen_random_uuid(),
  order_item_id uuid not null unique references public.order_items(id),
  user_id uuid not null references auth.users(id),
  product_id uuid not null references public.products(id),
  license_tier text not null,
  activated_at timestamptz not null default now(),
  expires_at timestamptz,
  revoked_at timestamptz
);
create table if not exists public.download_audit (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id),
  entitlement_id uuid references public.entitlements(id),
  artifact_id uuid references public.artifacts(id),
  allowed boolean not null,
  reason text,
  created_at timestamptz not null default now()
);
create table if not exists public.automation_jobs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id),
  product_id uuid not null references public.products(id),
  source text not null check(source in ('apify','own_worker')),
  external_run_id text,
  status text not null default 'queued' check(status in ('queued','running','succeeded','failed','canceled')),
  input_ref text,
  result_ref text,
  units_processed bigint not null default 0 check(units_processed >= 0),
  estimated_cost_minor bigint not null default 0,
  actual_cost_minor bigint,
  created_at timestamptz not null default now(),
  completed_at timestamptz
);
create table if not exists public.usage_ledger (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.automation_jobs(id),
  user_id uuid not null references auth.users(id),
  kind text not null check(kind in ('reserve','charge','release','refund')),
  source_event_id text not null,
  units bigint not null check(units >= 0),
  amount_minor bigint not null check(amount_minor >= 0),
  currency text not null check(currency in ('THB','USD')),
  created_at timestamptz not null default now(),
  unique(job_id,kind,source_event_id)
);
create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid references auth.users(id),
  action text not null,
  entity_type text not null,
  entity_id text not null,
  detail jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists orders_owner_idx on public.orders(user_id,created_at desc);
create index if not exists order_items_order_idx on public.order_items(order_id);
create index if not exists entitlements_owner_idx on public.entitlements(user_id,product_id);
create index if not exists jobs_owner_idx on public.automation_jobs(user_id,created_at desc);
create index if not exists usage_owner_idx on public.usage_ledger(user_id,created_at desc);
create index if not exists product_category_idx on public.products(category_id,status);
create index if not exists product_versions_product_idx on public.product_versions(product_id,status);

-- Enable RLS everywhere. Admin operations are allowed only via privileged,
-- authenticated server endpoints; no direct browser SQL admin writes.
do $$ declare tab text; begin
  foreach tab in array array['profiles','admin_members','categories','products','product_localizations','product_prices','product_versions','artifacts','orders','order_items','payment_events','entitlements','download_audit','automation_jobs','usage_ledger','audit_logs'] loop
    execute format('alter table public.%I enable row level security',tab);
    execute format('revoke all on public.%I from anon, authenticated',tab);
  end loop;
end $$;

-- Public read: published catalog only. Direct artifact table access is NEVER granted.
grant select on public.categories,public.products,public.product_localizations,public.product_prices,public.product_versions to anon,authenticated;
create policy categories_visible on public.categories for select to anon,authenticated using(is_active=true);
create policy products_visible on public.products for select to anon,authenticated using(status='published');
create policy locales_visible on public.product_localizations for select to anon,authenticated using(exists(select 1 from public.products p where p.id=product_id and p.status='published'));
create policy prices_visible on public.product_prices for select to anon,authenticated using(is_active=true and exists(select 1 from public.products p where p.id=product_id and p.status='published'));
create policy versions_visible on public.product_versions for select to anon,authenticated using(status='released' and exists(select 1 from public.products p where p.id=product_id and p.status='published'));

-- Customer read-only scopes. All writes to financial/job/license tables are via server.
grant select on public.profiles to authenticated;
grant update (display_name,locale) on public.profiles to authenticated;
grant select on public.orders,public.order_items,public.entitlements,public.automation_jobs to authenticated;
create policy profile_read_own on public.profiles for select to authenticated using((select auth.uid())=user_id);
create policy profile_update_own on public.profiles for update to authenticated using((select auth.uid())=user_id) with check((select auth.uid())=user_id);
create policy orders_read_own on public.orders for select to authenticated using((select auth.uid())=user_id);
create policy items_read_own on public.order_items for select to authenticated using(exists(select 1 from public.orders o where o.id=order_id and o.user_id=(select auth.uid())));
create policy entitlements_read_own on public.entitlements for select to authenticated using((select auth.uid())=user_id);
create policy jobs_read_own on public.automation_jobs for select to authenticated using((select auth.uid())=user_id);

-- Explicitly NO client grants/policies for admin_members, artifacts, payment_events,
-- download_audit, usage_ledger and audit_logs. Query those through trusted API only.
-- SECURITY REVIEW: profile UPDATE currently includes role-free display and locale only;
-- if adding columns to profiles, revisit column-level grants immediately.
