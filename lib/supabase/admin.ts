import { createClient } from "@supabase/supabase-js";

/**
 * Service-role client that bypasses RLS.
 * Use ONLY in server-only code (Server Actions, Route Handlers).
 * Never expose the service role key to the browser.
 */
export function createSupabaseAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
