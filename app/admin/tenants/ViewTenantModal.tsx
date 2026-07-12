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
        style={{ width: "100%", maxWidth: "780px", backgroundColor: "#161b27", border: "1px solid #263044", borderRadius: "1rem", boxShadow: "0 25px 50px rgba(0,0,0,0.7)", padding: "2rem", flexShrink: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
          <div>
            <h2 style={{ fontSize: "1.3rem", fontWeight: 700, margin: 0, color: "#e8eaf0" }}>
              Tenant Profile View
            </h2>
            <p style={{ color: "#64748b", marginTop: "0.2rem", fontSize: "0.85rem", margin: 0 }}>
              Details and payment records for Room {tenant.room}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              color: "#64748b",
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
            <h3 style={{ fontSize: "0.95rem", fontWeight: 600, color: "#94a3b8", marginBottom: "0.75rem", marginTop: 0 }}>
              Personal Info
            </h3>
            <div style={{ background: "#1e2535", padding: "1rem", borderRadius: "0.75rem", border: "1px solid #2d3a52" }}>
              <div style={{ marginBottom: "0.75rem" }}>
                <span style={{ fontSize: "0.75rem", color: "#64748b", display: "block" }}>Full Name</span>
                <span style={{ fontWeight: 600, color: "#e2e8f0" }}>{tenant.name}</span>
              </div>
              <div style={{ marginBottom: "0.75rem" }}>
                <span style={{ fontSize: "0.75rem", color: "#64748b", display: "block" }}>Room Assigned</span>
                <span style={{ fontWeight: 600, color: "#e2e8f0" }}>Room {tenant.room}</span>
              </div>
              <div style={{ marginBottom: "0.75rem" }}>
                <span style={{ fontSize: "0.75rem", color: "#64748b", display: "block" }}>Monthly Rent Rate</span>
                <span style={{ fontWeight: 600, color: "#10b981" }}>{formatPeso(tenant.rent_amount)}</span>
              </div>
              <div>
                <span style={{ fontSize: "0.75rem", color: "#64748b", display: "block" }}>Rent Due Day</span>
                <span style={{ fontWeight: 600, color: "#e2e8f0" }}>Day {tenant.due_day} of each month</span>
              </div>
            </div>
          </div>

          {/* Payment History */}
          <div>
            <h3 style={{ fontSize: "0.95rem", fontWeight: 600, color: "#94a3b8", marginBottom: "0.75rem", marginTop: 0 }}>
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
                      <td colSpan={3} style={{ textAlign: "center", color: "#475569", padding: "2rem" }}>
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
