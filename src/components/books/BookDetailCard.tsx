"use client";

import { BookDTO } from "@/lib/validations/book";
import Card from "@/components/ui/Card";
import BackButton from "@/components/BackButton";
import { twMerge } from "tailwind-merge";
import { useRouter } from "next/navigation";

import BookCover from "./shared/BookCover";
import BookGenrePill from "./shared/BookGenrePill";
import BookActions from "./shared/BookActions";

type Props = { book: BookDTO; className?: string; isAuthed: boolean };

export default function BookDetailCard({ book, className, isAuthed }: Props) {
  const router = useRouter();

  return (
    <Card as="article" className={twMerge(className)}>
      <div>
        <BackButton
          label={
            <span className="text-sm flex items-center min-w-0">
              <span className="opacity-70 shrink-0">Books</span>
              <span className="opacity-70 shrink-0"> / </span>
              <span className="font-medium truncate min-w-0">{book.name}</span>
            </span>
          }
        />
      </div>

      <div className="pt-4">
        <div className="flex flex-col gap-5">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-6">
            <div className="w-full sm:w-auto sm:shrink-0">
              <BookCover
                src={book.coverUrl}
                alt={book.name}
                ratio="2:3"
                className="w-full sm:w-30 h-full lg:w-45"
              />
            </div>

            <div className="flex-1 min-w-0 sm:pr-0 sm:max-w-none">
              <h1 className="text-2xl sm:text-4xl font-semibold sm:font-extrabold leading-tight">
                {book.name}
              </h1>

              <BookGenrePill className="mt-1 sm:mt-2">
                {book.genre}
              </BookGenrePill>

              <p className="mt-3 sm:mt-4 leading-relaxed">{book.description}</p>
            </div>
          </div>

          <Card padding="sm" variant="secondary" className="max-xs:p-3">
            <BookActions
              bookId={book.id}
              initial={{
                averageRating: book.averageRating,
                haveRead: book.haveRead,
                currentlyReading: book.currentlyReading,
                wantToRead: book.wantToRead,
                userRating: book.userRating,
                userShelfStatus: book.userShelfStatus,
              }}
              isAuthed={isAuthed}
              onSignin={() => {
                const next = `/books/${book.id}`;
                router.push(`/signin?next=${encodeURIComponent(next)}`);
              }}
            />
          </Card>
        </div>
      </div>
    </Card>
  );
}
