"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getRole } from "@/lib/session";

async function requireAdmin() {
  const role = await getRole();
  if (role !== "admin") throw new Error("Unauthorized");
}

export async function updateSettings(
  prevState: { error?: string; success?: boolean } | undefined,
  formData: FormData
) {
  await requireAdmin();

  const supabase = await createSupabaseServerClient();

  const gcash_name = String(formData.get("gcash_name") ?? "").trim();
  const gcash_number = String(formData.get("gcash_number") ?? "").trim();
  const qrFile = formData.get("qr_image") as File | null;

  const updates: Record<string, string> = {
    gcash_name,
    gcash_number,
    updated_at: new Date().toISOString(),
  };

  if (qrFile && qrFile.size > 0) {
    const ext = qrFile.name.split(".").pop() ?? "png";
    const path = `gcash-qr.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("qr-codes")
      .upload(path, qrFile, { upsert: true });

    if (uploadError) {
      return { error: "Failed to upload QR: " + uploadError.message };
    }

    const { data: urlData } = supabase.storage
      .from("qr-codes")
      .getPublicUrl(path);
    updates.qr_image_url = urlData.publicUrl;
  }

  const { error } = await supabase
    .from("settings")
    .update(updates)
    .eq("id", 1);

  if (error) return { error: error.message };

  revalidatePath("/admin/settings");
  revalidatePath("/dashboard");
  return { success: true };
}
