"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getRole, getTenantRow } from "@/lib/session";
import { toMonthISO } from "@/lib/utils";

async function requireAdmin() {
  const role = await getRole();
  if (role !== "admin") throw new Error("Unauthorized");
}

export async function submitPayment(
  prevState: { error?: string; success?: boolean } | undefined,
  formData: FormData
) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) return { error: "Not authenticated." };

  const tenant = await getTenantRow();
  if (!tenant) return { error: "Tenant record not found." };

  const month = String(formData.get("month") ?? "");
  const amount = parseFloat(String(formData.get("amount") ?? "0"));
  const ref_number = String(formData.get("ref_number") ?? "").trim();
  const receiptFile = formData.get("receipt") as File | null;

  if (!month || isNaN(amount) || !ref_number) {
    return { error: "Month, amount, and reference number are required." };
  }

  // Validate ISO month format (YYYY-MM-01)
  const monthISO = month.length === 7 ? `${month}-01` : month;

  let receipt_url: string | null = null;

  // Upload receipt if provided
  if (receiptFile && receiptFile.size > 0) {
    const ext = receiptFile.name.split(".").pop() ?? "jpg";
    const path = `${tenant.id}/${Date.now()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("receipts")
      .upload(path, receiptFile, { upsert: false });

    if (uploadError) {
      return { error: "Failed to upload receipt: " + uploadError.message };
    }

    const { data: urlData } = supabase.storage
      .from("receipts")
      .getPublicUrl(path);
    receipt_url = urlData.publicUrl;
  }

  const { error } = await supabase.from("payments").insert({
    tenant_id: tenant.id,
    month: monthISO,
    amount,
    ref_number,
    receipt_url,
    status: "pending",
  });

  if (error) return { error: error.message };

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/payments");
  revalidatePath("/dashboard/history");
  revalidatePath("/admin/dashboard");
  revalidatePath("/admin/payments");
  return { success: true };
}

export async function confirmPayment(id: string) {
  await requireAdmin();
  const supabase = await createSupabaseServerClient();

  const { error } = await supabase
    .from("payments")
    .update({ status: "confirmed", confirmed_at: new Date().toISOString() })
    .eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath("/admin/dashboard");
  revalidatePath("/admin/payments");
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/payments");
  revalidatePath("/dashboard/history");
}

export async function rejectPayment(
  prevState: { error?: string; success?: boolean } | undefined,
  formData: FormData
) {
  await requireAdmin();
  const supabase = await createSupabaseServerClient();

  const id = String(formData.get("id") ?? "");
  const admin_note = String(formData.get("admin_note") ?? "").trim();

  if (!id) return { error: "Payment ID is required." };

  const { error } = await supabase
    .from("payments")
    .update({ status: "rejected", admin_note: admin_note || null })
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/admin/dashboard");
  revalidatePath("/admin/payments");
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/payments");
  revalidatePath("/dashboard/history");
  return { success: true };
}
