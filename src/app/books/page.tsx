import BookListClient from "@/app/books/BookListClient";
import { BookListQuerySchema, type BookDTO } from "@/lib/validations/book";
import { getBooksFromDb } from "@/server/books";

// Ensure this page is dynamic (no static cahcing)
export const revalidate = 0;

export default async function BooksPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  // Wait for searchParams to resolve
  const params = await searchParams;

  // validate the ?sort= query parameter using Zod
  const parsed = BookListQuerySchema.safeParse({
    sort: typeof params.sort === "string" ? searchParams.sort : undefined,
  });

  // if validation succeeds, use the parsed sort value; otherwise undefined
  const sort = parsed.success ? parsed.data.sort : undefined;

  // fetch books from the database using the selected or default sort order
  const initialBooks: BookDTO[] = await getBooksFromDb(sort);

  return (
    <section className="p-6 space-y-6 text-amber-900">
      <BookListClient initialBooks={initialBooks} initialSort={sort} />
    </section>
  );
}
