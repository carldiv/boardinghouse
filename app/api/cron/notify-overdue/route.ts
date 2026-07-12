import { NextResponse, type NextRequest } from "next/server";
import { notifyOverdueTenants } from "@/lib/notify-overdue";

export async function GET(request: NextRequest) {
  return handleRequest(request);
}

export async function POST(request: NextRequest) {
  return handleRequest(request);
}

async function handleRequest(_request: NextRequest) {
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
