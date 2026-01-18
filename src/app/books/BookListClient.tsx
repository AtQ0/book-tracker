import BookGrid from "@/components/books/BookGrid";
import BookSortBar from "@/components/books/BookSortBar";
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
      <div className="mx-auto w-full max-w-[56rem]">
        <div className="my-4 mx-auto w-full max-w-[27rem] lg:max-w-none">
          <BookSortBar value={initialSort} />
        </div>

        <BookGrid initialBooks={initialBooks} />
      </div>
    </section>
  );
}
