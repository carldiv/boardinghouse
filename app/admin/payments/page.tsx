import { createSupabaseServerClient } from "@/lib/supabase/server";
import { formatPeso, formatMonth, formatDate, type TenantRow, type PaymentRow } from "@/lib/utils";
import RejectModal from "./RejectModal";
import PaymentActions from "./PaymentActions";
import Image from "next/image";

export const metadata = { title: "Payments — BH Manager" };

type Filter = "all" | "pending" | "confirmed" | "rejected";

export default async function PaymentsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; reject?: string; page?: string }>;
}) {
  const { status = "all", reject, page = "1" } = await searchParams;
  const supabase = await createSupabaseServerClient();

  const [{ data: paymentsRaw }, { data: tenantsRaw }] = await Promise.all([
    supabase.from("payments").select("*").order("submitted_at", { ascending: false }),
    supabase.from("tenants").select("id, name, room, rent_amount"),
  ]);

  const payments = (paymentsRaw ?? []) as PaymentRow[];
  const tenants = (tenantsRaw ?? []) as Pick<TenantRow, "id" | "name" | "room" | "rent_amount">[];

  const tenantMap = Object.fromEntries(tenants.map((t) => [t.id, t]));

  // Build a set of ref numbers that appear more than once (excluding rejected)
  const refCounts: Record<string, number> = {};
  for (const p of payments) {
    if (p.status !== "rejected") {
      refCounts[p.ref_number] = (refCounts[p.ref_number] ?? 0) + 1;
    }
  }
  const duplicateRefs = new Set(Object.keys(refCounts).filter((r) => refCounts[r] > 1));

  const filtered =
    status === "all" ? payments : payments.filter((p) => p.status === status);

  const currentPage = parseInt(page, 10) || 1;
  const pageSize = 10;
  const totalItems = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const rejectPayment = reject ? payments.find((p) => p.id === reject) : null;
  const rejectTenant = rejectPayment ? tenantMap[rejectPayment.tenant_id] : null;

  const tabs: { key: Filter; label: string }[] = [
    { key: "all", label: "All" },
    { key: "pending", label: "Pending" },
    { key: "confirmed", label: "Confirmed" },
    { key: "rejected", label: "Rejected" },
  ];

  return (
    <div className="animate-in" style={{ maxWidth: "1100px" }}>
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "1.6rem", fontWeight: 700, margin: 0, color: "var(--text-primary)" }}>
          Payments
        </h1>
        <p style={{ color: "var(--text-muted)", marginTop: "0.25rem", fontSize: "0.9rem" }}>
          {filtered.length} payment{filtered.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Status tabs */}
      <div
        style={{
          display: "flex",
          gap: "0.5rem",
          marginBottom: "1.5rem",
          background: "var(--surface-1)",
          padding: "0.35rem",
          borderRadius: "0.75rem",
          border: "1px solid var(--border)",
          width: "fit-content",
        }}
      >
        {tabs.map((tab) => {
          const isActive = status === tab.key;
          const count = tab.key === "all" ? payments.length : payments.filter((p) => p.status === tab.key).length;
          return (
            <a
              key={tab.key}
              href={`/admin/payments?status=${tab.key}`}
              style={{
                padding: "0.45rem 1rem",
                borderRadius: "0.5rem",
                textDecoration: "none",
                fontSize: "0.85rem",
                fontWeight: 600,
                transition: "all 0.15s",
                background: isActive ? "linear-gradient(135deg, #6366f1, #4f46e5)" : "transparent",
                color: isActive ? "#fff" : "var(--text-muted)",
              }}
            >
              {tab.label} ({count})
            </a>
          );
        })}
      </div>

      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Receipt</th>
              <th>Tenant</th>
              <th>Month</th>
              <th>Amount</th>
              <th>Remaining</th>
              <th>Ref #</th>
              <th>Status</th>
              <th>Submitted</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 && (
              <tr>
                <td colSpan={9} style={{ textAlign: "center", padding: "3rem", color: "var(--text-muted)" }}>
                  No payments found.
                </td>
              </tr>
            )}
            {paginated.map((payment) => {
              const tenant = tenantMap[payment.tenant_id];
              return (
                <tr key={payment.id}>
                  <td>
                    {payment.receipt_url ? (
                      <a href={payment.receipt_url} target="_blank" rel="noreferrer">
                        <Image
                          src={payment.receipt_url}
                          alt="Receipt"
                          width={40}
                          height={50}
                          style={{ borderRadius: "4px", objectFit: "cover", border: "1px solid var(--border)" }}
                        />
                      </a>
                    ) : (
                      <span style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}>—</span>
                    )}
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, color: "var(--text-primary)" }}>{tenant?.name ?? "—"}</div>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Room {tenant?.room}</div>
                  </td>
                  <td>{formatMonth(payment.month)}</td>
                  <td style={{ fontWeight: 600, color: "var(--color-success)" }}>{formatPeso(payment.amount)}</td>
                  <td style={{ fontWeight: 600, color: (() => {
                    const confirmedTotal = payments
                      .filter((p) => p.tenant_id === payment.tenant_id && p.month === payment.month && p.status === "confirmed")
                      .reduce((sum, p) => sum + p.amount, 0);
                    const remaining = tenant ? Math.max(0, tenant.rent_amount - confirmedTotal) : 0;
                    return remaining === 0 ? "var(--color-success)" : "#f43f5e";
                  })() }}>
                    {(() => {
                      const confirmedTotal = payments
                        .filter((p) => p.tenant_id === payment.tenant_id && p.month === payment.month && p.status === "confirmed")
                        .reduce((sum, p) => sum + p.amount, 0);
                      const remaining = tenant ? Math.max(0, tenant.rent_amount - confirmedTotal) : 0;
                      return formatPeso(remaining);
                    })()}
                  </td>
                  <td style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontFamily: "monospace" }}>
                    {payment.ref_number}
                    {duplicateRefs.has(payment.ref_number) && (
                      <span style={{
                        marginLeft: "0.4rem",
                        background: "rgba(239,68,68,0.15)",
                        color: "var(--color-danger)",
                        fontSize: "0.68rem",
                        fontWeight: 700,
                        padding: "0.1rem 0.4rem",
                        borderRadius: "0.3rem",
                        border: "1px solid rgba(239,68,68,0.3)",
                        fontFamily: "sans-serif",
                        letterSpacing: "0.02em",
                      }}>
                        ⚠ DUPLICATE
                      </span>
                    )}
                  </td>
                  <td>
                    <span className={`badge badge-${payment.status === "confirmed" ? "confirmed" : payment.status === "rejected" ? "rejected" : "pending"}`}>
                      {payment.status}
                    </span>
                    {payment.admin_note && (
                      <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>
                        {payment.admin_note}
                      </div>
                    )}
                  </td>
                  <td style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>{formatDate(payment.submitted_at)}</td>
                  <td>
                    {payment.status === "pending" && (
                      <PaymentActions
                        paymentId={payment.id}
                        rejectHref={`/admin/payments?status=${status}&reject=${payment.id}`}
                      />
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "1.5rem" }}>
          <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", margin: 0 }}>
            Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, totalItems)} of {totalItems} payments
          </p>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <a
              href={`/admin/payments?status=${status}${currentPage > 1 ? `&page=${currentPage - 1}` : ""}`}
              className="btn btn-ghost btn-sm"
              style={{ pointerEvents: currentPage === 1 ? "none" : "auto", opacity: currentPage === 1 ? 0.5 : 1, textDecoration: "none" }}
            >
              Previous
            </a>
            <a
              href={`/admin/payments?status=${status}${currentPage < totalPages ? `&page=${currentPage + 1}` : `&page=${totalPages}`}`}
              className="btn btn-ghost btn-sm"
              style={{ pointerEvents: currentPage === totalPages ? "none" : "auto", opacity: currentPage === totalPages ? 0.5 : 1, textDecoration: "none" }}
            >
              Next
            </a>
          </div>
        </div>
      )}

      {/* Reject modal */}
      {rejectPayment && rejectTenant && (
        <RejectModal
          paymentId={rejectPayment.id}
          tenantName={rejectTenant.name}
          month={formatMonth(rejectPayment.month)}
          amount={formatPeso(rejectPayment.amount)}
          backUrl={`/admin/payments?status=${status}`}
        />
      )}
    </div>
  );
}
