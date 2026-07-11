import { createSupabaseServerClient } from "@/lib/supabase/server";
import Image from "next/image";
import SettingsForm from "./SettingsForm";
import type { Settings } from "@/lib/utils";

export const metadata = { title: "Settings — BH Manager" };

export default async function SettingsPage() {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.from("settings").select("*").eq("id", 1).single();

  const settings: Settings = data ?? { gcash_name: null, gcash_number: null, qr_image_url: null };

  return (
    <div className="animate-in" style={{ maxWidth: "560px" }}>
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "1.6rem", fontWeight: 700, margin: 0, color: "#e8eaf0" }}>
          Settings
        </h1>
        <p style={{ color: "#64748b", marginTop: "0.25rem", fontSize: "0.9rem" }}>
          GCash payment details shown to all tenants.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 200px", gap: "1.5rem", alignItems: "start" }}>
        <div className="card">
          <SettingsForm settings={settings} />
        </div>

        {/* QR Preview */}
        <div>
          <p style={{ fontSize: "0.8rem", color: "#64748b", marginBottom: "0.75rem", textAlign: "center" }}>
            Current QR
          </p>
          <div
            style={{
              background: "#fff",
              borderRadius: "1rem",
              padding: "1rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              minHeight: "180px",
              border: "2px solid #263044",
            }}
          >
            {settings.qr_image_url ? (
              <Image
                src={settings.qr_image_url}
                alt="GCash QR Code"
                width={160}
                height={160}
                style={{ objectFit: "contain" }}
              />
            ) : (
              <div style={{ color: "#94a3b8", fontSize: "0.8rem", textAlign: "center" }}>
                No QR uploaded yet
              </div>
            )}
          </div>
          {settings.gcash_name && (
            <div style={{ textAlign: "center", marginTop: "0.75rem" }}>
              <div style={{ fontWeight: 700, color: "#e2e8f0" }}>{settings.gcash_name}</div>
              <div style={{ color: "#10b981", fontWeight: 600, fontSize: "0.9rem" }}>{settings.gcash_number}</div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @media (max-width: 600px) {
          div[style*="1fr 200px"] { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
