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

          <p className="hidden text-[1rem] max-xs:block">
            Sign in to add this
            <span className="block">book to your shelf</span>
            or rate it
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
      className={twMerge("flex flex-col items-center gap-4", className)}
      {...rest}
    >
      <div className="w-full min-w-0">
        <p>Avg Rating:</p>
      </div>

      <div className="flex w-full">
        <p className="mr-10">Reads: </p>
        <p>Want to read: </p>
      </div>

      <div
        className="w-full flex justify-start
  gap-3
  lg:gap-2
  max-[499px]:justify-between
  max-[499px]:gap-0"
      >
        <Button
          className="text-lg max-[499px]:text-sm max-[499px]:pl-3 max-[499px]:pr-3"
          type="button"
          variant="secondary"
        >
          Want to read
        </Button>
        <Button
          className="text-lg max-[499px]:text-sm max-[499px]:pl-3 max-[499px]:pr-3"
          type="button"
        >
          Reading
        </Button>
        <Button
          className="text-lg max-[499px]:text-sm max-[499px]:pl-3 max-[499px]:pr-3"
          type="button"
          variant="secondary"
        >
          Read
        </Button>
      </div>
    </div>
  );
}
