# pomoapp design spec

Date: 2026-10-29
Status: draft, awaiting review

## 1. Purpose

pomoapp is a pomodoro timer that records focused time per skill, so the user can track progress toward 10,000 hours of deliberate practice in each one. It works fully offline with no account. An optional account adds sync across devices.

Success means:

- Starting a focus session takes one action from the home screen.
- Every focused minute is recorded against the right skill, even if the tab is throttled, reloaded or closed mid-session.
- Each skill shows its total hours, its share of 10,000 hours, and a projected completion date at the current pace.
- The interface looks deliberately designed, not like a generic template.

## 2. Scope

### In scope (v1)

- Pomodoro timer with focus, short break and long break phases.
- Skills: create, rename, archive, delete.
- Session history, per-skill progress and simple stats.
- Local storage in the browser (IndexedDB).
- JSON export and import.
- Optional account with cross-device sync (delivered last, see section 9).

### Out of scope (v1)

- Manual time entry for practice done away from the app.
- Teams, sharing or social features.
- Native mobile apps (the web app is responsive and installable as a PWA).
- Localization. The UI is English only.

## 3. Domain model

All records use client-generated UUIDs, so they can be created offline and synced later without id conflicts. All timestamps are ISO 8601 UTC strings. Every syncable record has `updatedAt` and a nullable `deletedAt` (soft delete, needed for sync).

```ts
type Skill = {
  id: string;
  name: string;            // 1-60 chars, unique among non-deleted skills (case-insensitive)
  targetHours: number;     // default 10_000
  archivedAt: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
};

type Session = {
  id: string;
  skillId: string;
  startedAt: string;
  endedAt: string;
  focusedSeconds: number;  // actual focused time, excluding pauses
  plannedSeconds: number;
  outcome: "completed" | "interrupted";
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
};

type Settings = {
  focusMinutes: number;          // default 25
  shortBreakMinutes: number;     // default 5
  longBreakMinutes: number;      // default 15
  longBreakEvery: number;        // default 4 focus sessions
  autoStartBreaks: boolean;      // default false
  autoStartFocus: boolean;       // default false
  soundEnabled: boolean;         // default true
  activeSkillId: string | null;
};
```

Rules:

- Only focus phases create sessions. Breaks are not stored.
- A focus phase that ends early is saved as `interrupted` with its actual `focusedSeconds`, if at least 60 seconds were focused. Shorter ones are discarded.
- Deleting a skill soft-deletes it and its sessions. Archiving hides it from the picker but keeps it in stats.
- Progress for a skill is the sum of `focusedSeconds` of its non-deleted sessions.

## 4. Timer

The timer core is a pure TypeScript module with no React or browser dependencies. It is fully unit-tested.

State is derived from timestamps, never from counting ticks:

```ts
type TimerState = {
  phase: "focus" | "shortBreak" | "longBreak";
  status: "idle" | "running" | "paused";
  plannedMs: number;
  accumulatedMs: number;        // time elapsed before the current run
  runningSince: number | null;  // epoch ms when the current run started
  phaseStartedAt: number | null;
  completedFocusCount: number;  // drives the long break cycle
};
```

- `remaining = plannedMs - (accumulatedMs + (now - runningSince))`.
- Actions: `start`, `pause`, `resume`, `skip`, `reset`, `tick(now)`. Each is a pure function `(state, action, now) => { state, events }`.
- Events such as `focusCompleted` and `phaseChanged` are returned to the caller, which saves sessions and plays sounds. The core never does I/O.
- The current state is persisted to `localStorage` on every transition. After a reload, the app restores it. If a phase finished while the tab was closed, the session is recorded with its real end time.
- The UI re-renders on `requestAnimationFrame` or a 250 ms interval only to display time. Correctness does not depend on it.

## 5. Data layer

The UI depends only on repository interfaces:

```ts
type NewSession = Pick<
  Session,
  "skillId" | "startedAt" | "endedAt" | "focusedSeconds" | "plannedSeconds" | "outcome"
>;

interface SkillRepository {
  list(options?: { includeArchived?: boolean }): Promise<Skill[]>;
  create(input: { name: string }): Promise<Skill>;
  update(id: string, patch: Partial<Pick<Skill, "name" | "archivedAt">>): Promise<Skill>;
  remove(id: string): Promise<void>;
  subscribe(listener: () => void): () => void;
}

interface SessionRepository {
  listBySkill(skillId: string, range?: { from: string; to: string }): Promise<Session[]>;
  listRecent(limit: number): Promise<Session[]>;
  add(session: NewSession): Promise<Session>;
  remove(id: string): Promise<void>;
  subscribe(listener: () => void): () => void;
}
```

