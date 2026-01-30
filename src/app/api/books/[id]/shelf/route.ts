import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth/options";
import { ShelfStatusSchema } from "@/lib/validations/shelf";
import { prisma } from "@/lib/db";
import { getBookById, setShelfStatusForUser } from "@/server/books";

const BodySchema = z.object({ status: ShelfStatusSchema }).strict();

export async function POST(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Ensure user exists (avoid FK 500)
  const userExists = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true },
  });
  if (!userExists) {
    return NextResponse.json(
      { error: "Auth session is stale. Please sign out and sign in again." },
      { status: 401 },
    );
  }

  const { id: bookId } = await ctx.params;

  const parsed = BodySchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  await setShelfStatusForUser({ userId, bookId, status: parsed.data.status });

  const updated = await getBookById(bookId, userId);
  if (!updated)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json(updated);
}
