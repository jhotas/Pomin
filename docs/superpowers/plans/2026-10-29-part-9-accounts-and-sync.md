# Part 9: Accounts and Sync

**Goal:** Optional sign-in (email magic link, optionally GitHub) and two-way sync of skills and sessions between each browser and a Supabase account.

**Spec:** `docs/superpowers/specs/2026-10-29-pomoapp-design.md` (section 9)

## Rulings

- **No server-side auth.** User data lives in the browser and every screen is a client component, so the browser's Supabase client holds the session (PKCE, stored in `localStorage`). No middleware, no server cookies.
- **IndexedDB stays the source.** Screens read the Dexie repositories only; the sync engine writes to the same database and shares the repositories' change notifier, so screens refresh after a pull.
- **Two cursors, two clocks.** The push cursor is the local clock when a push began, less 10 seconds, so a write committing during the push is sent again rather than missed. The pull cursor is the server's clock (`synced_at`, stamped by a trigger), re-reading the minute before it, so client clock skew never decides what a pull misses. Re-sending or re-reading a row is harmless: the later `updatedAt` wins on both sides.
- **Writes go through `push_changes`,** a `security invoker` SQL function that upserts only when the incoming `updated_at` is later. Row-level security applies; sessions reference skills through `(user_id, skill_id)`, so a session can never point at another account's skill.
- **First sync pulls before it pushes,** then merges each local skill into the account's skill of the same name (case-insensitive): its sessions move over and the local skill becomes a tombstone. Practice logged on two devices before signing in adds up under one skill. A block under way on the merged skill moves with it.
- **Signing out removes the account's data from the browser,** after a final sync. If that sync fails, sign-out is refused so unsynced changes are not lost. A browser whose stored owner differs from the account signing in (the previous session ended without a sign-out) is cleared before syncing, so one account's data is never uploaded into another.
- **GitHub sign-in is opt-in** (`NEXT_PUBLIC_SUPABASE_GITHUB_ENABLED`), because it needs a GitHub OAuth app in the Supabase project; a button that always errors would be worse than none.
- **No configuration, no accounts.** Without the Supabase variables the settings screen says accounts are not set up and the app behaves as before.

## Known limits

- Two devices that both create a skill with the same name while signed in and between syncs keep two skills; the user can rename or delete one.
- Changes made in another tab reach the account on that tab's own sync; tabs do not notify each other of IndexedDB writes.
- A device whose clock runs far behind can lose a last-write-wins race it should have won.
