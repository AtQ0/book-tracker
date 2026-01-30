"use client";

import React from "react";
import { twMerge } from "tailwind-merge";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import { BookDTO } from "@/lib/validations/book";
import { ShelfStatus } from "@/lib/validations/shelf";
import RatingStars from "../RatingStars";

type ShelfUi = "to-read" | "reading" | "read" | null;

function uiToDb(ui: Exclude<ShelfUi, null>): ShelfStatus {
  if (ui === "reading") return "currentlyReading";
  if (ui === "read") return "haveRead";
  return "wantToRead";
}

function dbToUi(db: ShelfStatus | null): ShelfUi {
  if (db === "currentlyReading") return "reading";
  if (db === "haveRead") return "read";
  if (db === "wantToRead") return "to-read";
  return null;
}

type BookActionsState = Pick<
  BookDTO,
  | "averageRating"
  | "haveRead"
  | "currentlyReading"
  | "wantToRead"
  | "userRating"
  | "userShelfStatus"
>;

export type BookActionsProps = React.ComponentPropsWithoutRef<"div"> & {
  isAuthed: boolean;
  onSignin: () => void;
  bookId: string;
  initial: BookActionsState;
};

export default function BookActions({
  isAuthed,
  onSignin,
  bookId,
  initial,
  className,
  ...rest
}: BookActionsProps) {
  const router = useRouter();

  const [state, setState] = React.useState<BookActionsState>(initial);
  const [shelf, setShelf] = React.useState<ShelfUi>(
    dbToUi(initial.userShelfStatus),
  );
  const [pendingShelf, setPendingShelf] = React.useState(false);
  const [pendingRating, setPendingRating] = React.useState(false);

  const selectedClasses = "bg-russet text-white border-russet";

  async function postJson<T>(url: string, body: unknown): Promise<T> {
    const res = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });

    if (res.status === 401) {
      onSignin();
      throw new Error("Unauthorized");
    }

    if (!res.ok) {
      throw new Error("Request failed");
    }

    return (await res.json()) as T;
  }

  async function handleShelf(next: Exclude<ShelfUi, null>) {
    if (!isAuthed) {
      onSignin();
      return;
    }
    if (pendingShelf || pendingRating) return;

    setPendingShelf(true);

    const prevShelf = shelf;
    setShelf(next);

    try {
      const updated = await postJson<BookDTO>(`/api/books/${bookId}/shelf`, {
        status: uiToDb(next),
      });

      // Immediate local UI update
      setState({
        averageRating: updated.averageRating,
        haveRead: updated.haveRead,
        currentlyReading: updated.currentlyReading,
        wantToRead: updated.wantToRead,
        userRating: updated.userRating,
        userShelfStatus: updated.userShelfStatus,
      });

      setShelf(dbToUi(updated.userShelfStatus));

      // Make server components re-fetch fresh data so highlight survives remounts
      router.refresh();
    } catch {
      setShelf(prevShelf);
    } finally {
      setPendingShelf(false);
    }
  }

  async function handleRate(nextRating: number) {
    if (!isAuthed) {
      onSignin();
      return;
    }
    if (pendingShelf || pendingRating) return;

    setPendingRating(true);

    try {
      const updated = await postJson<BookDTO>(`/api/books/${bookId}/rate`, {
        rating: nextRating,
      });

      setState({
        averageRating: updated.averageRating,
        haveRead: updated.haveRead,
        currentlyReading: updated.currentlyReading,
        wantToRead: updated.wantToRead,
        userRating: updated.userRating,
        userShelfStatus: updated.userShelfStatus,
      });

      setShelf(dbToUi(updated.userShelfStatus));

      // Keep rating display consistent across remounts too
      router.refresh();
    } finally {
      setPendingRating(false);
    }
  }

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

  const shownRating = state.userRating ?? state.averageRating;

  return (
    <div
      className={twMerge("flex flex-col items-center gap-2", className)}
      {...rest}
    >
      <div className="w-full min-w-0">
        <div className="w-full min-w-0 flex items-center gap-3">
          <p className="shrink-0">Rating:</p>

          <RatingStars
            value={shownRating}
            onChange={handleRate}
            disabled={pendingRating}
            ariaLabel="Rate this book"
          />

          <p className="shrink-0 font-semibold">
            Avg {state.averageRating.toFixed(1)} / 5
          </p>
        </div>

        <p className="mt-2">Have read: {state.haveRead}</p>
        <p>Currently reading: {state.currentlyReading}</p>
        <p>Want to read: {state.wantToRead}</p>
      </div>

      <div className="w-full flex gap-2 lg:gap-2">
        <Button
          className={twMerge("flex-1", shelf === "to-read" && selectedClasses)}
          type="button"
          variant="outline"
          disabled={pendingShelf}
          onClick={() => handleShelf("to-read")}
        >
          To read
        </Button>

        <Button
          className={twMerge("flex-1", shelf === "reading" && selectedClasses)}
          type="button"
          variant="outline"
          disabled={pendingShelf}
          onClick={() => handleShelf("reading")}
        >
          Reading
        </Button>

        <Button
          className={twMerge("flex-1", shelf === "read" && selectedClasses)}
          type="button"
          variant="outline"
          disabled={pendingShelf}
          onClick={() => handleShelf("read")}
        >
          Read
        </Button>
      </div>
    </div>
  );
}
