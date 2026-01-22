import BookGrid from "@/components/books/BookGrid";
import BookSortBar from "@/components/books/BookSortBar";
import { BookDTO } from "@/lib/validations/book";

type BookListClientProps = {
  initialBooks: BookDTO[];
  initialSort: string | undefined;
  isAuthed: boolean;
};

export default function BookListClient({
  initialBooks,
  initialSort,
  isAuthed,
}: BookListClientProps) {
  return (
    <section>
      <div className="mx-auto w-full max-w-[56rem]">
        <div className="my-4 mx-auto w-full max-w-[27rem] lg:max-w-none">
          <BookSortBar value={initialSort} />
        </div>

        <BookGrid initialBooks={initialBooks} isAuthed={isAuthed} />
      </div>
    </section>
  );
}
