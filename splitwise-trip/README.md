# Splitwise Trip — Mike · Mau · Villalon

A private, Splitwise-style expense splitter for a 3-person trip. Built with Next.js 14, Tailwind CSS, and Supabase (Postgres). Deploys to Vercel on the free tier.

## What it does

- Pick who you are (Mike, Mau, or Villalon) from the top-right menu — no passwords.
- **Dashboard** — overall balance, who owes you / who you owe, recent activity.
- **Add expense** — description, amount in MXN, who paid, split equally or by exact amounts, include or exclude people.
- **Activity** — every expense and settlement, newest first, with delete.
- **Settle up** — suggested payments that clear everyone in the fewest transactions, plus a manual "I paid X pesos to Y" form.
- Mobile-first UI you can save to your home screen.

## Stack

- Next.js 14 (App Router, TypeScript, React client components)
- Tailwind CSS for styling
- Supabase (Postgres + REST) for storage

## Run it locally

```bash
npm install
cp .env.example .env.local     # then fill in Supabase values
npm run dev
```

Open http://localhost:3000.

## Project layout

```
app/
  page.tsx          Dashboard
  add/page.tsx      Add expense
  activity/page.tsx All activity
  settle/page.tsx   Settle up
components/         TopBar, BottomNav, ExpenseRow, Loader
lib/
  supabase.ts       Supabase client
  api.ts            Read/write helpers
  calculations.ts   Balances + settle-up algorithm
  format.ts         Currency + date helpers
  types.ts          Shared TS types
supabase-schema.sql Paste into Supabase SQL editor
```

## Deploy

See **DEPLOY.md** for the full step-by-step (GitHub → Supabase → Vercel, about 15 minutes).
