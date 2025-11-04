import { NextResponse } from "next/server";

// Helper to send JSON responses with no caching
export function json(body: unknown, status: number) {
  const res = NextResponse.json(body, { status });
  res.headers.set("Cache-Control", "no-store");
  return res;
}

export function problem(
  status: number,
  title: string,
  detail?: string,
  extra?: Record<string, unknown>
) {
  const res = new NextResponse(
    JSON.stringify({
      type: "about:blank",
      title,
      status,
      ...(detail ? { detail } : {}),
      ...(extra ?? {}),
    }),
    {
      status,
      headers: {
        "content-type": "application/problem+json",
        "Cache-Control": "no-store",
      },
    }
  );
  return res;
}
