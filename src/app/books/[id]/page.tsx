// src/app/books/[id]/page.tsx
import { getBookById } from "@/server/books";
import { notFound } from "next/navigation";
import BookDetailCard from "@/components/books/BookDetailCard";
import { authOptions } from "@/lib/auth/options";
import { getServerSession } from "next-auth";

export const dynamic = "force-dynamic";

export default async function BookDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const session = await getServerSession(authOptions);

  const userId =
    typeof session?.user?.id === "string" && session.user.id.length > 0
      ? session.user.id
      : null;

  const book = await getBookById(id, userId ?? undefined);
  if (!book) notFound();

  return (
    <div className="min-h-screen px-6 py-6 sm:flex sm:items-center sm:justify-center">
      <BookDetailCard
        book={book}
        className="max-w-3xl mx-auto"
        isAuthed={!!userId}
      />
    </div>
  );
}
