import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getTenantRow } from "@/lib/session";
import { getTenantMonthsRange, computeTenantLedger, type PaymentRow, type Settings } from "@/lib/utils";
import GcashDetailsCard from "../GcashDetailsCard";
import GcashQrCard from "../GcashQrCard";
import PaymentForm from "../PaymentForm";

export const metadata = { title: "Payments — BH Manager" };

export default async function PaymentsPage() {
  const tenant = await getTenantRow();
  if (!tenant) redirect("/login");

  const supabase = await createSupabaseServerClient();
  const now = new Date();

  const [{ data: paymentsRaw }, { data: settingsRaw }] = await Promise.all([
    supabase
      .from("payments")
      .select("*")
      .eq("tenant_id", tenant.id)
      .order("month", { ascending: false }),
    supabase.from("settings").select("*").eq("id", 1).single(),
  ]);

  const payments = (paymentsRaw ?? []) as PaymentRow[];
  const settings = settingsRaw as Settings | null;

  const ledger = computeTenantLedger(tenant, payments, now);
  const allMonths = getTenantMonthsRange(tenant.created_at, now);

  const hasGcashInfo =
    settings && (settings.gcash_name || settings.gcash_number || settings.qr_image_url);

  return (
    <div className="animate-in flex flex-col gap-5">
      {hasGcashInfo ? (
        <>
          {settings && (settings.gcash_name || settings.gcash_number) && (
            <GcashDetailsCard settings={settings} />
          )}
          {settings?.qr_image_url && (
            <GcashQrCard qrImageUrl={settings.qr_image_url} />
          )}
        </>
      ) : (
        <div className="card text-center text-sm text-[#64748b]">
          GCash payment details are not configured yet.
        </div>
      )}

      <div className="card">
        <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-[#94a3b8]">
          Submit Payment
        </h2>
        <PaymentForm
          tenantId={tenant.id}
          rentAmount={tenant.rent_amount}
          allMonths={allMonths}
          ledger={ledger}
        />
      </div>
    </div>
  );
}
