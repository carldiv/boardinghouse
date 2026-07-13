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
        style={{ width: "100%", maxWidth: "520px", backgroundColor: "var(--surface-1)", border: "1px solid var(--border)", borderRadius: "1rem", boxShadow: "0 25px 50px rgba(0,0,0,0.7)", padding: "2rem", flexShrink: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
          <div>
            <h2 style={{ fontSize: "1.3rem", fontWeight: 700, margin: 0, color: "var(--text-primary)" }}>Edit Tenant Profile</h2>
            <p style={{ color: "var(--text-muted)", fontSize: "0.8rem", margin: "0.25rem 0 0" }}>Update room assignment or payment settings.</p>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "var(--text-muted)", fontSize: "1.5rem", cursor: "pointer", padding: "0.25rem", lineHeight: 1 }}>&times;</button>
        </div>

        <form action={action} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          <input type="hidden" name="id" value={tenant.id} />
          <Field label="Full Name" id="edit-name" name="name" defaultValue={tenant.name} required />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <Field label="Room" id="edit-room" name="room" defaultValue={tenant.room} required />
            <Field label="Monthly Rent (₱)" id="edit-rent" name="rent_amount" type="number" defaultValue={String(tenant.rent_amount)} min="1" step="0.01" required />
          </div>
          <div>
            <label htmlFor="edit-due-day" style={{ display: "block", marginBottom: "0.4rem", fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 500 }}>Rent Due Day (1–31)</label>
            <select id="edit-due-day" name="due_day" className="input" defaultValue={tenant.due_day}>
              {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                <option key={d} value={d} style={{ background: "var(--surface-2)" }}>Day {d}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="edit-move-in" style={{ display: "block", marginBottom: "0.4rem", fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 500 }}>
              Move-in Month <span style={{ color: "var(--text-muted)", fontWeight: 400 }}>(sets when rent starts)</span>
            </label>
            <input
              id="edit-move-in"
              name="move_in_date"
              type="month"
              className="input"
              style={{ colorScheme: "dark" }}
              defaultValue={
                tenant.move_in_date
                  ? tenant.move_in_date.slice(0, 7)
                  : tenant.created_at
                  ? tenant.created_at.slice(0, 7)
                  : ""
              }
            />
          </div>
          {state?.error && (
            <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: "0.5rem", padding: "0.75rem 1rem", color: "var(--color-danger)", fontSize: "0.875rem" }}>
              {state.error}
            </div>
          )}
          <div style={{ display: "flex", gap: "0.75rem", paddingTop: "0.5rem" }}>
            <button type="button" onClick={onClose} className="btn btn-ghost" style={{ flex: 1 }}>Cancel</button>
            <button id="submit-edit-tenant" type="submit" disabled={pending} className="btn btn-primary" style={{ flex: 2 }}>
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
        style={{ display: "block", marginBottom: "0.4rem", fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 500 }}
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
