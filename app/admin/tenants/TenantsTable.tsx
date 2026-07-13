"use client";

import { formatPeso, type TenantRow, type PaymentRow } from "@/lib/utils";
import DeleteTenantButton from "./DeleteTenantButton";
import Link from "next/link";
import { useState } from "react";

interface TenantsTableProps {
  tenants: TenantRow[];
  allPayments: PaymentRow[];
}

function Spinner() {
  return (
    <svg
      className="animate-spin"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      width={13}
      height={13}
      style={{ display: "inline-block", verticalAlign: "middle" }}
      aria-hidden
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  );
}

export default function TenantsTable({ tenants }: TenantsTableProps) {
  // loadingKey: "add" | "<tenantId>-view" | "<tenantId>-edit"
  const [loadingKey, setLoadingKey] = useState<string | null>(null);

  const handleClick = (key: string) => setLoadingKey(key);

  return (
    <>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "2rem" }}>
        <div>
          <h1 style={{ fontSize: "1.6rem", fontWeight: 700, margin: 0, color: "#e8eaf0" }}>Tenants</h1>
          <p style={{ color: "#64748b", marginTop: "0.25rem", fontSize: "0.9rem" }}>
            {tenants.length} tenant{tenants.length !== 1 ? "s" : ""} registered
          </p>
        </div>
        <Link
          href="/admin/tenants/add"
          className="btn btn-primary"
          style={{
            textDecoration: "none",
            display: "inline-flex",
            alignItems: "center",
            gap: "0.4rem",
            opacity: loadingKey === "add" ? 0.75 : 1,
            pointerEvents: loadingKey ? "none" : "auto",
            transition: "opacity 0.2s",
          }}
          onClick={() => handleClick("add")}
        >
          {loadingKey === "add" ? <Spinner /> : null}
          {loadingKey === "add" ? "Opening…" : "+ Add Tenant"}
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
                  <Link href="/admin/tenants/add" style={{ color: "#818cf8", textDecoration: "underline" }}>
                    Add your first tenant →
                  </Link>
                </td>
              </tr>
            )}
            {tenants.map((tenant) => {
              const viewKey = `${tenant.id}-view`;
              const editKey = `${tenant.id}-edit`;
              const isAnyLoading = loadingKey !== null;

              return (
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
                      {/* View */}
                      <Link
                        href={`/admin/tenants/${tenant.id}`}
                        className="btn btn-ghost btn-sm"
                        style={{
                          color: "#38bdf8",
                          textDecoration: "none",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "0.3rem",
                          opacity: isAnyLoading && loadingKey !== viewKey ? 0.4 : 1,
                          pointerEvents: isAnyLoading ? "none" : "auto",
                          transition: "opacity 0.2s",
                          minWidth: "52px",
                          justifyContent: "center",
                        }}
                        onClick={() => handleClick(viewKey)}
                      >
                        {loadingKey === viewKey ? <Spinner /> : null}
                        {loadingKey === viewKey ? "…" : "View"}
                      </Link>

                      {/* Edit */}
                      <Link
                        href={`/admin/tenants/${tenant.id}/edit`}
                        className="btn btn-ghost btn-sm"
                        style={{
                          textDecoration: "none",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "0.3rem",
                          opacity: isAnyLoading && loadingKey !== editKey ? 0.4 : 1,
                          pointerEvents: isAnyLoading ? "none" : "auto",
                          transition: "opacity 0.2s",
                          minWidth: "48px",
                          justifyContent: "center",
                        }}
                        onClick={() => handleClick(editKey)}
                      >
                        {loadingKey === editKey ? <Spinner /> : null}
                        {loadingKey === editKey ? "…" : "Edit"}
                      </Link>

                      <DeleteTenantButton tenantId={tenant.id} tenantName={tenant.name} />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
