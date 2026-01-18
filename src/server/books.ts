import "server-only";
import { prisma } from "@/lib/db";
import type { Prisma } from "@prisma/client";
import { sortFieldMap, type BookDTO } from "@/lib/validations/book";

export async function getBooksFromDb(
  sort?: keyof typeof sortFieldMap,
): Promise<BookDTO[]> {
  // Default order: if no valid ?sort= is provided in the query, order books by newest first
  let orderBy: Prisma.BookOrderByWithRelationInput[] = [{ createdAt: "desc" }];

  // Override default order if sort is present in the query
  if (sort) {
    // index sortFieldMap object with sort and destructure the keys belonging to that specific sort key
    const { field, direction } = sortFieldMap[sort];

    //replace orderby value with field (sort), direction (sort value) and the id
    orderBy = [{ [field]: direction }, { id: "asc" }]; // add id as a tie-breaker
  }

  // Fetch books directly from DB (not via api) with the chosen sort and return data from only selected fields.
  const rows = await prisma.book.findMany({
    orderBy,
    select: {
      id: true,
      name: true,
      description: true,
      genre: true,
      coverUrl: true,
      averageRating: true,
      haveRead: true,
      currentlyReading: true,
      wantToRead: true,
    },
  });

  return rows;
}

export async function getBookById(id: string): Promise<BookDTO | null> {
  const book = await prisma.book.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      description: true,
      genre: true,
      coverUrl: true,
      averageRating: true,
      haveRead: true,
      currentlyReading: true,
      wantToRead: true,
    },
  });

  return book;
}
