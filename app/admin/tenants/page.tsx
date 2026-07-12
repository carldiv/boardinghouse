import { createSupabaseServerClient } from "@/lib/supabase/server";
import { type TenantRow, type PaymentRow } from "@/lib/utils";
import TenantsTable from "./TenantsTable";

export const metadata = { title: "Tenants — BH Manager" };

export default async function TenantsPage() {
  const supabase = await createSupabaseServerClient();

  const [{ data: tenantsData }, { data: paymentsData }] = await Promise.all([
    supabase.from("tenants").select("*").order("room"),
    supabase.from("payments").select("*").order("month", { ascending: false }),
  ]);

  const tenants = (tenantsData ?? []) as TenantRow[];
  const allPayments = (paymentsData ?? []) as PaymentRow[];

  return (
    <div className="animate-in" style={{ maxWidth: "1000px" }}>
      <TenantsTable tenants={tenants} allPayments={allPayments} />
    </div>
  );
}
