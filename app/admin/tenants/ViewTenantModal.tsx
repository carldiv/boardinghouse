"use client";

import { useState } from "react";
import { formatPeso, formatMonth, formatDate, type TenantRow, type PaymentRow } from "@/lib/utils";

interface ViewTenantModalProps {
  tenant: TenantRow;
  payments: PaymentRow[];
  isOpen: boolean;
  onClose: () => void;
}

export default function ViewTenantModal({ tenant, payments, isOpen, onClose }: ViewTenantModalProps) {
  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        top: 0, left: 0, right: 0, bottom: 0,
        zIndex: 9999,
        backgroundColor: "rgba(10, 14, 23, 0.88)",
        overflowY: "auto",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        padding: "2rem 1.5rem 2rem calc(240px + 1.5rem)",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{ width: "100%", maxWidth: "780px", backgroundColor: "var(--surface-1)", border: "1px solid var(--border)", borderRadius: "1rem", boxShadow: "0 25px 50px rgba(0,0,0,0.7)", padding: "2rem", flexShrink: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
          <div>
            <h2 style={{ fontSize: "1.3rem", fontWeight: 700, margin: 0, color: "var(--text-primary)" }}>
              Tenant Profile View
            </h2>
            <p style={{ color: "var(--text-muted)", marginTop: "0.2rem", fontSize: "0.85rem", margin: 0 }}>
              Details and payment records for Room {tenant.room}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              color: "var(--text-muted)",
              fontSize: "1.5rem",
              cursor: "pointer",
              padding: "0.25rem",
            }}
          >
            &times;
          </button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: "1.5rem" }} className="view-grid">
          {/* Tenant Details */}
          <div>
            <h3 style={{ fontSize: "0.95rem", fontWeight: 600, color: "var(--text-muted)", marginBottom: "0.75rem", marginTop: 0 }}>
              Personal Info
            </h3>
            <div style={{ background: "var(--surface-2)", padding: "1rem", borderRadius: "0.75rem", border: "1px solid var(--border-hover)" }}>
              <InfoItem label="Full Name" value={tenant.name} />
              <InfoItem label="Room Assigned" value={`Room ${tenant.room}`} />
              <InfoItem label="Monthly Rent Rate" value={formatPeso(tenant.rent_amount)} valueColor="var(--color-success)" />
              <InfoItem label="Rent Due Day" value={`Day ${tenant.due_day} of each month`} />
              <div style={{ borderTop: "1px solid var(--border)", margin: "0.75rem 0" }} />
              <p style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", margin: "0 0 0.6rem" }}>
                Emergency Contact
              </p>
              <InfoItem label="Name" value={tenant.emergency_contact_name ?? "—"} />
              <InfoItem label="Phone" value={tenant.emergency_contact_phone ?? "—"} />
              <InfoItem label="Address" value={tenant.address ?? "—"} noBorder />
            </div>
          </div>

          {/* Payment History */}
          <div>
            <h3 style={{ fontSize: "0.95rem", fontWeight: 600, color: "var(--text-muted)", marginBottom: "0.75rem", marginTop: 0 }}>
              Payment History
            </h3>
            <div className="table-wrapper" style={{ maxHeight: "300px", overflowY: "auto" }}>
              <table style={{ minWidth: "100%" }}>
                <thead>
                  <tr>
                    <th>Month</th>
                    <th>Amount</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {(!payments || payments.length === 0) && (
                    <tr>
                      <td colSpan={3} style={{ textAlign: "center", color: "var(--text-muted)", padding: "2rem" }}>
                        No payments logged
                      </td>
                    </tr>
                  )}
                  {(payments ?? []).map((p) => (
                    <tr key={p.id}>
                      <td style={{ fontSize: "0.85rem" }}>{formatMonth(p.month)}</td>
                      <td style={{ fontSize: "0.85rem", fontWeight: 500 }}>{formatPeso(p.amount)}</td>
                      <td>
                        <span
                          className={`badge badge-${p.status === "confirmed" ? "confirmed" : p.status === "rejected" ? "rejected" : "pending"}`}
                          style={{ fontSize: "0.7rem", padding: "0.2rem 0.5rem" }}
                        >
                          {p.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "1.5rem" }}>
          <button onClick={onClose} className="btn btn-ghost">
            Close
          </button>
        </div>

        <style>{`
          @media (max-width: 600px) {
            .view-grid { grid-template-columns: 1fr !important; }
          }
        `}</style>
      </div>
    </div>
  );
}

function InfoItem({ label, value, valueColor, noBorder }: { label: string; value: string; valueColor?: string; noBorder?: boolean }) {
  return (
    <div style={{ marginBottom: noBorder ? 0 : "0.75rem" }}>
      <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "block" }}>{label}</span>
      <span style={{ fontWeight: 600, color: valueColor ?? "var(--text-primary)" }}>{value}</span>
    </div>
  );
}
