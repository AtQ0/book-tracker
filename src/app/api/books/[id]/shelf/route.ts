import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { SetShelfSchema } from "@/lib/validations/shelf";
import { getBookById, setShelfStatusForUser } from "@/server/books";

export async function POST(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: bookId } = await ctx.params;

  const body = await req.json().catch(() => ({}));
  const parsed = SetShelfSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  await setShelfStatusForUser({ userId, bookId, status: parsed.data.status });

  const updated = await getBookById(bookId, userId);
  return NextResponse.json(updated);
}
