"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { updateTenant } from "@/actions/tenants";
import Link from "next/link";
import type { TenantRow } from "@/lib/utils";

interface EditTenantFormProps {
  tenant: TenantRow;
}

export default function EditTenantForm({ tenant }: EditTenantFormProps) {
  const router = useRouter();
  const [state, action, pending] = useActionState(updateTenant, undefined);

  useEffect(() => {
    if (state?.success) {
      router.push(`/admin/tenants/${tenant.id}`);
    }
  }, [state, router, tenant.id]);

  return (
    <div style={{ backgroundColor: "#161b27", border: "1px solid #263044", borderRadius: "1rem", padding: "2rem", boxShadow: "0 25px 50px rgba(0,0,0,0.4)" }}>
      <div style={{ marginBottom: "1.75rem" }}>
        <h1 style={{ fontSize: "1.4rem", fontWeight: 700, margin: 0, color: "#e8eaf0" }}>Edit Tenant Profile</h1>
        <p style={{ color: "#64748b", fontSize: "0.85rem", margin: "0.25rem 0 0" }}>Update room assignment or payment settings.</p>
      </div>

      <form action={action} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
        <input type="hidden" name="id" value={tenant.id} />

        <Field label="Full Name" id="edit-name" name="name" defaultValue={tenant.name} required />

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
          <Field label="Room" id="edit-room" name="room" defaultValue={tenant.room} required />
          <Field label="Monthly Rent (₱)" id="edit-rent" name="rent_amount" type="number" defaultValue={String(tenant.rent_amount)} min="1" step="0.01" required />
        </div>

        <div>
          <label htmlFor="edit-due-day" style={{ display: "block", marginBottom: "0.4rem", fontSize: "0.85rem", color: "#94a3b8", fontWeight: 500 }}>
            Rent Due Day (1–31)
          </label>
          <select id="edit-due-day" name="due_day" className="input" defaultValue={tenant.due_day}>
            {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
              <option key={d} value={d} style={{ background: "#1e2535" }}>Day {d}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="edit-move-in" style={{ display: "block", marginBottom: "0.4rem", fontSize: "0.85rem", color: "#94a3b8", fontWeight: 500 }}>
            Move-in Month <span style={{ color: "#475569", fontWeight: 400 }}>(sets when rent starts)</span>
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
          <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: "0.5rem", padding: "0.75rem 1rem", color: "#ef4444", fontSize: "0.875rem" }}>
            {state.error}
          </div>
        )}

        <div style={{ display: "flex", gap: "0.75rem", paddingTop: "0.5rem" }}>
          <Link href={`/admin/tenants/${tenant.id}`} className="btn btn-ghost" style={{ flex: 1, textAlign: "center", textDecoration: "none" }}>
            Cancel
          </Link>
          <button id="submit-edit-tenant" type="submit" disabled={pending} className="btn btn-primary" style={{ flex: 2 }}>
            {pending ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({ label, id, name, type = "text", defaultValue, required, min, step }: {
  label: string; id: string; name: string; type?: string;
  defaultValue?: string; required?: boolean; min?: string; step?: string;
}) {
  return (
    <div>
      <label htmlFor={id} style={{ display: "block", marginBottom: "0.4rem", fontSize: "0.85rem", color: "#94a3b8", fontWeight: 500 }}>{label}</label>
      <input id={id} name={name} type={type} defaultValue={defaultValue} required={required} min={min} step={step} className="input" />
    </div>
  );
}
