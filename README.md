# Clone LM

Clone LM is a clone of Google NotebookLM. You create notebooks, fill them with sources (web research, uploaded files, or pasted text), chat with an assistant that answers strictly from those sources, and generate study material such as quizzes, flashcards, mind maps, reports, and infographics.

The project is built with Next.js 14 (App Router) and TypeScript, stores its data in Supabase (Postgres), and uses the Claude API for AI features.

## Features

- **Notebook collection.** Grid and list views, search, sort, plus create, rename, and delete.
- **Three-panel workspace.** Sources on the left, Chat in the middle, Studio on the right. Each side panel collapses, and the layout switches to a tabbed single-panel view on tablets and phones.
- **Sources.**
  - Web research powered by Claude's web search, with a fast mode and a deeper mode.
  - File upload (PDF and text) that gets summarized into a source.
  - Paste from clipboard.
  - A per-source overview that generates a short German summary and a topic category.
  - **Labels.** Group sources into categories, drag and drop between labels, and let the assistant organize everything automatically. New web research is sorted into sensible labels on import. Labels persist in the database.
- **Chat.** Streaming answers grounded in the notebook's sources, inline citations, follow-up suggestions, and the option to save an answer as a note.
- **Studio.** Generates quizzes, mind maps, reports, flashcards, infographics, data tables, and notes, each with its own settings dialog.
- **Access gate.** The whole site sits behind a shared password (HTTP Basic Auth).

## Tech stack

- Next.js 14 (App Router) and React 18
- TypeScript
- Framer Motion for animation
- Supabase (Postgres) for storage, accessed only from server-side API routes
- Anthropic Claude: Sonnet 4.6 for writing-heavy work (chat, reports) and Haiku 4.5 for structured output (quizzes, mind maps, summaries, label organizing)

## Project layout

```
app/
  list/                 Notebook collection page
  notebook/[id]/        Notebook workspace page
  api/notebooks/        All server routes (notebooks, sources, chat, studio, labels, ...)
components/             UI components (panels, modals, chat, studio, ...)
lib/                    Server clients (Supabase, Anthropic) and shared types
middleware.ts           Basic Auth gate
```

All database and AI access happens in `app/api`. The browser never sees a database or API key.

## Prerequisites

- Node.js 18 or newer
- A Supabase project
- An Anthropic API key from https://console.claude.com

## Environment variables

Copy `.env.example` to `.env.local` and fill in all four values. None of them use the `NEXT_PUBLIC_` prefix, because all four are server-only and must never reach the browser.

| Variable | Description |
| --- | --- |
| `APP_PASSWORD` | The shared site password. At the browser login prompt any username is accepted and only the password is checked. If this is unset, every request is rejected. |
| `ANTHROPIC_API_KEY` | Claude API key. Powers chat, research, studio generation, source overviews, and label organizing. |
| `SUPABASE_URL` | Your Supabase project URL, for example `https://xxxxxxxx.supabase.co`. |
| `SUPABASE_SERVICE_ROLE_KEY` | The Supabase `service_role` key (Settings, then API). It has full database access, so treat it as a secret. |

`.env.local` is gitignored, so your secrets are never committed.

## Database setup

The app expects four tables. If you are starting from a fresh Supabase project, run the SQL below in the Supabase SQL editor.

```sql
create extension if not exists "pgcrypto";

create table notebooks (
  id uuid primary key default gen_random_uuid(),
  title text not null default 'Unbenanntes Notebook',
  summary text,
  created_at timestamptz not null default now()
);

create table sources (
  id uuid primary key default gen_random_uuid(),
  notebook_id uuid not null references notebooks(id) on delete cascade,
  title text not null,
  url text,
  snippet text,
  content text,
  created_at timestamptz not null default now()
);

create table artifacts (
  id uuid primary key default gen_random_uuid(),
  notebook_id uuid not null references notebooks(id) on delete cascade,
  kind text not null,
  title text,
  data jsonb,
  created_at timestamptz not null default now()
);

create table chat_messages (
  id uuid primary key default gen_random_uuid(),
  notebook_id uuid not null references notebooks(id) on delete cascade,
  role text not null,
  content text not null default '',
  citations jsonb,
  created_at timestamptz not null default now()
);
```

The `artifacts` table is shared by several features. Its `kind` column distinguishes them: studio results (such as `quiz` or `mindmap`), `note`, `cover`, and `labels` (the per-notebook category configuration).

Because the server uses the `service_role` key, Postgres row level security is bypassed and no RLS policies are required. You can keep RLS enabled if you prefer, since the database is only reached from server-side code.

## Local development

```bash
npm install
npm run dev
```

Open http://localhost:3000. The browser will prompt for a username and password. Enter any username and the value you set for `APP_PASSWORD`.

Useful scripts:

```bash
npm run build    # production build
npm run start    # serve the production build
npm run lint     # Next.js lint
```

## How authentication works

[`middleware.ts`](middleware.ts) gates every page and API route except Next.js static assets. It reads the `Authorization` header, decodes the Basic Auth credentials, and compares only the password against `APP_PASSWORD`. The password is never stored in source code, and the middleware fails closed: if `APP_PASSWORD` is missing, all requests are rejected.

## Notes

- This is a personal clone for learning and demonstration. It is not affiliated with Google or NotebookLM.
- The interface is in German by design, since it mirrors the original product.
