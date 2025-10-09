import { BookDTO } from "@/lib/validations/book";

interface BookListClientProps {
  initialBooks: BookDTO[];
  initialSort: string | undefined;
}

export default function BookListClient({
  initialBooks,
  initialSort,
}: BookListClientProps) {
  return (
    <section>
      <p>YEAH YEAH</p>
    </section>
  );
}
