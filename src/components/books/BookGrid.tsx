import { BookDTO } from "@/lib/validations/book";
import BookCard from "./BookCard";

type BookGridProps = {
  initialBooks: BookDTO[];
};

export default function BookGrid({ initialBooks }: BookGridProps) {
  return (
    <ul className="grid gap-15 grid-cols-1 lg:grid-cols-2">
      {initialBooks.map((book) => (
        <li key={book.id}>
          <BookCard book={book} />
        </li>
      ))}
    </ul>
  );
}
