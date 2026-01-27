import { NextResponse } from "next/server";
import { BookListQuerySchema } from "@/lib/validations/book";
import { z } from "zod";
import { getBooksFromDb } from "@/server/books";

export async function GET(req: Request) {
  const url = new URL(req.url);

  const parsed = BookListQuerySchema.safeParse({
    sort: url.searchParams.get("sort") ?? undefined,
  });

  if (!parsed.success) {
    const details = z.treeifyError(parsed.error);
    return NextResponse.json(
      { error: "Invalid query", details },
      { status: 400 },
    );
  }

  const { sort } = parsed.data;

  const dto = await getBooksFromDb(sort);
  return NextResponse.json(dto);
}
