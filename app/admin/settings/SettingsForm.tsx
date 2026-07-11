"use client";

import { useActionState, useState } from "react";
import { updateSettings } from "@/actions/settings";
import type { Settings } from "@/lib/utils";

export default function SettingsForm({ settings }: { settings: Settings }) {
  const [state, action, pending] = useActionState(updateSettings, undefined);
  const [preview, setPreview] = useState<string | null>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPreview(url);
    }
  }

  return (
    <form action={action} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      <div>
        <label
          htmlFor="gcash_name"
          style={{ display: "block", marginBottom: "0.4rem", fontSize: "0.85rem", color: "#94a3b8", fontWeight: 500 }}
        >
          GCash Account Name
        </label>
        <input
          id="gcash_name"
          name="gcash_name"
          type="text"
          defaultValue={settings.gcash_name ?? ""}
          placeholder="Juan dela Cruz"
          className="input"
        />
      </div>

      <div>
        <label
          htmlFor="gcash_number"
          style={{ display: "block", marginBottom: "0.4rem", fontSize: "0.85rem", color: "#94a3b8", fontWeight: 500 }}
        >
          GCash Number
        </label>
        <input
          id="gcash_number"
          name="gcash_number"
          type="tel"
          defaultValue={settings.gcash_number ?? ""}
          placeholder="09XX XXX XXXX"
          className="input"
        />
      </div>

      <div>
        <label
          htmlFor="qr_image"
          style={{ display: "block", marginBottom: "0.4rem", fontSize: "0.85rem", color: "#94a3b8", fontWeight: 500 }}
        >
          GCash QR Code Image
        </label>
        <div
          style={{
            border: "2px dashed #2d3a52",
            borderRadius: "0.75rem",
            padding: "1.5rem",
            textAlign: "center",
            cursor: "pointer",
            transition: "border-color 0.15s",
            position: "relative",
          }}
          onDragOver={(e) => e.preventDefault()}
        >
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt="QR Preview" style={{ maxHeight: "120px", objectFit: "contain", margin: "0 auto" }} />
          ) : (
            <>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" style={{ margin: "0 auto 0.5rem", display: "block" }}>
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <div style={{ color: "#64748b", fontSize: "0.85rem" }}>
                Click or drag to upload QR image
              </div>
            </>
          )}
          <input
            id="qr_image"
            name="qr_image"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            style={{ opacity: 0, position: "absolute", inset: 0, cursor: "pointer" }}
          />
        </div>
      </div>

      {state?.error && (
        <div style={{ color: "#ef4444", fontSize: "0.875rem", background: "rgba(239,68,68,0.1)", padding: "0.75rem", borderRadius: "0.5rem" }}>
          {state.error}
        </div>
      )}
      {state?.success && (
        <div style={{ color: "#10b981", fontSize: "0.875rem", background: "rgba(16,185,129,0.1)", padding: "0.75rem", borderRadius: "0.5rem" }}>
          ✓ Settings saved!
        </div>
      )}

      <button
        id="save-settings"
        type="submit"
        disabled={pending}
        className="btn btn-primary"
      >
        {pending ? "Saving…" : "Save Settings"}
      </button>
    </form>
  );
}