- v1 implementation: IndexedDB through Dexie, with a versioned schema.
- Settings live in `localStorage`, behind a small typed store.
- All data crossing a boundary (IndexedDB reads, JSON import, later the network) is validated with Zod schemas, which are also the source of the TypeScript types.
- React hooks (`useSkills`, `useSessions`, `useSkillProgress`) wrap the repositories with `useSyncExternalStore`, so screens update when data changes.
- The repositories are provided through a single React context, so the sync part can swap in a syncing implementation without touching screens.

## 6. Screens

- **Timer** (`/`): the active skill, the phase, the countdown and the primary control. Secondary controls: skip, reset, skill switcher. Today's focused time for the active skill.
- **Skills** (`/skills`): list with hours, progress toward the target, and actions (create, rename, archive, delete).
- **Skill detail** (`/skills/[id]`): total hours, percentage of target, projected completion date based on the last 30 days, weekly totals, session history.
- **Settings** (`/settings`): timer lengths, auto-start, sound, export and import.

Keyboard: `Space` starts or pauses, `S` skips, `R` resets. Shortcuts are listed in the UI and ignored while typing in inputs.

The document title shows the remaining time while running, for example `18:42 · Focus · pomoapp`.

## 7. Design direction

Art direction is decided in part 2 with the `design-taste-frontend` skill, using its app-screen mode and browser inspector. Fixed constraints:

- Typography and spacing carry the hierarchy. No gradients, glass effects, drop shadows at rest, emoji or decorative icons.
- One restrained accent color. Light and dark themes from the same tokens.
- The countdown is the visual focus of the timer screen.
- All design values live as tokens in Tailwind's theme. Components never use raw hex values.
- WCAG 2.2 AA contrast, visible focus states, full keyboard use, and `prefers-reduced-motion` respected.

## 8. Engineering

- Next.js (latest stable, App Router), React, TypeScript in `strict` mode with `noUncheckedIndexedAccess`.
- Tailwind CSS (latest stable).
- pnpm.
- ESLint (Next.js config plus TypeScript rules) and Prettier.
- Vitest for unit tests (timer core, repositories with `fake-indexeddb`, utilities). React Testing Library for components.
- Playwright for an end-to-end flow: create a skill, run a shortened focus session, check that progress updates.
- GitHub Actions CI runs lint, type-check, unit tests and build on every push.
- Folder layout:

```
src/
  app/                 routes and layouts
  features/
    timer/             core (pure), hooks, components
    skills/
    sessions/
    progress/
    settings/
  data/                repository interfaces, Dexie implementation, schemas, provider
  ui/                  shared design primitives
  lib/                 small shared utilities (time formatting, ids)
```

- User data is client-only. Screens that read it are client components inside server-rendered layouts.

## 9. Accounts and sync (last part)

Defined in detail in its own spec before implementation. Planned direction:

- Supabase Auth (email magic link plus GitHub OAuth) and Postgres with row-level security, so each user can only read and write their own rows.
- Tables mirror `skills` and `sessions`, with a `user_id` column.
- Local IndexedDB stays the source the UI reads from. A sync worker pushes local changes and pulls remote ones.
- Conflict rule: last write wins per record, by `updatedAt`. Soft deletes propagate as tombstones.
- On first sign-in, the user's existing local data is uploaded to the account.

## 10. Delivery parts

Each part is one reviewed commit (or a small group of commits) pushed to `main`.

1. **Foundation:** scaffold, strict TypeScript, Tailwind, ESLint, Prettier, Vitest, Playwright, CI, README.
2. **Design system:** tokens, type scale, color, layout shell and navigation.
3. **Timer core:** pure state machine plus unit tests.
4. **Data layer:** schemas, repositories, Dexie implementation, provider, hooks, tests.
5. **Timer screen:** UI wired to the core and the repositories, session recording, persistence across reloads.
6. **Skills and progress:** skills screen, skill detail, stats and projection.
7. **Settings and data safety:** settings screen, JSON export and import.
8. **Polish:** accessibility pass, sounds, notifications, PWA, deploy to Vercel.
9. **Accounts and sync:** per section 9.

## 11. Decisions taken by assumption

The user can overturn any of these during review:

- Default lengths 25/5/15 minutes, long break every 4 focus sessions.
- Interrupted focus sessions count if at least 60 seconds long.
- Deploy target: Vercel.
- Manual time entry is out of v1.
- Sync is the last part, after the app is complete and useful offline.
