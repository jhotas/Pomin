import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Read directly so Next inlines them into the browser bundle.
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

/** GitHub sign-in needs a GitHub app in the Supabase project, so it is opt-in. */
export const githubSignInEnabled =
  process.env.NEXT_PUBLIC_SUPABASE_GITHUB_ENABLED === "true";

/**
 * The browser's Supabase client, or null when the project is not configured:
 * the app then works as before, in this browser only.
 */
export function createBrowserSupabase(): SupabaseClient | null {
  if (!url || !key) return null;
  return createClient(url, key, {
    auth: {
      flowType: "pkce",
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storageKey: "pomoapp:auth",
    },
  });
}
