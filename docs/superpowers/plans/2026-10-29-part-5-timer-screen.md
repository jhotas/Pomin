# Part 5: Timer Screen Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** The working timer: pick or add a skill, run focus blocks and breaks, record sessions, survive reloads, and show the skill's progress toward 10,000 hours.

**Architecture:** A `TimerStore` keeps the pure timer state (Part 3) and the block's skill in `localStorage`, follows other tabs through the `storage` event, and is read with `useSyncExternalStore`. `useTimer` turns reducer events into sessions through the repository (Part 4). The screen is a client component inside the server-rendered shell.

**Spec:** `docs/superpowers/specs/2026-10-29-pomoapp-design.md` (sections 4, 6 and 7)

## Rulings

- **The active skill lives with the timer,** not in settings: the running block belongs to a skill. `Settings.activeSkillId` is removed; the skill cannot change while a block is under way.
- **Session writes are idempotent** (same skill and `startedAt` returns the existing session), so two tabs or a repeated event cannot log a block twice.
- **The clock is read only in the browser.** Next 16 prerenders client components; the server always renders the idle snapshot, which does not depend on time.
- **App data is handed out after hydration.** The server has no browser storage; rendering data on the first client pass made React keep server attributes (a disabled Skip button). Regression covered by `e2e/timer.spec.ts`.
- **The countdown is set at `clamp(4.5rem, 13vw, 9rem)`**, above the app-screen 48px figure limit: it is the instrument, read from across the desk, not a KPI.
- **Today's sessions sit in the timer card** and the progress card holds the mastery grid, so the two cards balance.

## Review Focus

1. **A tab closed mid-block** resumes with the right time left, and a block that ended meanwhile is logged once.
2. **Two tabs open:** both follow the same timer; a block is logged once.
3. **Shortcuts while typing** a skill name do nothing; Space on a focused button presses it only once.
4. **First run:** no skill means Start is disabled and the add-skill field is the first thing to do.
5. **A skill deleted mid-block:** the session is dropped with a console error, the timer keeps working.

## Tasks

1. `src/lib/time.ts`: `formatDuration`, `dayRange`, `formatTimeOfDay` (tested).
2. `src/features/progress/progress.ts`: `totalFocusedSeconds`, `masteryCells` (tested); `MasteryGrid`, `SkillProgressPanel`.
3. `src/features/timer/timer-store.ts` (tested: persistence, corrupt data, skill lock, settings, other tabs).
4. `useTimer`, `useTimerShortcuts`, `useDocumentTitle`, `AddSkillForm`, `TodaySessions`, `TimerScreen` (tested with real Dexie on fake-indexeddb and a controlled `Date.now`).
5. `e2e/timer.spec.ts` with Playwright's clock: a full block is logged, reload mid-block resumes, the tab title counts down, controls work right after load.
