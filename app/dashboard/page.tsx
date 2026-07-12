import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getTenantRow } from "@/lib/session";
import { computeStatus, computeTenantLedger, getTenantMonthsRange, toMonthISO, formatMonth, formatPeso, type PaymentRow } from "@/lib/utils";
import RentStatusCard from "./RentStatusCard";

export const metadata = { title: "Dashboard — BH Manager" };

const STATUS_LABEL: Record<string, string> = {
  paid: "Paid",
  pending: "Pending",
  overdue: "Overdue",
  due: "Due",
};

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

  const ledger = computeTenantLedger(tenant, payments, now);
  const allMonths = getTenantMonthsRange(tenant.created_at, now);
  
  const currentMonthISO = toMonthISO(now);
  const visibleMonths = allMonths.filter((m) => {
    if (m <= currentMonthISO) return true;
    const item = ledger[m];
    return item && (item.confirmedPaid > 0 || item.pendingPaid > 0);
  });

  return (
    <div className="animate-in flex flex-col gap-5">
      <RentStatusCard
        tenant={tenant}
        status={status}
        payments={payments}
        now={now}
      />

      <div className="card">
        <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-[#94a3b8]">
          Monthly Billing Ledger
        </h2>
        <div className="table-wrapper">
          <table style={{ minWidth: "100%" }}>
            <thead>
              <tr>
                <th>Month</th>
                <th>Rent Due</th>
                <th>Paid Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {visibleMonths.map((m) => {
                const item = ledger[m];
                return (
                  <tr key={m}>
                    <td style={{ fontWeight: 600, color: "#e2e8f0" }}>{formatMonth(m)}</td>
                    <td>{formatPeso(item.rentAmount)}</td>
                    <td style={{ color: item.confirmedPaid >= item.rentAmount ? "#10b981" : "#cbd5e1" }}>
                      {formatPeso(item.confirmedPaid)}
                      {item.pendingPaid > 0 && (
                        <span style={{ fontSize: "0.8rem", color: "#f59e0b", marginLeft: "0.4rem" }}>
                          (+{formatPeso(item.pendingPaid)} pending)
                        </span>
                      )}
                    </td>
                    <td>
                      <span className={`badge badge-${item.status}`}>
                        {STATUS_LABEL[item.status]}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
