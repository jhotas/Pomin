import type {
  Session as AuthSession,
  SupabaseClient,
} from "@supabase/supabase-js";
import type { PomoDatabase } from "@/data/dexie/database";
import type { ChangeNotifier } from "@/data/notifier";
import type { TimerStore } from "@/features/timer/timer-store";
import { githubSignInEnabled } from "./supabase";
import {
  createSyncEngine,
  cursorKey,
  type SyncEngine,
  type SyncState,
} from "./sync-engine";

export type AccountState =
  | { status: "loading" }
  | { status: "signedOut" }
  | {
      status: "signedIn";
      userId: string;
      email: string | null;
      sync: SyncState;
    };

export type AccountStore = {
  get(): AccountState;
  subscribe(listener: () => void): () => void;
  readonly githubEnabled: boolean;
  /** Emails a sign-in link that brings the user back to `returnTo`. */
  signInWithEmail(email: string, returnTo: string): Promise<void>;
  signInWithGitHub(returnTo: string): Promise<void>;
  /** Syncs what it can, signs out and removes the account's data from this browser. */
  signOut(): Promise<void>;
  syncNow(): Promise<void>;
};

type AccountStoreOptions = {
  supabase: SupabaseClient;
  db: PomoDatabase;
  notifier: ChangeNotifier;
  timer: TimerStore;
  storage: Storage;
};

/** Whose data this browser's IndexedDB holds, once it has been synced. */
const OWNER_KEY = "pomoapp:sync:owner";

/**
 * The signed-in account and its sync. Signed out, the app keeps working on
 * this browser's data alone.
 */
export function createAccountStore({
  supabase,
  db,
  notifier,
  timer,
  storage,
}: AccountStoreOptions): AccountStore {
  const listeners = new Set<() => void>();
  let state: AccountState = { status: "loading" };
  let engine: SyncEngine | null = null;
  let userId: string | null = null;

  function setState(next: AccountState) {
    state = next;
    for (const listener of listeners) listener();
  }

  async function clearLocalData() {
    await db.transaction("rw", db.skills, db.sessions, async () => {
      await db.skills.clear();
      await db.sessions.clear();
    });
    timer.clear();
    notifier.notify();
  }

  async function startSync(session: AuthSession) {
    const user = session.user;
    const owner = storage.getItem(OWNER_KEY);
    // This browser holds another account's data (its session ended without
    // a sign-out here). That data is in its own account; it must not be
    // uploaded into this one.
    if (owner && owner !== user.id) {
      storage.removeItem(cursorKey(owner));
      await clearLocalData();
    }
    storage.setItem(OWNER_KEY, user.id);

    const email = user.email ?? null;
    engine = createSyncEngine({
      supabase,
      db,
      notifier,
      storage,
      userId: user.id,
      onState: (sync) => {
        if (userId === user.id) {
          setState({ status: "signedIn", userId: user.id, email, sync });
        }
      },
      onSkillMerged: ({ from, to }) => timer.replaceSkill(from, to),
    });
  }

  function onSession(session: AuthSession | null) {
    const nextUserId = session?.user.id ?? null;
    if (nextUserId === userId && state.status !== "loading") return;
    engine?.stop();
    engine = null;
    userId = nextUserId;
    if (!session) {
      setState({ status: "signedOut" });
      return;
    }
    void startSync(session);
  }

  // Supabase calls this inside its own lock; work that calls Supabase back
  // waits for the next task.
  supabase.auth.onAuthStateChange((_event, session) => {
    setTimeout(() => onSession(session), 0);
  });

  return {
    get: () => state,

    subscribe(listener) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },

    githubEnabled: githubSignInEnabled,

    async signInWithEmail(email, returnTo) {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: returnTo, shouldCreateUser: true },
      });
      if (error) throw new Error(error.message);
    },

    async signInWithGitHub(returnTo) {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "github",
        options: { redirectTo: returnTo },
      });
      if (error) throw new Error(error.message);
    },

    async signOut() {
      await engine?.syncNow();
      // Signing out removes this browser's copy, so it must be in the account.
      const current = state;
      if (current.status === "signedIn" && current.sync.phase === "error") {
        throw new Error(
          "Your latest changes have not reached your account yet, so signing out would lose them. Check your connection and try again.",
        );
      }
      const signedOutId = userId;
      // Only this browser: other devices stay signed in.
      const { error } = await supabase.auth.signOut({ scope: "local" });
      if (error) throw new Error(error.message);
      // Nothing may sync while the copy is being removed.
      engine?.stop();
      engine = null;
      if (signedOutId) storage.removeItem(cursorKey(signedOutId));
      storage.removeItem(OWNER_KEY);
      await clearLocalData();
    },

    syncNow: () => engine?.syncNow() ?? Promise.resolve(),
  };
}
