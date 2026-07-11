import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { deleteTenant } from "@/actions/tenants";
import { formatPeso, type TenantRow } from "@/lib/utils";

export const metadata = { title: "Tenants — BH Manager" };

export default async function TenantsPage() {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("tenants")
    .select("*")
    .order("room");

  const tenants = (data ?? []) as TenantRow[];

  return (
    <div className="animate-in" style={{ maxWidth: "1000px" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "2rem",
        }}
      >
        <div>
          <h1 style={{ fontSize: "1.6rem", fontWeight: 700, margin: 0, color: "#e8eaf0" }}>
            Tenants
          </h1>
          <p style={{ color: "#64748b", marginTop: "0.25rem", fontSize: "0.9rem" }}>
            {tenants.length} tenant{tenants.length !== 1 ? "s" : ""} registered
          </p>
        </div>
        <Link href="/admin/tenants/new" className="btn btn-primary">
          + Add Tenant
        </Link>
      </div>

      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Room</th>
              <th>Monthly Rent</th>
              <th>Due Day</th>
              <th>Account</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {tenants.length === 0 && (
              <tr>
                <td colSpan={6} style={{ textAlign: "center", padding: "3rem", color: "#475569" }}>
                  No tenants yet.{" "}
                  <Link href="/admin/tenants/new" style={{ color: "#818cf8" }}>
                    Add your first tenant →
                  </Link>
                </td>
              </tr>
            )}
            {tenants.map((tenant) => (
              <tr key={tenant.id}>
                <td style={{ fontWeight: 600, color: "#e2e8f0" }}>{tenant.name}</td>
                <td>{tenant.room}</td>
                <td>{formatPeso(tenant.rent_amount)}</td>
                <td>Day {tenant.due_day}</td>
                <td>
                  {tenant.auth_user_id ? (
                    <span className="badge badge-confirmed">Linked</span>
                  ) : (
                    <span className="badge badge-pending">No Account</span>
                  )}
                </td>
                <td>
                  <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                    <Link
                      href={`/admin/tenants/${tenant.id}`}
                      className="btn btn-ghost btn-sm"
                    >
                      Edit
                    </Link>
                    <form
                      action={async () => {
                        "use server";
                        await deleteTenant(tenant.id);
                      }}
                    >
                      <button
                        id={`delete-tenant-${tenant.id}`}
                        type="submit"
                        className="btn btn-danger btn-sm"
                      >
                        Delete
                      </button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
