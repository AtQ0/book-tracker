"use client";

import { BookDTO } from "@/lib/validations/book";
import Image from "next/image";
import Button from "../ui/Button";
import { useRouter } from "next/navigation";
import { twMerge } from "tailwind-merge";
import React from "react";
import Card from "../ui/Card";
import Link from "next/link";

type BookCardProps = { book: BookDTO };

export default function BookCard({ book }: BookCardProps) {
  const router = useRouter();

  return (
    <Card
      as="article"
      className="flex flex-col gap-5 min-xs:w-[27rem]  mx-auto"
    >
      {/* Image and text side-by-side */}

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

      {/* Bottom: actions */}
      <Card padding="md" variant="secondary" className="max-xs:p-3">
        <BookActions onLogin={() => router.push("/login")} />
      </Card>
    </Card>
  );
}

/* Local helpers - to be exported in the future maybe */

type BookCoverProps = {
  src: string;
  alt: string;
  ratio?: "2:3" | "1:1";
  className?: string;
};

function BookCover({ src, alt, ratio = "2:3", className }: BookCoverProps) {
  const ratioClass = ratio === "1:1" ? "aspect-square" : "aspect-[2/3]";

  return (
    <div
      className={twMerge(
        "relative overflow-hidden rounded-xl p-2",
        ratioClass,
        className
      )}
    >
      <Image
        alt={alt}
        src={src}
        fill
        sizes="(min-width: 1536px) 320px,
         (min-width: 1280px) 280px,
         (min-width: 1024px) 240px,
         (min-width: 768px) 200px,
         160px"
        className="object-cover"
        priority={true}
      />
    </div>
  );
}

function BookGenrePill({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-1 w-fit rounded-2xl px-2 border border-black-bean bg-coyote text-white">
      {children}
    </p>
  );
}

type BookActionsProps = React.ComponentPropsWithoutRef<"div"> & {
  onLogin: () => void;
};

function BookActions({ onLogin, className, ...rest }: BookActionsProps) {
  return (
    <div className={twMerge("flex justify-between", className)} {...rest}>
      <div>
        <p className="text-xl font-light max-xs:hidden">
          Log in to add this book
          <span className="block">to your shelf or rate it</span>
        </p>
        <p className="hidden text-[0.9rem] max-xs:block">
          Log in to add this
          <span className="block">book to your shelf</span>
          or rate it
        </p>
      </div>
      <div className="flex justify-center items-center">
        <Button type="button" className="max-xs:text-lg" onClick={onLogin}>
          Log in
        </Button>
      </div>
    </div>
  );
}
