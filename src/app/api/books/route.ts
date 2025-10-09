import { NextResponse } from "next/server";
import { BookListQuerySchema } from "@/lib/validations/book";
import { z } from "zod";
import { getBooksFromDb } from "@/server/books";

export async function GET(req: Request) {
  const url = new URL(req.url);

  // Validate ?sort= with Zod
  const parsed = BookListQuerySchema.safeParse({
    sort: url.searchParams.get("sort") ?? undefined,
  });

  // On validation failure, return treeified Zod errors and exit the route handler
  if (!parsed.success) {
    const details = z.treeifyError(parsed.error);
    return NextResponse.json(
      { error: "Invalid query", details },
      { status: 400 }
    );
  }

  // On validation success, extract sort value from the query (derived from searchParams)
  const { sort } = parsed.data;

  // Get data from the server helper and return as JSON
  const dto = await getBooksFromDb(sort);
  return NextResponse.json(dto);
}
