import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

// GET /api/check-ref?ref=<ref_number>&excludeId=<payment_id>
// Returns { duplicate: boolean, status?: string }
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const ref = searchParams.get("ref")?.trim();
  const excludeId = searchParams.get("excludeId"); // optional: ignore a specific payment (for admin edits)

  if (!ref || ref.length < 3) {
    return NextResponse.json({ duplicate: false });
  }

  const supabase = await createSupabaseServerClient();

  let query = supabase
    .from("payments")
    .select("id, status, tenant_id, month")
    .eq("ref_number", ref)
    .neq("status", "rejected")
    .limit(1);

  if (excludeId) {
    query = query.neq("id", excludeId);
  }

  const { data } = await query;

  if (data && data.length > 0) {
    return NextResponse.json({ duplicate: true, status: data[0].status });
  }

  return NextResponse.json({ duplicate: false });
}
