import "server-only";
import { prisma } from "@/lib/db";
import type { Prisma } from "@prisma/client";
import { sortFieldMap, type BookDTO } from "@/lib/validations/book";
import type { ShelfStatus } from "@/lib/validations/shelf";

export async function getBooksFromDb(
  sort?: keyof typeof sortFieldMap,
): Promise<BookDTO[]> {
  let orderBy: Prisma.BookOrderByWithRelationInput[] = [{ createdAt: "desc" }];

  if (sort) {
    const { field, direction } = sortFieldMap[sort];
    orderBy = [{ [field]: direction }, { id: "asc" }];
  }

  const rows = await prisma.book.findMany({
    orderBy,
    select: {
      id: true,
      name: true,
      genre: true,
      coverUrl: true,
      description: true,
      averageRating: true,
      haveRead: true,
      currentlyReading: true,
      wantToRead: true,
    },
  });

  // list endpoint does not need per-user rating; return null to satisfy BookDTO
  return rows.map((b) => ({ ...b, userRating: null }));
}

export async function getBookById(
  bookId: string,
  userId?: string,
): Promise<BookDTO | null> {
  const book = await prisma.book.findUnique({
    where: { id: bookId },
    select: {
      id: true,
      name: true,
      genre: true,
      coverUrl: true,
      description: true,
      averageRating: true,
      haveRead: true,
      currentlyReading: true,
      wantToRead: true,
    },
  });

  if (!book) return null;

  if (!userId) {
    return { ...book, userRating: null };
  }

  const ub = await prisma.userBook.findUnique({
    where: { userId_bookId: { userId, bookId } },
    select: { rating: true },
  });

  return { ...book, userRating: ub?.rating ?? null };
}

async function recomputeBookAggregates(bookId: string) {
  const grouped = await prisma.userBook.groupBy({
    by: ["status"],
    where: { bookId },
    _count: { _all: true },
  });

  const counts: Record<string, number> = {
    haveRead: 0,
    currentlyReading: 0,
    wantToRead: 0,
  };

  for (const g of grouped) {
    counts[g.status] = g._count._all;
  }

  const ratingAgg = await prisma.userBook.aggregate({
    where: { bookId, rating: { not: null } },
    _avg: { rating: true },
    _count: { rating: true },
  });

  const avg = ratingAgg._avg.rating ?? 0;
  const ratingCount = ratingAgg._count.rating ?? 0;

  await prisma.book.update({
    where: { id: bookId },
    data: {
      haveRead: counts.haveRead,
      currentlyReading: counts.currentlyReading,
      wantToRead: counts.wantToRead,
      averageRating: avg,
      ratingCount,
    },
  });
}

export async function setShelfStatusForUser(params: {
  userId: string;
  bookId: string;
  status: ShelfStatus;
}): Promise<void> {
  const { userId, bookId, status } = params;

  await prisma.userBook.upsert({
    where: { userId_bookId: { userId, bookId } },
    update: { status },
    create: { userId, bookId, status },
  });

  await recomputeBookAggregates(bookId);
}

export async function rateBookForUser(params: {
  userId: string;
  bookId: string;
  rating: number;
}): Promise<void> {
  const { userId, bookId, rating } = params;

  await prisma.userBook.upsert({
    where: { userId_bookId: { userId, bookId } },
    update: { rating },
    create: { userId, bookId, rating, status: "wantToRead" },
  });

  await recomputeBookAggregates(bookId);
}

export async function addBookToDb(input: {
  name: string;
  genre: string;
  coverUrl: string;
  description: string;
}): Promise<BookDTO> {
  const created = await prisma.book.create({
    data: {
      name: input.name,
      genre: input.genre,
      coverUrl: input.coverUrl,
      description: input.description,
    },
    select: {
      id: true,
      name: true,
      genre: true,
      coverUrl: true,
      description: true,
      averageRating: true,
      haveRead: true,
      currentlyReading: true,
      wantToRead: true,
    },
  });

  return { ...created, userRating: null };
}
