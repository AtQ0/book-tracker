import { BookDTO } from "@/lib/validations/book";
import BookCard from "./BookCard";

type BookGridProps = {
  initialBooks: BookDTO[];
};

export default function BookGrid({ initialBooks }: BookGridProps) {
  return (
    <ul className="flex flex-col gap-8">
      {initialBooks.map((book) => (
        <li key={book.id}>
          <BookCard book={book} />
        </li>
      ))}
    </ul>
  );
}
