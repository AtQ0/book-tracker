import { NextResponse } from "next/server";
import { z } from "zod";
import { BookListQuerySchema, AddBookDTOSchema } from "@/lib/validations/book";
import { getBooksFromDb, addBookToDb } from "@/server/books";

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

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));

  const parsed = AddBookDTOSchema.safeParse(body);
  if (!parsed.success) {
    const details = z.treeifyError(parsed.error);
    return NextResponse.json(
      { error: "Invalid body", details },
      { status: 400 },
    );
  }

  const created = await addBookToDb(parsed.data);
  return NextResponse.json(created, { status: 201 });
}
