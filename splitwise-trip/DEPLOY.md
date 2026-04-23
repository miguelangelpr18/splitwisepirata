# Deploy guide — GitHub → Supabase → Vercel

This guide takes ~15 minutes. Everything is free.

---

## Part 1 · Put the code on GitHub

1. Create a free account at https://github.com if you don't have one.
2. Install Git on your computer if you haven't: https://git-scm.com/downloads
3. Open a terminal **inside the `splitwise-trip` folder** and run:

   ```bash
   git init
   git add .
   git commit -m "Initial commit: splitwise trip app"
   ```

4. On github.com click **New repository**, name it `splitwise-trip`, keep it **Private**, and click **Create**. Do NOT add a README or .gitignore (we already have them).

5. Copy the two commands GitHub shows you under "…push an existing repository from the command line". They look like:

   ```bash
   git remote add origin https://github.com/<your-username>/splitwise-trip.git
   git branch -M main
   git push -u origin main
   ```

   Paste them in your terminal. Done — the code is on GitHub.

---

## Part 2 · Set up Supabase (the database)

1. Go to https://supabase.com and sign up (GitHub login works).
2. Click **New Project**. Name it `splitwise-trip`, pick any region close to you (e.g. East US), set a database password (save it somewhere, you likely won't need it again). Click **Create new project** — wait ~1 minute while it spins up.
3. In the left sidebar click the **SQL Editor** icon (`</>`). Click **New query**.
4. Open `supabase-schema.sql` from this project, copy the whole file, paste it into the editor, and click **Run** (or ⌘/Ctrl + Enter). You should see "Success. No rows returned." The three tables and the three people (Mike, Mau, Villalon) are now created.
5. Still in Supabase, click **Project Settings** (gear icon) → **API**. You need two values:
   - **Project URL** — looks like `https://abcdefgh.supabase.co`
   - **anon public** API key — a long string starting with `eyJ…`
   Keep this tab open, you'll paste these into Vercel next.

---

## Part 3 · Deploy on Vercel

1. Go to https://vercel.com and sign up (GitHub login recommended — it'll auto-connect your repos).
2. Click **Add New → Project**. Pick the `splitwise-trip` repo you just pushed. Click **Import**.
3. Vercel auto-detects Next.js — leave all the build settings as-is.
4. Expand **Environment Variables** and add these two (copy them from the Supabase tab):

   | Name | Value |
   |---|---|
   | `NEXT_PUBLIC_SUPABASE_URL` | your Project URL |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | your anon public key |

5. Click **Deploy**. Wait ~1 minute.
6. Vercel gives you a URL like `https://splitwise-trip-abcd.vercel.app`. Open it on your phone, add it to your home screen (Share → Add to Home Screen on iOS) for an app-like feel. Share the URL with Mau and Villalon — they each pick their name from the top-right menu on their own device.

---

## Part 4 · Making changes later

Whenever you want to tweak something:

```bash
# edit files …
git add .
git commit -m "what I changed"
git push
```

Vercel auto-deploys the new version within ~30 seconds. You don't have to touch Vercel again.

---

## Troubleshooting

**"Missing Supabase env vars" error on the deployed site**
You forgot to add the two env vars in Vercel, or the names don't exactly match (they're case-sensitive and must start with `NEXT_PUBLIC_`). Fix: Vercel → your project → Settings → Environment Variables → add them → Deployments → click the latest → "Redeploy".

**Data doesn't show up**
Open Supabase → Table Editor → `people`. You should see three rows (Mike, Mau, Villalon). If the table is empty, re-run `supabase-schema.sql` — the `INSERT … ON CONFLICT DO NOTHING` is safe to run multiple times.

**I want to rename someone or add a 4th person**
In Supabase → Table Editor → `people` → click a row to rename, or click "Insert row" to add a new one. The app refreshes automatically.

**I want to change the currency**
Edit `lib/format.ts` — change `CURRENCY_CODE`, `CURRENCY_SYMBOL`, and the `Intl.NumberFormat` locale. Commit, push, Vercel redeploys.

---

## Security note

The `anon` key is public-safe — the database is locked to a closed group by row-level security policies that only allow reads/writes through your deployed app. The three friends all share the same URL. If you ever want real per-person auth, flip on Supabase Auth and tighten the RLS policies in `supabase-schema.sql`.
