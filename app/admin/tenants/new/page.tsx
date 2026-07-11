"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { createTenant } from "@/actions/tenants";
import Link from "next/link";

export default function NewTenantPage() {
  const router = useRouter();
  const [state, action, pending] = useActionState(createTenant, undefined);

  useEffect(() => {
    if (state?.success) {
      router.push("/admin/tenants");
    }
  }, [state, router]);

  return (
    <div className="animate-in" style={{ maxWidth: "560px" }}>
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "1.6rem", fontWeight: 700, margin: 0, color: "#e8eaf0" }}>
          Add Tenant
        </h1>
        <p style={{ color: "#64748b", marginTop: "0.25rem", fontSize: "0.9rem" }}>
          Creates a login account with a temporary password for the tenant.
        </p>
      </div>

      <div className="card">
        <form action={action} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          <Field label="Full Name" id="name" name="name" placeholder="Juan dela Cruz" required />
          <Field label="Email Address" id="email" name="email" type="email" placeholder="tenant@email.com" required />
          <Field label="Temporary Password" id="password" name="password" type="password" placeholder="Minimum 6 characters" required />

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <Field label="Room" id="room" name="room" placeholder="101" required />
            <Field label="Monthly Rent (₱)" id="rent_amount" name="rent_amount" type="number" placeholder="3500" min="1" step="0.01" required />
          </div>

          <div>
            <label
              htmlFor="due_day"
              style={{ display: "block", marginBottom: "0.4rem", fontSize: "0.85rem", color: "#94a3b8", fontWeight: 500 }}
            >
              Rent Due Day (1–31)
            </label>
            <select id="due_day" name="due_day" className="input" required defaultValue="1">
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

          <div style={{ display: "flex", gap: "0.75rem", paddingTop: "0.25rem" }}>
            <Link
              href="/admin/tenants"
              className="btn btn-ghost"
              style={{ flex: 1, textDecoration: "none", display: "flex", alignItems: "center", justifyContent: "center" }}
            >
              Cancel
            </Link>
            <button
              id="submit-new-tenant"
              type="submit"
              disabled={pending}
              className="btn btn-primary"
              style={{ flex: 2 }}
            >
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
        style={{ display: "block", marginBottom: "0.4rem", fontSize: "0.85rem", color: "#94a3b8", fontWeight: 500 }}
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
