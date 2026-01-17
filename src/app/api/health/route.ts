import { NextResponse } from "next/server";

// Used by Renders cron job to check "health" every 10min and avoid cold start
export async function GET() {
  return NextResponse.json({ status: "ok" });
}
