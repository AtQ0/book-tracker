import BookListClient from "@/app/books/BookListClient";
import Container from "@/components/layout/Container";
import Section from "@/components/layout/Section";
import { BookListQuerySchema, type BookDTO } from "@/lib/validations/book";
import { getBooksFromDb } from "@/server/books";

// Ensure this page is dynamic (no static cahcing)
export const revalidate = 0;

export default async function BooksPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  // Wait for searchParams to resolve
  const params = await searchParams;

  // validate the ?sort= query parameter using Zod
  const parsed = BookListQuerySchema.safeParse({
    sort: typeof params.sort === "string" ? params.sort : undefined,
  });

  // if validation succeeds, use the parsed sort value; otherwise undefined
  const sort = parsed.success ? parsed.data.sort : undefined;

  // fetch books from the database using the selected or default sort order
  const initialBooks: BookDTO[] = await getBooksFromDb(sort);

  return (
    <Section className="bg-amber-300">
      <Container className="bg-pink-400">
        <BookListClient initialBooks={initialBooks} />
      </Container>
    </Section>
  );
}
