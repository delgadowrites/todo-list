# To-Do Quest

A pixel-art to-do list where finishing a task earns XP. Tasks are saved in a Supabase Postgres database, and each browser only sees its own tasks.

**Live demo:** https://delgadowrites.github.io/todo-list/

## What it does

- Add a task (Add button or Enter). Blank tasks are blocked.
- **complete** removes the task and gives +15 XP.
- **×** removes the task with no XP (for typos or tasks you don't need).
- Your XP total shows at the bottom of the screen.
- Tasks are saved in a database and come back after a refresh.

## How it's built

| Part | Tool |
|---|---|
| Front end | HTML, CSS, JavaScript (no framework) |
| Database | Supabase Postgres (`tasks` table) |
| Security | Row Level Security (RLS) + Supabase anonymous sign-in |
| Supabase client | `supabase-js` v2, loaded from the jsDelivr CDN |
| XP total | Browser localStorage |
| Hosting | GitHub Pages |

**How the data stays private:** when the page opens, it signs in anonymously, so each browser gets its own user id. Every task row stores that id in `user_id`. RLS policies allow reading, adding, updating and deleting only rows where `user_id = auth.uid()`.

**About the key in `script.js`:** it's Supabase's **publishable** key, which is meant to be public. It only lets requests reach the database; the RLS policies decide what each request can see or change. The secret key (which skips RLS) is never used in this project.

## How to run it

1. Clone the repo and open `index.html` in a browser. It uses my Supabase project.
2. To use your own Supabase project instead:
   1. Create a project at supabase.com.
   2. In the SQL Editor, run:
```sql
      create table tasks (
        id uuid primary key default gen_random_uuid(),
        user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
        text text not null,
        completed boolean default false,
        created_at timestamptz default now()
      );

      alter table tasks enable row level security;

      create policy "Read own tasks" on tasks for select to authenticated
        using (user_id = (select auth.uid()));
      create policy "Insert own tasks" on tasks for insert to authenticated
        with check (user_id = (select auth.uid()));
      create policy "Update own tasks" on tasks for update to authenticated
        using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
      create policy "Delete own tasks" on tasks for delete to authenticated
        using (user_id = (select auth.uid()));
```
   3. Authentication → Sign In / Providers → turn on **Allow anonymous sign-ins**.
   4. In `script.js`, replace `supabaseUrl` and `supabaseKey` with your project URL and publishable key.

## Problem I hit and how I solved it

**Symptom:** while testing sign-in in the browser Console, my tasks "disappeared." A read gave back an empty list `[]` with **no error**, even though the Table Editor still showed my row.

**How I investigated:**
- Authentication → Users showed **two** anonymous users instead of one.
- In the Table Editor, my row's `user_id` started with `90c1`, but the browser was now signed in as a different user (`21bd`).

**Root cause:** calling `signInAnonymously()` while already signed in creates a **new** user and replaces the current session. RLS then correctly hid the old user's rows. With RLS, "no permission" for a read looks like "no data": you get `[]`, not an error.

**Fix:** the page checks for a saved session first (`getSession()`) and only signs in when there is none. Then it loads tasks, in that order (`await signInIfNeeded()` → `await loadTasks()`).

**Prevention:** I tested RLS three ways from the Console, reading the Network tab and response headers:

| Test | Result | What it proved |
|---|---|---|
| Insert a row with another user's `user_id` | `403`, `proxy-status: error=42501` | The insert policy blocks writing as someone else |
| Delete another user's row | `204`, no error, row still there | For read, update and delete, RLS filters rows instead of throwing an error |
| Query a misspelled table (`taskz`) | `404`, `PGRST205` with a hint | How a typo looks, so it isn't mistaken for an RLS problem |

## What I learned

- RLS returns an empty result instead of an error when a read isn't allowed, so "empty" can mean "no permission."
- Anonymous users use the `authenticated` role, so policies must say `to authenticated`.
- Network tab headers (`proxy-status`, `sb-jwt-sub`) show the database error code and which user sent the request.
- Order matters with async code: sign in, then read.
- Save to the database first, then update the page, so the page never shows data that wasn't saved.

## How I used AI

I used Claude as a senior-engineer tutor. For the Supabase backend, under a short deadline, Claude wrote the code in small chunks; I added each chunk, tested it, broke it on purpose to see the errors, and investigated each failure in the Console, Network tab and Supabase dashboard before moving on.

## Part of my portfolio

Project 3 of my 20-project full-stack challenge: https://delgadowrites.github.io/portfolio/