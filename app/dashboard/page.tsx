import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getTenantRow } from "@/lib/session";
import { computeStatus, type PaymentRow } from "@/lib/utils";
import RentStatusCard from "./RentStatusCard";

export const metadata = { title: "Dashboard — BH Manager" };

export default async function TenantDashboardPage() {
  const tenant = await getTenantRow();
  if (!tenant) redirect("/login");

  const supabase = await createSupabaseServerClient();
  const now = new Date();

  const { data: paymentsRaw } = await supabase
    .from("payments")
    .select("*")
    .eq("tenant_id", tenant.id)
    .order("month", { ascending: false })
    .order("submitted_at", { ascending: false });

  const payments = (paymentsRaw ?? []) as PaymentRow[];
  const status = computeStatus(tenant, payments, now);

  return (
    <div className="animate-in flex flex-col gap-5">
      <RentStatusCard
        tenant={tenant}
        status={status}
        payments={payments}
        now={now}
      />
    </div>
  );
}
