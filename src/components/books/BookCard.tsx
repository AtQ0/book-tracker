import { BookDTO } from "@/lib/validations/book";

interface BookCardProps {
  book: BookDTO;
}

export default function BookCard({ book }: BookCardProps) {
  return (
    <article>
      <h4>{book.name}</h4>
    </article>
  );
}
