# Part 4: Data Layer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Validated skills and sessions stored in IndexedDB behind repository interfaces, a typed settings store, and React hooks that keep screens in sync with the data.

**Architecture:** Zod schemas are the source of the domain types. The UI depends on `SkillRepository` and `SessionRepository` only; the Dexie implementation is one of possibly several (sync arrives in Part 9). Repositories take an injected clock and id generator so tests are deterministic. Settings live in `localStorage` behind a small store with `subscribe`, read through `useSyncExternalStore`.

**Tech Stack:** Zod 4, Dexie 4, fake-indexeddb (tests), React 19.

**Spec:** `docs/superpowers/specs/2026-10-29-pomoapp-design.md` (sections 3 and 5)

## Global Constraints

- Client-generated UUIDs; ISO 8601 UTC timestamps; `updatedAt` and nullable `deletedAt` on every record.
- Skill names: trimmed, 1-60 characters, unique among non-deleted skills ignoring case. `targetHours` defaults to 10,000.
- Deleting a skill soft-deletes it and its sessions. Archived skills stay in stats but leave the picker.
- Everything read from storage or imported is parsed with the Zod schemas.

## Rulings

- **Hooks over async repositories use `useEffect` + `useState` with `subscribe`,** not `useSyncExternalStore`: the latter needs a synchronous snapshot, which an IndexedDB query cannot give without a separate cache. The settings store is synchronous and does use `useSyncExternalStore`.
- **Change notification is in-process.** Cross-tab updates wait until they are needed.
- `NewSession` must reference an existing, non-deleted skill, and `endedAt` must not precede `startedAt`.

## Review Focus

1. **Renaming a skill to its own name in another case** ("guitar" to "Guitar") is allowed; renaming to another skill's name is not.
2. **A deleted skill's name can be reused** by a new skill.
3. **Corrupt `localStorage` settings** (old shape, bad JSON) fall back to defaults instead of crashing.
4. **Ranges are half-open** (`from` inclusive, `to` exclusive), so a session on a boundary is counted once.
5. **Server rendering:** nothing touches IndexedDB or `localStorage` during SSR.

---

### Task 1: Schemas and repository interfaces

`src/data/schemas.ts` (`SkillSchema`, `SessionSchema`, `NewSessionSchema`, `SettingsSchema`, inferred types, `DEFAULT_SETTINGS`), `src/data/repositories.ts` (interfaces from spec section 5, `DuplicateSkillNameError`, `RecordNotFoundError` (not `NotFoundError`: Dexie rewraps errors with DOMException names)), tests for name rules and defaults.

### Task 2: Dexie repositories

`src/data/dexie/database.ts`, `src/data/dexie/repositories.ts` (both repositories, sharing one change notifier), tests on fake-indexeddb with a fixed clock: create/list/rename/archive/delete, duplicate names, cascade soft delete, session add/list by skill and range/recent/remove, subscribe fires after every write.

### Task 3: Settings store, provider and hooks

`src/data/settings-store.ts` (+ tests for defaults, round trip, corrupt data, subscribe), `src/data/provider.tsx` (`AppDataProvider`, `useAppData`), `src/data/hooks.ts` (`useSkills`, `useSkill`, `useSkillSessions`, `useRecentSessions`, `useSettings`), hook tests against Dexie on fake-indexeddb (real code, no fakes), provider mounted in the root layout.
