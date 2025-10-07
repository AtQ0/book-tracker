"use client";
import Button from "@/components/ui/Button";
import bookshelf from "../../public/images/bookshelf.png";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  return (
    <section
      className="h-full bg-cover bg-center flex flex-col justify-center items-center gap-8"
      style={{ backgroundImage: `url(${bookshelf.src})` }}
    >
      <h1 className="text-center">
        Disover your <span className="block">great next read</span>
      </h1>
      <Button label="Browse books" onClick={() => router.push("/books")} />
    </section>
  );
}
