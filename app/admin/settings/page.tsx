import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getSession } from "@/lib/session";
import Image from "next/image";
import SettingsForm from "./SettingsForm";
import ProfileForm from "./ProfileForm";
import type { Settings } from "@/lib/utils";

export const metadata = { title: "Settings — BH Manager" };

export default async function SettingsPage() {
  const supabase = await createSupabaseServerClient();
  const session = await getSession();

  const { data } = await supabase.from("settings").select("*").eq("id", 1).single();

  const settings: Settings = data ?? { gcash_name: null, gcash_number: null, qr_image_url: null };

  const currentEmail = session?.user?.email ?? "";
  const currentName = session?.user?.user_metadata?.name ?? "";

  return (
    <div className="animate-in" style={{ maxWidth: "1000px" }}>
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "1.6rem", fontWeight: 700, margin: 0, color: "#e8eaf0" }}>
          Settings
        </h1>
        <p style={{ color: "#64748b", marginTop: "0.25rem", fontSize: "0.9rem" }}>
          Manage your account profile and GCash payment settings.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem", alignItems: "start" }} className="settings-grid">
        {/* Account Profile Form */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          <h2 style={{ fontSize: "1.15rem", fontWeight: 600, color: "#e2e8f0", margin: 0 }}>
            Account Profile
          </h2>
          <div className="card">
            <ProfileForm initialName={currentName} initialEmail={currentEmail} />
          </div>
        </div>

        {/* GCash Settings Form */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          <h2 style={{ fontSize: "1.15rem", fontWeight: 600, color: "#e2e8f0", margin: 0 }}>
            GCash Configuration
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 160px", gap: "1.25rem", alignItems: "start" }} className="gcash-form-grid">
            <div className="card">
              <SettingsForm settings={settings} />
            </div>

            {/* QR Preview */}
            <div>
              <p style={{ fontSize: "0.8rem", color: "#64748b", marginBottom: "0.5rem", textAlign: "center" }}>
                Current QR
              </p>
              <div
                style={{
                  background: "#fff",
                  borderRadius: "1rem",
                  padding: "0.75rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  minHeight: "150px",
                  border: "2px solid #263044",
                }}
              >
                {settings.qr_image_url ? (
                  <Image
                    src={settings.qr_image_url}
                    alt="GCash QR Code"
                    width={130}
                    height={130}
                    style={{ objectFit: "contain" }}
                  />
                ) : (
                  <div style={{ color: "#94a3b8", fontSize: "0.8rem", textAlign: "center" }}>
                    No QR uploaded yet
                  </div>
                )}
              </div>
              {settings.gcash_name && (
                <div style={{ textAlign: "center", marginTop: "0.5rem" }}>
                  <div style={{ fontWeight: 700, color: "#e2e8f0", fontSize: "0.85rem" }}>{settings.gcash_name}</div>
                  <div style={{ color: "#10b981", fontWeight: 600, fontSize: "0.8rem" }}>{settings.gcash_number}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .settings-grid { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 500px) {
          .gcash-form-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
