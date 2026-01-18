"use client";

import React from "react";
import { twMerge } from "tailwind-merge";
import Button from "@/components/ui/Button";

export type BookActionsProps = React.ComponentPropsWithoutRef<"div"> & {
  onSignin: () => void;
};

export default function BookActions({
  onSignin,
  className,
  ...rest
}: BookActionsProps) {
  return (
    <div className={twMerge("flex items-center gap-4", className)} {...rest}>
      <div className="min-w-0">
        <p className="text-xl font-light max-xs:hidden">
          Sign in to add this book
          <span className="block">to your shelf or rate it</span>
        </p>

        <p className="hidden text-[0.9rem] max-xs:block">
          Sign in to add this
          <span className="block">book to your shelf</span>
          or rate it
        </p>
      </div>

      <div className="flex-1 shrink-0 flex justify-end">
        <Button
          type="button"
          className="max-xs:text-lg w-full max-w-98"
          onClick={onSignin}
        >
          Sign in
        </Button>
      </div>
    </div>
  );
}
