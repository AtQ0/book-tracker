"use client";

import React from "react";

type BookGenrePillProps = {
  children: React.ReactNode;
  className?: string;
};

export default function BookGenrePill({
  children,
  className,
}: BookGenrePillProps) {
  return (
    <p
      className={[
        "mt-1 w-fit rounded-2xl px-2 border border-black-bean bg-coyote text-white",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </p>
  );
}
