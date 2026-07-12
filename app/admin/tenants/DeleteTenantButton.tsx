"use client";

import { deleteTenant } from "@/actions/tenants";

interface DeleteTenantButtonProps {
  tenantId: string;
  tenantName: string;
}

export default function DeleteTenantButton({ tenantId, tenantName }: DeleteTenantButtonProps) {
  async function handleDelete(e: React.FormEvent) {
    e.preventDefault();
    
    const confirmed = window.confirm(
      `⚠️ WARNING: Are you sure you want to delete ${tenantName}?\n\nThis will permanently delete this tenant, their linked login account, and ALL of their rent payment history. This action cannot be undone.`
    );
    
    if (confirmed) {
      try {
        await deleteTenant(tenantId);
      } catch (err: any) {
        alert("Failed to delete tenant: " + err.message);
      }
    }
  }

  return (
    <form onSubmit={handleDelete}>
      <button
        id={`delete-tenant-${tenantId}`}
        type="submit"
        className="btn btn-danger btn-sm"
      >
        Delete
      </button>
    </form>
  );
}
