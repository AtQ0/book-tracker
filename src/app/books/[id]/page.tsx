import { getBookById } from "@/server/books";
import BookCard from "@/components/books/BookCard";
import { notFound } from "next/navigation";
import BackButton from "@/components/BackButton";

export default async function BookDetail({
  params,
}: {
  params: { id: string };
}) {
  const book = await getBookById(params.id);

  if (!book) {
    notFound(); // Or return <p>Book not found</p>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <BackButton />
      <BookCard book={book} />
    </div>
  );
}
