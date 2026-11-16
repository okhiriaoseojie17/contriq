-- PROFILES
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  created_at timestamptz not null default now()
);

create function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name');
  return new;
end $$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- CAMPAIGNS (amounts stored in minor units, e.g. kobo)
create table public.campaigns (
  id uuid primary key default gen_random_uuid(),
  organizer_id uuid not null references public.profiles(id) on delete cascade,
  title text not null check (char_length(title) between 3 and 120),
  description text,
  slug text not null unique,
  target_amount bigint not null check (target_amount > 0),
  fixed_amount bigint check (fixed_amount > 0),
  deadline timestamptz,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- PAYMENTS
create table public.payments (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  reference text not null unique,
  amount bigint not null check (amount > 0),
  payer_name text not null,
  payer_email text not null,
  status text not null default 'pending'
    check (status in ('pending','success','failed')),
  paid_at timestamptz,
  created_at timestamptz not null default now()
);
create index on public.payments (campaign_id, status);

-- RLS
alter table public.profiles  enable row level security;
alter table public.campaigns enable row level security;
alter table public.payments  enable row level security;

create policy "own profile read"   on public.profiles for select using (auth.uid() = id);
create policy "own profile update" on public.profiles for update using (auth.uid() = id);

create policy "organizer manages own campaigns" on public.campaigns
  for all using (auth.uid() = organizer_id) with check (auth.uid() = organizer_id);

create policy "public reads active campaigns" on public.campaigns
  for select using (is_active = true);

create policy "organizer reads own campaign payments" on public.payments
  for select using (
    exists (select 1 from public.campaigns c
            where c.id = payments.campaign_id and c.organizer_id = auth.uid())
  );
-- No insert/update policies on payments: only the server (service role)
-- writes payments, via initialize and the verified webhook.

-- PUBLIC PROGRESS (no emails exposed, successful payments only)
create function public.campaign_progress(p_campaign_id uuid)
returns table (total_collected bigint, payment_count bigint)
language sql security definer set search_path = public as $$
  select coalesce(sum(amount),0), count(*)
  from payments where campaign_id = p_campaign_id and status = 'success';
$$;

create function public.campaign_recent_contributors(p_campaign_id uuid, p_limit int default 10)
returns table (payer_name text, amount bigint, paid_at timestamptz)
language sql security definer set search_path = public as $$
  select payer_name, amount, paid_at from payments
  where campaign_id = p_campaign_id and status = 'success'
  order by paid_at desc limit least(p_limit, 50);
$$;