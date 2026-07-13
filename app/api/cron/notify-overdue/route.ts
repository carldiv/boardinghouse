import { NextResponse, type NextRequest } from "next/server";
import { notifyOverdueTenants } from "@/lib/notify-overdue";

export async function GET(request: NextRequest) {
  return handleRequest(request);
}

export async function POST(request: NextRequest) {
  return handleRequest(request);
}

async function handleRequest(request: NextRequest) {
  // Verify the request is authorized with the CRON_SECRET
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    return NextResponse.json(
      { success: false, error: "Server misconfiguration: CRON_SECRET is not set." },
      { status: 500 }
    );
  }

  const authHeader = request.headers.get("authorization");
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (token !== cronSecret) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const report = await notifyOverdueTenants();
    return NextResponse.json({
      success: true,
      message: `Sent ${report.successCount} overdue notification(s)`,
      results: report.results,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to send notifications" },
      { status: 500 }
    );
  }
}
