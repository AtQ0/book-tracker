"use client";
import { useRouter } from "next/navigation";
import { ArrowLeftIcon } from "@phosphor-icons/react";

export default function BackButton() {
  const router = useRouter();
  return (
    <button
      onClick={() => router.back()}
      className="flex justify-center items-center transition cursor-pointer text-kobicha hover:opacity-70 text-xl absolute left-2 top-2"
    >
      <ArrowLeftIcon />
      Back
    </button>
  );
}
