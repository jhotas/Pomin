# Part 6: Skills and Progress Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A skills screen to add and open skills, and a page per skill with its figures, weekly hours, mastery grid, session history and management (rename, archive, delete).

**Spec:** `docs/superpowers/specs/2026-10-29-pomoapp-design.md` (sections 3 and 6)

## Rulings

- **Projection:** the remaining hours divided by the daily average of the last 30 days, today included. No practice in that window means no projection (a grey dash), never a guess.
- **Weeks start on Monday,** local time. The chart shows 8 weeks; the current week carries the data hue, past weeks are grey, ticks are round and the top tick is above the maximum.
- **Totals add up as shown:** the skills screen total is the sum of the rows' rounded hours.
- **Deleting a skill** asks first, naming the skill and its session count, and offers Cancel.
- **The skill page reads its id on the client** (skills live in the browser) inside `<Suspense>`, as Next 16 requires for URL data. The nav reads the pathname inside `<Suspense>` for the same reason.
- **Tab titles from browser data** (the skill's name) are kept by `useDocumentTitle`, which re-applies them when the route's metadata writes its own title later.
- **History shows the latest 8 sessions** with the total count, so the history and management cards balance.

## Review Focus

1. **Week boundaries:** a session at 00:30 on Monday and 23:25 on Sunday land in the right weeks.
2. **A skill with only old practice** shows its hours but no projection.
3. **An unknown or deleted skill address** says "Skill not found" with a way back.
4. **Rounding:** two skills of 1.25 h each show 1.3 h each and a total of 2.6 h.
5. **Navigating away** from a skill page leaves the next page's tab title alone.

## Tasks

1. `progress.ts`: `sumSince`, `weeklyTotals`, `projectCompletion`, `niceTicks` (tested).
2. `SessionRepository.listAll` and `useAllSessions` (tested).
3. `time.ts`: `formatDayLabel`, `formatMonthYear`, `formatShortDate`; `useNow` (tested).
4. `SkillsScreen`, `WeeklyChart`, `SkillDetailScreen`, `SkillDetailRoute` (tested with real Dexie on fake-indexeddb).
5. `e2e/skills.spec.ts`: the full skill lifecycle, starting a block from a skill page, an unknown address.
