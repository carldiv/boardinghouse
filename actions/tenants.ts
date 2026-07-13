"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getRole } from "@/lib/session";

async function requireAdmin() {
  const role = await getRole();
  if (role !== "admin") throw new Error("Unauthorized");
}

export async function createTenant(
  prevState: { error?: string; success?: boolean } | undefined,
  formData: FormData
) {
  await requireAdmin();

  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const room = String(formData.get("room") ?? "").trim();
  const rent_amount = parseFloat(String(formData.get("rent_amount") ?? "0"));
  const due_day = parseInt(String(formData.get("due_day") ?? "1"), 10);
  const move_in_raw = String(formData.get("move_in_date") ?? "").trim();
  // Input type="month" yields "YYYY-MM"; append "-01" for the date column
  const move_in_date = move_in_raw ? `${move_in_raw}-01` : null;

  if (!name || !email || !password || !room || isNaN(rent_amount) || isNaN(due_day)) {
    return { error: "All fields are required." };
  }
  if (password.length < 6) {
    return { error: "Password must be at least 6 characters long." };
  }
  if (due_day < 1 || due_day > 31) {
    return { error: "Due day must be between 1 and 31." };
  }

  const adminClient = createSupabaseAdminClient();

  // Create the auth user with the specified password (auto-confirmed)
  const { data: userData, error: userError } =
    await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { role: "tenant", name },
    });

  if (userError || !userData.user) {
    return { error: userError?.message ?? "Failed to create user account." };
  }

  // Insert tenant row linked to the new auth user
  const { error: tenantError } = await adminClient.from("tenants").insert({
    auth_user_id: userData.user.id,
    name,
    room,
    rent_amount,
    due_day,
    ...(move_in_date ? { move_in_date } : {}),
  });

  if (tenantError) {
    // Roll back: delete the auth user we just created
    await adminClient.auth.admin.deleteUser(userData.user.id);
    return { error: tenantError.message };
  }

  revalidatePath("/admin/tenants");
  revalidatePath("/admin/dashboard");
  return { success: true };
}

export async function updateTenant(
  prevState: { error?: string; success?: boolean } | undefined,
  formData: FormData
) {
  await requireAdmin();

  const id = String(formData.get("id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const room = String(formData.get("room") ?? "").trim();
  const rent_amount = parseFloat(String(formData.get("rent_amount") ?? "0"));
  const due_day = parseInt(String(formData.get("due_day") ?? "1"), 10);
  const move_in_raw = String(formData.get("move_in_date") ?? "").trim();
  const move_in_date = move_in_raw ? `${move_in_raw}-01` : null;

  if (!id || !name || !room || isNaN(rent_amount) || isNaN(due_day)) {
    return { error: "All fields are required." };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("tenants")
    .update({ name, room, rent_amount, due_day, move_in_date })
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/admin/tenants");
  revalidatePath(`/admin/tenants/${id}`);
  revalidatePath("/admin/dashboard");
  return { success: true };
}

export async function deleteTenant(id: string) {
  await requireAdmin();

  const adminClient = createSupabaseAdminClient();

  // Get auth_user_id first
  const { data: tenant } = await adminClient
    .from("tenants")
    .select("auth_user_id")
    .eq("id", id)
    .single();

  // Delete tenant row (payments cascade)
  const { error } = await adminClient.from("tenants").delete().eq("id", id);
  if (error) throw new Error(error.message);

  // Also delete the Supabase auth user if linked
  if (tenant?.auth_user_id) {
    await adminClient.auth.admin.deleteUser(tenant.auth_user_id);
  }

  revalidatePath("/admin/tenants");
  revalidatePath("/admin/dashboard");
}
