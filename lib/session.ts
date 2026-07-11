import { createSupabaseServerClient } from "./supabase/server";

export type Role = "admin" | "tenant";

/** Returns the current Supabase session or null. */
export async function getSession() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session;
}

/** Returns the role from user_metadata, or null if not logged in. */
export async function getRole(): Promise<Role | null> {
  const session = await getSession();
  if (!session) return null;
  const role = session.user.user_metadata?.role as Role | undefined;
  return role ?? null;
}

/** Returns the tenant row ID for the currently logged-in tenant, or null. */
export async function getTenantRow() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) return null;

  const { data } = await supabase
    .from("tenants")
    .select("*")
    .eq("auth_user_id", session.user.id)
    .single();
  return data ?? null;
}
