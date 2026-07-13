"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getRole, getTenantRow } from "@/lib/session";
import { toMonthISO } from "@/lib/utils";
import { sendEmail } from "@/lib/mail";

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

  // Block duplicate GCash reference numbers globally (bypass RLS)
  const adminClient = createSupabaseAdminClient();
  const { data: existing } = await adminClient
    .from("payments")
    .select("id")
    .eq("ref_number", ref_number)
    .neq("status", "rejected")
    .limit(1);

  if (existing && existing.length > 0) {
    return {
      error:
        "This GCash reference number has already been submitted. Please check your reference number or contact the admin if you believe this is correct.",
    };
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

  // Send admin notification
  const adminEmail = process.env.GMAIL_USER;
  if (adminEmail) {
    try {
      // Use local timezone for correct month parsing (date is stored as YYYY-MM-01)
      const dateParts = monthISO.split("-");
      const monthDate = new Date(parseInt(dateParts[0]), parseInt(dateParts[1]) - 1, 1);
      const monthLabel = monthDate.toLocaleDateString("en-PH", { month: "long", year: "numeric" });
      const amountFormatted = new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" }).format(amount);
      const dateFormatted = new Date().toLocaleDateString("en-PH", { year: "numeric", month: "long", day: "numeric", timeZone: "Asia/Manila" });
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

      await sendEmail({
        to: adminEmail,
        subject: `💳 New Payment: ${tenant.name} (Room ${tenant.room})`,
        text: `${tenant.name} submitted a payment of ${amountFormatted} for ${monthLabel}.\nRef: ${ref_number}\n\nPlease review it at ${appUrl}/admin/payments`,
        html: `
          <div style="font-family: sans-serif; padding: 24px; border: 1px solid #e2e8f0; max-width: 500px; margin: 0 auto; border-radius: 12px;">
            <h2 style="color: #0f172a; margin-top: 0;">New Payment Received</h2>
            <p style="color: #475569; font-size: 15px;"><strong>${tenant.name}</strong> (Room ${tenant.room}) has submitted a new payment.</p>
            <div style="background: #f8fafc; padding: 16px; border-radius: 8px; margin: 20px 0; border: 1px solid #f1f5f9; font-size: 14px;">
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="color: #64748b; padding: 6px 0;">Amount</td>
                  <td style="font-weight: 700; text-align: right; color: #10b981;">${amountFormatted}</td>
                </tr>
                <tr>
                  <td style="color: #64748b; padding: 6px 0;">For Month</td>
                  <td style="font-weight: 600; text-align: right; color: #0f172a;">${monthLabel}</td>
                </tr>
                <tr>
                  <td style="color: #64748b; padding: 6px 0;">Ref Number</td>
                  <td style="font-weight: 600; text-align: right; color: #0f172a;">${ref_number}</td>
                </tr>
                <tr>
                  <td style="color: #64748b; padding: 6px 0;">Date</td>
                  <td style="font-weight: 600; text-align: right; color: #0f172a;">${dateFormatted}</td>
                </tr>
              </table>
            </div>
            <div style="text-align: center; margin-top: 24px;">
              <a href="${appUrl}/admin/payments" style="display: inline-block; background: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 15px;">Review Payment</a>
            </div>
          </div>
        `
      });
    } catch (e) {
      console.error("Failed to send admin notification:", e);
    }
  }

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

  // 1. Fetch payment to know who the tenant is
  const { data: payment, error: fetchPayError } = await supabase
    .from("payments")
    .select("*, tenant:tenants(*)")
    .eq("id", id)
    .single();

  if (fetchPayError || !payment) {
    throw new Error(fetchPayError?.message || "Payment not found");
  }

  const { error } = await supabase
    .from("payments")
    .update({ status: "confirmed", confirmed_at: new Date().toISOString() })
    .eq("id", id);

  if (error) throw new Error(error.message);

  // 2. Asynchronously notify the tenant if email setup is available
  try {
    const tenant = payment.tenant;
    if (tenant && tenant.auth_user_id) {
      const adminClient = createSupabaseAdminClient();
      const { data: userData, error: userError } = await adminClient.auth.admin.getUserById(tenant.auth_user_id);
      
      if (!userError && userData?.user?.email) {
        const email = userData.user.email;
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
        
        // Format month and currency
        const monthParts = payment.month.split("-");
        const monthLabel = new Date(parseInt(monthParts[0]), parseInt(monthParts[1]) - 1, 1).toLocaleDateString("en-PH", {
          month: "long",
          year: "numeric",
        });

        const amountFormatted = new Intl.NumberFormat("en-PH", {
          style: "currency",
          currency: "PHP",
        }).format(payment.amount);
        
        const dateFormatted = new Date().toLocaleDateString("en-PH", {
          year: "numeric",
          month: "long",
          day: "numeric",
          timeZone: "Asia/Manila",
        });

        const { data: monthPayments } = await supabase
          .from("payments")
          .select("amount")
          .eq("tenant_id", tenant.id)
          .eq("month", payment.month)
          .eq("status", "confirmed");
        
        const totalPaid = monthPayments?.reduce((sum, p) => sum + p.amount, 0) || 0;
        const remainingBalance = Math.max(0, tenant.rent_amount - totalPaid);
        const remainingFormatted = new Intl.NumberFormat("en-PH", {
          style: "currency",
          currency: "PHP",
        }).format(remainingBalance);

        let remainingBalanceHtml = "";
        if (remainingBalance > 0) {
          remainingBalanceHtml = `
                <tr>
                  <td style="color: #64748b; padding: 12px 0 6px 0; border-top: 1px solid #e2e8f0;">Remaining Balance</td>
                  <td style="font-weight: 700; text-align: right; padding: 12px 0 6px 0; color: #ef4444; border-top: 1px solid #e2e8f0;">${remainingFormatted}</td>
                </tr>
          `;
        }

        const { sendEmail } = await import("@/lib/mail");
        
        const subject = `✅ Rent Payment Confirmed — Room ${tenant.room}`;
        const text = `Hi ${tenant.name},\n\nYour rent payment of ${amountFormatted} for ${monthLabel} has been confirmed!\n\nThank you for your payment.`;
        const html = `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff; color: #1e293b; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
            <div style="text-align: center; margin-bottom: 24px;">
              <div style="background-color: #dcfce7; color: #22c55e; width: 48px; height: 48px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 24px; font-weight: bold; line-height: 48px;">✓</div>
            </div>
            
            <h2 style="color: #0f172a; margin-top: 0; text-align: center; font-size: 20px; font-weight: 700;">Payment Confirmed</h2>
            <p style="font-size: 15px; line-height: 1.5; color: #475569; margin-top: 16px;">Hi <strong>${tenant.name}</strong>,</p>
            <p style="font-size: 15px; line-height: 1.5; color: #475569;">Your rent payment has been successfully confirmed.</p>
            
            <div style="background-color: #f8fafc; padding: 18px; border-radius: 8px; margin: 20px 0; border: 1px solid #f1f5f9;">
              <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                <tr>
                  <td style="color: #64748b; padding: 6px 0;">Room</td>
                  <td style="font-weight: 600; text-align: right; padding: 6px 0; color: #0f172a;">${tenant.room}</td>
                </tr>
                <tr>
                  <td style="color: #64748b; padding: 6px 0;">Month</td>
                  <td style="font-weight: 600; text-align: right; padding: 6px 0; color: #0f172a;">${monthLabel}</td>
                </tr>
                <tr>
                  <td style="color: #64748b; padding: 6px 0;">Amount Paid</td>
                  <td style="font-weight: 700; text-align: right; padding: 6px 0; color: #22c55e;">${amountFormatted}</td>
                </tr>
                <tr>
                  <td style="color: #64748b; padding: 6px 0;">Ref Number</td>
                  <td style="font-weight: 600; text-align: right; padding: 6px 0; color: #0f172a;">${payment.ref_number}</td>
                </tr>
                <tr>
                  <td style="color: #64748b; padding: 6px 0;">Date</td>
                  <td style="font-weight: 600; text-align: right; padding: 6px 0; color: #0f172a;">${dateFormatted}</td>
                </tr>${remainingBalanceHtml}
              </table>
            </div>

            <p style="font-size: 14px; line-height: 1.5; color: #475569; text-align: center; margin: 20px 0;">Thank you for your payment!</p>
            
            <div style="text-align: center; margin: 24px 0;">
              <a href="${appUrl}/dashboard" style="background-color: #4f46e5; color: #ffffff; padding: 10px 24px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block; font-size: 14px;">Go to Dashboard</a>
            </div>
          </div>
        `;

        await sendEmail({ to: email, subject, text, html });
      }
    }
  } catch (emailErr) {
    console.error("Failed to send payment confirmation email:", emailErr);
  }

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

  // Fetch payment/tenant info first for email notification
  const { data: payment, error: fetchPayError } = await supabase
    .from("payments")
    .select("*, tenant:tenants(*)")
    .eq("id", id)
    .single();

  if (fetchPayError || !payment) {
    return { error: fetchPayError?.message || "Payment not found" };
  }

  const { error } = await supabase
    .from("payments")
    .update({ status: "rejected", admin_note: admin_note || null })
    .eq("id", id);

  if (error) return { error: error.message };

  // Send rejection email notification
  try {
    const tenant = payment.tenant;
    if (tenant && tenant.auth_user_id) {
      const adminClient = createSupabaseAdminClient();
      const { data: userData, error: userError } = await adminClient.auth.admin.getUserById(tenant.auth_user_id);
      
      if (!userError && userData?.user?.email) {
        const email = userData.user.email;
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
        
        // Format month and currency
        const monthParts = payment.month.split("-");
        const monthLabel = new Date(parseInt(monthParts[0]), parseInt(monthParts[1]) - 1, 1).toLocaleDateString("en-PH", {
          month: "long",
          year: "numeric",
        });

        const amountFormatted = new Intl.NumberFormat("en-PH", {
          style: "currency",
          currency: "PHP",
        }).format(payment.amount);
        
        const dateFormatted = new Date().toLocaleDateString("en-PH", {
          year: "numeric",
          month: "long",
          day: "numeric",
          timeZone: "Asia/Manila",
        });

        const { sendEmail } = await import("@/lib/mail");
        
        const subject = `❌ Payment Rejected — Room ${tenant.room}`;
        const text = `Hi ${tenant.name},\n\nYour rent payment of ${amountFormatted} for ${monthLabel} was rejected by the admin.\n\nReason/Note: ${admin_note || "None provided"}\n\nPlease submit a new payment reference in your dashboard.`;
        const html = `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff; color: #1e293b; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
            <div style="text-align: center; margin-bottom: 24px;">
              <div style="background-color: #fee2e2; color: #ef4444; width: 48px; height: 48px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 24px; font-weight: bold; line-height: 48px;">⚠️</div>
            </div>
            
            <h2 style="color: #0f172a; margin-top: 0; text-align: center; font-size: 20px; font-weight: 700;">Payment Rejected</h2>
            <p style="font-size: 15px; line-height: 1.5; color: #475569; margin-top: 16px;">Hi <strong>${tenant.name}</strong>,</p>
            <p style="font-size: 15px; line-height: 1.5; color: #475569;">Your rent payment submission was rejected by the administrator.</p>
            
            <div style="background-color: #f8fafc; padding: 18px; border-radius: 8px; margin: 20px 0; border: 1px solid #f1f5f9;">
              <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                <tr>
                  <td style="color: #64748b; padding: 6px 0;">Room</td>
                  <td style="font-weight: 600; text-align: right; padding: 6px 0; color: #0f172a;">${tenant.room}</td>
                </tr>
                <tr>
                  <td style="color: #64748b; padding: 6px 0;">Month</td>
                  <td style="font-weight: 600; text-align: right; padding: 6px 0; color: #0f172a;">${monthLabel}</td>
                </tr>
                <tr>
                  <td style="color: #64748b; padding: 6px 0;">Amount Submitted</td>
                  <td style="font-weight: 700; text-align: right; padding: 6px 0; color: #ef4444;">${amountFormatted}</td>
                </tr>
                <tr>
                  <td style="color: #64748b; padding: 6px 0;">Note from Admin</td>
                  <td style="font-weight: 600; text-align: right; padding: 6px 0; color: #dc2626;">${admin_note || "No explanation provided"}</td>
                </tr>
                <tr>
                  <td style="color: #64748b; padding: 6px 0;">Date</td>
                  <td style="font-weight: 600; text-align: right; padding: 6px 0; color: #0f172a;">${dateFormatted}</td>
                </tr>
              </table>
            </div>

            <p style="font-size: 14px; line-height: 1.5; color: #475569;">Please log in to your dashboard to correct the reference number or re-upload your receipt.</p>
            
            <div style="text-align: center; margin: 24px 0;">
              <a href="${appUrl}/dashboard" style="background-color: #4f46e5; color: #ffffff; padding: 10px 24px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block; font-size: 14px;">Go to Dashboard</a>
            </div>
          </div>
        `;

        await sendEmail({ to: email, subject, text, html });
      }
    }
  } catch (emailErr) {
    console.error("Failed to send payment rejection email:", emailErr);
  }

  revalidatePath("/admin/dashboard");
  revalidatePath("/admin/payments");
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/payments");
  revalidatePath("/dashboard/history");
  return { success: true };
}

