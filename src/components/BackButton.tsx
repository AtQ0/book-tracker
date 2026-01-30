"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeftIcon } from "@phosphor-icons/react";
import { twMerge } from "tailwind-merge";

type BackButtonProps = {
  label?: React.ReactNode; // default "Back"
  className?: string;
  href?: string;
};

export default function BackButton({
  label = "Back",
  className,
  href,
}: BackButtonProps) {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => {
        if (href) {
          router.push(href);
          return;
        }
        router.back();
      }}
      className={twMerge(
        "flex items-center gap-1 transition cursor-pointer text-kobicha hover:opacity-70 text-xl",
        className,
      )}
    >
      <ArrowLeftIcon />
      {label}
    </button>
  );
}
