# Delivery Management System

Next.js 14 (App Router, TypeScript) + Supabase (Postgres, Auth, Storage) + Tailwind CSS.

This is **Phase 1, steps 1–6** from the project plan: project setup, database schema with
row-level security, authentication, role-based routing, and the dashboard/driver shells with
live summary cards. Orders, Customers, Drivers CRUD, and delivery assignment are the next
additions.

## 1. Prerequisites

- Node.js 18.18+ (`node -v`)
- A free [Supabase](https://supabase.com) account

## 2. Create your Supabase project

1. Go to supabase.com → New project.
2. Once it's provisioned, open **SQL Editor** and run the contents of `supabase/schema.sql`
   in full. This creates every table, enum, trigger, and RLS policy.
3. Go to **Project Settings → API** and copy the **Project URL** and **anon public** key.

## 3. Configure environment variables

```bash
cp .env.local.example .env.local
```

Fill in `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` from step 2.

## 4. Install dependencies

```bash
npm install
```

## 5. Create your first admin user

1. In Supabase dashboard → **Authentication → Users → Add user**, create yourself with an
   email + password (skip email confirmation for local testing, or confirm via the emailed link).
2. In **SQL Editor**, promote that user to admin (a fresh signup defaults to `customer`):

   ```sql
   update public.profiles set role = 'admin' where email = 'you@example.com';
   ```

## 6. Run the app

```bash
npm run dev
```

Visit `http://localhost:3000` — you'll be redirected to `/login`, then to `/dashboard` after
signing in as an admin.

To test the driver view, create a second user and set `role = 'driver'` the same way, then
visit `/driver` while signed in as that user.

## Project structure

```
src/
  app/
    login/            # auth
    dashboard/         # admin + manager area (protected)
    driver/            # driver area (protected)
    track/             # public customer tracking (Phase 2)
  components/          # shared UI (sidebar, status badges, cards)
  lib/supabase/         # browser / server / middleware Supabase clients
  types/database.ts     # shared TS types mirroring the schema
  middleware.ts          # route protection + role-based redirects
supabase/
  schema.sql             # full DB schema + RLS policies
```

## Roadmap (matches the original spec's phases)

- **Phase 1 (in progress):** auth, roles, dashboard shell, customers, orders, drivers,
  delivery assignment, driver dashboard actions, basic payments, proof of delivery.
- **Phase 2:** analytics/reports, calendar, customer tracking pages, notifications, storage
  polish.
- **Phase 3:** Google Maps, live GPS tracking, route optimization, auto-assignment, M-Pesa.
