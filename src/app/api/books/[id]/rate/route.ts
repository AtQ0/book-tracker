import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth/options";
import { getBookById, rateBookForUser } from "@/server/books";

const BodySchema = z
  .object({
    rating: z.number().int().min(1).max(5),
  })
  .strict();

export async function POST(
  _req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: bookId } = await ctx.params;

  let body: unknown;
  try {
    body = await _req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid body", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  await rateBookForUser({
    userId,
    bookId,
    rating: parsed.data.rating,
  });

  // Return fresh BookDTO for this user so UI updates immediately
  const updated = await getBookById(bookId, userId);
  if (!updated) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(updated, { status: 200 });
}
