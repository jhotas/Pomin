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
