"use client";

import Image from "next/image";
import { twMerge } from "tailwind-merge";

export type BookCoverProps = {
  src: string;
  alt: string;
  ratio?: "2:3" | "1:1";
  className?: string;
};

export default function BookCover({
  src,
  alt,
  ratio = "2:3",
  className,
}: BookCoverProps) {
  const ratioClass = ratio === "1:1" ? "aspect-square" : "aspect-[2/3]";

  return (
    <div
      className={twMerge(
        "relative overflow-hidden rounded-xl",
        ratioClass,
        className,
      )}
    >
      <Image
        alt={alt}
        src={src}
        fill
        sizes="(max-width: 475px) 100px, 120px"
        className="object-cover"
        unoptimized
        placeholder="blur"
        blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMiIgaGVpZ2h0PSIzIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciLz4="
      />
    </div>
  );
}
