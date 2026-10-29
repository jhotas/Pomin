# pomoapp

pomoapp is a pomodoro timer that records focused time per skill, so you can track your progress toward 10,000 hours of deliberate practice in each one. It works fully offline with no account. An optional account adds sync across devices.

## Requirements

- Node.js 26 (see `.nvmrc`)
- pnpm

## Setup

```bash
pnpm install
pnpm dev
```

Open http://localhost:3000.

## Accounts and sync (optional)

Without configuration the app keeps everything in the browser. To let people sign in and sync across devices, connect a [Supabase](https://supabase.com) project:

1. Create a project. In **SQL Editor**, run [`supabase/migrations/20261029120000_accounts_and_sync.sql`](supabase/migrations/20261029120000_accounts_and_sync.sql). It creates the `skills` and `sessions` tables with row-level security and the `push_changes` and `pull_changes` functions.
2. In **Authentication > URL Configuration**, set the site URL and add `http://localhost:3000/**` (and your deployed URL) to the redirect URLs.
3. Copy `.env.example` to `.env.local` and fill in the project URL and publishable key from **Project Settings > API Keys**.
4. Optional: to offer GitHub sign-in, enable GitHub under **Authentication > Providers** and set `NEXT_PUBLIC_SUPABASE_GITHUB_ENABLED=true`.

How sync works: IndexedDB stays the source the app reads, so the app is as fast and offline-capable signed in as signed out. A sync engine pushes records changed since its last push and pulls rows the server stamped since its last pull. Each record keeps the version written last (`updatedAt`); deletions travel as tombstones. On a browser's first sync, its skills are merged into the account's skills of the same name. Signing out removes the account's data from that browser.

## Scripts

| Script              | What it does                                        |
| ------------------- | --------------------------------------------------- |
| `pnpm dev`          | Start the development server                        |
| `pnpm build`        | Build for production                                |
| `pnpm start`        | Serve the production build                          |
| `pnpm lint`         | Lint with ESLint                                    |
| `pnpm typecheck`    | Generate route types and type-check with TypeScript |
| `pnpm format`       | Format all files with Prettier                      |
| `pnpm format:check` | Check formatting without writing                    |

## Design

The product and technical design lives in [`docs/superpowers/specs/2026-10-29-pomoapp-design.md`](docs/superpowers/specs/2026-10-29-pomoapp-design.md). Implementation plans for each part are in [`docs/superpowers/plans/`](docs/superpowers/plans/).

## How this was built

This project is developed with Claude Code as an AI pair programmer. Commits it wrote carry a `Co-Authored-By` trailer.
