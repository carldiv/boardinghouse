import Link from "next/link";
import { redirect } from "next/navigation";
import { getRole, getSession } from "@/lib/session";
import { logout } from "@/actions/auth";
import IdleLogout from "@/lib/IdleLogout";

const navItems = [
  {
    href: "/admin/dashboard",
    label: "Dashboard",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="2" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="2" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="2" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="2" />
      </svg>
    ),
  },
  {
    href: "/admin/tenants",
    label: "Tenants",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    href: "/admin/payments",
    label: "Payments",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <rect x="1" y="4" width="22" height="16" rx="2" stroke="currentColor" strokeWidth="2" />
        <path d="M1 10h22" stroke="currentColor" strokeWidth="2" />
      </svg>
    ),
  },
  {
    href: "/admin/settings",
    label: "Settings",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" stroke="currentColor" strokeWidth="2" />
      </svg>
    ),
  },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Run both checks in parallel instead of sequentially — this was
  // doubling latency on every single nav click before.
  const [role, session] = await Promise.all([getRole(), getSession()]);
  if (role !== "admin") redirect("/login");

  const adminEmail = session?.user?.email ?? "Admin";

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      {/* Sidebar */}
      <aside
        style={{
          width: "240px",
          background: "#161b27",
          borderRight: "1px solid #263044",
          display: "flex",
          flexDirection: "column",
          position: "fixed",
          top: 0,
          left: 0,
          bottom: 0,
          zIndex: 50,
          overflowY: "auto",
        }}
        className="admin-sidebar"
      >
        {/* Brand */}
        <div
          style={{
            padding: "1.5rem",
            borderBottom: "1px solid #263044",
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
          }}
        >
          <div
            style={{
              width: "38px",
              height: "38px",
              background: "linear-gradient(135deg, #6366f1, #4f46e5)",
              borderRadius: "10px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              boxShadow: "0 4px 12px rgba(99,102,241,0.35)",
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M9 22V12h6v10" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div>
            <div className="gradient-text" style={{ fontWeight: 700, fontSize: "0.95rem" }}>
              BH Manager
            </div>
            <div style={{ fontSize: "0.7rem", color: "#475569" }}>Admin</div>
          </div>
        </div>

        {/* Nav links */}
        <nav style={{ flex: 1, padding: "1rem 0.75rem" }}>
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                padding: "0.65rem 0.85rem",
                borderRadius: "0.6rem",
                color: "#64748b",
                textDecoration: "none",
                fontSize: "0.88rem",
                fontWeight: 500,
                marginBottom: "0.25rem",
                transition: "all 0.15s",
              }}
              className="admin-nav-link"
            >
              <span style={{ flexShrink: 0 }}>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        {/* User info + logout */}
        <div
          style={{
            padding: "1rem",
            borderTop: "1px solid #263044",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.75rem" }}>
            <div
              style={{
                width: "32px",
                height: "32px",
                background: "linear-gradient(135deg, #6366f1, #4f46e5)",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                fontSize: "0.8rem",
                fontWeight: 700,
                color: "#fff",
              }}
            >
              {adminEmail[0].toUpperCase()}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: "0.78rem", fontWeight: 600, color: "#cbd5e1", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {adminEmail}
              </div>
              <div style={{ fontSize: "0.68rem", color: "#475569" }}>Administrator</div>
            </div>
          </div>

          <form action={logout}>
            <button
              id="admin-logout"
              type="submit"
              className="btn btn-ghost"
              style={{ width: "100%", fontSize: "0.8rem" }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Sign out
            </button>
          </form>
        </div>
      </aside>

      {/* Main content */}
      <main
        style={{
          flex: 1,
          marginLeft: "240px",
          padding: "2rem",
          minHeight: "100vh",
        }}
        className="admin-main"
      >
        {children}
      </main>

      <IdleLogout />

      <style>{`
        .admin-nav-link:hover {
          background: rgba(99,102,241,0.1);
          color: #818cf8;
        }
        
        /* Fix modal overlay layout positioning under fixed headers/sidebars */
        .modal-overlay-container {
          position: fixed;
          top: 0;
          right: 0;
          bottom: 0;
          left: 0;
          z-index: 9999;
          background-color: rgba(10, 14, 23, 0.8);
          backdrop-filter: blur(4px);
          overflow-y: auto; /* Enable scroll on the overlay backdrop itself */
          padding: 2rem 1rem;
          text-align: center;
          white-space: nowrap;
        }

        /* Ghost helper element to vertical-align center modal card */
        .modal-overlay-container::before {
          content: '';
          display: inline-block;
          height: 100%;
          vertical-align: middle;
          margin-right: -0.25em; /* Adjusts spacing */
        }

        .modal-overlay-container > div {
          display: inline-block;
          vertical-align: middle;
          white-space: normal;
          text-align: left;
          width: 100%;
        }

        @media (max-width: 768px) {
          .admin-sidebar {
            width: 100% !important;
            position: static !important;
            height: auto !important;
            flex-direction: row !important;
            overflow-x: auto;
            overflow-y: hidden !important;
          }
          .admin-main {
            margin-left: 0 !important;
          }
        }
      `}</style>
    </div>
  );
}