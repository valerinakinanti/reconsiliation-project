# Semester Notebook

A fast, visual study dashboard for tracking an NUS semester across chapter-based
and class-based modules — weekly chapter progress, session attendance,
confidence ratings, deadlines, and week-over-week trends. Synced through
Supabase so the same data shows up on your laptop and your phone.

## Stack

React + Vite + TypeScript, Tailwind CSS v4, Zustand (+ Immer), Recharts,
Framer Motion, Supabase (Postgres + Auth + JS client).

## 1. Create a Supabase project

1. Go to [supabase.com](https://supabase.com), sign in, and click **New project**.
2. Pick any name/region and a database password (you won't need the password day-to-day).
3. Once the project is ready, open **SQL Editor → New query**, paste in the
   contents of [`supabase/schema.sql`](./supabase/schema.sql), and run it.
   This creates the `courses`, `weeks`, `chapters`, `sessions`, and
   `deadlines` tables plus Row Level Security policies so only your signed-in
   user can ever read or write your rows.
4. Under **Authentication → Providers**, email auth is on by default — that's
   all this app needs (magic link or email/password, your choice at sign-in).
   If you want magic links to work out of the box, also set the **Site URL**
   (Authentication → URL Configuration) to wherever the app is running (e.g.
   `http://localhost:5173` while developing, and your deployed URL later).
5. Under **Project Settings → API**, copy the **Project URL** and the
   **anon public** key.

## 2. Configure the app

```bash
cp .env.example .env
```

Fill in the two values from step 1:

```
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
```

`.env` is gitignored — the anon key is safe to expose client-side (RLS is
what actually protects your data), but it still shouldn't be hardcoded into
source or committed.

## 3. Run it

```bash
npm install
npm run dev
```

Open the printed local URL, sign in (first sign-in creates your account —
this is a single-user app), and start adding modules.

## Other scripts

```bash
npm run build     # typecheck + production build
npm run test      # runs once — see also: npx vitest (watch mode)
npm run lint      # oxlint
npm run preview   # preview the production build locally
```

## Deploying

Any static host works (Vercel and Netlify both have generous free tiers):

1. Push this repo to GitHub.
2. Import it in Vercel or Netlify, with the project root set to `study-dashboard/`
   if it's not already the repo root.
3. Build command: `npm run build`. Output directory: `dist`.
4. Add the two `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` environment
   variables in the host's dashboard (same values as your local `.env`).
5. Deploy, then update Supabase's **Site URL** / **Redirect URLs**
   (Authentication → URL Configuration) to include the live URL so magic
   links resolve correctly.

Open the live URL on your phone and laptop — both read/write the same
Supabase project, so changes show up on next load/refresh.

## Data model

See [`supabase/schema.sql`](./supabase/schema.sql) for the full schema. In
short: a `course` is either `chapter-based` (organized into `weeks` →
`chapters`, each with discussion/self-study/tested-knowledge checkboxes and a
1–5 confidence rating) or `class-based` (a flat list of `sessions` with
attendance/confidence/notes). Every course can have any number of
`deadlines` (project or soft). Status badges (*Needs self-study* → *Needs
revision* → *Test yourself* → *Safe to move on*) are computed client-side
from those fields — see `src/lib/statusLogic.ts` — never stored or set
directly.
