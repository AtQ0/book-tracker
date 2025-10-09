import "server-only";
import { db } from "@/lib/db";
import type { Prisma } from "@prisma/client";
import { sortFieldMap, type BookDTO } from "@/lib/validations/book";

export async function getBooksFromDb(
  sort?: keyof typeof sortFieldMap
): Promise<BookDTO[]> {
  // if no valid ?sort= is provided in the query, order books by newest first
  let orderBy: Prisma.BookOrderByWithRelationInput[] = [{ createdAt: "desc" }];

  // Override default order if sort is present in the query
  if (sort) {
    const { field, direction } = sortFieldMap[sort];
    orderBy = [{ [field]: direction }, { id: "asc" }]; // add id as a tie-breaker
  }

  // Fetch books with the chosen sort and return data from only selected fields.
  const rows = await db.book.findMany({
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
