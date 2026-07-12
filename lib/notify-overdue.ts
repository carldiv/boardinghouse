import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { computeStatus, toMonthISO, type TenantRow, type PaymentRow } from "@/lib/utils";
import { sendEmail } from "./mail";

export interface NotificationResult {
  tenantName: string;
  email: string;
  status: "success" | "skipped" | "error";
  message?: string;
}

export async function notifyOverdueTenants(): Promise<{
  successCount: number;
  results: NotificationResult[];
}> {
  const adminClient = createSupabaseAdminClient();
  const now = new Date();
  const currentMonthISO = toMonthISO(now);

  // 1. Fetch all tenants
  const { data: tenants, error: tenantsError } = await adminClient
    .from("tenants")
    .select("*")
    .order("room");

  if (tenantsError || !tenants) {
    throw new Error(`Failed to fetch tenants: ${tenantsError?.message}`);
  }

  // 2. Fetch all payments for current month
  const { data: payments, error: paymentsError } = await adminClient
    .from("payments")
    .select("*")
    .eq("month", currentMonthISO);

  if (paymentsError || !payments) {
    throw new Error(`Failed to fetch payments: ${paymentsError?.message}`);
  }

  // 3. Fetch all auth users to map tenant to email
  const usersMap = new Map<string, string>();
  let page = 1;
  const perPage = 100;
  while (true) {
    const { data, error } = await adminClient.auth.admin.listUsers({
      page,
      perPage,
    });
    if (error || !data || !data.users || data.users.length === 0) break;
    for (const u of data.users) {
      if (u.email) {
        usersMap.set(u.id, u.email);
      }
    }
    if (data.users.length < perPage) break;
    page++;
  }

  const results: NotificationResult[] = [];
  let successCount = 0;

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const currentMonthLabel = now.toLocaleDateString("en-PH", { month: "long", year: "numeric" });

  for (const tenant of tenants as TenantRow[]) {
    const status = computeStatus(tenant, payments as PaymentRow[], now);

    if (status !== "overdue") {
      continue;
    }

    const email = tenant.auth_user_id ? usersMap.get(tenant.auth_user_id) : null;

    if (!email) {
      results.push({
        tenantName: tenant.name,
        email: "No linked email",
        status: "skipped",
        message: "No auth user or email found for this tenant",
      });
      continue;
    }

    try {
      const subject = `⚠️ Overdue Rent Notice — Room ${tenant.room}`;
      const rentFormatted = new Intl.NumberFormat("en-PH", {
        style: "currency",
        currency: "PHP",
      }).format(tenant.rent_amount);

      const html = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff; color: #1e293b; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
          <div style="text-align: center; margin-bottom: 24px;">
            <div style="background-color: #fee2e2; color: #ef4444; width: 48px; height: 48px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 24px; font-weight: bold; line-height: 48px;">⚠️</div>
          </div>
          
          <h2 style="color: #0f172a; margin-top: 0; text-align: center; font-size: 20px; font-weight: 700;">Overdue Rent Reminder</h2>
          <p style="font-size: 15px; line-height: 1.5; color: #475569; margin-top: 16px;">Hi <strong>${tenant.name}</strong>,</p>
          <p style="font-size: 15px; line-height: 1.5; color: #475569;">This is a reminder that your rent for <strong>${currentMonthLabel}</strong> is overdue.</p>
          
          <div style="background-color: #f8fafc; padding: 18px; border-radius: 8px; margin: 20px 0; border: 1px solid #f1f5f9;">
            <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
              <tr>
                <td style="color: #64748b; padding: 6px 0;">Room</td>
                <td style="font-weight: 600; text-align: right; padding: 6px 0; color: #0f172a;">${tenant.room}</td>
              </tr>
              <tr>
                <td style="color: #64748b; padding: 6px 0;">Rent Amount</td>
                <td style="font-weight: 700; text-align: right; padding: 6px 0; color: #ef4444;">${rentFormatted}</td>
              </tr>
              <tr>
                <td style="color: #64748b; padding: 6px 0;">Due Day</td>
                <td style="font-weight: 600; text-align: right; padding: 6px 0; color: #0f172a;">Day ${tenant.due_day}</td>
              </tr>
            </table>
          </div>

          <p style="font-size: 14px; line-height: 1.5; color: #475569;">Please log in to the portal to submit your payment details (GCash reference number and receipt image) as soon as possible.</p>
          
          <div style="text-align: center; margin: 28px 0;">
            <a href="${appUrl}/dashboard" style="background-color: #4f46e5; color: #ffffff; padding: 12px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block; font-size: 15px; box-shadow: 0 4px 6px rgba(79, 70, 229, 0.15);">Pay Rent Now</a>
          </div>

          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
          <p style="font-size: 12px; color: #94a3b8; text-align: center; line-height: 1.4; margin: 0;">If you have already submitted your payment, please wait for the administrator to review and confirm it.</p>
        </div>
      `;

      const text = `Hi ${tenant.name},\n\nThis is a reminder that your rent of ${rentFormatted} for Room ${tenant.room} is overdue (Due Day: ${tenant.due_day} of each month).\n\nPlease log in to the portal at ${appUrl}/dashboard to submit your payment details.\n\nThank you!`;

      await sendEmail({ to: email, subject, text, html });
      successCount++;
      results.push({
        tenantName: tenant.name,
        email,
        status: "success",
      });
    } catch (err: any) {
      results.push({
        tenantName: tenant.name,
        email,
        status: "error",
        message: err.message || "Failed to send email",
      });
    }
  }

  return { successCount, results };
}
