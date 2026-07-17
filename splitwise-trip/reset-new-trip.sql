-- ==========================================================================
--  NUEVO VIAJE — reset script
--  Run this in the Supabase SQL editor of your EXISTING project to start
--  the new trip: wipes every expense/settlement from the previous trip and
--  adds Mbappe as the 4th member.
--
--  ⚠️  This permanently deletes the old trip's history. If you want to keep
--  it, export the `expenses` and `expense_splits` tables to CSV first
--  (Table Editor → table → Export).
--
--  (If instead you're setting up a BRAND-NEW Supabase project, skip this
--  file and just run supabase-schema.sql — it already seeds the 4 people.)
-- ==========================================================================

-- 1. Wipe all expenses & settlements (splits are removed by ON DELETE CASCADE)
delete from expenses;

-- 2. Add the new member (safe to re-run; does nothing if he already exists)
insert into people (name, avatar_emoji) values
  ('Mbappe', '⚽')
on conflict (name) do nothing;

-- 3. Sanity check — should return 4 rows: Mike, Mau, Mbappe, Villalon
select id, name, avatar_emoji from people order by id;
