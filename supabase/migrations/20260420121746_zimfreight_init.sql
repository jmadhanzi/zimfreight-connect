-- ZimFreight initial schema

create type public.user_role as enum ('carrier', 'broker', 'owner');
create type public.app_role as enum ('admin', 'moderator', 'user');
create type public.load_status as enum ('available', 'booked', 'completed', 'expired');
create type public.booking_status as enum ('pending', 'accepted', 'rejected', 'cancelled', 'completed');
create type public.plan_tier as enum ('free', 'basic', 'pro', 'fleet');
create type public.subscription_status as enum ('active', 'past_due', 'cancelled', 'trialing', 'expired');

create table public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  full_name text not null,
  company_name text,
  phone_whatsapp text,
  city text,
  role public.user_role not null default 'carrier',
  zimra_registered boolean not null default false,
  verified boolean not null default false,
  rating numeric(3,2) not null default 0,
  total_loads integer not null default 0,
  created_at timestamptz not null default now()
);
alter table public.profiles enable row level security;

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null,
  unique (user_id, role)
);
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean language sql stable security definer set search_path = public
as $$ select exists (select 1 from public.user_roles where user_id = _user_id and role = _role) $$;

create table public.loads (
  id uuid primary key default gen_random_uuid(),
  poster_id uuid not null references auth.users(id) on delete cascade,
  origin text not null,
  destination text not null,
  highway text,
  distance_km integer,
  load_type text not null,
  equipment_required text,
  weight_tonnes numeric(10,2),
  num_loads integer not null default 1,
  rate_usd numeric(12,2) not null,
  rate_per_km numeric(10,2),
  payment_terms text,
  pickup_date date,
  delivery_deadline date,
  notes text,
  status public.load_status not null default 'available',
  is_border_crossing boolean not null default false,
  zimra_required boolean not null default false,
  commodity_value numeric(14,2),
  is_urgent boolean not null default false,
  views integer not null default 0,
  created_at timestamptz not null default now()
);
alter table public.loads enable row level security;
create index loads_status_created_idx on public.loads(status, created_at desc);
create index loads_origin_destination_idx on public.loads(origin, destination);

create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  load_id uuid not null references public.loads(id) on delete cascade,
  carrier_id uuid not null references auth.users(id) on delete cascade,
  status public.booking_status not null default 'pending',
  message text,
  created_at timestamptz not null default now(),
  unique (load_id, carrier_id)
);
alter table public.bookings enable row level security;

create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  plan public.plan_tier not null default 'free',
  status public.subscription_status not null default 'active',
  stripe_subscription_id text,
  ecocash_ref text,
  expires_at timestamptz,
  created_at timestamptz not null default now()
);
alter table public.subscriptions enable row level security;
create index subscriptions_user_idx on public.subscriptions(user_id);

create table public.route_rates (
  id uuid primary key default gen_random_uuid(),
  origin text not null,
  destination text not null,
  avg_rate_per_km numeric(10,2) not null,
  weekly_loads integer not null default 0,
  last_updated timestamptz not null default now(),
  unique (origin, destination)
);
alter table public.route_rates enable row level security;

create table public.border_status (
  id uuid primary key default gen_random_uuid(),
  border_name text not null unique,
  country_from text not null,
  country_to text not null,
  wait_hours numeric(5,2) not null default 0,
  status text not null default 'normal',
  updated_at timestamptz not null default now()
);
alter table public.border_status enable row level security;

create policy "Profiles readable by authenticated" on public.profiles for select to authenticated using (true);
create policy "Users insert own profile" on public.profiles for insert to authenticated with check (auth.uid() = user_id);
create policy "Users update own profile" on public.profiles for update to authenticated using (auth.uid() = user_id);

create policy "Users read own roles" on public.user_roles for select to authenticated using (auth.uid() = user_id);
create policy "Admins manage roles" on public.user_roles for all to authenticated
  using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));

create policy "Anyone can view loads" on public.loads for select to anon, authenticated using (true);
create policy "Authenticated users post loads" on public.loads for insert to authenticated with check (auth.uid() = poster_id);
create policy "Posters update own loads" on public.loads for update to authenticated using (auth.uid() = poster_id);
create policy "Posters delete own loads" on public.loads for delete to authenticated using (auth.uid() = poster_id);

create policy "Bookings visible to carrier and poster" on public.bookings for select to authenticated
  using (auth.uid() = carrier_id or exists (select 1 from public.loads l where l.id = bookings.load_id and l.poster_id = auth.uid()));
create policy "Carriers create bookings" on public.bookings for insert to authenticated with check (auth.uid() = carrier_id);
create policy "Carrier or poster updates booking" on public.bookings for update to authenticated
  using (auth.uid() = carrier_id or exists (select 1 from public.loads l where l.id = bookings.load_id and l.poster_id = auth.uid()));

create policy "Users read own subscription" on public.subscriptions for select to authenticated using (auth.uid() = user_id);

create policy "Route rates public read" on public.route_rates for select to anon, authenticated using (true);
create policy "Border status public read" on public.border_status for select to anon, authenticated using (true);

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public
as $$
begin
  insert into public.profiles (user_id, full_name, role) values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    coalesce((new.raw_user_meta_data->>'role')::public.user_role, 'carrier')
  );
  insert into public.subscriptions (user_id, plan, status) values (new.id, 'free', 'active');
  insert into public.user_roles (user_id, role) values (new.id, 'user');
  return new;
end;
$$;

create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

insert into public.route_rates (origin, destination, avg_rate_per_km, weekly_loads) values
  ('Harare', 'Bulawayo', 1.85, 42),
  ('Harare', 'Mutare', 1.95, 28),
  ('Harare', 'Beitbridge', 1.75, 56),
  ('Bulawayo', 'Beitbridge', 1.80, 38),
  ('Harare', 'Chirundu', 1.90, 31),
  ('Harare', 'Plumtree', 1.78, 22),
  ('Bulawayo', 'Victoria Falls', 1.88, 18),
  ('Mutare', 'Beitbridge', 2.05, 14);

insert into public.border_status (border_name, country_from, country_to, wait_hours, status) values
  ('Beitbridge', 'Zimbabwe', 'South Africa', 6.5, 'congested'),
  ('Chirundu', 'Zimbabwe', 'Zambia', 2.0, 'normal'),
  ('Plumtree', 'Zimbabwe', 'Botswana', 1.5, 'normal'),
  ('Forbes', 'Zimbabwe', 'Mozambique', 3.0, 'moderate'),
  ('Kazungula', 'Zimbabwe', 'Botswana', 1.0, 'normal'),
  ('Victoria Falls', 'Zimbabwe', 'Zambia', 0.75, 'normal');
