"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeftIcon } from "@phosphor-icons/react";
import { twMerge } from "tailwind-merge";

type BackButtonProps = {
  label?: React.ReactNode; // default "Back"
  className?: string;
};

export default function BackButton({
  label = "Back",
  className,
}: BackButtonProps) {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => router.back()}
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
