import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getRole, getTenantRow } from "@/lib/session";
import { logout } from "@/actions/auth";
import BottomNav from "./BottomNav";
import SettingsMenu from "./SettingsMenu";
import IdleLogout from "@/lib/IdleLogout";

export default async function TenantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const role = await getRole();
  if (!role) redirect("/login");
  if (role === "admin") redirect("/admin/dashboard");

  const tenant = await getTenantRow();
  if (!tenant) redirect("/login");

  return (
    <div className="dashboard-shell">
      <header className="dashboard-header">
        <div className="flex items-center gap-2.5">
          <div className="header-avatar">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path
                d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"
                stroke="#fff"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M9 22V12h6v10"
                stroke="#fff"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div>
            <div className="gradient-text text-sm font-bold leading-tight">
              BH Manager
            </div>
            <div className="text-xs leading-tight text-[#94a3b8]">
              {tenant.name} · Room {tenant.room}
            </div>
          </div>
        </div>

        <SettingsMenu logoutAction={logout} />
      </header>

      <main className="dashboard-main">{children}</main>

      <BottomNav />
      <IdleLogout />
    </div>
  );
}
