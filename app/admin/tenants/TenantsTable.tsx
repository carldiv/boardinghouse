"use client";

import { useState } from "react";
import { formatPeso, type TenantRow, type PaymentRow } from "@/lib/utils";
import DeleteTenantButton from "./DeleteTenantButton";
import AddTenantModal from "./AddTenantModal";
import ViewTenantModal from "./ViewTenantModal";
import EditTenantModal from "./EditTenantModal";
import { useRouter } from "next/navigation";

interface TenantsTableProps {
  tenants: TenantRow[];
  allPayments: PaymentRow[];
}

export default function TenantsTable({ tenants, allPayments }: TenantsTableProps) {
  const router = useRouter();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  
  const [selectedTenant, setSelectedTenant] = useState<TenantRow | null>(null);
  const [selectedPayments, setSelectedPayments] = useState<PaymentRow[]>([]);

  function handleOpenView(tenant: TenantRow) {
    setSelectedTenant(tenant);
    // Filter payments for this tenant
    const payments = allPayments.filter((p) => p.tenant_id === tenant.id);
    setSelectedPayments(payments);
    setIsViewOpen(true);
  }

  function handleCloseView() {
    setIsViewOpen(false);
    setSelectedTenant(null);
    setSelectedPayments([]);
  }

  function handleOpenEdit(tenant: TenantRow) {
    setSelectedTenant(tenant);
    setIsEditOpen(true);
  }

  function handleCloseEdit() {
    setIsEditOpen(false);
    setSelectedTenant(null);
  }

  return (
    <>
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
        <button onClick={() => setIsAddOpen(true)} className="btn btn-primary">
          + Add Tenant
        </button>
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
                  <button
                    onClick={() => setIsAddOpen(true)}
                    style={{ background: "none", border: "none", color: "#818cf8", textDecoration: "underline", cursor: "pointer", padding: 0 }}
                  >
                    Add your first tenant →
                  </button>
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
                    <button
                      onClick={() => handleOpenView(tenant)}
                      className="btn btn-ghost btn-sm"
                      style={{ color: "#38bdf8" }}
                    >
                      View
                    </button>
                    <button
                      onClick={() => handleOpenEdit(tenant)}
                      className="btn btn-ghost btn-sm"
                    >
                      Edit
                    </button>
                    <DeleteTenantButton tenantId={tenant.id} tenantName={tenant.name} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Tenant Modal */}
      <AddTenantModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onSuccess={() => {
          setIsAddOpen(false);
          router.refresh();
        }}
      />

      {/* View Tenant Modal */}
      {selectedTenant && isViewOpen && (
        <ViewTenantModal
          tenant={selectedTenant}
          payments={selectedPayments}
          isOpen={isViewOpen}
          onClose={handleCloseView}
        />
      )}

      {/* Edit Tenant Modal */}
      {selectedTenant && isEditOpen && (
        <EditTenantModal
          tenant={selectedTenant}
          isOpen={isEditOpen}
          onClose={handleCloseEdit}
          onSuccess={() => {
            setIsEditOpen(false);
            setSelectedTenant(null);
            router.refresh();
          }}
        />
      )}
    </>
  );
}
