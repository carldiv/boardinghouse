import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getSession } from "@/lib/session";
import ProfileForm from "@/app/admin/settings/ProfileForm";

export const metadata = { title: "Profile Settings — BH Manager" };

export default async function TenantSettingsPage() {
  const session = await getSession();

  const currentEmail = session?.user?.email ?? "";
  const currentName = session?.user?.user_metadata?.name ?? "";

  return (
    <div className="animate-in" style={{ maxWidth: "560px", margin: "0 auto", padding: "1.5rem" }}>
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 700, margin: 0, color: "#e8eaf0" }}>
          Profile Settings
        </h1>
        <p style={{ color: "#64748b", marginTop: "0.25rem", fontSize: "0.85rem" }}>
          Update your full name, login email address, or update your password.
        </p>
      </div>

      <div className="card">
        <ProfileForm initialName={currentName} initialEmail={currentEmail} />
      </div>
    </div>
  );
}
