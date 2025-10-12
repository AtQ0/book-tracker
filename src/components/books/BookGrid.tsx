import { BookDTO } from "@/lib/validations/book";
import BookCard from "./BookCard";

interface BookGridProps {
  initialBooks: BookDTO[];
}

export default function BookGrid({ initialBooks }: BookGridProps) {
  return (
    <ul>
      {initialBooks.map((book) => (
        <li key={book.id}>
          <BookCard book={book} />
        </li>
      ))}
    </ul>
  );
}
