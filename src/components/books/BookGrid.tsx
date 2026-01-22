import { BookDTO } from "@/lib/validations/book";
import BookCard from "./BookCard";

type BookGridProps = {
  initialBooks: BookDTO[];
  isAuthed: boolean;
};

export default function BookGrid({ initialBooks, isAuthed }: BookGridProps) {
  return (
    <ul className="grid gap-15 grid-cols-1 lg:grid-cols-2">
      {initialBooks.map((book) => (
        <li key={book.id}>
          <BookCard book={book} isAuthed={isAuthed} />
        </li>
      ))}
    </ul>
  );
}
