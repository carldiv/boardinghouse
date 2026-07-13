import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getTenantRow } from "@/lib/session";
import { type PaymentRow } from "@/lib/utils";
import PaymentHistoryList from "../PaymentHistoryList";

export const metadata = { title: "Payment History — BH Manager" };

export default async function HistoryPage() {
  const tenant = await getTenantRow();
  if (!tenant) redirect("/login");

  const supabase = await createSupabaseServerClient();

  const { data: paymentsRaw } = await supabase
    .from("payments")
    .select("*")
    .eq("tenant_id", tenant.id)
    .order("submitted_at", { ascending: false });

  const payments = (paymentsRaw ?? []) as PaymentRow[];

  return (
    <div className="animate-in flex flex-col gap-5">
      <div className="card">
        <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-[var(--text-muted)]">
          Payment History
        </h2>
        <PaymentHistoryList payments={payments} />
      </div>
    </div>
  );
}
