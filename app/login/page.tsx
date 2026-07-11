"use client";

import { useActionState } from "react";
import { login } from "@/actions/auth";

export default function LoginPage() {
  const [state, action, pending] = useActionState(login, undefined);

  return (
    <div className="animate-in" style={{ width: "100%", maxWidth: "420px" }}>
      {/* Logo / Brand */}
      <div style={{ textAlign: "center", marginBottom: "2rem" }}>
        <div
          style={{
            width: "56px",
            height: "56px",
            background: "linear-gradient(135deg, #6366f1, #4f46e5)",
            borderRadius: "16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 1rem",
            boxShadow: "0 8px 32px rgba(99,102,241,0.4)",
          }}
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
            <path
              d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"
              stroke="#fff"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M9 22V12h6v10"
              stroke="#fff"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <h1
          className="gradient-text"
          style={{ fontSize: "1.6rem", fontWeight: 700, margin: 0 }}
        >
          BH Manager
        </h1>
        <p style={{ color: "#64748b", marginTop: "0.4rem", fontSize: "0.9rem" }}>
          Sign in to your account
        </p>
      </div>

      {/* Card */}
      <div className="card" style={{ padding: "2rem" }}>
        <form action={action} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          <div>
            <label
              htmlFor="email"
              style={{ display: "block", marginBottom: "0.4rem", fontSize: "0.85rem", color: "#94a3b8", fontWeight: 500 }}
            >
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder="you@example.com"
              className="input"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              style={{ display: "block", marginBottom: "0.4rem", fontSize: "0.85rem", color: "#94a3b8", fontWeight: 500 }}
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              placeholder="••••••••"
              className="input"
            />
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

          <button
            id="login-submit"
            type="submit"
            disabled={pending}
            className="btn btn-primary"
            style={{ marginTop: "0.25rem", padding: "0.75rem" }}
          >
            {pending ? (
              <>
                <span className="spinner" />
                Signing in…
              </>
            ) : (
              "Sign in"
            )}
          </button>
        </form>
      </div>

      <p style={{ textAlign: "center", marginTop: "1.5rem", fontSize: "0.8rem", color: "#475569" }}>
        Contact your admin if you need access.
      </p>

      <style>{`
        .spinner {
          display: inline-block;
          width: 14px;
          height: 14px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.6s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
