-- =========================================================
-- Delivery Management System — Supabase schema (Phase 1)
-- Run this in Supabase SQL Editor, or via `supabase db push`
-- =========================================================

-- ---------- Extensions ----------
create extension if not exists "uuid-ossp";

-- ---------- Enums ----------
create type user_role as enum ('admin', 'manager', 'driver', 'customer');
create type order_status as enum (
  'pending', 'confirmed', 'assigned', 'out_for_delivery',
  'delivered', 'failed', 'cancelled'
);
create type payment_method as enum ('mpesa', 'cash', 'card', 'bank_transfer', 'other');
create type payment_status as enum ('paid', 'pending', 'partially_paid', 'failed', 'refunded');
create type driver_status as enum ('online', 'offline', 'available', 'busy');
create type failure_reason as enum (
  'customer_unavailable', 'incorrect_address', 'customer_refused',
  'payment_problem', 'vehicle_problem', 'other'
);

-- ---------- Profiles (extends Supabase auth.users) ----------
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role user_role not null default 'customer',
  full_name text not null,
  phone text,
  email text,
  avatar_url text,
  -- for drivers only:
  driver_status driver_status default 'offline',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- Customers ----------
create table public.customers (
  id uuid primary key default uuid_generate_v4(),
  full_name text not null,
  phone text not null,
  email text,
  address text,
  location_lat double precision,
  location_lng double precision,
  notes text,
  -- if the customer has a login account, link it here (nullable — most won't)
  profile_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- Orders ----------
create table public.orders (
  id uuid primary key default uuid_generate_v4(),
  order_number text not null unique, -- e.g. "ORD-1024"
  customer_id uuid not null references public.customers(id) on delete restrict,
  description text not null,
  quantity int not null default 1,
  amount numeric(12,2) not null default 0,
  delivery_address text not null,
  delivery_lat double precision,
  delivery_lng double precision,
  preferred_date date,
  preferred_time text,
  notes text,
  status order_status not null default 'pending',
  payment_method payment_method,
  payment_status payment_status not null default 'pending',
  assigned_driver_id uuid references public.profiles(id) on delete set null,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index orders_customer_idx on public.orders(customer_id);
create index orders_driver_idx on public.orders(assigned_driver_id);
create index orders_status_idx on public.orders(status);
create index orders_created_at_idx on public.orders(created_at desc);

-- ---------- Order status history (audit trail for the workflow in section 16) ----------
create table public.order_status_history (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid not null references public.orders(id) on delete cascade,
  status order_status not null,
  changed_by uuid references public.profiles(id) on delete set null,
  notes text,
  created_at timestamptz not null default now()
);

-- ---------- Deliveries (proof of delivery + failure details) ----------
create table public.deliveries (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid not null unique references public.orders(id) on delete cascade,
  driver_id uuid references public.profiles(id) on delete set null,
  started_at timestamptz,
  completed_at timestamptz,
  delivery_notes text,
  proof_photo_url text,
  proof_signature_url text,
  gps_lat double precision,
  gps_lng double precision,
  gps_verified boolean default false,
  failure_reason failure_reason,
  failure_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- Payments ----------
create table public.payments (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid not null references public.orders(id) on delete cascade,
  customer_id uuid not null references public.customers(id) on delete restrict,
  amount numeric(12,2) not null,
  method payment_method not null,
  status payment_status not null default 'pending',
  collected_by uuid references public.profiles(id) on delete set null,
  paid_at timestamptz default now(),
  created_at timestamptz not null default now()
);

create index payments_order_idx on public.payments(order_id);
create index payments_customer_idx on public.payments(customer_id);

-- ---------- updated_at trigger helper ----------
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_profiles_updated before update on public.profiles
  for each row execute function public.set_updated_at();
create trigger trg_customers_updated before update on public.customers
  for each row execute function public.set_updated_at();
create trigger trg_orders_updated before update on public.orders
  for each row execute function public.set_updated_at();
create trigger trg_deliveries_updated before update on public.deliveries
  for each row execute function public.set_updated_at();

-- ---------- Auto-log order status changes ----------
create or replace function public.log_order_status_change()
returns trigger language plpgsql as $$
begin
  if (tg_op = 'INSERT') or (old.status is distinct from new.status) then
    insert into public.order_status_history (order_id, status, changed_by)
    values (new.id, new.status, auth.uid());
  end if;
  return new;
end;
$$;

create trigger trg_orders_status_log
  after insert or update of status on public.orders
  for each row execute function public.log_order_status_change();

-- =========================================================
-- Row Level Security
-- =========================================================

alter table public.profiles enable row level security;
alter table public.customers enable row level security;
alter table public.orders enable row level security;
alter table public.order_status_history enable row level security;
alter table public.deliveries enable row level security;
alter table public.payments enable row level security;

-- Helper: get the caller's role without recursive RLS lookups
create or replace function public.current_role()
returns user_role language sql stable security definer set search_path = public as $$
  select role from public.profiles where id = auth.uid();
$$;

-- ---------- profiles ----------
create policy "profiles: self can read own" on public.profiles
  for select using (id = auth.uid());
create policy "profiles: admin/manager can read all" on public.profiles
  for select using (public.current_role() in ('admin', 'manager'));
create policy "profiles: admin can manage" on public.profiles
  for all using (public.current_role() = 'admin')
  with check (public.current_role() = 'admin');
create policy "profiles: self can update own basic info" on public.profiles
  for update using (id = auth.uid());

-- ---------- customers ----------
create policy "customers: admin/manager full access" on public.customers
  for all using (public.current_role() in ('admin', 'manager'))
  with check (public.current_role() in ('admin', 'manager'));
create policy "customers: driver can read customers on their orders" on public.customers
  for select using (
    public.current_role() = 'driver'
    and exists (
      select 1 from public.orders o
      where o.customer_id = customers.id and o.assigned_driver_id = auth.uid()
    )
  );
create policy "customers: customer can read own record" on public.customers
  for select using (profile_id = auth.uid());

-- ---------- orders ----------
create policy "orders: admin/manager full access" on public.orders
  for all using (public.current_role() in ('admin', 'manager'))
  with check (public.current_role() in ('admin', 'manager'));
create policy "orders: driver sees only assigned orders" on public.orders
  for select using (public.current_role() = 'driver' and assigned_driver_id = auth.uid());
create policy "orders: driver can update status on assigned orders" on public.orders
  for update using (public.current_role() = 'driver' and assigned_driver_id = auth.uid())
  with check (public.current_role() = 'driver' and assigned_driver_id = auth.uid());
create policy "orders: customer sees only their own orders" on public.orders
  for select using (
    public.current_role() = 'customer'
    and exists (
      select 1 from public.customers c
      where c.id = orders.customer_id and c.profile_id = auth.uid()
    )
  );

-- ---------- order_status_history ----------
create policy "history: admin/manager read all" on public.order_status_history
  for select using (public.current_role() in ('admin', 'manager'));
create policy "history: driver reads history for own orders" on public.order_status_history
  for select using (
    public.current_role() = 'driver'
    and exists (select 1 from public.orders o where o.id = order_id and o.assigned_driver_id = auth.uid())
  );
create policy "history: system insert" on public.order_status_history
  for insert with check (true);

-- ---------- deliveries ----------
create policy "deliveries: admin/manager full access" on public.deliveries
  for all using (public.current_role() in ('admin', 'manager'))
  with check (public.current_role() in ('admin', 'manager'));
create policy "deliveries: driver manages own deliveries" on public.deliveries
  for all using (public.current_role() = 'driver' and driver_id = auth.uid())
  with check (public.current_role() = 'driver' and driver_id = auth.uid());
create policy "deliveries: customer reads delivery for own order" on public.deliveries
  for select using (
    public.current_role() = 'customer'
    and exists (
      select 1 from public.orders o
      join public.customers c on c.id = o.customer_id
      where o.id = deliveries.order_id and c.profile_id = auth.uid()
    )
  );

-- ---------- payments ----------
create policy "payments: admin/manager full access" on public.payments
  for all using (public.current_role() in ('admin', 'manager'))
  with check (public.current_role() in ('admin', 'manager'));
create policy "payments: driver can insert for own deliveries" on public.payments
  for insert with check (
    public.current_role() = 'driver'
    and exists (
      select 1 from public.orders o
      where o.id = order_id and o.assigned_driver_id = auth.uid()
    )
  );
create policy "payments: driver can read own collections" on public.payments
  for select using (public.current_role() = 'driver' and collected_by = auth.uid());
create policy "payments: customer reads own payments" on public.payments
  for select using (
    public.current_role() = 'customer'
    and exists (select 1 from public.customers c where c.id = customer_id and c.profile_id = auth.uid())
  );

-- =========================================================
-- Auto-create a profile row when a new auth user signs up
-- (role defaults to 'customer'; promote admins/managers/drivers manually
--  or via an admin-only API route)
-- =========================================================
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.email),
    new.email,
    coalesce((new.raw_user_meta_data->>'role')::user_role, 'customer')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
