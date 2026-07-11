import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { formatPeso, formatMonth, formatDate, type TenantRow, type PaymentRow } from "@/lib/utils";
import EditTenantForm from "./EditTenantForm";
import Link from "next/link";

export const metadata = { title: "Edit Tenant — BH Manager" };

export default async function TenantDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();

  const [{ data: tenant }, { data: payments }] = await Promise.all([
    supabase.from("tenants").select("*").eq("id", id).single(),
    supabase.from("payments").select("*").eq("tenant_id", id).order("month", { ascending: false }),
  ]);

  if (!tenant) notFound();

  return (
    <div className="animate-in" style={{ maxWidth: "800px" }}>
      <div style={{ marginBottom: "2rem" }}>
        <Link
          href="/admin/tenants"
          style={{ color: "#64748b", fontSize: "0.85rem", textDecoration: "none" }}
        >
          ← Back to Tenants
        </Link>
        <h1 style={{ fontSize: "1.6rem", fontWeight: 700, margin: "0.5rem 0 0", color: "#e8eaf0" }}>
          {(tenant as TenantRow).name}
        </h1>
        <p style={{ color: "#64748b", marginTop: "0.25rem", fontSize: "0.9rem" }}>
          Room {(tenant as TenantRow).room}
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
        {/* Edit form */}
        <div>
          <h2 style={{ fontSize: "1rem", fontWeight: 600, color: "#94a3b8", marginBottom: "1rem" }}>
            Tenant Details
          </h2>
          <div className="card">
            <EditTenantForm tenant={tenant as TenantRow} />
          </div>
        </div>

        {/* Payment history */}
        <div>
          <h2 style={{ fontSize: "1rem", fontWeight: 600, color: "#94a3b8", marginBottom: "1rem" }}>
            Payment History
          </h2>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Month</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {(!payments || payments.length === 0) && (
                  <tr>
                    <td colSpan={4} style={{ textAlign: "center", color: "#475569", padding: "2rem" }}>
                      No payments yet
                    </td>
                  </tr>
                )}
                {(payments ?? []).map((p: PaymentRow) => (
                  <tr key={p.id}>
                    <td>{formatMonth(p.month)}</td>
                    <td>{formatPeso(p.amount)}</td>
                    <td>
                      <span className={`badge badge-${p.status === "confirmed" ? "confirmed" : p.status === "rejected" ? "rejected" : "pending"}`}>
                        {p.status}
                      </span>
                    </td>
                    <td style={{ fontSize: "0.8rem", color: "#64748b" }}>{formatDate(p.submitted_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 700px) {
          div[style*="1fr 1fr"] { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
