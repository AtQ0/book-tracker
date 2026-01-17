import { NextResponse } from "next/server";

// Used by external monitor (UptimeRobot) to prevent Render cold starts
export async function GET() {
  return NextResponse.json({ status: "ok" });
}
