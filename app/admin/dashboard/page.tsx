import { createSupabaseServerClient } from "@/lib/supabase/server";
import { computeStatus, formatPeso, formatMonth, formatDate, type TenantRow, type PaymentRow } from "@/lib/utils";
import { confirmPayment } from "@/actions/payments";
import Image from "next/image";
import Link from "next/link";

export const metadata = { title: "Dashboard — BH Manager" };

const STATUS_LABEL: Record<string, string> = {
  paid: "Paid",
  pending: "Pending",
  overdue: "Overdue",
  due: "Due",
};

export default async function AdminDashboardPage() {
  const supabase = await createSupabaseServerClient();
  const now = new Date();

  const [{ data: tenants }, { data: payments }] = await Promise.all([
    supabase.from("tenants").select("*").order("room"),
    supabase.from("payments").select("*").order("submitted_at", { ascending: false }),
  ]);

  const tenantList = (tenants ?? []) as TenantRow[];
  const paymentList = (payments ?? []) as PaymentRow[];

  const pendingPayments = paymentList.filter((p) => p.status === "pending");

  // Compute per-tenant status
  const tenantStatuses = tenantList.map((t) => ({
    tenant: t,
    status: computeStatus(t, paymentList, now),
  }));

  const counts = {
    total: tenantList.length,
    paid: tenantStatuses.filter((x) => x.status === "paid").length,
    overdue: tenantStatuses.filter((x) => x.status === "overdue").length,
    pending: pendingPayments.length,
  };

  return (
    <div className="animate-in" style={{ maxWidth: "1400px" }}>
      {/* Header */}
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "1.6rem", fontWeight: 700, margin: 0, color: "#e8eaf0" }}>
          Dashboard
        </h1>
        <p style={{ color: "#64748b", marginTop: "0.25rem", fontSize: "0.9rem" }}>
          {now.toLocaleDateString("en-PH", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
        </p>
      </div>

      {/* Stat Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "1rem",
          marginBottom: "2rem",
        }}
      >
        {[
          { label: "Total Tenants", value: counts.total, color: "#818cf8" },
          { label: "Paid This Month", value: counts.paid, color: "#10b981" },
          { label: "Pending Review", value: counts.pending, color: "#f59e0b" },
          { label: "Overdue", value: counts.overdue, color: "#ef4444" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="card"
            style={{ padding: "1.25rem 1.5rem" }}
          >
            <div style={{ fontSize: "2rem", fontWeight: 800, color: stat.color }}>
              {stat.value}
            </div>
            <div style={{ fontSize: "0.8rem", color: "#64748b", marginTop: "0.2rem", fontWeight: 500 }}>
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 420px", gap: "1.5rem" }}>
        {/* Tenant Status Table */}
        <div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
            <h2 style={{ fontSize: "1.05rem", fontWeight: 700, color: "#e8eaf0", margin: 0 }}>
              Tenant Status
            </h2>
            <Link href="/admin/tenants/new" className="btn btn-primary btn-sm">
              + Add Tenant
            </Link>
          </div>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Tenant</th>
                  <th>Room</th>
                  <th>Rent</th>
                  <th>Due Day</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {tenantStatuses.length === 0 && (
                  <tr>
                    <td colSpan={6} style={{ textAlign: "center", color: "#475569", padding: "2rem" }}>
                      No tenants yet. <Link href="/admin/tenants/new" style={{ color: "#818cf8" }}>Add one →</Link>
                    </td>
                  </tr>
                )}
                {tenantStatuses.map(({ tenant, status }) => (
                  <tr key={tenant.id}>
                    <td style={{ fontWeight: 600, color: "#e2e8f0" }}>{tenant.name}</td>
                    <td>{tenant.room}</td>
                    <td>{formatPeso(tenant.rent_amount)}</td>
                    <td>Day {tenant.due_day}</td>
                    <td>
                      <span className={`badge badge-${status}`}>
                        {STATUS_LABEL[status]}
                      </span>
                    </td>
                    <td>
                      <Link
                        href={`/admin/tenants/${tenant.id}`}
                        style={{ color: "#6366f1", fontSize: "0.8rem", textDecoration: "none" }}
                      >
                        View →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pending Payments Queue */}
        <div>
          <h2 style={{ fontSize: "1.05rem", fontWeight: 700, color: "#e8eaf0", marginBottom: "1rem" }}>
            Pending Review
            {pendingPayments.length > 0 && (
              <span
                style={{
                  marginLeft: "0.5rem",
                  background: "#f59e0b",
                  color: "#1a1200",
                  fontSize: "0.7rem",
                  fontWeight: 700,
                  padding: "0.15rem 0.5rem",
                  borderRadius: "9999px",
                }}
              >
                {pendingPayments.length}
              </span>
            )}
          </h2>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {pendingPayments.length === 0 && (
              <div
                className="card"
                style={{ textAlign: "center", color: "#475569", padding: "2rem", fontSize: "0.9rem" }}
              >
                ✅ All caught up!
              </div>
            )}
            {pendingPayments.map((payment) => {
              const tenant = tenantList.find((t) => t.id === payment.tenant_id);
              return (
                <div key={payment.id} className="card" style={{ padding: "1rem" }}>
                  <div style={{ display: "flex", gap: "0.75rem" }}>
                    {/* Receipt thumbnail */}
                    {payment.receipt_url ? (
                      <a href={payment.receipt_url} target="_blank" rel="noreferrer" style={{ flexShrink: 0 }}>
                        <Image
                          src={payment.receipt_url}
                          alt="Receipt"
                          width={64}
                          height={80}
                          style={{ borderRadius: "6px", objectFit: "cover", border: "1px solid #263044" }}
                        />
                      </a>
                    ) : (
                      <div
                        style={{
                          width: 64, height: 80, background: "#1e2535", borderRadius: "6px",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          color: "#475569", fontSize: "0.7rem", flexShrink: 0,
                        }}
                      >
                        No receipt
                      </div>
                    )}

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, color: "#e2e8f0", fontSize: "0.9rem" }}>
                        {tenant?.name ?? "Unknown"}
                      </div>
                      <div style={{ color: "#64748b", fontSize: "0.75rem", marginBottom: "0.25rem" }}>
                        Room {tenant?.room} · {formatMonth(payment.month)}
                      </div>
                      <div style={{ color: "#10b981", fontWeight: 700, fontSize: "0.95rem" }}>
                        {formatPeso(payment.amount)}
                      </div>
                      <div style={{ color: "#94a3b8", fontSize: "0.75rem" }}>
                        Ref: {payment.ref_number}
                      </div>
                      <div style={{ color: "#475569", fontSize: "0.72rem", marginTop: "0.15rem" }}>
                        {formatDate(payment.submitted_at)}
                      </div>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.75rem" }}>
                    <form
                      action={async () => {
                        "use server";
                        await confirmPayment(payment.id);
                      }}
                      style={{ flex: 1 }}
                    >
                      <button
                        id={`confirm-${payment.id}`}
                        type="submit"
                        className="btn btn-success btn-sm"
                        style={{ width: "100%" }}
                      >
                        ✓ Confirm
                      </button>
                    </form>
                    <Link
                      href={`/admin/payments?reject=${payment.id}`}
                      className="btn btn-danger btn-sm"
                      style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", textDecoration: "none" }}
                    >
                      ✗ Reject
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          div[style*="1fr 420px"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
