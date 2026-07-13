"use client";

import { useActionState, useState } from "react";
import { updateProfile } from "@/actions/profile";

interface ProfileFormProps {
  initialName: string;
  initialEmail: string;
}

export default function ProfileForm({ initialName, initialEmail }: ProfileFormProps) {
  const [state, action, pending] = useActionState(updateProfile, undefined);
  const [password, setPassword] = useState("");

  return (
    <form action={action} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      <div>
        <label
          htmlFor="name"
          style={{ display: "block", marginBottom: "0.4rem", fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 500 }}
        >
          Full Name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          defaultValue={initialName}
          placeholder="e.g. Juan dela Cruz"
          className="input"
          required
        />
      </div>

      <div>
        <label
          htmlFor="email"
          style={{ display: "block", marginBottom: "0.4rem", fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 500 }}
        >
          Email Address
        </label>
        <input
          id="email"
          name="email"
          type="email"
          defaultValue={initialEmail}
          placeholder="admin@email.com"
          className="input"
          required
        />
      </div>

      <div>
        <label
          htmlFor="password"
          style={{ display: "block", marginBottom: "0.4rem", fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 500 }}
        >
          New Password (leave blank to keep current)
        </label>
        <input
          id="password"
          name="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          className="input"
        />
      </div>

      {state?.error && (
        <div style={{ color: "var(--color-danger)", fontSize: "0.875rem", background: "rgba(239,68,68,0.1)", padding: "0.75rem", borderRadius: "0.5rem" }}>
          {state.error}
        </div>
      )}
      {state?.success && (
        <div style={{ color: "var(--color-success)", fontSize: "0.875rem", background: "rgba(16,185,129,0.1)", padding: "0.75rem", borderRadius: "0.5rem" }}>
          ✓ Profile updated successfully!
        </div>
      )}

      <button
        id="save-profile"
        type="submit"
        disabled={pending}
        className="btn btn-primary"
      >
        {pending ? "Saving…" : "Save Profile Details"}
      </button>
    </form>
  );
}
