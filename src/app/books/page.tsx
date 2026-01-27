import BookListClient from "@/app/books/BookListClient";
import Container from "@/components/layout/Container";
import Section from "@/components/layout/Section";
import { BookListQuerySchema, type BookDTO } from "@/lib/validations/book";
import { getBooksFromDb } from "@/server/books";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";

export const revalidate = 0;

export default async function BooksPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;

  const parsed = BookListQuerySchema.safeParse({
    sort: typeof params.sort === "string" ? params.sort : undefined,
  });

  const sort = parsed.success ? parsed.data.sort : undefined;

  const session = await getServerSession(authOptions);
  const isAuthed = !!session?.user;

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
