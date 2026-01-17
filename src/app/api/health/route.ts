import { NextResponse } from "next/server";

// Endpoint used by renders cron job to check "health" and thus avoid cold start
export async function GET() {
  return NextResponse.json({ status: "ok" });
}
