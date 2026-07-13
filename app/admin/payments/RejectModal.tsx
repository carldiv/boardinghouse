"use client";

import { useActionState } from "react";
import { rejectPayment } from "@/actions/payments";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function RejectModal({
  paymentId,
  tenantName,
  month,
  amount,
  backUrl,
}: {
  paymentId: string;
  tenantName: string;
  month: string;
  amount: string;
  backUrl: string;
}) {
  const router = useRouter();
  const [state, action, pending] = useActionState(rejectPayment, undefined);

  useEffect(() => {
    if (state?.success) router.push(backUrl);
  }, [state, router, backUrl]);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.75)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 100,
        padding: "1.5rem",
      }}
    >
      <div
        className="card animate-in"
        style={{ maxWidth: "420px", width: "100%", padding: "2rem" }}
      >
        <h2 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#e8eaf0", margin: "0 0 0.5rem" }}>
          Reject Payment
        </h2>
        <p style={{ color: "#64748b", fontSize: "0.875rem", marginBottom: "1.5rem" }}>
          <strong style={{ color: "#cbd5e1" }}>{tenantName}</strong> — {month} · {amount}
        </p>

        <form action={action} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <input type="hidden" name="id" value={paymentId} />

          <div>
            <label
              htmlFor="admin_note"
              style={{ display: "block", marginBottom: "0.4rem", fontSize: "0.85rem", color: "#94a3b8", fontWeight: 500 }}
            >
              Reason / Note (optional)
            </label>
            <textarea
              id="admin_note"
              name="admin_note"
              rows={3}
              placeholder="e.g. Reference number not found"
              className="input"
              style={{ resize: "vertical" }}
            />
          </div>

          {state?.error && (
            <div style={{ color: "#ef4444", fontSize: "0.85rem" }}>{state.error}</div>
          )}

          <div style={{ display: "flex", gap: "0.75rem" }}>
            <a
              href={backUrl}
              className="btn btn-ghost"
              style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", textDecoration: "none" }}
            >
              Cancel
            </a>
            <button
              id="confirm-reject"
              type="submit"
              disabled={pending}
              className="btn btn-danger"
              style={{ flex: 2, display: "flex", alignItems: "center", justifyContent: "center", gap: "0.4rem", opacity: pending ? 0.75 : 1, transition: "opacity 0.2s" }}
            >
              {pending && (
                <svg
                  className="animate-spin"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  width={14}
                  height={14}
                  aria-hidden
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              )}
              {pending ? "Rejecting…" : "Reject Payment"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
