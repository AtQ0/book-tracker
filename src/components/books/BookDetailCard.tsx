"use client";

import { BookDTO } from "@/lib/validations/book";
import Card from "@/components/ui/Card";
import BackButton from "@/components/BackButton";
import { twMerge } from "tailwind-merge";
import { useRouter } from "next/navigation";

import BookCover from "./shared/BookCover";
import BookGenrePill from "./shared/BookGenrePill";
import BookActions from "./shared/BookActions";

type Props = { book: BookDTO; className?: string };

export default function BookDetailCard({ book, className }: Props) {
  const router = useRouter();

  return (
    <Card as="article" className={twMerge(className)}>
      {/* breadcrumb-ish header */}
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
          {/* mobile-first layout that matches BookCard */}
          <div className="flex gap-3 sm:gap-6">
            <div className="shrink-0">
              <BookCover
                src={book.coverUrl}
                alt={book.name}
                ratio="2:3"
                className="w-30 max-xs:w-25 h-full lg:w-45"
              />
            </div>

            <div className="flex-1 min-w-0 pr-2 sm:pr-0 max-w-[25rem] sm:max-w-none">
              <h1 className="max-xs:text-lg text-2xl sm:text-4xl font-semibold sm:font-extrabold leading-tight min-xs:truncate sm:line-clamp-none">
                {book.name}
              </h1>

              <BookGenrePill className="mt-1 sm:mt-2">
                {book.genre}
              </BookGenrePill>

              <p className="mt-3 sm:mt-4 leading-relaxed line-clamp-8 sm:line-clamp-10 md:line-clamp-none">
                {book.description}
              </p>
            </div>
          </div>

          <Card padding="md" variant="secondary" className="max-xs:p-3">
            <BookActions
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
