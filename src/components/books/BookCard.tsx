"use client";

import { BookDTO } from "@/lib/validations/book";
import { useRouter } from "next/navigation";
import Card from "../ui/Card";
import Link from "next/link";

import BookCover from "./shared/BookCover";
import BookGenrePill from "./shared/BookGenrePill";
import BookActions from "./shared/BookActions";

type BookCardProps = { book: BookDTO };

export default function BookCard({ book }: BookCardProps) {
  const router = useRouter();

  return (
    <Card
      as="article"
      className="
    flex flex-col gap-5
    w-full
    min-xs:max-w-[27rem]
    mx-auto
    lg:max-w-none
    lg:mx-0
  "
    >
      <Link
        href={`/books/${book.id}`}
        className="flex gap-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-peach-yellow rounded-xl"
      >
        <div>
          <BookCover
            src={book.coverUrl}
            alt={book.name}
            ratio="2:3"
            className="w-30 max-xs:w-25 h-full"
          />
        </div>

        <div className="flex-1 min-w-0 pr-2 max-w-[25rem]">
          <h3 className="max-xs:text-lg font-semibold min-xs:truncate">
            {book.name}
          </h3>

          <BookGenrePill>{book.genre}</BookGenrePill>

          <p className="mt-3 line-clamp-8">{book.description}</p>
        </div>
      </Link>

      <Card padding="md" variant="secondary" className="max-xs:p-3">
        <BookActions
          onSignin={() => {
            const next = `/books/${book.id}`;
            router.push(`/signin?next=${encodeURIComponent(next)}`);
          }}
        />
      </Card>
    </Card>
  );
}
