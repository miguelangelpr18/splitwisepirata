-- ==========================================================================
--  Splitwise Trip  —  Supabase schema
--  Paste this entire file into the Supabase SQL editor and click "Run".
-- ==========================================================================

-- 1. People (the 3 trip members)
create table if not exists people (
  id           serial primary key,
  name         text not null unique,
  avatar_emoji text default '🙂',
  created_at   timestamptz default now()
);

insert into people (name, avatar_emoji) values
  ('Mike',     '🧑'),
  ('Mau',      '🧔'),
  ('Villalon', '😎')
on conflict (name) do nothing;

-- 2. Expenses
-- An "expense" is either a spend (is_settlement = false) OR a payment between
-- two people (is_settlement = true), so the activity list can show both.
create table if not exists expenses (
  id             serial primary key,
  description    text not null,
  amount         numeric(12, 2) not null check (amount > 0),
  paid_by        integer not null references people(id) on delete restrict,
  paid_to        integer references people(id) on delete restrict,  -- only for settlements
  date           timestamptz default now(),
  category       text default 'general',
  is_settlement  boolean default false,
  created_at     timestamptz default now()
);

-- 3. Splits (who owes what share of an expense)
create table if not exists expense_splits (
  id         serial primary key,
  expense_id integer not null references expenses(id) on delete cascade,
  person_id  integer not null references people(id) on delete restrict,
  amount     numeric(12, 2) not null,
  unique (expense_id, person_id)
);

create index if not exists idx_expenses_date   on expenses (date desc);
create index if not exists idx_splits_expense  on expense_splits (expense_id);
create index if not exists idx_splits_person   on expense_splits (person_id);

-- 4. Row Level Security
-- This trip is a closed group of 3 friends so we keep it simple: allow
-- everyone (anon key) to read/write. If you want stricter rules later you can
-- swap these for authenticated-only policies.
alter table people          enable row level security;
alter table expenses        enable row level security;
alter table expense_splits  enable row level security;

drop policy if exists "public read people"        on people;
drop policy if exists "public write people"       on people;
drop policy if exists "public read expenses"      on expenses;
drop policy if exists "public write expenses"     on expenses;
drop policy if exists "public read splits"        on expense_splits;
drop policy if exists "public write splits"       on expense_splits;

create policy "public read people"    on people          for select using (true);
create policy "public write people"   on people          for all    using (true) with check (true);
create policy "public read expenses"  on expenses        for select using (true);
create policy "public write expenses" on expenses        for all    using (true) with check (true);
create policy "public read splits"    on expense_splits  for select using (true);
create policy "public write splits"   on expense_splits  for all    using (true) with check (true);
