"use client";

import { useActionState, useEffect } from "react";
import { updateTenant } from "@/actions/tenants";
import type { TenantRow } from "@/lib/utils";

interface EditTenantModalProps {
  tenant: TenantRow;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EditTenantModal({ tenant, isOpen, onClose, onSuccess }: EditTenantModalProps) {
  const [state, action, pending] = useActionState(updateTenant, undefined);

  useEffect(() => {
    if (state?.success) {
      onSuccess();
    }
  }, [state, onSuccess]);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        backgroundColor: "rgba(10, 14, 23, 0.8)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: "2rem 1rem",
      }}
      onClick={onClose}
      className="modal-overlay"
    >
      <style>{`
        @media (min-width: 769px) {
          .modal-overlay {
            left: 240px !important;
          }
        }
      `}</style>
      <div
        className="card animate-in"
        style={{
          width: "100%",
          maxWidth: "520px",
          backgroundColor: "#161b27",
          border: "1px solid #263044",
          boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 10px 10px -5px rgba(0, 0, 0, 0.4)",
          maxHeight: "85vh",
          overflowY: "auto",
          padding: "2rem",
          display: "flex",
          flexDirection: "column",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
          <div>
            <h2 style={{ fontSize: "1.3rem", fontWeight: 700, margin: 0, color: "#e8eaf0" }}>
              Edit Tenant Profile
            </h2>
            <p style={{ color: "#64748b", marginTop: "0.2rem", fontSize: "0.8rem", margin: 0 }}>
              Update room assignment or payment settings.
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

        <form action={action} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          <input type="hidden" name="id" value={tenant.id} />

          <Field label="Full Name" id="edit-name" name="name" defaultValue={tenant.name} required />

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <Field label="Room" id="edit-room" name="room" defaultValue={tenant.room} required />
            <Field label="Monthly Rent (₱)" id="edit-rent" name="rent_amount" type="number" defaultValue={String(tenant.rent_amount)} min="1" step="0.01" required />
          </div>

          <div>
            <label
              htmlFor="edit-due-day"
              style={{ display: "block", marginBottom: "0.4rem", fontSize: "0.85rem", color: "#94a3b8", fontWeight: 500 }}
            >
              Rent Due Day (1–31)
            </label>
            <select id="edit-due-day" name="due_day" className="input" defaultValue={tenant.due_day}>
              {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                <option key={d} value={d} style={{ background: "#1e2535" }}>
                  Day {d}
                </option>
              ))}
            </select>
          </div>

          {state?.error && (
            <div
              style={{
                background: "rgba(239,68,68,0.1)",
                border: "1px solid rgba(239,68,68,0.3)",
                borderRadius: "0.5rem",
                padding: "0.75rem 1rem",
                color: "#ef4444",
                fontSize: "0.875rem",
              }}
            >
              {state.error}
            </div>
          )}

          <div style={{ display: "flex", gap: "0.75rem", paddingTop: "0.5rem" }}>
            <button
              type="button"
              onClick={onClose}
              className="btn btn-ghost"
              style={{ flex: 1 }}
            >
              Cancel
            </button>
            <button
              id="submit-edit-tenant"
              type="submit"
              disabled={pending}
              className="btn btn-primary"
              style={{ flex: 2 }}
            >
              {pending ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({
  label,
  id,
  name,
  type = "text",
  defaultValue,
  required,
  min,
  step,
}: {
  label: string;
  id: string;
  name: string;
  type?: string;
  defaultValue?: string;
  required?: boolean;
  min?: string;
  step?: string;
}) {
  return (
    <div>
      <label
        htmlFor={id}
        style={{ display: "block", marginBottom: "0.4rem", fontSize: "0.85rem", color: "#94a3b8", fontWeight: 500 }}
      >
        {label}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        defaultValue={defaultValue}
        required={required}
        min={min}
        step={step}
        className="input"
      />
    </div>
  );
}
