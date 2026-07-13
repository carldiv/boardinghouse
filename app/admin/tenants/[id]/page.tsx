import { createSupabaseServerClient } from "@/lib/supabase/server";
import { formatPeso, formatMonth, computeTenantLedger, getTenantMonthsRange, toMonthISO, type TenantRow, type PaymentRow } from "@/lib/utils";
import Link from "next/link";
import { notFound } from "next/navigation";

export const metadata = { title: "View Tenant — BH Manager" };

const STATUS_LABEL: Record<string, string> = {
  paid: "Paid",
  pending: "Pending",
  overdue: "Overdue",
  due: "Due",
};

export default async function ViewTenantPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const now = new Date();

  const [{ data: tenant }, { data: payments }] = await Promise.all([
    supabase.from("tenants").select("*").eq("id", id).single(),
    supabase.from("payments").select("*").eq("tenant_id", id).order("month", { ascending: false }),
  ]);

  if (!tenant) notFound();

  const t = tenant as TenantRow;
  const p = (payments ?? []) as PaymentRow[];

  const ledger = computeTenantLedger(t, p, now);
  const allMonths = getTenantMonthsRange(t.created_at, now);

  const currentMonthISO = toMonthISO(now);
  const visibleMonths = allMonths.filter((m) => {
    if (m <= currentMonthISO) return true;
    const item = ledger[m];
    return item && (item.confirmedPaid > 0 || item.pendingPaid > 0);
  });

  return (
    <div className="animate-in" style={{ maxWidth: "860px" }}>
      {/* Back + actions */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem" }}>
        <Link
          href="/admin/tenants"
          style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", color: "var(--text-muted)", fontSize: "0.9rem", textDecoration: "none" }}
        >
          ← Back to Tenants
        </Link>
        <Link
          href={`/admin/tenants/${id}/edit`}
          className="btn btn-ghost btn-sm"
          style={{ textDecoration: "none" }}
        >
          Edit Tenant
        </Link>
      </div>

      {/* Header */}
      <div style={{ marginBottom: "1.5rem" }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 700, margin: 0, color: "var(--text-primary)" }}>Tenant Profile View</h1>
        <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", margin: "0.25rem 0 0" }}>Details and payment records for Room {t.room}</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.4fr", gap: "1.5rem", marginBottom: "1.5rem" }}>
        {/* Personal Info */}
        <div style={{ backgroundColor: "var(--surface-1)", border: "1px solid var(--border)", borderRadius: "1rem", padding: "1.5rem" }}>
          <h2 style={{ fontSize: "0.95rem", fontWeight: 600, color: "var(--text-muted)", marginTop: 0, marginBottom: "1rem" }}>Personal Info</h2>
          <div style={{ background: "var(--surface-2)", padding: "1rem", borderRadius: "0.75rem", border: "1px solid var(--border-hover)", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <InfoRow label="Full Name" value={t.name} />
            <InfoRow label="Room Assigned" value={`Room ${t.room}`} />
            <InfoRow label="Monthly Rent Rate" value={formatPeso(t.rent_amount)} valueColor="var(--color-success)" />
            <InfoRow label="Rent Due Day" value={`Day ${t.due_day} of each month`} />
            <InfoRow label="Account" value={t.auth_user_id ? "Linked" : "No Account"} valueColor={t.auth_user_id ? "var(--color-success)" : "var(--color-warning)"} />
          </div>
        </div>

        {/* Payment History */}
        <div style={{ backgroundColor: "var(--surface-1)", border: "1px solid var(--border)", borderRadius: "1rem", padding: "1.5rem" }}>
          <h2 style={{ fontSize: "0.95rem", fontWeight: 600, color: "var(--text-muted)", marginTop: 0, marginBottom: "1rem" }}>Payment History</h2>
          <div className="table-wrapper">
            <table style={{ minWidth: "100%" }}>
              <thead>
                <tr>
                  <th>Month</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {p.length === 0 && (
                  <tr>
                    <td colSpan={3} style={{ textAlign: "center", color: "var(--text-muted)", padding: "2rem" }}>No payments logged</td>
                  </tr>
                )}
                {p.map((payment) => (
                  <tr key={payment.id}>
                    <td style={{ fontSize: "0.85rem" }}>{formatMonth(payment.month)}</td>
                    <td style={{ fontSize: "0.85rem", fontWeight: 500 }}>{formatPeso(payment.amount)}</td>
                    <td>
                      <span className={`badge badge-${payment.status === "confirmed" ? "confirmed" : payment.status === "rejected" ? "rejected" : "pending"}`}
                        style={{ fontSize: "0.7rem", padding: "0.2rem 0.5rem" }}>
                        {payment.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Monthly Billing Ledger */}
      <div style={{ backgroundColor: "var(--surface-1)", border: "1px solid var(--border)", borderRadius: "1rem", padding: "1.5rem" }}>
        <h2 style={{ fontSize: "0.95rem", fontWeight: 600, color: "var(--text-muted)", marginTop: 0, marginBottom: "1rem" }}>Monthly Billing Ledger</h2>
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
                    <td style={{ fontWeight: 600, color: "var(--text-primary)" }}>{formatMonth(m)}</td>
                    <td>{formatPeso(item.rentAmount)}</td>
                    <td style={{ color: item.confirmedPaid >= item.rentAmount ? "var(--color-success)" : "var(--text-primary)" }}>
                      {formatPeso(item.confirmedPaid)}
                      {item.pendingPaid > 0 && (
                        <span style={{ fontSize: "0.8rem", color: "var(--color-warning)", marginLeft: "0.4rem" }}>
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

      {/* Bottom close button */}
      <div style={{ marginTop: "1.5rem", display: "flex", justifyContent: "flex-end" }}>
        <Link href="/admin/tenants" className="btn btn-ghost" style={{ textDecoration: "none" }}>
          Close
        </Link>
      </div>
    </div>
  );
}

function InfoRow({ label, value, valueColor }: { label: string; value: string; valueColor?: string }) {
  return (
    <div>
      <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "block" }}>{label}</span>
      <span style={{ fontWeight: 600, color: valueColor ?? "var(--text-primary)" }}>{value}</span>
    </div>
  );
}
