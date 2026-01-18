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
      {/* render BookSortBar here */}
      {/* pass initialSort (UI sync prop) so BookSortBar knows the latest */}
      {/* <BookSortBar value={initialSort} /> */}
      <BookGrid initialBooks={initialBooks} />
    </section>
  );
}
