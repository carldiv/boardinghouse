"use client";

import { useActionState, useEffect } from "react";
import { createTenant } from "@/actions/tenants";

interface AddTenantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddTenantModal({ isOpen, onClose, onSuccess }: AddTenantModalProps) {
  const [state, action, pending] = useActionState(createTenant, undefined);

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
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: "100vw",
        height: "100vh",
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
        style={{
          width: "100%",
          maxWidth: "520px",
          backgroundColor: "var(--surface-1)",
          border: "1px solid var(--border)",
          borderRadius: "1rem",
          boxShadow: "0 25px 50px rgba(0,0,0,0.7)",
          padding: "2rem",
          flexShrink: 0,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
          <div>
            <h2 style={{ fontSize: "1.3rem", fontWeight: 700, margin: 0, color: "var(--text-primary)" }}>Add Tenant</h2>
            <p style={{ color: "var(--text-muted)", fontSize: "0.8rem", margin: "0.25rem 0 0" }}>Creates a tenant and a login account.</p>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "var(--text-muted)", fontSize: "1.5rem", cursor: "pointer", padding: "0.25rem", lineHeight: 1 }}>&times;</button>
        </div>

        <form action={action} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          <Field label="Full Name" id="name" name="name" placeholder="Juan dela Cruz" required />
          <Field label="Email Address" id="email" name="email" type="email" placeholder="tenant@email.com" required />
          <Field label="Temporary Password" id="password" name="password" type="password" placeholder="Minimum 6 characters" required />

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <Field label="Room" id="room" name="room" placeholder="101" required />
            <Field label="Monthly Rent (₱)" id="rent_amount" name="rent_amount" type="number" placeholder="3500" min="1" step="0.01" required />
          </div>

          <div>
            <label htmlFor="due_day" style={{ display: "block", marginBottom: "0.4rem", fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 500 }}>
              Rent Due Day (1–31)
            </label>
            <select id="due_day" name="due_day" className="input" required defaultValue="1" style={{ padding: "0.6rem 0.8rem" }}>
              {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                <option key={d} value={d} style={{ background: "var(--surface-2)" }}>Day {d}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="move_in_date" style={{ display: "block", marginBottom: "0.4rem", fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 500 }}>
              Move-in Month <span style={{ color: "var(--text-muted)", fontWeight: 400 }}>(optional — sets when rent starts)</span>
            </label>
            <input
              id="move_in_date"
              name="move_in_date"
              type="month"
              className="input"
              style={{ colorScheme: "dark" }}
            />
          </div>

          {/* Divider */}
          <div style={{ borderTop: "1px solid var(--border)", margin: "0.25rem 0" }} />
          <p style={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", margin: 0 }}>
            Emergency Contact
          </p>

          <Field label="Emergency Contact Name" id="emergency_contact_name" name="emergency_contact_name" placeholder="e.g. Maria dela Cruz (Mother)" />
          <Field label="Emergency Contact Phone" id="emergency_contact_phone" name="emergency_contact_phone" type="tel" placeholder="e.g. 09171234567" />
          <Field label="Tenant Address" id="address" name="address" placeholder="e.g. 123 Rizal St, Brgy. San Jose, Manila" />

          {state?.error && (
            <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: "0.5rem", padding: "0.75rem 1rem", color: "var(--color-danger)", fontSize: "0.875rem" }}>
              {state.error}
            </div>
          )}

          <div style={{ display: "flex", gap: "0.75rem", paddingTop: "0.5rem" }}>
            <button type="button" onClick={onClose} className="btn btn-ghost" style={{ flex: 1 }}>Cancel</button>
            <button id="submit-new-tenant" type="submit" disabled={pending} className="btn btn-primary" style={{ flex: 2 }}>
              {pending ? "Creating…" : "Create Tenant"}
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
  placeholder,
  required,
  min,
  step,
}: {
  label: string;
  id: string;
  name: string;
  type?: string;
  placeholder?: string;
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
        placeholder={placeholder}
        required={required}
        min={min}
        step={step}
        className="input"
      />
    </div>
  );
}
