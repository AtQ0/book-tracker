import { getBookById } from "@/server/books";
import { notFound } from "next/navigation";
import BookDetailCard from "@/components/books/BookDetailCard";
import { authOptions } from "@/lib/auth/options";
import { getServerSession } from "next-auth";

export const dynamic = "force-dynamic";

export default async function BookDetail({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { id } = await params;
  const sp = await searchParams;

  const session = await getServerSession(authOptions);

  const userId =
    typeof session?.user?.id === "string" && session.user.id.length > 0
      ? session.user.id
      : null;

  const book = await getBookById(id, userId ?? undefined);
  if (!book) notFound();

  // Prefer "next" from the list page, fallback to /books
  const nextRaw = sp.next;
  const backHref =
    typeof nextRaw === "string" && nextRaw.length > 0 ? nextRaw : "/books";

  return (
    <div className="min-h-screen px-6 py-6 sm:flex sm:items-center sm:justify-center">
      <BookDetailCard
        book={book}
        className="max-w-3xl mx-auto"
        isAuthed={!!userId}
        backHref={backHref}
      />
    </div>
  );
}
