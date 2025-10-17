import { BookDTO } from "@/lib/validations/book";
import BookCard from "./BookCard";

type BookGridProps = {
  initialBooks: BookDTO[];
};

export default function BookGrid({ initialBooks }: BookGridProps) {
  return (
    <ul className="my-5 xl:px-10 grid gap-12 xl:grid-cols-2 mx-auto max-w-5xl place-items-center">
      {initialBooks.map((book) => (
        <li key={book.id}>
          <BookCard book={book} />
        </li>
      ))}
    </ul>
  );
}
