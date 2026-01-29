import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;

  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      name: true,
      userBooks: {
        select: {
          bookId: true,
          status: true,
        },
      },
    },
  });

  if (!user) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const dto = {
    id: user.id,
    username: (user.name?.trim() || user.email).trim(),
    shelf: user.userBooks.map((ub) => ({
      bookId: ub.bookId,
      status: ub.status,
    })),
  };

  return NextResponse.json(dto);
}
