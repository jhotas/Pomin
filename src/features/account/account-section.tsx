"use client";

import { useId, useState, type FormEvent } from "react";
import { formatDayLabel, formatTimeOfDay } from "@/lib/time";
import { useNow } from "@/lib/use-now";
import { buttonClass } from "@/ui/button";
import { SettingsSection } from "@/ui/settings-section";
import type { AccountStore } from "./account-store";
import type { SyncState } from "./sync-engine";
import { useAccount } from "./use-account";

const errorMessage = (error: unknown) =>
  error instanceof Error && error.message
    ? error.message
    : "Something went wrong. Try again.";

/** Where a sign-in link or GitHub sends the user back to. */
const returnUrl = () => `${window.location.origin}/settings`;

const SIGNED_OUT_DESCRIPTION =
  "Sign in to keep a copy of your practice in an account and use it on other devices. Without one, pomoapp works in this browser only.";

export function AccountSection() {
  const account = useAccount();

  if (account.kind === "pending") {
    return (
      <SettingsSection title="Account" description={SIGNED_OUT_DESCRIPTION}>
        <p className="text-muted">Checking your account…</p>
      </SettingsSection>
    );
  }
  if (account.kind === "unavailable") {
    return (
      <SettingsSection
        title="Account"
        description="Accounts are not set up for this copy of pomoapp."
      >
        <p>Your skills and sessions are kept in this browser.</p>
      </SettingsSection>
    );
  }

  const { store, state } = account;
  if (state.status === "signedIn") {
    return (
      <SettingsSection
        title="Account"
        description="Your skills and sessions sync to your account, so every device you sign in on shows the same hours."
      >
        <SignedIn store={store} email={state.email} sync={state.sync} />
      </SettingsSection>
    );
  }
  return (
    <SettingsSection title="Account" description={SIGNED_OUT_DESCRIPTION}>
      {state.status === "loading" ? (
        <p className="text-muted">Checking your account…</p>
      ) : (
        <SignInForm store={store} />
      )}
    </SettingsSection>
  );
}

function SignInForm({ store }: { store: AccountStore }) {
  const [email, setEmail] = useState("");
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const fieldId = useId();
  const errorId = useId();

  async function sendLink(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const address = email.trim();
    if (!/^\S+@\S+\.\S+$/.test(address)) {
      setError("Enter an email address, such as name@example.com.");
      return;
    }
    setBusy(true);
    try {
      await store.signInWithEmail(address, returnUrl());
      setSentTo(address);
      setError(null);
    } catch (caught) {
      setError(errorMessage(caught));
    } finally {
      setBusy(false);
    }
  }

  async function github() {
    setBusy(true);
    try {
      await store.signInWithGitHub(returnUrl());
    } catch (caught) {
      setError(errorMessage(caught));
      setBusy(false);
    }
  }

  if (sentTo) {
    return (
      <div role="status">
        <p className="font-medium">Check your inbox</p>
        <p className="mt-1 text-muted">
          We sent a sign-in link to {sentTo}. Open it in this browser to sign
          in. Practice you have logged here is added to your account.
        </p>
        <button
          type="button"
          onClick={() => setSentTo(null)}
          className={`${buttonClass("text")} mt-3`}
        >
          Use another email
        </button>
      </div>
    );
  }

  return (
    <>
      <form onSubmit={sendLink} noValidate>
        <label htmlFor={fieldId} className="block font-medium">
          Email
        </label>
        <div className="mt-2 flex flex-wrap gap-3">
          <input
            id={fieldId}
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
            inputMode="email"
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? errorId : undefined}
            className="h-11 min-w-56 flex-1 rounded-control border border-control bg-surface px-3 placeholder:text-muted md:h-9"
            placeholder="name@example.com"
          />
          <button
            type="submit"
            disabled={busy}
            className={buttonClass("primary")}
          >
            Email me a sign-in link
          </button>
        </div>
        {error && (
          <p id={errorId} role="alert" className="mt-2 text-negative">
            {error}
          </p>
        )}
      </form>
      {store.githubEnabled && (
        <div className="mt-5 border-t border-rule pt-5">
          <button
            type="button"
            onClick={github}
            disabled={busy}
            className={buttonClass("secondary")}
          >
            Continue with GitHub
          </button>
        </div>
      )}
    </>
  );
}

function SignedIn({
  store,
  email,
  sync,
}: {
  store: AccountStore;
  email: string | null;
  sync: SyncState;
}) {
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function signOut() {
    setBusy(true);
    try {
      await store.signOut();
    } catch (caught) {
      setError(errorMessage(caught));
      setConfirming(false);
      setBusy(false);
    }
  }

  return (
    <>
      <p>
        Signed in as{" "}
        <span className="font-medium">{email ?? "your account"}</span>
      </p>
      <SyncStatus sync={sync} />
      <div className="mt-3">
        <button
          type="button"
          onClick={() => void store.syncNow()}
          disabled={sync.phase === "syncing"}
          className={buttonClass("secondary")}
        >
          Sync now
        </button>
      </div>

      <div className="mt-5 border-t border-rule pt-5">
        {confirming ? (
          <>
            <p>
              Sign out? Your skills and sessions are removed from this browser.
              They stay in your account.
            </p>
            <div className="mt-3 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={signOut}
                disabled={busy}
                className={buttonClass("danger")}
              >
                Sign out
              </button>
              <button
                type="button"
                onClick={() => setConfirming(false)}
                disabled={busy}
                className={buttonClass("text")}
              >
                Cancel
              </button>
            </div>
          </>
        ) : (
          <button
            type="button"
            onClick={() => setConfirming(true)}
            className={buttonClass("text")}
          >
            Sign out
          </button>
        )}
        {error && (
          <p role="alert" className="mt-2 text-negative">
            {error}
          </p>
        )}
      </div>
    </>
  );
}

function SyncStatus({ sync }: { sync: SyncState }) {
  const now = useNow();
  let text: string;
  if (sync.phase === "syncing") {
    text = "Syncing…";
  } else if (sync.lastSyncedAt && now) {
    const label = formatDayLabel(sync.lastSyncedAt, now);
    const day = /^\d/.test(label) ? label : label.toLowerCase();
    text = `Last synced ${day} at ${formatTimeOfDay(sync.lastSyncedAt)}.`;
  } else {
    text = "Not synced yet.";
  }

  return (
    <div className="mt-1" aria-live="polite">
      <p className="text-muted">{text}</p>
      {sync.phase === "error" && sync.error && (
        <p className="mt-1 text-negative">{sync.error}</p>
      )}
    </div>
  );
}
