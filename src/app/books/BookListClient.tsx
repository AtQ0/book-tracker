import BookGrid from "@/components/books/BookGrid";
import { BookDTO } from "@/lib/validations/book";

type BookListClientProps = {
  initialBooks: BookDTO[];
  initialSort: string | undefined;
};

export default function BookListClient({
  initialBooks,
  initialSort,
}: BookListClientProps) {
  return (
    <section>
      <BookGrid initialBooks={initialBooks} />
    </section>
  );
}
