"use client";

import React from "react";
import { twMerge } from "tailwind-merge";
import Button from "@/components/ui/Button";

export type BookActionsProps = React.ComponentPropsWithoutRef<"div"> & {
  isAuthed: boolean;
  onSignin: () => void;
};

export default function BookActions({
  isAuthed,
  onSignin,
  className,
  ...rest
}: BookActionsProps) {
  if (!isAuthed) {
    return (
      <div className={twMerge("flex items-center gap-5", className)} {...rest}>
        <div className="min-w-0">
          <p className="xs:text-lg  font-light max-xs:hidden">
            Sign in to add this book
            <span className="block">to your shelf or rate it</span>
          </p>

          <p className="hidden text-[0.9rem] max-xs:block">
            Sign in to add
            <span className="block"> this book to your</span>
            shelf or rate it
          </p>
        </div>

        <div className="flex-1 shrink-0 flex justify-end">
          <Button
            type="button"
            className="text-base w-full max-w-98"
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
      className={twMerge("flex flex-col items-center gap-8", className)}
      {...rest}
    >
      <div className="w-full min-w-0">
        <p>Avg Rating:</p>
      </div>

      <div className="flex w-full">
        <p className="mr-10">Reads: </p>
        <p>Want to read: </p>
      </div>

      <div className="w-full flex gap-2 lg:gap-2">
        <Button type="button" variant="secondary">
          To read
        </Button>

        <Button type="button" variant="secondary">
          Reading
        </Button>

        <Button type="button" variant="secondary">
          Read
        </Button>
      </div>
    </div>
  );
}
