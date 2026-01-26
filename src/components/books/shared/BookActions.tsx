"use client";

import React from "react";
import { twMerge } from "tailwind-merge";
import Button from "@/components/ui/Button";
import { BookDTO } from "@/lib/validations/book";
import RatingStars from "../RatingStars";

type Shelf = "to-read" | "reading" | "read";
type BookStats = Pick<
  BookDTO,
  "averageRating" | "haveRead" | "currentlyReading" | "wantToRead"
>;

export type BookActionsProps = React.ComponentPropsWithoutRef<"div"> & {
  isAuthed: boolean;
  onSignin: () => void;
  bookStats: BookStats;
};
export default function BookActions({
  isAuthed,
  onSignin,
  bookStats,
  className,
  ...rest
}: BookActionsProps) {
  const [shelf, setShelf] = React.useState<Shelf>("to-read");
  const selectedClasses = "bg-russet text-white border-russet";

  if (!isAuthed) {
    return (
      <div className={twMerge("flex items-center gap-8", className)} {...rest}>
        <div className="min-w-0">
          <p className="xs:text-[0.88rem] font-light">
            Sign in to add this book to your shelf or rate it
            <span className="block"></span>
          </p>
        </div>
        <div className="flex-1 flex justify-end">
          <Button
            type="button"
            className="text-base whitespace-nowrap flex-1 max-[499px]:w-28 w-40"
            onClick={onSignin}
          >
            Sign in
          </Button>
        </div>
      </div>
    );
  }

  // Authenticated UI
  return (
    <div
      className={twMerge("flex flex-col items-center gap-2", className)}
      {...rest}
    >
      <div className="w-full min-w-0">
        <div className="w-full min-w-0 flex items-center gap-3">
          <p className="shrink-0">Avg rating:</p>

          <RatingStars value={bookStats.averageRating} />

          <p className="shrink-0 font-semibold">
            {bookStats.averageRating.toFixed(1)} / 5
          </p>
        </div>
        <p>Have read: {bookStats.haveRead}</p>
        <p>Currently reading: {bookStats.currentlyReading}</p>
        <p>Want to read: {bookStats.wantToRead}</p>
      </div>

      <div className="w-full flex gap-2 lg:gap-2">
        <Button
          className={twMerge("flex-1", shelf === "to-read" && selectedClasses)}
          type="button"
          variant="outline"
          onClick={() => setShelf("to-read")}
        >
          To read
        </Button>

        <Button
          className={twMerge("flex-1", shelf === "reading" && selectedClasses)}
          type="button"
          variant="outline"
          onClick={() => setShelf("reading")}
        >
          Reading
        </Button>

        <Button
          className={twMerge("flex-1", shelf === "read" && selectedClasses)}
          type="button"
          variant="outline"
          onClick={() => setShelf("read")}
        >
          Read
        </Button>
      </div>
    </div>
  );
}
