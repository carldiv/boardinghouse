import { NextResponse, type NextRequest } from "next/server";
import { notifyOverdueTenants } from "@/lib/notify-overdue";

export async function GET(request: NextRequest) {
  return handleRequest(request);
}

export async function POST(request: NextRequest) {
  return handleRequest(request);
}

async function handleRequest(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  
  // Protect with CRON_SECRET if defined
  const cronSecret = process.env.CRON_SECRET;
  
  // Diagnostic logs (visible in Vercel Logs)
  console.log("[DEBUG CRON] CRON_SECRET length on Vercel:", cronSecret ? cronSecret.length : 0);
  console.log("[DEBUG CRON] Authorization Header present:", !!authHeader);
  if (authHeader && cronSecret) {
    console.log("[DEBUG CRON] Token match:", authHeader === `Bearer ${cronSecret}`);
  }

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return new NextResponse("Unauthorized", { status: 401 });
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
