import { NextResponse } from "next/server";

// Helper that returns a normal JSON response (success or client error) with cache disabled
export function json(body: unknown, status: number) {
  const res = NextResponse.json(body, { status });
  res.headers.set("Cache-Control", "no-store");
  return res;
}

// Helper that returns a standardized RFC 7807 error response with cache disabled
export function problem(
  status: number,
  title: string,
  detail?: string,
  extra?: Record<string, unknown>
) {
  // Create a new NextResponse manually
  const res = new NextResponse(
    // Build the body of the response
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
