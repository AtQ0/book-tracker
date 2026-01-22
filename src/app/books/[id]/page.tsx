import { getBookById } from "@/server/books";
import { notFound } from "next/navigation";
import BookDetailCard from "@/components/books/BookDetailCard";
import { authOptions } from "@/lib/auth/options";
import { getServerSession } from "next-auth";

export default async function BookDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const session = await getServerSession(authOptions);
  const isAuthed = !!session?.user;

  const book = await getBookById(id);
  if (!book) notFound();

  return (
    <div className="min-h-screen px-6 py-6 sm:flex sm:items-center sm:justify-center">
      <BookDetailCard
        book={book}
        className="max-w-3xl mx-auto"
        isAuthed={isAuthed}
      />
    </div>
  );
}
