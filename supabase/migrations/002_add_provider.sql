alter table public.payments
  add column provider text not null default 'paystack'
  check (provider in ('kora', 'paystack'));