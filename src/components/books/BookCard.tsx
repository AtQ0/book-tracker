"use client";

import { BookDTO } from "@/lib/validations/book";
import Image from "next/image";
import Button from "../ui/Button";
import { useRouter } from "next/navigation";

interface BookCardProps {
  book: BookDTO;
}

export default function BookCard({ book }: BookCardProps) {
  const router = useRouter();
  return (
    <article className="w-[28rem] flex flex-col gap-5 rounded border-alabaster border-2 p-5 cursor-pointer select-none">
      <div className="flex gap-2 h-[18rem]">
        <Image
          alt={book.name}
          className="object-cover rounded"
          width={220}
          height={300}
          src={book.coverUrl}
        />
        <div className="flex flex-col gap-1 flex-1 overflow-hidden">
          <h4>{book.name}</h4>
          <div className="flex flex-col gap-5 pt-1">
            <p className="bg-coyote border-black-bean border-1 w-fit rounded-2xl px-2 text-white">
              {book.genre}
            </p>
            <p className="line-clamp-9">{book.description}</p>
          </div>
        </div>
      </div>

      <div
        className="flex p-5 justify-between items-center cursor-auto bg-cosmic-latte border-2 border-peach-yellow rounded"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="text-xl">
          Log in to add this book{" "}
          <span className="block">to your shelf or rate it</span>
        </p>
        <Button
          label="Log in"
          className="bg-russet border-kobicha border-2 px-3 py-2 text-white"
          onClick={() => router.push("/login")}
        />
      </div>
    </article>
  );
}
