"use client";

import { useActionState } from "react";
import { updateTenant } from "@/actions/tenants";
import type { TenantRow } from "@/lib/utils";

export default function EditTenantForm({ tenant }: { tenant: TenantRow }) {
  const [state, action, pending] = useActionState(updateTenant, undefined);

  return (
    <form action={action} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <input type="hidden" name="id" value={tenant.id} />

      <Field label="Full Name" id="edit-name" name="name" defaultValue={tenant.name} required />
      <Field label="Room" id="edit-room" name="room" defaultValue={tenant.room} required />
      <Field label="Monthly Rent (₱)" id="edit-rent" name="rent_amount" type="number" defaultValue={String(tenant.rent_amount)} min="1" step="0.01" required />

      <div>
        <label
          htmlFor="edit-due-day"
          style={{ display: "block", marginBottom: "0.4rem", fontSize: "0.85rem", color: "#94a3b8", fontWeight: 500 }}
        >
          Due Day
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
        <div style={{ color: "#ef4444", fontSize: "0.85rem" }}>{state.error}</div>
      )}
      {state?.success && (
        <div style={{ color: "#10b981", fontSize: "0.85rem" }}>✓ Saved!</div>
      )}

      <button
        id="save-tenant"
        type="submit"
        disabled={pending}
        className="btn btn-primary"
        style={{ marginTop: "0.25rem" }}
      >
        {pending ? "Saving…" : "Save Changes"}
      </button>
    </form>
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
