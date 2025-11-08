"use client";
import Button from "@/components/ui/Button";
import bookshelf from "../../public/images/bookshelf.png";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  return (
    <section
      className="flex flex-col flex-1 bg-cover bg-center justify-center items-center gap-8"
      style={{ backgroundImage: `url(${bookshelf.src})` }}
    >
      <h1 className="text-center text-white">
        Discover your <span className="block">great next read</span>
      </h1>
      <Button
        className="font-merriweather"
        onClick={() => router.push("/books")}
        variant="secondary"
      >
        Browse Books
      </Button>
    </section>
  );
}
