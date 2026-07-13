import { createSupabaseServerClient } from "@/lib/supabase/server";
import { type TenantRow } from "@/lib/utils";
import Link from "next/link";
import { notFound } from "next/navigation";
import EditTenantForm from "./EditTenantForm";

export const metadata = { title: "Edit Tenant — BH Manager" };

export default async function EditTenantPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();

  const { data: tenant } = await supabase.from("tenants").select("*").eq("id", id).single();

  if (!tenant) notFound();

  const t = tenant as TenantRow;

  return (
    <div className="animate-in" style={{ maxWidth: "560px" }}>
      {/* Back link */}
      <Link
        href={`/admin/tenants/${id}`}
        style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", color: "var(--text-muted)", fontSize: "0.9rem", marginBottom: "1.5rem", textDecoration: "none" }}
      >
        ← Back to Profile
      </Link>

      <EditTenantForm tenant={t} />
    </div>
  );
}
