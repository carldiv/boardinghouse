"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getSession } from "@/lib/session";

export async function updateProfile(
  prevState: { error?: string; success?: boolean } | undefined,
  formData: FormData
) {
  const session = await getSession();
  if (!session) return { error: "Not authenticated." };

  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!name || !email) {
    return { error: "Full name and email are required." };
  }

  const supabase = await createSupabaseServerClient();
  const adminClient = createSupabaseAdminClient();

  try {
    const isTenant = session.user.user_metadata?.role === "tenant";

    // 1. Update auth metadata and email
    const updateData: any = {
      email,
      email_confirm: true,
      user_metadata: {
        ...session.user.user_metadata,
        name,
      },
    };

    if (password) {
      if (password.length < 6) {
        return { error: "Password must be at least 6 characters long." };
      }
      updateData.password = password;
    }

    const { error: authError } = await adminClient.auth.admin.updateUserById(
      session.user.id,
      updateData
    );

    if (authError) {
      return { error: authError.message };
    }

    // 2. If user is a tenant, sync name in tenants table
    if (isTenant) {
      const { error: dbError } = await adminClient
        .from("tenants")
        .update({ name })
        .eq("auth_user_id", session.user.id);

      if (dbError) {
        return { error: dbError.message };
      }
    }

    revalidatePath("/admin/settings");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (err: any) {
    return { error: err.message || "An unexpected error occurred." };
  }
}
