import { NextResponse } from "next/server";

// Lightweight keep-warm endpoint — called by GitHub Actions every 5 minutes
// to prevent Vercel serverless cold starts
export async function GET() {
  return NextResponse.json({ ok: true, ts: Date.now() });
}
