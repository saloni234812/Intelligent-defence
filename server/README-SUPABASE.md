# Supabase migration

Set environment variables:

- SUPABASE_URL
- SUPABASE_SERVICE_ROLE_KEY (or SUPABASE_ANON_KEY for local dev)
- JWT_SECRET

SQL schema (execute in Supabase SQL editor):

```sql
create table public.users_app (
  id uuid primary key default gen_random_uuid(),
  name text,
  email text unique not null,
  password_hash text not null,
  role text not null default 'User',
  created_at timestamptz default now()
);

create table public.alerts (
  id uuid primary key default gen_random_uuid(),
  alert_type text check (alert_type in ('CRITICAL','HIGH','MEDIUM','LOW')) not null,
  title text not null,
  description text,
  location text,
  confidence numeric,
  status text not null default 'OPEN',
  created_at timestamptz default now()
);

create table public.radar_detections (
  id uuid primary key default gen_random_uuid(),
  radarId text not null,
  timestamp timestamptz not null,
  rangeMeters numeric not null,
  azimuthDeg int not null,
  elevationDeg int,
  rcs numeric,
  velocityMps numeric,
  confidence numeric,
  meta jsonb default '{}'::jsonb
);

-- Basic RLS policies (optional; adjust as needed)
alter table public.users_app enable row level security;
create policy "users read own" on public.users_app for select using (true);

alter table public.alerts enable row level security;
create policy "alerts read" on public.alerts for select using (true);
create policy "alerts write" on public.alerts for insert with check (true);
create policy "alerts update" on public.alerts for update using (true);

alter table public.radar_detections enable row level security;
create policy "radar read" on public.radar_detections for select using (true);
create policy "radar write" on public.radar_detections for insert with check (true);
create policy "radar delete" on public.radar_detections for delete using (true);
```

Update `.env` and run:

```bash
cd server
npm install
npm run seed:radar
npm run dev
```

