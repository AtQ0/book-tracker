import BookListClient from "@/app/books/BookListClient";
import Container from "@/components/layout/Container";
import Section from "@/components/layout/Section";
import { BookListQuerySchema, type BookDTO } from "@/lib/validations/book";
import { getBooksFromDb } from "@/server/books";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";

// Mark page as being dynamic, meaning don't cache but always fetch fresh data
export const revalidate = 0;

export default async function BooksPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  // Resolve async searchParams into a normal variable
  const params = await searchParams;

  // Runtime defensive validation of the ?sort= query parameter using Zod
  const parsed = BookListQuerySchema.safeParse({
    sort: typeof params.sort === "string" ? params.sort : undefined,
  });

  // if validation succeeds, use the parsed sort value; otherwise undefined
  const sort = parsed.success ? parsed.data.sort : undefined;

  // session check (server side), pass down a boolean
  const session = await getServerSession(authOptions);
  const isAuthed = !!session?.user;

  // fetch books from the database using the selected or default sort order
  const initialBooks: BookDTO[] = await getBooksFromDb(sort);

  return (
    <Section>
      <Container>
        <BookListClient
          initialBooks={initialBooks}
          initialSort={sort}
          isAuthed={isAuthed}
        />
      </Container>
    </Section>
  );
}
