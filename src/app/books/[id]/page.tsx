import { getBookById } from "@/server/books";
import { notFound } from "next/navigation";
import BookDetailCard from "@/components/books/BookDetailCard";

export default async function BookDetail({
  params,
}: {
  params: { id: string };
}) {
  const book = await getBookById(params.id);

  if (!book) notFound();

  return (
    <div className="min-h-screen px-6 py-6 sm:flex sm:items-center sm:justify-center">
      <BookDetailCard book={book} className="max-w-3xl mx-auto" />
    </div>
  );
}
